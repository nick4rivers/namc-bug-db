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


def migrate_taxonomy(mscon, output_path):

    log = Logger('taxonomy')

    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.taxa.Taxonomy")
    taxa = {}
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        if msdata['code'] in taxa:
            raise Exception('duplicate code {} in raw data'.format(msdata['code']))

        taxa[msdata['code']] = {
            'parent_id': msdata['parent_code'],
            'level_id': msdata['taxa_level_id'],
            'scientific_name': sanitize_string_col('taxaonomy', 'code', msdata, 'scientific_name')
        }

    with open(output_path, 'w') as f:
        for id, data in taxa.items():
            f.write("INSERT INTO taxa.taxonomy(taxonomy_id, scientific_name, level_id, parent_id, author, year) VALUES({}, '{}', {}, {}, {}, {});\n".format(
                id,
                data['scientific_name'],
                data['level_id'],
                data['parent_id'],
                'NULL',
                'NULL'
            ))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('msdb', help='SQLServer password', type=str)
    parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    parser.add_argument('mspassword', help='SQLServer password', type=str)
    parser.add_argument('output_path', help='Output SQL file', type=str)

    args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"))

    log.info('SQLServer database: {}'.format(args.msdb))

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    output_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', args.output_path)

    migrate_taxonomy(mscon, output_path)


if __name__ == '__main__':
    main()
