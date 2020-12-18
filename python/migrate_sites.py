import json
import pyodbc
from lookup_data import get_db_id
from postgres_lookup_data import lookup_data, insert_row, log_row_count
from utilities import sanitize_string_col, sanitize_string, add_metadata, write_sql_file, log_record_count
from rscommons import Logger, ProgressBar


def migrate(mscurs, pgcurs):

    systems = lookup_data(pgcurs, 'geo.systems', 'system_name')
    ecosystems = lookup_data(pgcurs, 'geo.ecosystems', 'ecosystem_name')

    expected_rows = log_record_count(mscurs, 'PilotDB.dbo.SiteInfo')

    mscurs.execute("SELECT * FROM PilotDB.dbo.SiteInfo WHERE (Lat IS NOT NULL) AND (Long IS NOT NULL)")
    log = Logger('Sites')

    progbar = ProgressBar(expected_rows, 50, "sites")
    counter = 0
    duplicate_count = 0
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        site_name = sanitize_string(msdata['Station'])
        ecosystem_id = get_db_id(ecosystems, 'ecosystem_id', ['ecosystem_name'], sanitize_string(msdata['System1']))
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
        add_metadata(metadata, 'gisNote', msdata['GISnote'])

        # Check system and ecosystem match
        if system_id and ecosystem_id:
            for key, val in systems.items():
                if key.lower() == msdata['System2'].lower():
                    if systems[key]['ecosystem_id'] != ecosystem_id:
                        log.error('System ({}) and Ecosystem ({}) IDs do not match'.format(system_id, ecosystem_id))
                        # raise Exception('system and ecosystem mismatch')

        # Custom insert because PostGIS functions
        pgcurs.execute("""INSERT INTO geo.sites (site_name, system_id, ecosystem_id, location, description, metadata)
            VALUES (%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s, %s);""",
                       [site_name,
                        system_id,
                        ecosystem_id,
                        msdata['Long'],
                        msdata['Lat'],
                        sanitize_string_col('BoxTracking', 'Station', msdata, 'SiteDesc'),
                        json.dumps(metadata) if len(metadata) > 0 else None])

        counter += 1
        progbar.update(counter)

    progbar.finish()
    log_row_count(pgcurs, 'geo.sites', expected_rows)
