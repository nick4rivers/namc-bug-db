import os
import json
import getpass
import datetime
import pyodbc
import argparse
from rscommons import Logger, ProgressBar, dotenv
from lookup_data import lookup_data, get_db_id
from utilities import get_string_value, sanitize_string_col, sanitize_string, get_date_value, get_string_value


def migrate_boxes(mscon, boxes_path):

    organizations_file = os.path.join(os.path.dirname(boxes_path), '30_entity.organizations.sql')
    organizations = lookup_data('CREATE TABLE organizations (organization_id INT, abbreviation TEXT, organization_name TEXT, entity_id INT, organization_type_id INT, is_lab BOOL);', organizations_file, 'abbreviation')

    box_states_file = os.path.join(os.path.dirname(boxes_path), '16_box_states.sql')
    box_states = lookup_data('CREATE TABLE box_states (box_state_id INT, box_state_name TEXT, box_state_order INT, description TEXT);', box_states_file, 'box_state_name')

    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.dbo.BoxTracking")
    log = Logger('Boxes')

    boxes = {}
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        custId = sanitize_string(msdata['CustId'])
        entity_id = get_db_id(organizations, 'entity_id', ['abbreviation', 'organization_name'], custId)
        box_state_id = get_db_id(box_states, 'box_state_id', ['box_state_name'], 'Complete')

        boxes[msdata['BoxId']] = {
            'customer_id': entity_id,
            'box_recevied_date': msdata['DateIn'],
            'box_state_id': box_state_id,
            'description': sanitize_string_col('BoxTracking', 'BoxId', msdata, 'Notes')
        }

    # write individuals
    with open(boxes_path, 'w') as f:
        for box_id, data in boxes.items():
            f.write('INSERT INTO sample.boxes (box_id, customer_id, box_state_id, box_recevied_date, description) VALUES ({}, {}, {}, {}, {});\n'.format(
                box_id,
                data['customer_id'],
                data['box_state_id'],
                get_date_value(data['box_recevied_date']),
                get_string_value(data['description'])
            ))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('msdb', help='SQLServer password', type=str)
    parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    parser.add_argument('mspassword', help='SQLServer password', type=str)
    parser.add_argument('boxes_path', help='Output SQL file', type=str)

    args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"))

    log.info('SQLServer database: {}'.format(args.msdb))

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    boxes_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', args.boxes_path)

    migrate_boxes(mscon, boxes_path)


if __name__ == '__main__':
    main()
