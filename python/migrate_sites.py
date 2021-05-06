import csv
import json
import pyodbc
from lookup_data import get_db_id
from postgres_lookup_data import lookup_data, log_row_count, insert_many_rows
from utilities import sanitize_string_col, sanitize_string, add_metadata, write_sql_file, log_record_count, merge_string_fields
from lib.logger import Logger
from lib.progress_bar import ProgressBar

columns = ['site_name', 'system_id', 'location', 'description', 'metadata']
sql = """INSERT INTO geo.sites (site_name, system_id, location, description, metadata)
            VALUES (%s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s, %s);"""

block_size = 5000
table_name = 'geo.sites'


def migrate(mscurs, pgcurs, schema):

    systems = lookup_data(pgcurs, 'geo.systems', 'system_name')
    ecosystems = lookup_data(pgcurs, 'geo.ecosystems', 'ecosystem_name')

    expected_rows = log_record_count(mscurs, '{}.dbo.SiteInfo'.format(schema))

    mscurs.execute('SELECT * FROM {}.dbo.SiteInfo WHERE (Lat IS NOT NULL) AND (Long IS NOT NULL)'.format(schema))
    log = Logger('Sites')

    progbar = ProgressBar(expected_rows, 50, "sites")
    counter = 0
    existing_site_count = 0
    duplicate_count = 0
    block_data = []
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        site_name = sanitize_string(msdata['Station'])

        # Determine if the site already exists (might have processed Pilot for BugDB first)
        pgcurs.execute('SELECT site_id FROM geo.sites WHERE site_name = %s', [site_name])
        row = pgcurs.fetchone()
        if row is not None:
            existing_site_count += 1
            continue

        # ecosystem_id = get_db_id(ecosystems, 'ecosystem_id', ['ecosystem_name'], sanitize_string(msdata['System1']))
        system_id = get_db_id(systems, 'system_id', ['system_name'], sanitize_string(msdata['System2']))

        if site_name == 'AA-003-2016':
            if duplicate_count < 1:
                duplicate_count += 1
            else:
                continue

        # Make Point requires X then Y
        # point = "ST_SetSRID(ST_MakePoint({}, {}), 4326)".format(msdata['Long'], msdata['Lat'])

        metadata = {}
        add_metadata(metadata, 'location', msdata['Location'])
        add_metadata(metadata, 'cardinalDirection', msdata['CardinalDirection'])
        add_metadata(metadata, 'hucCode', msdata['HucCode'])
        add_metadata(metadata, 'basin', msdata['Basin'])
        add_metadata(metadata, 'easting', msdata['Easting'])
        add_metadata(metadata, 'northing', msdata['Northing'])
        add_metadata(metadata, 'special', msdata['Special'])
        add_metadata(metadata, 'reference', msdata['Reference'])
        add_metadata(metadata, 'notes', msdata['Notes'])

        # The following fields are not found in front end BugLab database
        if 'GISnote' in msdata:
            add_metadata(metadata, 'gisNote', msdata['GISnote'])

        # Check system and ecosystem match
        # if system_id and ecosystem_id:
        #     for key, val in systems.items():
        #         if key.lower() == msdata['System2'].lower():
        #             if systems[key]['ecosystem_id'] != ecosystem_id:
        #                 log.error('System ({}) and Ecosystem ({}) IDs do not match'.format(system_id, ecosystem_id))
        #                 # raise Exception('system and ecosystem mismatch')

        block_data.append([
            site_name,
            system_id,
            msdata['Long'],
            msdata['Lat'],
            merge_string_fields(msdata['Location'], msdata['SiteDesc']),
            json.dumps(metadata) if len(metadata) > 0 else None])

        if len(block_data) == block_size:
            insert_many_rows(pgcurs, table_name, columns, block_data, sql)
            block_data = []
            progbar.update(counter)

        counter += 1

    # insert remaining rows
    if len(block_data) > 0:
        insert_many_rows(pgcurs, table_name, columns, block_data, sql)

    progbar.finish()
    log_row_count(pgcurs, 'geo.sites', expected_rows)

    log.info('{} existing sites found'.format(existing_site_count))


