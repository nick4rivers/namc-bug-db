import os
import json
import getpass
import datetime
import pyodbc
import argparse
from rscommons import Logger, ProgressBar, dotenv
from lookup_data import lookup_data, get_db_id
from utilities import get_string_value, sanitize_string_col, sanitize_string, get_date_value, get_string_value
from utilities import add_metadata
from utilities import write_sql_file


def migrate_sites(mscon, sites_path):

    systems = lookup_data('systems', '09_systems.sql', 'system_name')
    ecosystems = lookup_data('ecosystems', '05_ecosystems.sql', 'ecosystem_name')

    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.dbo.SiteInfo WHERE (Lat IS NOT NULL) AND (Long IS NOT NULL)")
    log = Logger('Sites')

    postgres_data = {}
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        site_name = sanitize_string(msdata['Station'])
        ecosystem_id = get_db_id(ecosystems, 'ecosystem_id', ['ecosystem_name'], msdata['System1'])
        system_id = get_db_id(systems, 'system_id', ['system_name'], msdata['System2'])
        point = "ST_SetSRID(ST_MakePoint({}, {}), 4326)".format(msdata['Lat'], msdata['Long'])

        metadata = None
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

        postgres_data[site_name] = {
            'site_name': site_name,
            'system_id': system_id,
            'ecosystem_id': ecosystem_id,
            'location': point,
            'description': sanitize_string_col('BoxTracking', 'Station', msdata, 'SiteDesc'),
            'metadata': metadata
        }

    write_sql_file(sites_path, 'geo.sites', postgres_data)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('msdb', help='SQLServer password', type=str)
    parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    parser.add_argument('mspassword', help='SQLServer password', type=str)
    parser.add_argument('sites_path', help='Output SQL file', type=str)

    args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"))

    log.info('SQLServer database: {}'.format(args.msdb))

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    sites_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', args.sites_path)

    migrate_sites(mscon, sites_path)


if __name__ == '__main__':
    main()
