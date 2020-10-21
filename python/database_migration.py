import os
import sys
import traceback
import csv
import json
import sqlite3
import argparse
from rscommons import Logger, ProgressBar, dotenv
import psycopg2
import getpass
import datetime
from psycopg2.extras import execute_values
import pyodbc
from migrate_projects import ProjectMigrator


def database_migration(mscon, pgcon):

    print('test')

    pgcurs = pgcon.cursor()
    lookup = {
        'agency_categories': load_lookup(pgcurs, 'agency_categories', 'category_id', 'category_name'),
        'agencies': load_lookup(pgcurs, 'agencies', 'agency_id', 'agency_name'),
        'life_stages': load_lookup(pgcurs, 'life_stages', 'life_stage_id', 'life_stage_name'),
        'ecosystems': load_lookup(pgcurs, 'ecosystems', 'ecosystem_id', 'ecosystem_name'),
        'land_uses': load_lookup(pgcurs, 'land_uses', 'land_use_id', 'land_use_name'),
        'habitats': load_lookup(pgcurs, 'habitats', 'habitat_id', 'habitat_name'),
        'sample_types': load_lookup(pgcurs, 'sample_types', 'sample_type_id', 'sample_type_name'),
        'systems': load_lookup(pgcurs, 'systems', 'system_id', 'system_name'),
        'states': load_lookup(pgcurs, 'states', 'state_id', 'abbreviation'),
        'counties': load_lookup(pgcurs, 'counties', 'county_id', 'county_name'),
        'taxa_levels': load_lookup(pgcurs, 'taxa_levels', 'taxa_level_id', 'taxa_level_name'),
        'models': load_lookup(pgcurs, 'models', 'model_id', 'model_name'),
        'sample_methods': load_lookup(pgcurs, 'sample_methods', 'sample_method_id', 'sample_method_name'),
        'box_statuses': load_lookup(pgcurs, 'box_statuses', 'box_status_id', 'box_status_name'),
        'datums': load_lookup(pgcurs, 'datums', 'datum_id', 'datum_name'),
        'labs': load_lookup(pgcurs, 'labs', 'lab_id', 'lab_name')
    }

    # import_customers(mscon, pgcon, lookup)

    project_migrator = ProjectMigrator(mscon)
    project_migrator.migrate(mscon, pgcon, lookup)

    # import_boxes(mscon, pgcon, lookup)


def load_lookup(pgcurs, table, id_col, name_col):

    pgcurs.execute('SELECT {}, {} FROM {}'.format(id_col, name_col, table))
    return {row[1]: row[0] for row in pgcurs.fetchall()}


def import_customers(mscon, pgcon, lookup):

    arapaho_count = 0

    # Customers with missing states
    customer_states = {
        'BLM-NV-014': 'NV',
        'DEQ-02': 'UT',
        'IDEQ': 'ID',
        'ISU': 'ID',
        'NPS-KLMN': 'OR',
        'Private-01': 'OR',
        'R02F10B': 'CO',
        'USU-Armstrong': 'UT'

    }

    def customer_sanitize(r, field):
        return sanitize('Customer', 'CustID', r, field)

    pgcurs = pgcon.cursor()

    mscurs = mscon.cursor()
    mscurs.execute('SELECT * FROM PilotDB.dbo.Customer')
    for row in mscurs.fetchall():
        r = dict(zip([t[0] for t in row.cursor_description], row))
        data = {
            'customer_code': customer_sanitize(r, 'CustID'),
            'category_id': lookup_id(lookup, 'agency_categories', r, 'Category'),
            'agency_id': lookup_id(lookup, 'agencies', r, 'Agency'),
            'customer_name': customer_sanitize(r, 'Customer'),
            'address1': customer_sanitize(r, 'Address1'),
            'address2': customer_sanitize(r, 'Address2'),
            'city': customer_sanitize(r, 'City'),
            'state_id': lookup_id(lookup, 'states', r, 'State'),
            'zip_code': customer_sanitize(r, 'ZipCode'),
            'contact': customer_sanitize(r, 'Contact'),
            'phone': customer_sanitize(r, 'Phone'),
            'fax': customer_sanitize(r, 'Fax'),
            'last_contact': r['LastContact'],
            'notes': customer_sanitize(r, 'Notes')
        }

        # Replace missing states with hard coded values from above
        if data['customer_code'] in customer_states:
            data['state_id'] = lookup['states'][customer_states[data['customer_code']]]

        if data['customer_name'] == 'USFS Arapaho-Roosevelt National Forest':
            if arapaho_count > 0:
                data['customer_name'] += ' ' + str(arapaho_count)
            arapaho_count += 1

        # duplicates
        if data['customer_code'] == 'Ecoanalysts - Moscow, ID':
            continue

        cols = list(data.keys())
        values = [data[col] for col in cols]
        pgcurs.execute('INSERT INTO customers ({}) VALUES ({})'.format(','.join(cols), ','.join('s' * len(cols)).replace('s', '%s')), values)

    pgcon.commit()

    lookup['customers'] = load_lookup(pgcurs, 'customers', 'customer_id', 'customer_name')

    # Add duplicates here
    lookup['customers']['Ecoanalysts - Moscow, ID'] = lookup['customers']['EcoA-ID']


def lookup_id(lookup, lookup_key, row, row_key):
    return lookup[lookup_key][row[row_key]] if row[row_key] in lookup[lookup_key] else None


def sanitize(table, id_field, row, field):

    original = row[field]

    if not row[field]:
        return None

    if row[field].lower() in ['<null>', 'null']:
        log = Logger(table)
        log.info('NULL literal "{}" in field {} with key {}'.format(row[field], field, row[id_field]))
        return None

    stripped = original.strip()
    if len(stripped) != len(original):
        log = Logger(table)
        log.info('Stripped white space from "{}" in field {} with key {}'.format(row[field], field, row[id_field]))
        original = stripped

    if len(original) < 1:
        log = Logger(table)
        log.info('Empty string converted to NULL in field {} with key {}'.format(field, row[id_field]))
        return None

    return original


def import_boxes(mscon, pgcon, lookup):

    print('here')


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument('pghost', help='Postgres password', type=str)
    parser.add_argument('pgport', help='Postgres password', type=str)
    parser.add_argument('pgdb', help='Postgres password', type=str)
    parser.add_argument('pguser_name', help='Postgres user name', type=str)
    parser.add_argument('pgpassword', help='Postgres password', type=str)
    parser.add_argument('msdb', help='SQLServer password', type=str)
    parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    parser.add_argument('mspassword', help='SQLServer password', type=str)

    args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"))

    log.info('Postgres database: {}'.format(args.pgdb))
    log.info('SQLServer database: {}'.format(args.msdb))

    # Postgres Connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    try:
        database_migration(mscon, pgcon)

        pgcon.commit()
    except Exception as ex:
        pgcon.rollback()
        traceback.print_exc(file=sys.stdout)
        log.error(ex)
        sys.exit(1)

    sys.exit(0)


if __name__ == '__main__':
    main()
