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


def migrate_projects(mscon, pgcon, output_path):

    log = Logger('projects')

    mscurs = mscon.cursor()

    mscurs.execute("SELECT Count(*) FROM PilotDB.dbo.Project")
    print('Processing', '{}'.format(mscurs.fetchone()[0]), 'projects')

    mscurs.execute("SELECT * FROM PilotDB.dbo.Project")
    projects = []
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))
        projects.append({
            'project_id': msdata['ProjectID'],
            'project_name': sanitize_string_col('Project', 'ProjectID', msdata, 'Name'),
            'description': sanitize_string_col('Project', 'ProjectID', msdata, 'ProjectDesc'),
            'is_private': True if not msdata['Privacy'] or msdata['Privacy'].lower() == 'p' else False
        })

    with open(output_path, 'w') as f:
        for prj in projects:
            f.write("INSERT INTO sample.projects(project_id, project_name, description, is_private) VALUES({}, '{}', '{}', {});\n".format(
                prj['project_id'],
                prj['project_name'],
                prj['description'],
                prj['is_private']
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

    output_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', args.output_path)

    migrate_projects(mscon, pgcon, output_path)


if __name__ == '__main__':
    main()
