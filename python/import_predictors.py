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

table_name = 'geo.predictors'


def migrate(sql_path, csv_path, pgcurs):

    log = Logger(table_name)

    # Load all existing predictors into memory
    predictors = lookup_data(pgcurs, 'geo.predictors', 'abbreviation')
    
    predictor_types = lookup_data(pgcurs, 'geo.predictor_types', 'predictor_type_name')
    units = lookup_data(pgcurs, 'geo.units', 'abbreviation')
    models = lookup_data(pgcurs, 'geo.models', 'abbreviation')

    raw_data = csv.DictReader(open(csv_path))
    log.info('Processing {:,} records for table geo.predictors'.format(len(list(raw_data))))

    counter = 0
    progbar = ProgressBar(len(list(raw_data)), 50, "predictors")
    raw_data = csv.DictReader(open(csv_path))
    for row in raw_data:
        predictor = row['Variable']

        if predictor in predictors:
            log.info('Predictor {} already exists. Skipping.'.format(predictor))
            continue

        predictor_type = row['Script'] if row['Script'] in predictor_types else 'Unknown'
        description = row['Variable Description']

        model = row['Model']
        if model not in models:
            raise Exception('Missing translation {}'.format(model))

        unit = row['Units']
        if not unit or len(unit) < 1 or unit not in units:
            unit = '??'

        metadata = {}
        add_metadata(metadata, 'function', row['Function Computed for Cells']),
        add_metadata(metadata, 'cellInfo', row['What do cells represent?']),
        add_metadata(metadata, 'cellSize', row['Cell size']),
        add_metadata(metadata, 'years', row['Years of data']),
        add_metadata(metadata, 'transformation', row['Transformation?']),
        add_metadata(metadata, 'dataPath', row['Data Path']),
        add_metadata(metadata, 'dataSource', row['Data Source']),
        add_metadata(metadata, 'exception', row['Exception for small sheds']),
        add_metadata(metadata, 'calculation', row['Calculation']),
        add_metadata(metadata, 'notes', row['Notes']),
        add_metadata(metadata, 'scriptConsolidated', row['Script Consolidated?']),
        add_metadata(metadata, 'coverageLevel', row['Coverage Level'])

        data = {
            'predictor_name': predictor,
            'abbreviation': predictor,
            'description': sanitize_string(description),
            'predictor_type_id': get_db_id(predictor_types, 'predictor_type_id', ['predictor_type_name'], predictor_type),
            'unit_id': get_db_id(units, 'unit_id', ['abbreviation'], unit),
            'metadata': json.dumps(metadata)
        }

        predictors[predictor] = insert_row(pgcurs, table_name, data, 'predictor_id')

        counter += 1
        progbar.update(counter)

    progbar.finish()
    log_row_count(pgcurs, table_name, len(predictors))
 
    # Write all predictors to SQL
    predictors = lookup_data(pgcurs, 'geo.predictors', 'predictor_id')
    write_sql_file(sql_path, 'geo.predictors', list(predictors.values()))
 

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
    sql_path = os.path.join(os.path.dirname(__file__),'../docker/postgres/initdb/20_geo_predictors.sql')
  
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
