import os
import argparse
import pyodbc
from rscommons import Logger, dotenv
from migrate_indicators import migrate as indicators
from migrate_projects import migrate as projects
from migrate_taxonomy import migrate_taxonomy as taxonomy
from migrate_taxonomy import migrate_attributes as attributes
from migrate_entities import migrate as entities
from migrate_boxes import migrate as boxes
from migrate_sites import migrate as sites
from migrate_samples import migrate as samples
from migrate_organisms import migrate as organisms


def migrate_all_data(mscon, indicator_csv_path):

    output_dir = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb')

    indicators(indicator_csv_path, os.path.join(output_dir, '25_geo.indicators.sql'))
    projects(mscon, os.path.join(output_dir, '26_sample.projects.sql'))
    taxonomy(mscon, os.path.join(output_dir, '27_taxa.taxonomy.sql'))
    attributes(mscon, os.path.join(output_dir, '28_taxa.attributes.sql'))
    entities(mscon, os.path.join(output_dir, '29_entity.entities.sql'),
             os.path.join(output_dir, '30_entity.organization.sql'),
             os.path.join(output_dir, '31_entity.individuals.sql'))
    boxes(mscon, os.path.join(output_dir, '32_sample.boxes.sql'))
    sites(mscon, os.path.join(output_dir, '33_geo_sites.sql'))
    samples(mscon, os.path.join(output_dir, '34_sample.samples.sql'))
    organisms(mscon, os.path.join(output_dir, '35_sample.organisms.sql'))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('msdb', help='SQLServer password', type=str)
    parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    parser.add_argument('mspassword', help='SQLServer password', type=str)
    parser.add_argument('csv_path', help='Input translation indicator CSV', type=str)
    args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    indicator_csv_path = os.path.join(os.path.dirname(__file__), args.csv_path)

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"), verbose=args.verbose)

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    migrate_all_data(mscon, indicator_csv_path)


if __name__ == '__main__':
    main()
