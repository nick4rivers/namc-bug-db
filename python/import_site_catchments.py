import os
import json
import pyodbc
import argparse
import psycopg2
from psycopg2.extras import execute_values

from lookup_data import get_db_id
from postgres_lookup_data import lookup_data, log_row_count, insert_many_rows
from utilities import sanitize_string_col, sanitize_string, add_metadata, write_sql_file, log_record_count, merge_string_fields
from lib.logger import Logger
from lib.progress_bar import ProgressBar
import json
from shapely.geometry import shape, GeometryCollection
from lib.dotenv import parse_args_env


def import_site_catchments(pgcurs, catchments_path):

    with open(catchments_path) as f:
        features = json.load(f)["features"]

    counter = 0
    successful = 0
    unsuccessful = 0
    progbar = ProgressBar(len(features), 50, "Catchments")
    for feature in features:
        site_code = feature['properties']['SiteCode']

        pgcurs.execute("UPDATE geo.sites SET catchment = ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326) WHERE site_name = %s", [json.dumps(feature['geometry']), site_code])
        if pgcurs.rowcount == 0:
            unsuccessful += 1
        else:
            successful += 1
        counter += 1
        progbar.update(counter)

    progbar.finish()

    print("Complete. {} successful and {} unsuccessful".format(successful, unsuccessful))


def main():
    parser = argparse.ArgumentParser()
    # parser.add_argument('msdb', help='SQLServer password', type=str)
    # parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    # parser.add_argument('mspassword', help='SQLServer password', type=str)

    parser.add_argument('pghost', help='Postgres password', type=str)
    parser.add_argument('pgport', help='Postgres password', type=str)
    parser.add_argument('pgdb', help='Postgres password', type=str)
    parser.add_argument('pguser_name', help='Postgres user name', type=str)
    parser.add_argument('pgpassword', help='Postgres password', type=str)

    parser.add_argument('catchments_json', help='Catchments JSON', type=str)
    parser.add_argument('--verbose', help='verbose logging', default=False)

    args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    # catchments_json = os.path.join(os.path.dirname(__file__), args.metric_values)

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"), verbose=args.verbose)

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    # mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    # Postgres connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)
    pgcurs = pgcon.cursor()

    try:
        import_site_catchments(pgcurs, args.catchments_json)
        pgcon.commit()
    except Exception as ex:
        log.error(str(ex))
        pgcon.rollback()


if __name__ == '__main__':
    main()
