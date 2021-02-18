from migrate_predictor_values import migrate as predictor_values
from migrate_organisms import migrate as organisms
from migrate_samples import migrate as samples
from migrate_sites import migrate as sites
from migrate_boxes import migrate as boxes
from migrate_entities import migrate as entities
from migrate_taxonomy_pivot import migrate as taxonomy
from migrate_projects import migrate as projects
from migrate_predictors import migrate as predictors
from lib.dotenv import parse_args_env
from lib.logger import Logger
from rscommons import Logger, dotenv
import os
import argparse
import pyodbc
import psycopg2
from psycopg2.extras import execute_values


def migrate_all_data(mscon, pgcon, predictor_csv_path, predictor_values_csv_path):

    # output_dir = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb')
    pgcurs = pgcon.cursor(cursor_factory=psycopg2.extras.DictCursor)
    mscurs = mscon.cursor()


<< << << < HEAD
sites(mscurs, pgcurs)
# predictor_values(pgcurs, predictor_values_csv_path)
== == == =
# predictors(predictor_csv_path, pgcurs)
projects(mscurs, pgcurs)
>>>>>> > ubuntu changes
taxonomy(mscurs, pgcurs)
entities(mscurs, pgcurs)
boxes(mscurs, pgcurs)
samples(mscurs, pgcurs)
<< << << < HEAD
projects(mscurs, pgcurs)
# organisms(mscurs, pgcurs)
== == == =
organisms(mscurs, pgcurs)

# Refresh any materialized views
pgcurs.execute('REFRESH MATERIALIZED VIEW taxa.vw_taxonomy_crosstab;')
pgcurs.execute('REFRESH MATERIALIZED VIEW sample.vw_map_data;')
>>>>>> > ubuntu changes

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
    parser.add_argument('predictor_values', help='Predictor values CSV', type=str)
    parser.add_argument('--verbose', help='verbose logging', default=False)

    args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    predictors = os.path.join(os.path.dirname(__file__), args.csv_path)
    predictor_values = os.path.join(os.path.dirname(__file__), args.predictor_values)

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"), verbose=args.verbose)

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    # Postgres connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)

    try:
        migrate_all_data(mscon, pgcon, predictors, predictor_values)
        pgcon.commit()
    except Exception as ex:
        log.error(str(ex))
        pgcon.rollback()


if __name__ == '__main__':
    main()