def migrate_model_reference_sites(pgcurs, csv_path):
    """ Imports a CSV file of model reference sites provided
    by Jennifer. The CSV has three columns

    Station (NAMC site name)
    Model (model name, somewhat matches geo.models.abbreviation)
    ModelSiteID (name of the site referred to in the model)

    This code attempts to match the Station with NAMC site names
    and Model with NAMC model abbreviations. The ModelSiteID
    (if present) is stored in geo.model_reference_sites.metadata
    """

    log = Logger('Model Ref Sites')
    log.info('Importing model reference sites')

    models = lookup_data(pgcurs, 'geo.models', 'abbreviation')

    data = {}
    csv_rows = 0
    missing_sites = 0
    for ref_site in csv.DictReader(open(csv_path)):
        csv_rows += 1
        site = ref_site['Station']
        model = ref_site['Model']
        model_site_code = ref_site['ModelSiteID']

        # Utah model has different name in database
        if model.lower() == 'ut all seasons':
            model = 'UTDEQ15'

        # retrieve the site
        pgcurs.execute('SELECT site_id FROM geo.sites WHERE site_name = %s', [site])
        site_row = pgcurs.fetchone()

        if site_row is None:
            log.warning('Missing site {}'.format(site))
            missing_sites += 1
            continue

        site_id = site_row['site_id']
        if site_id not in data:
            data[site_id] = {}

        # Colorado - match using polygon
        if model.lower() == 'co':
            model_id = get_model_by_location(pgcurs, site, site_id, 'CO EDAS Biotype%%')

        # Wyoming - match using polygon
        elif model.lower() == 'wy':
            model_id = get_model_by_location(pgcurs, site, site_id, 'WY -%%')

        # Westwide - match using polygon
        elif model.lower() == 'westwide':
            model_id = get_model_by_location(pgcurs, site, site_id, 'Westwide%%')

        # AREMP - assign all sites to both models
        elif model.lower() == 'aremp':
            model_id = get_all_models_with_prefix(pgcurs, 'AREMP%%')

        # All other models should be straight lookup
        else:
            model_id = get_db_id(models, 'model_id', ['abbreviation'], model, True)

        if model_id is None:
            # Other places in the code should have already logged this issue
            continue

        if not isinstance(model_id, list):
            model_id = [model_id]

        for a_model in model_id:
            if a_model not in data[site_id]:
                data[site_id][a_model] = None if model_site_code is None else {'ModelSiteID': model_site_code}

    log.warning('{} sites in the CSV file are missing from the database'.format(missing_sites))
    # Flatten data back to tuples
    flat_data = []
    for site_id, model_dict in data.items():
        [flat_data.append((site_id, model_id, model_site_code)) for model_id, model_site_code in model_dict.items()]

    insert_many_rows(pgcurs, 'geo.model_reference_sites', ['site_id', 'model_id', 'metadata'], flat_data)
    log_row_count(pgcurs, 'geo.model_reference_sites', csv_rows)


def get_model_by_location(pgcurs, site_name, site_id, model_prefix):

    pgcurs.execute("""SELECT m.model_id
        FROM geo.models m
        JOIN geo.sites s
        ON ST_intersects(m.extent, s.location)
        WHERE (abbreviation ilike ('{}')) and (s.site_id = %s)""".format(model_prefix), [site_id])
    row = pgcurs.fetchone()
    if row is None:
        log = Logger()
        log.error("Failed to find model with prefix '{}' for site {}".format(model_prefix, site_name))
        return None
    else:
        return row['model_id']


def get_all_models_with_prefix(pgcurs, model_prefix):

    pgcurs.execute("SELECT model_id FROM geo.models WHERE abbreviation ilike ('{}%%')".format(model_prefix))
    models = pgcurs.fetchall()
    if models is None:
        log = Logger()
        log.error("No models with prefix '{}'".format(model_prefix))
        return None

    return [row['model_id'] for row in models]
