from rscommons import Logger, ProgressBar
import pyodbc
from utilities import sanitize_string_col, log_record_count
from utilities import sanitize_phone_fax, sanitize_email, sanitize_url, write_sql_file, add_metadata
from lookup_data import lookup_data, get_db_id


def migrate(mscon, entities_path, organizations_path, individuals_path):

    individuals = {}
    organizations = {}

    countries = lookup_data('countries', '10_countries.sql', 'country_name')
    states = lookup_data('states', '11_states.sql', 'state_name')
    org_types = lookup_data('organization_types', '02_organization_types.sql', 'organization_type_name')

    migrate_customers(mscon, organizations, individuals, countries, states, org_types)
    migrate_labs(mscon, organizations, states, countries, org_types)

    # assign organization IDs
    organization_id = 1
    entity_id = 1
    for orgdata in organizations.values():
        orgdata['organization_id'] = organization_id
        orgdata['entity_id'] = entity_id

        # Assign affiliations for any individuals with this custID
        for individual in individuals.values():
            if individual['affiliation'].lower() == orgdata['abbreviation'].lower():
                individual['affiliation_id'] = organization_id

        organization_id += 1
        entity_id += 1

    # assign individuals IDs
    individual_id = 1
    for indidividual_data in individuals.values():
        indidividual_data['individual_id'] = individual_id
        indidividual_data['entity_id'] = entity_id
        individual_id += 1
        entity_id += 1

    # Merge organizations and individuals into entities
    entities = []
    for entity in [individuals, organizations]:
        for data in entity.values():
            entities.append({
                'entity_id': data['entity_id'],
                'address1': data['address1'],
                'address2': data['address2'],
                'city': data['city'],
                'state_id': data['state_id'],
                'country_id': data['country_id'],
                'zip_code': data['zip_code'],
                'phone': data['phone'],
                'fax': data['fax'],
                'metadata': data['metadata']
            })

    # Strip down organizations to just the essential fields
    cleaned_organizations = []
    for entity in organizations.values():
        data = {}
        for key in ['organization_id', 'abbreviation', 'organization_name', 'entity_id', 'organization_type_id', 'is_lab']:
            data[key] = entity[key]
        cleaned_organizations.append(data)

    # Strip down the individuals to just the essential fields
    cleaned_individuals = []
    for entity in individuals.values():
        data = {}
        for key in ['individual_id', 'first_name', 'last_name', 'initials', 'entity_id', 'affiliation_id', 'email']:
            data[key] = entity[key]
        cleaned_individuals.append(data)

    write_sql_file(organizations_path, 'entity.organizations', cleaned_organizations)
    write_sql_file(individuals_path, 'entity.individuals', cleaned_individuals)
    write_sql_file(entities_path, 'entity.entities', entities)


