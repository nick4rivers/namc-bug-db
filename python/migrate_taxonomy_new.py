import os
import sys
import json
import argparse
from rscommons import Logger, ProgressBar, dotenv
import getpass
import datetime
from psycopg2.extras import execute_values
import pyodbc
from utilities import sanitize_string_col, get_string_value

csv_relative_path = '../data'


def migrate_taxa(mscon, taxonomy_path, attributes_path):

    migrate_taxonomy(mscon, taxonomy_path)
    migrate_attributes(mscon, attributes_path)


def migrate_taxonomy(mscon, output_path):

    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.taxa.Taxonomy")
    taxa = {}
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        if msdata['code'] in taxa:
            raise Exception('duplicate code {} in raw data'.format(msdata['code']))

        taxa[msdata['code']] = {
            'parent_id': msdata['parent_code'],
            'level_id': msdata['taxa_level_id'],
            'scientific_name': sanitize_string_col('taxaonomy', 'code', msdata, 'scientific_name')
        }

    with open(output_path, 'w') as f:
        for id, data in taxa.items():
            f.write("INSERT INTO taxa.taxonomy(taxonomy_id, scientific_name, level_id, parent_id, author, year) VALUES({}, '{}', {}, {}, {}, {});\n".format(
                id,
                data['scientific_name'],
                data['level_id'],
                data['parent_id'],
                'NULL',
                'NULL'
            ))


def migrate_attributes(mscon, output_path):

    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.taxa.type_attribute")
    atts = {}
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        if msdata['attribute_id'] in atts:
            raise Exception('duplicate attribute ID {} in raw data'.format(msdata['attribute_id']))

        name = sanitize_string_col('attribute', 'attribute_id', msdata, 'attribute')
        attribute_type = 'Unknown'
        label = sanitize_string_col('attribute', 'attribute_id', msdata, 'label')
        desc = sanitize_string_col('attribute', 'attribute_id', msdata, 'description')

        if label and label.lower() == name.lower():
            label = None

        if desc and desc.lower() == name.lower():
            desc = None

        metadata = {}
        range_low = msdata['range_low']
        if range_low:
            metadata['range_lower'] = sanitize_string_col('attributes', 'attribute_id', msdata, 'range_low')

        range_high = msdata['range_high']
        if range_high:
            metadata['range_high'] = sanitize_string_col('attributes', 'attribute_id', msdata, 'range_high')

        values = msdata['allowable_values']
        if values:
            metadata['allowable_values'] = sanitize_string_col('attributes', 'attribute_id', msdata, 'allowable_values')

        atts[msdata['attribute_id']] = {
            'attribute_name': name,
            'label': label,
            'description': desc,
            'attribute_type': attribute_type,
            'metadata': get_string_value(json.dumps(metadata)) if len(metadata) > 0 else 'NULL'
        }

    with open(output_path, 'w') as f:
        for id, data in atts.items():
            f.write("INSERT INTO taxa.attributes(attribute_id, attribute_name, attribute_type, label, description, metadata) VALUES({}, {}, {}, {}, {}, {});\n".format(
                id,
                get_string_value(data['attribute_name']),
                get_string_value(data['attribute_type']),
                get_string_value(data['label']),
                get_string_value(data['description']),
                data['metadata']
            ))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('msdb', help='SQLServer password', type=str)
    parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    parser.add_argument('mspassword', help='SQLServer password', type=str)
    parser.add_argument('taxonomy_path', help='Output SQL file', type=str)
    parser.add_argument('attributes_path', help='Output SQL file', type=str)

    args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"))

    log.info('SQLServer database: {}'.format(args.msdb))

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    taxonomy_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', args.taxonomy_path)
    attributes_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', args.attributes_path)

    migrate_taxa(mscon, taxonomy_path, attributes_path)


if __name__ == '__main__':
    main()
