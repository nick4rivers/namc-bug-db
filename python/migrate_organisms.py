import pyodbc
from rscommons import Logger, ProgressBar
from lookup_data import get_db_id
from utilities import log_record_count, format_values
from postgres_lookup_data import process_table, lookup_data


def migrate(mscurs, pgcurs):

    lookup = {
        'life_stages': lookup_data(pgcurs, 'taxa.life_stages', 'abbreviation')
    }

    process_table(mscurs, pgcurs, 'PilotDB.dbo.BugData', 'sample.organisms', organisms_callback, lookup)


def organisms_callback(msdata, lookup):

    original_life_stage = msdata['LifeStage']

    life_stage_id = get_db_id(lookup['life_stages'], 'life_stage_id', ['abbreviation'], original_life_stage)
    if not life_stage_id:
        life_stage_id = lookup['life_stages']['U']['life_stage_id']

    return {
        'sample_id': int(msdata['SampleID']),
        'taxonomy_id': int(msdata['Code']),
        'life_stage_id': life_stage_id,
        'bug_size': msdata['BugSize'],
        'split_count': msdata['SplitCount'],
        'big_rare_count': msdata['BigRareCount']
    }

    # log = Logger('Organisms')
    # total_rows = log_record_count(mscon, 'PilotDB.dbo.BugData')

    # life_stages = lookup_data('life_stages', '04_life_stages.sql', 'life_stage_name')

    # cols = ['sample_id', 'taxonomy_id', 'life_stage_id', 'bug_size', 'split_count', 'big_rare_count']

    # mscurs = mscon.cursor()
    # mscurs.execute('SELECT * FROM PilotDB.dbo.BugData')
    # counter = 0
    # progbar = ProgressBar(total_rows, 50, "Migrating organisms")
    # with open(output_path, 'w') as f:
    #     f.write('INSERT INTO sample.organisms ({}) VALUES\n'.format(','.join(cols)))

    #     for msrow in mscurs.fetchall():
    #         msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

    #         life_stage_id = get_db_id(life_stages, 'life_stage_id', ['life_stage_name', 'abbreviation'], msdata['LifeStage'])
    #         if not life_stage_id:
    #             life_stage_id = life_stages['Unspecified']['life_stage_id']

    #         data = {
    #             'sample_id': msdata['SampleID'],
    #             'life_stage_id': life_stage_id,
    #             'taxonomy_id': msdata['Code'],
    #             'bug_size': msdata['BugSize'],
    #             'split_count': msdata['SplitCount'],
    #             'big_rare_count': int(msdata['BigRareCount']) if msdata['BigRareCount'] else None
    #         }

    #         f.write('{}({})\n'.format(',' if counter > 0 else '', format_values(cols, data)))
    #         counter += 1
    #         progbar.update(counter)

    #         if counter > 1000:
    #             break

    #     f.write(';\n')

    # progbar.finish()
