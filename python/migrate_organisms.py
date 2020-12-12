import pyodbc
from rscommons import Logger, ProgressBar
from lookup_data import lookup_data, get_db_id
from utilities import log_record_count


def migrate(mscon, output_path):

    log = Logger('Organisms')
    total_rows = log_record_count(mscon, 'PilotDB.dbo.BugData')

    life_stages = lookup_data('life_stages', '04_life_stages.sql', 'life_stage_name')

    mscurs = mscon.cursor()
    mscurs.execute('SELECT * FROM PilotDB.dbo.BugData')
    counter = 0
    progbar = ProgressBar(total_rows, 50, "Migrating organisms")
    with open(output_path, 'w') as f:
        f.write('INSERT INTO sample.organisms (sample_id, taxonomy_id, life_stage_id, bug_size, split_count, big_rare_count) VALUES\n')

        for msrow in mscurs.fetchall():
            msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

            life_stage_id = get_db_id(life_stages, 'life_stage_id', ['life_stage_name', 'abbreviation'], msdata['LifeStage'])
            if not life_stage_id:
                life_stage_id = life_stages['Unspecified']['life_stage_id']

            f.write('{}({},{},{},{},{},{})\n'.format(
                ',' if counter > 0 else '',
                msdata['SampleID'],
                msdata['Code'],
                life_stage_id,
                msdata['BugSize'],
                msdata['SplitCount'],
                msdata['BigRareCount']))

            counter += 1
            progbar.update(counter)

        f.write(';\n')

    progbar.finish()
