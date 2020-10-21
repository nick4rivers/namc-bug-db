import os
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

    import_customers(mscon, pgcon, lookup)
    import_boxes(mscon, pgcon, lookup)


def load_lookup(pgcurs, table, id_col, name_col):

    pgcurs.execute('SELECT {}, {} FROM {}'.format(id_col, name_col, table))
    return {row[1]: row[0] for row in pgcurs.fetchall()}


def import_customers(mscon, pgcon, lookup):

    arapaho_count = 0

    pgcurs = pgcon.cursor()

    mscurs = mscon.cursor()
    mscurs.execute('SELECT * FROM PilotDB.dbo.Customer')
    for row in mscurs.fetchall():
        r = dict(zip([t[0] for t in row.cursor_description], row))
        data = {
            'customer_code': r['CustID'],
            'category_id': lookup_id(lookup, 'agency_categories', r, 'Category'),
            'agency_id': lookup_id(lookup, 'agencies', r, 'Agency'),
            'customer_name': sanitize(r['Customer']),
            'address1': sanitize(r['Address1']),
            'address2': sanitize(r['Address2']),
            'city': sanitize(r['City']),
            'state_id': lookup_id(lookup, 'states', r, 'State'),
            'zip_code': sanitize(r['ZipCode']),
            'contact': sanitize(r['Contact']),
            'phone': sanitize(r['Phone']),
            'fax': sanitize(r['Fax']),
            'last_contact': r['LastContact'],
            'notes': sanitize(r['Notes'])
        }

        # Missing states
        if data['customer_code'] == 'BLM-NV-014':
            data['state_id'] = lookup['states']['NV']

        if data['customer_code'] == 'DEQ-02':
            data['state_id'] = lookup['states']['UT']

        if data['customer_code'] == 'IDEQ':
            data['state_id'] = lookup['states']['ID']

        if data['customer_code'] == 'ISU':
            data['state_id'] = lookup['states']['ID']

        if data['customer_code'] == 'NPS-KLMN':
            data['state_id'] = lookup['states']['OR']

        if data['customer_code'] == 'Private-01':
            data['state_id'] = lookup['states']['OR']

        if data['customer_code'] == 'R02F10B':
            data['state_id'] = lookup['states']['CO']

        if data['customer_code'] == 'USU-Armstrong':
            data['state_id'] = lookup['states']['UT']

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


def sanitize(original):

    if not original:
        return None

    if original.lower() == '<null>':
        print('literal <null> encountered')
        return None

    if original.lower() == 'null':
        print('literal null encountered')
        return None

    original = original.strip()

    if len(original) < 1:
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
        log.error(ex)


if __name__ == '__main__':
    main()
