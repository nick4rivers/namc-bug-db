import os
import sys
import argparse
from rscommons import Logger, ProgressBar, dotenv
import psycopg2
import getpass
import datetime
from psycopg2.extras import execute_values
import pyodbc
from utilities import sanitize_string_col

csv_relative_path = '../data'


def migrate_taxonomy(mscon, pgcon, output_path):

    log = Logger('taxonomy')

    pgcurs = pgcon.cursor()
    pgcurs.execute('SELECT level_id, level_name FROM organism.taxa_levels ORDER BY level_rank')
    levels = [(row[0], row[1]) for row in pgcurs.fetchall()]
    level_lookup = {level_name: level_id for level_id, level_name in levels}
    level_lookup_by_id = {level_id: level_name for level_id, level_name in levels}

    mscurs = mscon.cursor()

    hierarchy = {'Kingdom': [{
        'taxonomy_id': 1,
        'taxonomy_name': 'Animalia',
        'level_id': level_lookup['Kingdom'],
        'parent_id': None,
        'author': None,
        'year': None
    }]}

    for org_level_id, level_name in levels:

        mscurs.execute("SELECT Count(*) FROM PilotDB.dbo.Taxonomy WHERE TaxaLevel = ?", [level_name])
        print('Processing', '{}'.format(mscurs.fetchone()[0]), level_name, 'organisms')

        if level_name not in hierarchy:
            hierarchy[level_name] = []

        mscurs.execute("SELECT * FROM PilotDB.dbo.Taxonomy WHERE TaxaLevel = ?", [level_name])
        for msrow in mscurs.fetchall():
            msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

            org_parent_level_name = level_lookup_by_id[org_level_id - 1]
            org_name = sanitize_string_col('PilotDB.Taxonomy', 'Code', msdata, level_name)
            org_scientific_name = sanitize_string_col('PilotDB.Taxonomy', 'Code', msdata, 'ScientificName')
            org_parent = sanitize_string_col('PilotDB.Taxonomy', 'Code', msdata, org_parent_level_name)
            org_author = sanitize_string_col('PilotDB.Taxonomy', 'Code', msdata, 'Author')
            org_year = int(msdata['Year']) if msdata['Year'] else None

            try:
                org_parent_id = get_parent_id(hierarchy[org_parent_level_name], org_parent)
            except Exception as ex:
                log.error("Failed to find parent for '{}' at level {}, with parent '{}' of {}".format(org_name, level_name, org_parent, org_parent_level_name))
                continue

            hierarchy[level_name].append({
                'level': level_name,
                'taxonomy_id': msdata['Code'],
                'taxonomy_name': org_name,
                'scientific_name': org_scientific_name,
                'level_id': org_level_id,
                'parent_id': org_parent_id,
                'author': org_author,
                'year': org_year})

            # print(org_name, org_scientific_name, org_parent)

    with open(output_path, 'w') as f:
        for level_name, level_data in hierarchy.items():
            for org_data in level_data:
                f.write('INSERT INTO organism.taxonomy(taxonomy_id, taxonomy_name, level_id, parent_id, scientific_name, author, year) VALUES({}, {}, {}, {}, {}, {}, {})'.format(
                    org_data['taxonomy_id'],
                    org_data['taxonomy_name'],
                    org_data['level_id'],
                    org_data['parent_id'],
                    org_data['scientific_name'],
                    org_data['author'],
                    org_data['year']
                ))


def get_parent_id(items, name):

    if not name:
        raise Exception('Missing parent')

    for organism in items:
        if organism['taxonomy_name'].lower() == name.lower():
            return organism['taxonomy_id']

    raise Exception('Failed to find parent')


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
    parser.add_argument('output_path', help='Output SQL file', type=str)

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

    output_path = os.path.join(os.path.dirname(__file__), 'docker/postgres/initdb', args.output_path)

    migrate_taxonomy(mscon, pgcon, output_path)


if __name__ == '__main__':
    main()
