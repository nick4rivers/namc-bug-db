"""
Main database migration script to move data from SQL Server
PilotDB and BugLab to Postgres
"""
import os
import argparse
import pyodbc
import psycopg2
from psycopg2.extras import execute_values
from migrate_predictor_values import migrate as predictor_values
from migrate_organisms import migrate as organisms
from migrate_samples import migrate as samples
from migrate_sites import migrate as sites
from migrate_sites import migrate_model_reference_sites as model_reference_sites
from migrate_boxes import migrate as boxes, update_box_states
from migrate_boxes import associate_models_with_boxes, update_box_states
from migrate_entities import migrate as entities
from migrate_taxonomy_pivot import migrate as taxonomy_synonyms_attributes
from migrate_projects import migrate as projects
from migrate_model_results import migrate as model_results
from lib.dotenv import parse_args_env
from lib.logger import Logger
from migrate_model_polygons import model_extent_polygons, associate_models_with_entities
from migrate_catchment_polygons import site_catchment_polygons


def migrate_all_data(mscon, pgcon, predictor_values_csv_path, metric_values_csv_path, model_polygons_geojson_path, parent_entities, catchment_polygons, model_ref_sites):
    """This is the main top level function for migrating data"""

    pgcurs = pgcon.cursor(cursor_factory=psycopg2.extras.DictCursor)
    mscurs = mscon.cursor()

    taxonomy_synonyms_attributes(mscurs, pgcurs)

    entities(mscurs, pgcurs, parent_entities)
    associate_models_with_entities(pgcurs)

    for db_name in ('PilotDB', 'BugLab'):

        sites(mscurs, pgcurs, db_name)
        boxes(mscurs, pgcurs, db_name)

        sample_ids = samples(mscurs, pgcurs, db_name)
        organisms(mscurs, pgcurs, db_name, sample_ids)

    update_box_states(mscurs, pgcurs)
    model_reference_sites(pgcurs, model_ref_sites)
    model_results(pgcurs, metric_values_csv_path)
    # model_extent_polygons(pgcurs, model_polygons_geojson_path)

    # Import GeoJSON catchment polygons from local file exported from ShapeFile provided by NAMC
    site_catchment_polygons(pgcurs, catchment_polygons)

    associate_models_with_boxes(pgcurs, predictor_values_csv_path)

    predictor_values(pgcurs, predictor_values_csv_path)
    projects(mscurs, pgcurs)

    # Refresh any materialized views
    pgcurs.execute('REFRESH MATERIALIZED VIEW taxa.vw_taxonomy_crosstab;')
    # pgcurs.execute('REFRESH MATERIALIZED VIEW sample.vw_map_data;')
    pgcurs.execute('REFRESH MATERIALIZED VIEW sample.vw_samples;')

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

    parser.add_argument('predictor_values', help='Predictor values CSV', type=str)
    parser.add_argument('metric_values', help='Metric values CSV', type=str)
    parser.add_argument('model_polygons', help='Model extent polygon GeoJSON', type=str)
    parser.add_argument('parent_entities', help='JSON file defining parent entities', type=str)
    parser.add_argument('catchment_polygons', help='Catchment polygon GeoJSON', type=str)
    parser.add_argument('model_reference_sites', help='Model reference istes', type=str)

    parser.add_argument('--verbose', help='verbose logging', default=False)

    args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    predictor_values_path = os.path.join(os.path.dirname(__file__), args.predictor_values)
    metric_values_path = os.path.join(os.path.dirname(__file__), args.metric_values)
    parent_entities_path = os.path.join(os.path.dirname(__file__), args.parent_entities)
    model_ref_sites_path = os.path.join(os.path.dirname(__file__), args.model_reference_sites)

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"), verbose=args.verbose)

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    # Postgres connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)

    try:
        migrate_all_data(mscon, pgcon, predictor_values_path, metric_values_path, args.model_polygons, parent_entities_path, args.catchment_polygons, model_ref_sites_path)
        pgcon.commit()
    except Exception as ex:
        log.error(str(ex))
        pgcon.rollback()


if __name__ == '__main__':
    main()