def migrate_customers(mscon, organizations, individuals, countries, states, org_types):

    log = Logger('Entities')

    # USA for use in missing data
    usa = get_db_id(countries, 'country_id', ['abbreviation'], 'USA')

    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.dbo.Customer")
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        custid = sanitize_string_col('Customer', 'CustID', msdata, 'CustID')
        clean_data = {}
        for key in msdata.keys():
            clean_key = sanitize_string_col('Customer', 'CustID', {'key': key, 'CustID': custid}, 'key')
            if isinstance(msdata[key], str):
                clean_data[clean_key] = sanitize_string_col('Customer', 'CustID', msdata, key)
            else:
                clean_data[clean_key] = msdata[key]

        ###################################################
        # Individual overrides here
        if custid == 'IDEQ':
            clean_data['State'] = 'ID'

        if custid == 'ISU':
            clean_data['State'] = 'ID'

        if custid == 'Private-01':
            clean_data['State'] = 'OR'

        if custid == 'R02F10B':
            clean_data['State'] = 'OR'

        # end overrides
        # ###################################################

        metadata = {}
        add_metadata(metadata, 'notes', clean_data['Notes'])
        add_metadata(metadata, 'group', clean_data['Group'])

        phone = sanitize_phone_fax(clean_data['Phone'])
        fax = sanitize_phone_fax(clean_data['Fax'])
        state_id = get_db_id(states, 'state_id', ['state_name', 'abbreviation'], clean_data['State'])
        country_id = get_db_id(countries, 'country_id', ['country_name', 'abbreviation'], clean_data['Country'])
        organization_type_id = get_db_id(org_types, 'organization_type_id', ['organization_type_name'], clean_data['Category'])
        if not country_id:
            country_id = usa

        organizations[custid] = {
            'abbreviation': custid,
            'organization_name': clean_data['Customer'],
            'organization_type_id': organization_type_id,
            'city': clean_data['City'],
            'address1': clean_data['Address1'],
            'address2': clean_data['Address2'],
            'state_id': state_id,
            'zip_code': clean_data['ZipCode'],
            'country_id': country_id,
            'phone': phone,
            'fax': fax,
            'is_lab': False,
            'metadata': metadata
        }

        first_name = None
        last_name = None
        if clean_data['Contact'] or clean_data['Email']:

            if clean_data['Contact'] and clean_data['Email']:
                key = '{}_{}'.format(clean_data['Contact'], clean_data['Email'])
            elif clean_data['Contact']:
                key = clean_data['Contact']
            else:
                key = clean_data['Email']

            if key in individuals:
                log.warning('Duplicate individual with key {} ({}, {})'.format(key, clean_data['Contact'], clean_data['Email']))
                continue

            if clean_data['Contact']:
                names = clean_data['Contact'].split(' ')
                if len(names) > 1:
                    first_name = names[0]
                    # Last name is the rest of the name to ensure we get all the string if there are more than one space!
                    last_name = clean_data['Contact'][len(names[0]) + 1:]

                    # special case. There's an 'A.J. Donnell' and an 'A.J Donnell' in the Pilot database
                    if first_name == 'A.J' and last_name == 'Donnell':
                        first_name = 'A.J.'
                else:
                    first_name = clean_data['Contact']
                    last_name = 'Unknown'
                    log.warning("Individual with same first and last name {}'".format(clean_data['Contact']))
            else:
                first_name = clean_data['Email']
                last_name = clean_data['Email']

            individuals[key] = {
                'name': clean_data['Contact'],
                'first_name': first_name,
                'last_name': last_name,
                'initials': None,
                'phone': phone,
                'fax': fax,
                'email': clean_data['Email'],
                'last_contact': clean_data['LastContact'],
                'affiliation': custid,
                'city': clean_data['City'],
                'address1': clean_data['Address1'],
                'address2': clean_data['Address2'],
                'state': clean_data['State'],
                'state_id': state_id,
                'zip_code': clean_data['ZipCode'],
                'country': clean_data['Country'],
                'country_id': country_id,
                'metadata': metadata
            }


def migrate_labs(mscon, organizations, states, countries, org_types):

    log = Logger('Labs')

    row_count = log_record_count(mscon, 'PilotDB.dbo.Lab')
    progbar = ProgressBar(row_count, 50, "labs")

    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.dbo.Lab")
    counter = 0
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        name = sanitize_string_col('Lab', 'LabID', msdata, 'Name')
        notes = sanitize_string_col('Lab', 'LabID', msdata, 'LabDesc')

        metadata = {}
        add_metadata(metadata, 'labDesc', notes)

        if name in organizations:
            log.warning("Lab name '{}' already exists as customer organization. Setting organization to lab".format(name))
            organizations[name]['is_lab'] = True
            continue

        state_id = get_db_id(states, 'state_id', ['state_name'], msdata['State'])
        country_id = get_db_id(countries, 'country_id', ['abbreviation'], 'USA')
        phone = sanitize_phone_fax(sanitize_string_col('Lab', 'LabID', msdata, 'PhoneNo'))
        fax = sanitize_phone_fax(sanitize_string_col('Lab', 'LabID', msdata, 'FaxNo'))
        website = sanitize_url(msdata['Website'])

        # Organization type not present in old database. Assume all are private/NGO except the explicit ones below
        org_type_id = get_db_id(org_types, 'organization_type_id', ['organization_type_name'], 'Private/NGO')
        if name.lower() == 'isu':
            org_type_id = get_db_id(org_types, 'organization_type_id', ['organization_type_name'], 'University')
        elif name.lower() == 'CALIFORNIA DFG-ABL':
            org_type_id = get_db_id(org_types, 'organization_type_id', ['organization_type_name'], 'State')

        lab = {
            'organization_name': name,
            'abbreviation': name,
            'address1': sanitize_string_col('Lab', 'LabID', msdata, 'Address1'),
            'address2': sanitize_string_col('Lab', 'LabID', msdata, 'Address1'),
            'city': sanitize_string_col('Lab', 'LabID', msdata, 'City'),
            'state_id': state_id,
            'country_id': country_id,
            'organization_type_id': org_type_id,
            'zip_code': sanitize_string_col('Lab', 'LabID', msdata, 'ZipCode'),
            'phone': phone,
            'fax': fax,
            'website': website,
            'email': sanitize_email(sanitize_string_col('Lab', 'LabID', msdata, 'Email')),
            'is_lab': True,
            'metadata': metadata
        }

        organizations[name] = lab
        progbar.update(counter)
        counter += 1

    progbar.finish()
