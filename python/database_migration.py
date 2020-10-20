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
        'agencies': load_lookup(pgcurs, 'agencies', 'agency_id', 'agency_name'),
        'life_stages': load_lookup(pgcurs, 'life_stages', 'life_stage_id', 'life_stage_name'),
        'ecosystems': load_lookup(pgcurs, 'ecosystems', 'ecosystem_id', 'ecosystem_name'),
        'land_uses': load_lookup(pgcurs, 'land_uses', 'land_use_id', 'land_use_name'),
        'habitats': load_lookup(pgcurs, 'habitats', 'habitat_id', 'habitat_name'),
        'sample_types': load_lookup(pgcurs, 'sample_types', 'sample_type_id', 'sample_type_name'),
        'systems': load_lookup(pgcurs, 'systems', 'system_id', 'system_name'),
        'counties': load_lookup(pgcurs, 'counties', 'county_id', 'county_name'),
        'taxa_levels': load_lookup(pgcurs, 'taxa_levels', 'taxa_level_id', 'taxa_level_name'),
        'models': load_lookup(pgcurs, 'models', 'model_id', 'model_name'),
        'sample_methods': load_lookup(pgcurs, 'sample_methods', 'sample_method_id', 'sample_method_name'),
        'box_statuses': load_lookup(pgcurs, 'box_statuses', 'box_status_id', 'box_status_name'),
        'datums': load_lookup(pgcurs, 'datums', 'datum_id', 'datum_name'),
        'labs': load_lookup(pgcurs, 'labs', 'lab_id', 'lab_name')
    }

    import_boxes(mscon, pgcon, lookup)


def load_lookup(pgcurs, table, id_col, name_col):

    pgcurs.execute('SELECT {}, {} FROM {}'.format(id_col, name_col, table))
    return {row[1]: row[0] for row in pgcurs.fetchall()}


def import_boxes(mscon, pgcon, loopup):

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
