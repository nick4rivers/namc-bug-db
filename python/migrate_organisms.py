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


def migrate_organisms(mscon, output_path):

    log = Logger('Organisms')

    life_states = lookup_data('life_stages', '04_life_stages.sql', 'life_stage_name')

    mscurs = mscon.cursor()
    mscurs.execute('SELECT Count(*) FROM PilotDB.dbo.BugData')
    total_rows = next(mscurs.fetchone())[0]

    mscurs.execute('SELECT * FROM PilotDB.dbo.BugData')

    counter = 0
    progbar = ProgressBar(total_rows, 50, "Migrating organisms")
    with open(output_path, 'w') as f:
        f.write('INSERT INTO sample.organisms (sample_id, taxonomy_id, life_stage_id, bug_size, split_count, big_rare_count) VALUES\n')

        for msrow in mscurs.fetchall():
            msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

            life_stage_id = get_db_id(life_states, 'life_stage_id', ['life_stage_name', 'abbreviation'], msdata['LifeStage'])
            if not life_stage_id:
                life_stage_id = life_states['Unspecified']['life_stage_id']

            f.write('{}({},{},{},{},{},{})\n'.format(',' if counter > 0 else '', gsmsdata['SampleID'], msdata['Code'], life_stage_id, msdata['BugSize'],
                                                     msdata['SplitCount'], msdata['BigRareCount']))

            counter += 1
            progbar.update(counter)

        f.write(';\n')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('msdb', help='SQLServer password', type=str)
    parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    parser.add_argument('mspassword', help='SQLServer password', type=str)
    parser.add_argument('output_path', help='Output SQL file', type=str)

    args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"))

    log.info('SQLServer database: {}'.format(args.msdb))

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    output_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', args.output_path)

    migrate_organisms(mscon, output_path)


if __name__ == '__main__':
    main()
