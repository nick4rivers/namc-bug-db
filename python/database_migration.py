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
from model_predictors import import_model_predictors

csv_relative_path = '../data'


def database_migration(mscon, pgcon):

    pgcurs = pgcon.cursor()
    lookup = {
        # 'agency_categories': load_lookup(pgcurs, 'agency_categories', 'category_id', 'category_name'),
        'organization_types': load_lookup(pgcurs, 'entity.organization_types', 'organization_type_id', 'organization_type_name'),
        # 'agencies': load_lookup(pgcurs, 'agencies', 'agency_id', 'agency_name'),
        'life_stages': load_lookup(pgcurs, 'organism.life_stages', 'life_stage_id', 'life_stage_name'),
        'ecosystems': load_lookup(pgcurs, 'ecosystems', 'ecosystem_id', 'ecosystem_name'),
        'land_uses': load_lookup(pgcurs, 'sample.land_uses', 'land_use_id', 'land_use_name'),
        'habitats': load_lookup(pgcurs, 'sample.habitats', 'habitat_id', 'habitat_name'),
        'sample_types': load_lookup(pgcurs, 'sample.sample_types', 'sample_type_id', 'sample_type_name'),
        'systems': load_lookup(pgcurs, 'systems', 'system_id', 'system_name'),
        'states': load_lookup(pgcurs, 'geo.states', 'state_id', 'state_name'),
        'counties': load_lookup(pgcurs, 'geo.counties', 'county_id', 'county_name'),
        'countries': load_lookup(pgcurs, 'geo.countries', 'country_id', 'abbreviation'),
        'taxa_levels': load_lookup(pgcurs, 'organism.taxa_levels', 'taxa_level_id', 'taxa_level_name'),
        # 'models': load_lookup(pgcurs, 'models', 'model_id', 'model_name'),
        'sample_methods': load_lookup(pgcurs, 'sample.sample_methods', 'sample_method_id', 'sample_method_name'),
        'box_statuses': load_lookup(pgcurs, 'sample.box_states', 'box_state_id', 'box_state_name')
        # 'datums': load_lookup(pgcurs, 'datums', 'datum_id', 'datum_name'),
        # 'labs': load_lookup(pgcurs, 'labs', 'lab_id', 'lab_name')
    }

    model_predictors_csv = os.path.join(os.path.dirname(__file__), csv_relative_path, 'model_predictors.csv')

    migrate_taxa(mscon, pgcon)

    # migrate_labs(mscon, pgcon, lookup)
    # migrate_private_orgs(mscon, pgcon, lookup)

    # migration_path = os.path.join(os.path.dirname(__file__), 'migration.json')
    # with open(migration_path) as f:
    #     tables = json.load(f)

    # for table in tables:
    #     migrate(mscon, pgcon, lookup, table)

    print('Database migration complete')


def migrate_taxa(mscon, pgcon):

    pgcurs = pgcon.cursor()
    pgcurs.execute('SELECT taxa_level_id, taxa_level_name FROM organism.taxa_levels ORDER BY taxa_level_rank')
    levels = [(row[0], row[1]) for row in pgcurs.fetchall()]
    level_lookup = {level_name: level_id for level_id, level_name in levels}
    level_lookup_by_id = {level_id: level_name for level_id, level_name in levels}

    mscurs = mscon.cursor()
    hierarchy = {'Animalia': {'level': 'Kingdom', ' children': {}}}
    for level_id, level_name in levels:

        mscurs.execute("SELECT Count(*) FROM PilotDB.dbo.Taxonomy WHERE TaxaLevel = ?", [level_name])
        # print('Processing', '{}'.format(mscurs.fetchone()[0]), level_name, 'organisms')

        mscurs.execute("SELECT * FROM PilotDB.dbo.Taxonomy WHERE TaxaLevel = ?", [level_name])

        for msrow in mscurs.fetchall():
            msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

            org_level_id = level_lookup[level_name]
            org_parent_level_name = level_lookup_by_id[org_level_id - 1]

            org_name = sanitize_string_col('PilotDB.Taxonomy', 'Code', msdata, level_name)
            org_scientific_name = sanitize_string_col('PilotDB.Taxonomy', 'Code', msdata, 'ScientificName')
            org_parent = sanitize_string_col('PilotDB.Taxonomy', 'Code', msdata, org_parent_level_name)

            # print(org_name, org_scientific_name, org_parent)


# def migrate(mscon, pgcon, lookup, table_info):

#     origin_table = table_info['originTable']
#     target_table = table_info['targetTable']
#     origin_id_field = table_info['originIdField']
#     target_id_field = table_info['targetIdField']
#     target_name_field = table_info['targetNameField']

#     log = Logger(origin_table)
#     error_count = 0

#     mscurs = mscon.cursor()
#     mscurs.execute('SELECT Count(*) FROM PilotDB.dbo.{}'.format(origin_table))
#     origin_rows = mscurs.fetchone()[0]
#     log.info('{} values in origin table {}.'.format(origin_rows, origin_table))

#     pgcurs = pgcon.cursor()
#     mscurs.execute('SELECT * FROM PilotDB.dbo.{}'.format(origin_table))
#     for row in mscurs.fetchall():
#         row = dict(zip([t[0] for t in row.cursor_description], row))

#         data = {}
#         for origin_field, target_field in table_info['columns'].items():
#             if isinstance(target_field, dict):
#                 if isinstance(target_field['lookup'], dict):
#                     lookup_values = target_field['lookup']
#                 else:
#                     if target_field['lookup'] in lookup:
#                         lookup_values = lookup[target_field['lookup']]
#                     else:
#                         if 'missing' in targetfield:
#                             if row[origin_id_field] in missing:
#                                 lookup_values

#                 if row[origin_field] in lookup_values:
#                     data[target_field['targetField']] = lookup_values[row[origin_field]]

#             elif isinstance(row[origin_field], str):
#                 data[target_field] = sanitize_string_col(origin_table, origin_id_field, row, origin_field)
#             else:
#                 data[target_field] = row[origin_field]

#         cols = list(data.keys())
#         values = [data[col] for col in cols]
#         try:
#             pgcurs.execute('INSERT INTO {} ({}) VALUES ({})'.format(target_table, ','.join(cols), ','.join('s' * len(cols)).replace('s', '%s')), values)
#         except Exception as ex:
#             log.error(str(ex))
#             error_count += 1

#     if error_count > 0:
#         pgcon.rollback()
#         raise 'Aborting table {} due to {} errors.'.format(origin_table, error_count)

#     # pgcon.commit()

#     pgcurs.execute('SELECT Count(*) FROM {}'.format(target_table))
#     target_rows = pgcurs.fetchone()[0]

#     if target_rows != origin_rows:
#         log.warning('{} has {} rows, while origin table {} has {} rows.'.format(target_table, target_rows, origin_table, origin_rows))
#     else:
#         log.info('Table {} ({}) migrated to {} ({}) successfully.'.format(origin_table, origin_rows, target_table, target_rows))

#     # Return the values as a dictionary so that they can be used as lookup
#     if target_id_field and target_name_field:
#         pgcurs.execute('SELECT {}, {} FROM {}'.format(target_id_field, target_name_field, target_table))
#         lookup[target_table] = {row[1]: row[0] for row in pgcurs.fetchall()}


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

    # try:
    database_migration(mscon, pgcon)

    pgcon.commit()
    # except Exception as ex:
    #     pgcon.rollback()
    #     traceback.print_exc(file=sys.stdout)
    #     log.error(ex)
    #     sys.exit(1)

    sys.exit(0)


if __name__ == '__main__':
    main()
