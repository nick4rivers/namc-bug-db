""" Migrates BugData organism counts from SQL Server to Postgres.
Reused for data from PilotDB and BugLab
"""
from lib.logger import Logger
from lib.progress_bar import ProgressBar
from lookup_data import get_db_id
from utilities import log_record_count, format_values, sanitize_string
from postgres_lookup_data import process_query, lookup_data


def migrate(mscurs, pgcurs, db_name, sample_ids):
    """Main routine for import BugData from SQL Server to Postgres"""

    log = Logger('Organisms')
    log.info('starting organisms from {}'.format(db_name))

    lookup = {
        'life_stages': lookup_data(pgcurs, 'taxa.life_stages', 'abbreviation'),
        'taxa': lookup_data(pgcurs, 'taxa.taxonomy', 'taxonomy_id'),
        'sample_ids': sample_ids
    }

    # Sum the counts over the required unique index. Join to Samples so we only get
    # records that also have valid samples.
    sql = """SELECT B.SampleID, Code, LifeStage, BugSize, Sum(SplitCount) SplitCount, Sum(BigRareCount) BigRareCount
             FROM {0}.dbo.BugData B INNER JOIN {0}.dbo.BugSample BS on B.SampleID = BS.SampleID
             GROUP BY B.SampleID, Code, LifeStage, BugSize""".format(db_name)

    process_query(mscurs, pgcurs, sql, 'sample.organisms', organisms_callback, lookup)
    # process_notes(pgcurs)


def organisms_callback(msdata, lookup):
    """callback for processing a single organism record in BugData"""

    # Lookup the new postgres SampleID
    # For Pilot these should match one to one. For BugLab these will map to newly issued postgres IDs
    # If the SampleID is not found then skip record. It could be a legacy sample in BugLab that was
    # not removed. i.e. Its not associated with an active, onhold or pending box.
    if msdata['SampleID'] not in lookup['sample_ids']:
        return None

    original_life_stage = msdata['LifeStage']

    life_stage_id = get_db_id(lookup['life_stages'], 'life_stage_id', ['abbreviation'], original_life_stage, False, False)
    if not life_stage_id:
        life_stage_id = lookup['life_stages']['U']['life_stage_id']

    if msdata['Code'] not in lookup['taxa']:
        log = Logger('organisms')
        log.error('Missing taxonomy')
        return None

    # Sanitize the notes string here so empty strings get converted to NULL
    # but notes are post-processed using a different method

    return {
        'sample_id': lookup['sample_ids'][int(msdata['SampleID'])],
        'taxonomy_id': int(msdata['Code']),
        'life_stage_id': life_stage_id,
        'bug_size': msdata['BugSize'] if msdata['BugSize'] and msdata['BugSize'] > 0 else None,
        'split_count': msdata['SplitCount'],
        'big_rare_count': 0 if msdata['BigRareCount'] is None else msdata['BigRareCount']
    }


def process_notes(pgcurs):
    """ Splits the BugData notes into their own table"""

    # Get the official notes lookups and convert to lower
    note_types = lookup_data(pgcurs, 'sample.note_types', 'abbreviation')
    note_types_clean = {key.lower(): val['note_id'] for key, val in note_types.items()}

    log = Logger('Organisms')
    pgcurs.execute('SELECT COUNT(*) FROM sample.organisms WHERE (Notes IS NOT NULL)')
    total_rows = pgcurs.fetchone()[0]
    log.info('{:,} records in sample.organisms with non-NULL notes'.format(total_rows))

    # iterate over all bug data that has non-NULL notes field.
    # The original insert should have sanitized the notes to remove whitespace
    # issues and set some records to NULL
    progbar = ProgressBar(total_rows, 50, 'organism notes')
    counter = 0
    pgcurs.execute('SELECT organism_id, notes FROM sample.organisms WHERE (Notes IS NOT NULL)')
    for row in pgcurs.fetchall():
        original = row[1]
        entries = original.split(',')
        for entry in entries:
            clean = entry.replace(' ', '').lower()
            if clean in note_types_clean:
                pgcurs.execute('INSERT INTO sample.organism_notes (organism_id, note_id) VALUES (%s, %s)',
                               (row[0], note_types_clean[clean]))

        counter += 1
        progbar.update(counter)

    progbar.finish()
    log_record_count(pgcurs, 'sample.organism_notes')

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
