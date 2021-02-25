"""

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


def import_catchments(pgcurs, catchments_path):

    log = Logger(table_name)

    # Load all existing predictors and models into memory
    sites = lookup_data(pgcurs, 'geo.sites', 'site_name')

    with open(catchments_path) as f:
        data = json.load(f)

        inserts = 0
        missing = 0
        for feature in data['features']:
            geom = feature['geometry']
            name = feature['properties']['Name']

            if name in sites:
                site_id = get_db_id(sites, 'site_id', ['site_name'], name)
                log.info('Site found for {}'.format(name))
                pgcurs.execute("UPDATE geo.sites SET catchment = ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326) WHERE site_id = %s", [json.dumps(geom), site_id])
                inserts += 1
            else:
                log.warning('No site found for {}'.format(name))
                missing += 1

    log.info('Catchment import completed successfully. {} inserts and {} missing.'.format(inserts, missing))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('pghost', help='Postgres password', type=str)
    parser.add_argument('pgport', help='Postgres password', type=str)
    parser.add_argument('pgdb', help='Postgres password', type=str)
    parser.add_argument('pguser_name', help='Postgres user name', type=str)
    parser.add_argument('pgpassword', help='Postgres password', type=str)
    parser.add_argument('catchments_path', help='Catchment KML file', type=str)
    parser.add_argument('--verbose', help='verbose logging', default=False)

    args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    log = Logger('Import Catchments')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "import_catchments.log"), verbose=args.verbose)

    log.info('Processing polygons from: {}'.format(args.catchments_path))

    # Postgres connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)
    pgcurs = pgcon.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        import_catchments(pgcurs, args.catchments_path)
        pgcon.commit()

    except Exception as ex:
        log.error(str(ex))
        pgcon.rollback()


if __name__ == '__main__':
    main()
