""" This script updates the geo.models table with geometries from a GeoJSON
    file. For statewide models it uses the polygons from the geo.states table.

    The GeoJSON file was generated from a ShapeFile of models provided by Kristin
    Maier and exported to GeoJSON using QGIS.
    """
import json
import psycopg2
from psycopg2.extras import execute_values
import psycopg2
from psycopg2.extras import execute_values
from lib.logger import Logger
from lib.progress_bar import ProgressBar

# GeoJSON names keyed to database model abbreviations for those that don't match the database.
# The model attribute column in the original ShapeFile uses old model names. Note that
# some of the records in the ShapeFile apply to multiple models (e.g. AREMP)
model_names = {
    'AREMP': ['AREMP OE', 'AREMP MMI'],
    'CO-EDAS2017-Biotype1': ['CO EDAS Biotype 1'],
    'CO-EDAS2017-Biotype2': ['CO EDAS Biotype 2'],
    'CO-EDAS2017-Biotype3': ['CO EDAS Biotype 3'],
    'ColumbiaRiverBasin_PIBO': ['PIBO'],
    'OR_MarineWesternCoastalForest': ['OR - MWCF'],
    'OR_NorthernBasinRange': ['OR NBR'],
    'OR_WesternCordillera_ColumbiaPlateau': ['OR - WCCP'],
    'WY2018_BIGHORN BASIN FOOTHILLS': ['WY - Bighorn basin foothills'],
    'WY2018_BLACK HILLS': ['WY - Black hills'],
    'WY2018_GRANITIC MNTS': ['WY - Granitic mountains'],
    'WY2018_HIGH VALLEYS': ['WY - High valleys'],
    'WY2018_NE PLAINS': ['WY - NE Plains'],
    'WY2018_SE PLAINS': ['WY - SE Plains'],
    'WY2018_SEDIMENTARY MNTS': ['WY - Sedimentary mountains'],
    'WY2018_SOUTH FH LARAMIE RANGE': ['WY - Southern foothills and Laramie range'],
    'WY2018_SOUTHERN ROCKIES': ['WY - Southern rockies'],
    'WY2018_VOLCANIC MOUNTAINS AND VALLEYS': ['WY - Volcanic mountains and valleys'],
    'WY2018_WYOMING BASIN': ['WY - Wyoming basin'],
    'WestWide_Eastern_Xeric_Plains': ['WestWide2018_XericEasternPlains'],
    'WestWide2018_OtherEcoregions': ['WestWide2018_OtherEcoregions']
}

# List of statewide models that need the polygons from the geo.states table
# Note that some models are populated from a union of multiple states.
statewide_models = {
    'CSCI': ['CA'],
    'UT All Seasons': ['UT'],
    'NV MMI': ['NV'],
    'TN': ['WA', 'ID', 'MT', 'WY', 'CO', 'UT', 'OR', 'CA', 'NV', 'AZ', 'NM'],
    'TP': ['WA', 'ID', 'MT', 'WY', 'CO', 'UT', 'OR', 'CA', 'NV', 'AZ', 'NM'],
    'EC12': ['WA', 'ID', 'MT', 'WY', 'CO', 'UT', 'OR', 'CA', 'NV', 'AZ', 'NM'],
    'Stream temp': ['WA', 'ID', 'MT', 'WY', 'CO', 'UT', 'OR', 'CA', 'NV', 'AZ', 'NM']
}


def migrate_model_polygons(pgcurs, geojson_path):

    with open(geojson_path) as f:
        features = json.load(f)["features"]

    log = Logger('Model Polygons')
    log.info('{} model polygons retrieved from GeoJSON at {}'.format(len(features), geojson_path))

    counter = 0
    successful = 0
    unsuccessful = 0
    progbar = ProgressBar(len(features), 50, "Model Polygons")
    for feature in features:
        model = feature['properties']['Model']

        # Look up which model(s) this GIS record applies to
        if model in model_names:
            models = model_names[model]
        else:
            models = [model]

        for abbrevation in models:
            pgcurs.execute("UPDATE geo.models SET extent = ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326) WHERE abbreviation LIKE (%s)", [json.dumps(feature['geometry']), abbrevation])
            if pgcurs.rowcount == 0:
                log.warning('No model in database for GeoJSON model {}'.format(model))
                unsuccessful += 1
            else:
                successful += 1
        counter += 1
        progbar.update(counter)

    progbar.finish()
    log.info('{} model polygons updated successfully'.format(successful))
    log.info('{} model polygons were unused because the name did not match a model in the database'.format(unsuccessful))

    # Now update statewide models with the extent polygons for their states using the dictionary definitions above
    successful = 0
    unsuccessful = 0
    counter = 0
    progbar = ProgressBar(len(statewide_models), 50, "Statewide Models")
    log.info('Updating model polygons that apply to entire states')
    for model_name, states in statewide_models.items():

        # UPDATE queries cannot use aggregate functions like ST_UNION so abstract it to CTE
        pgcurs.execute("""WITH cte_union  AS (
            SELECT ST_MULTI(ST_UNION(geom)) AS geom FROM geo.states WHERE abbreviation = ANY (%s)
        )
        UPDATE geo.models m SET extent = geom FROM cte_union WHERE m.abbreviation = %s""", [states, model_name])

        if pgcurs.rowcount == 0:
            unsuccessful += 1
        else:
            successful += 1
        counter += 1
        progbar.update(counter)

    progbar.finish()
    log.info('{} statewide model polygons updated successfully'.format(successful))
    log.info('{} statewide model polygons failed to update any records'.format(unsuccessful))

    pgcurs.execute('SELECT model_id, model_name, abbreviation FROM geo.models WHERE extent IS NULL')
    for row in pgcurs.fetchall():
        log.warning('Model {} ({}) still has NULL extent geometry'.format(row['abbreviation'], row['model_id']))

    log.info('Model polygon migration complete')


def associate_models_with_entities(pgcurs):
    """Associating models with customers per Trip's advice on this ticket
    https://github.com/namc-utah/namc-bug-db/issues/99

    """

    log = Logger('Customer Models')
    log.info('Associating customer with default models')

    customer_models = [
        ('USFS-504', 'AREMP%%'),
        ('USFS-502', 'PIBO%%'),
        ('DEQ-02', 'UT All Seasons')
    ]

    for entity, model in customer_models:
        pgcurs.execute("""INSERT INTO entity.entity_models (entity_id, model_id)
            SELECT o.entity_id, m.model_id
            FROM entity.organizations o , geo.models m
            WHERE o.abbreviation = %s and m.abbreviation like '{}'""".format(model), [entity])

        log.info('{} {} models associated with entity {}'.format(pgcurs.rowcount, model, entity))

    # Any BLM customers from CA, NV, OR, UT, WY, CO, get state-specific model only
    # Note this associates with the BLM state office customer, not the field office or other child entity!
    for state in ['CA', 'NV', 'OR', 'UT', 'WY', 'CO']:
        pgcurs.execute("""INSERT INTO entity.entity_models (entity_id, model_id)
            SELECT o.entity_id, m.model_id
            FROM entity.organizations o , geo.models m
            WHERE (o.abbreviation like 'BLM-{}%') AND (o.organization_name ilike '%% state %%') and (m.abbreviation like '{} %%')""".format(state, state))

        log.info('{} models associated with BLM state office for {}'.format(pgcurs.rowcount, state))

    log.info('Customer model association complete')
