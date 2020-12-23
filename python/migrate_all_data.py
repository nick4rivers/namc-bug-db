import os
import argparse
import pyodbc
import psycopg2
from psycopg2.extras import execute_values
from rscommons import Logger, dotenv
from migrate_predictors import migrate as predictors
from migrate_projects import migrate as projects
from migrate_taxonomy_pivot import migrate as taxonomy
from migrate_entities import migrate as entities
from migrate_boxes import migrate as boxes
from migrate_sites import migrate as sites
from migrate_samples import migrate as samples
from migrate_organisms import migrate as organisms


def migrate_all_data(mscon, pgcon, predictor_csv_path):

    # output_dir = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb')
    pgcurs = pgcon.cursor(cursor_factory=psycopg2.extras.DictCursor)
    mscurs = mscon.cursor()

    predictors(predictor_csv_path, pgcurs)
    projects(mscurs, pgcurs)
    taxonomy(mscurs, pgcurs)
    entities(mscurs, pgcurs)
    boxes(mscurs, pgcurs)
    sites(mscurs, pgcurs)
    samples(mscurs, pgcurs)
    organisms(mscurs, pgcurs)

    log = Logger('Migration')
    pgcurs = pgcon.cursor()
    pgcurs.execute("SELECT pg_size_pretty( pg_database_size('bugdb') );")
    log.info('Migration complete. Postgres database is {}'.format(pgcurs.fetchone()[0]))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('msdb', help='SQLServer password', type=str)
    parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    parser.add_argument('mspassword', help='SQLServer password', type=str)

    parser.add_argument('pghost', help='Postgres password', type=str)
    parser.add_argument('pgport', help='Postgres password', type=str)
    parser.add_argument('pgdb', help='Postgres password', type=str)
    parser.add_argument('pguser_name', help='Postgres user name', type=str)
    parser.add_argument('pgpassword', help='Postgres password', type=str)

    parser.add_argument('csv_path', help='Input translation indicator CSV', type=str)
    parser.add_argument('--verbose', help='verbose logging', default=False)

    args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    indicator_csv_path = os.path.join(os.path.dirname(__file__), args.csv_path)

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"), verbose=args.verbose)

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    # Postgres connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)

    try:
        migrate_all_data(mscon, pgcon, indicator_csv_path)
        pgcon.commit()
    except Exception as ex:
        log.error(str(ex))
        pgcon.rollback()


if __name__ == '__main__':
    main()
