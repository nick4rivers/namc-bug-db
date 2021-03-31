from lib.logger import Logger
from lib.progress_bar import ProgressBar
import pyodbc
import json
from utilities import sanitize_string_col, log_record_count, sanitize_string
from utilities import sanitize_phone_fax, sanitize_email, sanitize_url, add_metadata
from postgres_lookup_data import lookup_data, insert_row, log_row_count
from lookup_data import get_db_id
from build_entity_hierarchy import build_entity_hierarchy

entity_cols = ['address1', 'address2', 'city', 'state_id', 'country_id', 'zip_code', 'phone', 'fax', 'metadata']
organization_cols = ['abbreviation', 'organization_name', 'entity_id', 'organization_type_id', 'is_lab']
indivisual_cols = ['first_name', 'last_name', 'initials', 'entity_id', 'affiliation_id', 'email']


def migrate(mscurs, pgcurs, parent_entities):

    individuals = {}
    organizations = {}

    countries = lookup_data(pgcurs, 'geo.countries', 'country_name')
    states = lookup_data(pgcurs, 'geo.states', 'state_name')
    org_types = lookup_data(pgcurs, 'entity.organization_types', 'organization_type_name')

    # Unspecified user for associating with boxes that don't have a contact
    individuals['Unspecified'] = {key: None for key in entity_cols + indivisual_cols}
    individuals['Unspecified']['first_name'] = 'Unspecified'
    individuals['Unspecified']['last_name'] = 'Unspecified'
    individuals['Unspecified']['country_id'] = get_db_id(countries, 'country_id', ['abbreviation'], 'USA')
    individuals['Unspecified']['affiliation'] = None

    # NAMC organization (for employees)
    organizations['NAMC'] = {
        'abbreviation': 'NAMC',
        'organization_name': 'National Aquatic Monitoring Center',
        'organization_type_id': get_db_id(org_types, 'organization_type_id', ['organization_type_name'], 'Other'),
        'city': 'Logan',
        'address1': 'Utah State University',
        'address2': '5210 Old Main Hill',
        'state_id': get_db_id(states, 'state_id', ['abbreviation'], 'UT'),
        'zip_code': '84322-5210',
        'country_id': get_db_id(countries, 'country_id', ['abbreviation'], 'USA'),
        'phone': '760-709-1210',
        'fax': '435-797-1871',
        'is_lab': True,
        'metadata': None
    }

    migrate_customers(mscurs, organizations, individuals, countries, states, org_types)
    migrate_labs(mscurs, organizations, states, countries, org_types)
    migrate_employees(mscurs, organizations, individuals, countries)

    # insert entities
    for entity in [individuals, organizations]:
        for raw_data in entity.values():
            data = {key: raw_data[key] for key in entity_cols}
            raw_data['entity_id'] = insert_row(pgcurs, 'entity.entities', data, 'entity_id')
    log_row_count(pgcurs, 'entity.entities')

    # insert organizations
    for entity in organizations.values():
        data = {key: entity[key] for key in organization_cols}
        entity['entity_id'] = insert_row(pgcurs, 'entity.organizations', data, 'entity_id')
        # TODO: assign individuals with the organization ID of their affiliation

    log_row_count(pgcurs, 'entity.organizations')

    # insert individuals
    for entity in individuals.values():
        entity['affiliation_id'] = organizations[entity['affiliation']]['entity_id'] if entity['affiliation'] else None
        data = {key: entity[key] for key in indivisual_cols}
        insert_row(pgcurs, 'entity.individuals', data)
    log_row_count(pgcurs, 'entity.individuals')

    # Finally, insert the parent entities and associate customers if they have a parent
    # insert_parent_organizations(pgcurs, parent_entities)
    build_entity_hierarchy(pgcurs)


