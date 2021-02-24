"""
    Takes the CSV of model predictors and writes them to SQL insert 
    statements.

    It assumes that Postgres is up and running with ALL predictors
    and models already loaded. It will then load the relationships
    from the CSV file and write an SQL insert file.
"""
import os
import csv
import json
import psycopg2
import argparse
from lib.dotenv import parse_args_env
from lib.logger import Logger
from lib.progress_bar import ProgressBar
from psycopg2.extras import execute_values
from utilities import sanitize_string, format_values, add_metadata, write_sql_file
from postgres_lookup_data import lookup_data, insert_row, log_row_count
from lookup_data import get_db_id

table_name = 'geo.model_predictors'


def migrate(sql_path, csv_path, pgcurs):

    log = Logger(table_name)

    # Load all existing predictors and models into memory
    predictors = lookup_data(pgcurs, 'geo.predictors', 'abbreviation')
    models = lookup_data(pgcurs, 'geo.models', 'abbreviation')

    raw_data = csv.DictReader(open(csv_path))
    log.info('Processing {:,} records for table geo.predictors'.format(len(list(raw_data))))

    values = []
    counter = 0
    progbar = ProgressBar(len(list(raw_data)), 50, "predictors")
    raw_data = csv.DictReader(open(csv_path))
    for row in raw_data:
        model = row['Model']
        predictor = row['Variable']

        if predictor not in predictors:
            raise Exception('Predictor {} missing from database'.format(predictor))

        if model not in models:
            raise Exception('Model {} missing from database'.format(model))

        values.append({
            'model_id': get_db_id(models, 'model_id', ['abbreviation'], model),
            'predictor_id': get_db_id(predictors, 'predictor_id', ['abbreviation'], predictor),
        })

        counter += 1
        progbar.update(counter)

    progbar.finish()

    # Write all model predictor relationships to SQL
    write_sql_file(sql_path, 'geo.model_predictors', values)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('pghost', help='Postgres password', type=str)
    parser.add_argument('pgport', help='Postgres password', type=str)
    parser.add_argument('pgdb', help='Postgres password', type=str)
    parser.add_argument('pguser_name', help='Postgres user name', type=str)
    parser.add_argument('pgpassword', help='Postgres password', type=str)
    parser.add_argument('csv_path', help='Input translation indicator CSV', type=str)
    parser.add_argument('--verbose', help='verbose logging', default=False)

    args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    predictors = os.path.join(os.path.dirname(__file__), args.csv_path)
    sql_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb/30_geo_model_predictors.sql')

    log = Logger('Predictor Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_predictors.log"), verbose=args.verbose)

    # Postgres connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)
    pgcurs = pgcon.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        migrate(sql_path, predictors, pgcurs)
        pgcon.rollback()

    except Exception as ex:
        log.error(str(ex))
        pgcon.rollback()


if __name__ == '__main__':
    main()
