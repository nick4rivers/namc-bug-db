import os
import sys
import json
import argparse
from rscommons import Logger, ProgressBar, dotenv
import getpass
import datetime
from psycopg2.extras import execute_values
import pyodbc
from utilities import sanitize_string_col, get_string_value, sanitize_phone_fax
from lookup_data import lookup_data, get_db_id

csv_relative_path = '../data'


def migrate_entities(mscon, organizations_path, individuals_path, entities_path):

    individuals = {}
    organizations = {}

    country_file = os.path.join(os.path.dirname(organizations_path), '10_countries.sql')
    countries = lookup_data('CREATE TABLE countries (country_id INT, country_name TEXT, abbreviation TEXT);', country_file, 'country_name')

    states_file = os.path.join(os.path.dirname(organizations_path), '11_states.sql')
    states = lookup_data('CREATE TABLE states (state_id INT, country_id INT, state_name TEXT, abbreviation TEXT);', states_file, 'state_name')

    migrate_customers(mscon, organizations, individuals, countries, states)

    # assign organization IDs
    organization_id = 1
    entity_id = 1
    for custid, orgdata in organizations.items():
        orgdata['organization_id'] = organization_id
        orgdata['entity_id'] = entity_id
        organization_id += 1
        entity_id += 1

    # assign individuals IDs
    individual_id = 1
    for name, indidividual_data in individuals.items():
        indidividual_data['individual_id'] = individual_id
        indidividual_data['entity_id'] = entity_id
        individual_id += 1
        entity_id += 1

    # # Write organizations
    # with open(organizations_path, 'w') as f:
    # for id, data in atts.items():
    #     f.write("INSERT INTO entity.organizations(organization_id, attribute_name, attribute_type, label, description, metadata) VALUES({}, {}, {}, {}, {}, {});\n".format(
    #         id,
    #         get_string_value(data['attribute_name']),
    #         get_string_value(data['attribute_type']),
    #         get_string_value(data['label']),
    #         get_string_value(data['description']),
    #         data['metadata']
    #     ))


def migrate_customers(mscon, organizations, individuals, countries, states):

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

       ###################################################

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

        if state_id and not country_id:
            country_id = usa

        organizations[custid] = {
            'abbreviation': custid,
            'organization_name': clean_data['Customer'],
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
            'metadata': metadata
        }

        if clean_data['Contact'] or clean_data['Email']:

            key = clean_data['Email'] if clean_data['Email'] else clean_data['Contact']

            if key in individuals:
                log.warning('Duplicate individual with key {} ({}, {})'.format(key, clean_data['Contact'], clean_data['Email']))
                continue

            individuals[key] = {
                'name': clean_data['Contact'],
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