def migrate_customers(mscurs, organizations, individuals, countries, states, org_types):

    log = Logger('Entities')

    # USA for use in missing data
    usa = get_db_id(countries, 'country_id', ['abbreviation'], 'USA')

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

        if custid.startswith('USFS'):
            custid = custid.replace('_', '-')

        if custid.startswith('USFS-R0'):
            custid = custid[0:6] + custid[7:]

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

        # Fix USFS spacing issues
        organization_name = clean_data['Customer']
        if organization_name.startswith('USFS-R10-ChugachNF-GRD-Moose Pass AK'):
            organization_name = 'USFS - R10 - ChugachNF-GRD-Moose Pass AK'

        # Fix USFS case problems
        if organization_name.startswith('Usfs -'):
            organization_name = 'USFS {}'.format(organization_name[5:])

        # Fix USFS missing region in name
        if organization_name in ['USFS San Bernardino National Forest', 'USFS Stanislaus National Forest', 'USFS Inyo National Forest', 'USFS Tahoe National Forest']:
            organization_name = 'USFS - R5 -' + organization_name[4:]

        if organization_name in ['USFS Malheur National Forest']:
            organization_name = 'USFS - R6 -' + organization_name[4:]

        organizations[custid] = {
            'abbreviation': custid,
            'organization_name': organization_name,
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
                'title': None,
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


def migrate_labs(mscurs, organizations, states, countries, org_types):

    log = Logger('Labs')

    row_count = log_record_count(mscurs, 'PilotDB.dbo.Lab')
    progbar = ProgressBar(row_count, 50, "labs")

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


def migrate_employees(mscurs, organizations, individuals, countries):

    row_count = log_record_count(mscurs, 'PilotDB.dbo.Employee')
    usa = get_db_id(countries, 'country_id', ['abbreviation'], 'USA')

    mscurs.execute("SELECT * FROM PilotDB.dbo.Employee")
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        key = 'name_{}_{}'.format(msdata['FirstName'], msdata['LastName'])

        # Beth Carlson (235, 236) and Carlos Frias (201, 202) appear twice in PilotDB.Employee
        if key in individuals:
            individuals[key]['metadata']['employeeId2'] = msdata['EmployeeID']
            continue

        individuals[key] = {
            'first_name': sanitize_string(msdata['FirstName']),
            'last_name': sanitize_string(msdata['LastName']),
            'initials': msdata['Initials'],
            'affiliation': 'NAMC',
            'title': sanitize_string(msdata['JobTitle']),
            'address1': None,
            'address2': None,
            'city': None,
            'zip_code': None,
            'phone': None,
            'email': None,
            'fax': None,
            'state_id': None,
            'country_id': usa,
            'metadata': {
                'ider': msdata['Ider'],
                'sorter': msdata['Sorter'],
                'notes': sanitize_string(msdata['Notes']),
                'employeeId': msdata['EmployeeID']
            }
        }

# # old JSON way of doing things
# def insert_parent_organizations(pgcurs, parent_entities):
#     """ This method inserts several "parent" entities
#     so that NAMC customers can inherit from them.
#     e.g. This inserts the Bureau of Land Management Federal
#     level entity.

#     Args:
#         pgcurs ([type]): [description]
#     """

#     notes = "system generated from python during database construction"

#     entity_types = lookup_data(pgcurs, 'entity.organization_types', 'organization_type_name')

#     with open(parent_entities) as f:
#         entities = json.load(f)

#     # Get the country code for USA
#     pgcurs.execute("SELECT country_id FROM geo.countries WHERE abbreviation = 'USA'")
#     usa_id = pgcurs.fetchone()[0]

#     for name, data in entities.items():

#         # Insert the entity first
#         pgcurs.execute('INSERT INTO entity.entities (country_id, notes) VALUES (%s, %s) RETURNING entity_id', [usa_id, notes])
#         entity_id = pgcurs.fetchone()[0]

#         # Now insert the organization associated with the entity
#         organization_type_id = get_db_id(entity_types, 'organization_type_id', ['organization_type_name'], data['type'], True)
#         pgcurs.execute('INSERT INTO entity.organizations (entity_id, organization_name, abbreviation, organization_type_id) VALUES (%s, %s, %s, %s)', [entity_id, name, data['abbreviation'], organization_type_id])

#         # now associate any children with this entity
#         if len(data['children']) > 0:
#             print('children')
