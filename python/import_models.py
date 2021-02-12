"""
    Takes the CSV of model predictors and appends them to the predictor
    SQL file ready for database initiation.

    REPEAT: This script is not part of the main data migration. It is a
    step that should be run as part of the main migration routine.

    It assumes that Postgres is up and running with some or all predictors
    already loaded. It will then insert any predictors it gets from the 
    CSV file and then write ALL predictors out to SQL file ready for next
    database initiatization.
"""
import os
import csv
import json
import psycopg2
import argparse
from rscommons import Logger, dotenv
from psycopg2.extras import execute_values
from rscommons import Logger, ProgressBar
from utilities import sanitize_string, format_values, add_metadata, write_sql_file
from postgres_lookup_data import lookup_data, insert_row, log_row_count
from lookup_data import get_db_id

table_name = 'geo.models'


def migrate(sql_path, csv_path, pgcurs):

    log = Logger(table_name)

    # Load all existing models into memory
    models = lookup_data(pgcurs, 'geo.models', 'abbreviation')

    raw_data = csv.DictReader(open(csv_path))
    log.info('Processing {:,} predictors from CSV file'.format(len(list(raw_data))))

    counter = 0
    progbar = ProgressBar(len(list(raw_data)), 50, "models")
    raw_data = csv.DictReader(open(csv_path))
    for row in raw_data:
        model = row['Model']

        if model in models:
            log.info('Model {} already exists. Skipping.'.format(model))
            continue

        data = {
                'abbreviation': model,
                'model_name': model,
        }

        models[model] = insert_row(pgcurs, table_name, data, 'model_id')
        counter += 1
        progbar.update(counter)

    progbar.finish()
    log_row_count(pgcurs, table_name, len(models))


    models = lookup_data(pgcurs, 'geo.models', 'model_id')
    write_sql_file(sql_path, 'geo.models', list(models.values()))
 

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('pghost', help='Postgres password', type=str)
    parser.add_argument('pgport', help='Postgres password', type=str)
    parser.add_argument('pgdb', help='Postgres password', type=str)
    parser.add_argument('pguser_name', help='Postgres user name', type=str)
    parser.add_argument('pgpassword', help='Postgres password', type=str)
    parser.add_argument('csv_path', help='Input translation indicator CSV', type=str)
    parser.add_argument('--verbose', help='verbose logging', default=False)

    args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    predictors = os.path.join(os.path.dirname(__file__), args.csv_path)
    sql_path = os.path.join(os.path.dirname(__file__),'../docker/postgres/initdb/10_geo_models.sql')
  
    log = Logger('Model Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_models.log"), verbose=args.verbose)

    # Postgres connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)
    pgcurs = pgcon.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        migrate(sql_path, predictors, pgcurs)

        # Rollback the database. We don't want the records we inserted... we just want their IDs.
        # Rolling back ensures the same IDs with subsequent runs.
        pgcon.rollback()
    except Exception as ex:
        log.error(str(ex))
        pgcon.rollback()


if __name__ == '__main__':
    main()
