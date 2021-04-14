import json
import psycopg2
from psycopg2.extras import execute_values
import psycopg2
from psycopg2.extras import execute_values
from lib.logger import Logger
from lib.progress_bar import ProgressBar


def migrate_catchment_polygons(pgcurs, geojson_path):

    with open(geojson_path) as f:
        features = json.load(f)["features"]

    log = Logger('Catchment Polygons')
    log.info('{} catchment polygons retrieved from GeoJSON at {}'.format(len(features), geojson_path))

    counter = 0
    successful = 0
    unsuccessful = 0
    progbar = ProgressBar(len(features), 50, "Catchment Polygons")
    for feature in features:
        reach_id = feature['properties']['REACHID']
        station = feature['properties']['STATION']
        site_name = station if reach_id is None else reach_id

        pgcurs.execute('SELECT site_id FROM geo.sites WHERE site_name = %s', [site_name])
        row = pgcurs.fetchone()
        if row is None:
            log.warning('site {} has duplicate polygon defined.'.format(site_name))
            unsuccessful += 1
        else:
            pgcurs.execute('UPDATE geo.sites SET catchment = ST_SetSRID(ST_MULTI(ST_GeomFromGeoJSON(%s)), 4326) WHERE site_id = %s', [json.dumps(feature['geometry']), row['site_id']])
            successful += 1
        counter += 1
        progbar.update(counter)

    progbar.finish()
    log.info('{} site catchment polygons updated successfully'.format(successful))
    log.info('{} site catchment polygons were skipped because the sites already had catchmnets.'.format(unsuccessful))

    log.info('Catchment polygon migration complete')
