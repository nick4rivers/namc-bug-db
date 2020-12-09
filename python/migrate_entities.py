import os
import sys
import json
import argparse
from rscommons import Logger, ProgressBar, dotenv
import getpass
import datetime
from psycopg2.extras import execute_values
import pyodbc
from utilities import sanitize_string_col, get_string_value, sanitize_phone_fax, sanitize_email, sanitize_url
from lookup_data import lookup_data, get_db_id

csv_relative_path = '../data'


def migrate_entities(mscon, organizations_path, individuals_path, entities_path):

    individuals = {}
    organizations = {}

    country_file = os.path.join(os.path.dirname(organizations_path), '10_countries.sql')
    countries = lookup_data('CREATE TABLE countries (country_id INT, country_name TEXT, abbreviation TEXT);', country_file, 'country_name')

    states_file = os.path.join(os.path.dirname(organizations_path), '11_states.sql')
    states = lookup_data('CREATE TABLE states (state_id INT, country_id INT, state_name TEXT, abbreviation TEXT);', states_file, 'state_name')

    org_types_file = os.path.join(os.path.dirname(organizations_path), '02_organization_types.sql')
    org_types = lookup_data('CREATE TABLE organization_types (organization_type_id INT, organization_type_name TEXT);', org_types_file, 'organization_type_name')

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

    # Write organizations
    with open(organizations_path, 'w') as f:
        for data in organizations.values():
            f.write("INSERT INTO entity.organizations (organization_id, abbreviation, organization_name, entity_id, organization_type_id, is_lab) VALUES({}, {}, {}, {}, {}, {});\n".format(
                data['organization_id'],
                get_string_value(data['abbreviation']),
                get_string_value(data['organization_name']),
                data['entity_id'],
                data['organization_type_id'],
                data['is_lab']
            ))

    # write individuals
    with open(individuals_path, 'w') as f:
        for data in individuals.values():
            f.write('INSERT INTO entity.individuals (individual_id, first_name, last_name, initials, entity_id, affiliation_id, email) VALUES ({}, {}, {}, {}, {}, {}, {});\n'.format(
                data['individual_id'],
                get_string_value(data['first_name']),
                get_string_value(data['last_name']),
                get_string_value(data['initials']),
                data['entity_id'],
                data['affiliation_id'],
                get_string_value(data['email'])
            ))

    with open(entities_path, 'w') as f:
        for data in individuals.values():
            f.write('INSERT INTO entity.entities (entity_id, address1, address2, city, state_id, country_id, zip_code, phone, fax, metadata) VALUES ({}, {}, {}, {}, {}, {}, {}, {}, {}, {});\n'.format(
                data['entity_id'],
                get_string_value(data['address1']),
                get_string_value(data['address2']),
                get_string_value(data['city']),
                data['state_id'],
                data['country_id'],
                get_string_value(data['zip_code']),
                get_string_value(data['phone']),
                get_string_value(data['fax']),
                data['metadata']
            ))


def migrate_customers(mscon, organizations, individuals, countries, states, org_types):

    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.dbo.Customer")

    log = Logger('Entities')

    # USA for use in missing data
    usa = get_db_id(countries, 'country_id', ['abbreviation'], 'USA')

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

        metadata = None
        if clean_data['Notes']:
            metadata = {'notes': clean_data['Notes']}

        if clean_data['Group']:
            if not metadata:
                metadata = {}
            metadata['Group'] = clean_data['Group']

        phone = sanitize_phone_fax(clean_data['Phone'])
        fax = sanitize_phone_fax(clean_data['Fax'])
        state_id = get_db_id(states, 'state_id', ['state_name', 'abbreviation'], clean_data['State'])
        country_id = get_db_id(countries, 'country_id', ['country_name', 'abbreviation'], clean_data['Country'])
        organization_type_id = get_db_id(org_types, 'organization_type_id', ['organization_type_name'], clean_data['Category'])
        if state_id and not country_id:
            country_id = usa

        organizations[custid] = {
            'abbreviation': custid,
            'organization_name': clean_data['Customer'],
            'organization_type_id': organization_type_id,
            'city': clean_data['City'],
            'address1': clean_data['Address1'],
            'address2': clean_data['Address2'],
            'state': clean_data['State'],
            'state_id': state_id,
            'zip_code': clean_data['ZipCode'],
            'country': clean_data['Country'],
            'country_id': country_id,
            'phone': phone,
            'fax': fax,
            'is_lab': 'FALSE',
            'metadata': metadata
        }

        first_name = None
        last_name = None
        if clean_data['Contact'] or clean_data['Email']:

            key = clean_data['Email'] if clean_data['Email'] else clean_data['Contact']

            if key in individuals:
                log.warning('Duplicate individual with key {} ({}, {})'.format(key, clean_data['Contact'], clean_data['Email']))
                continue

            if clean_data['Contact']:
                names = clean_data['Contact'].split(' ')
                if len(names) > 1:
                    first_name = names[0]
                    last_name = names[1]
                else:
                    first_name = clean_data['Contact']
                    last_name = clean_data['Contact']
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

    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.dbo.Lab")

    log = Logger('Labs')

    # USA for use in missing data
    usa = get_db_id(countries, 'country_id', ['abbreviation'], 'USA')

    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        name = sanitize_string_col('Lab', 'LabID', msdata, 'Name')
        notes = sanitize_string_col('Lab', 'LabID', msdata, 'LabDesc')

        metadata = None
        if notes:
            metadata = get_string_value(json.dumps({'LabDesc': notes}))

        if name in organizations:
            log.warning("Lab name '{}' already exists as customer organization. Setting organization to lab".format(name))
            organizations[name]['is_lab'] = True
            continue

        state_id = get_db_id(states, 'state_id', ['state_name'], msdata['State'])
        country_id = usa
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
            'address1': sanitize_string_col('Lab', 'LabID', msdata, 'Address1'),
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


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('msdb', help='SQLServer password', type=str)
    parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    parser.add_argument('mspassword', help='SQLServer password', type=str)
    parser.add_argument('organizations_path', help='Output SQL file', type=str)
    parser.add_argument('individuals_path', help='Output SQL file', type=str)
    parser.add_argument('entities_path', help='Output SQL file', type=str)

    args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"))

    log.info('SQLServer database: {}'.format(args.msdb))

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    organizations_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', args.organizations_path)
    individuals_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', args.individuals_path)
    entities_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', args.entities_path)

    migrate_entities(mscon, organizations_path, individuals_path, entities_path)


if __name__ == '__main__':
    main()
