import math
import pyodbc
from rscommons import Logger, ProgressBar
from utilities import sanitize_string_col, sanitize_string, sanitize_time, add_metadata, format_values, log_record_count
from postgres_lookup_data import lookup_data, insert_row, log_row_count, insert_many_rows
from lookup_data import get_db_id

table_name = 'sample.samples'

block_size = 5000


def migrate(mscurs, pgcurs):

    # migrate_samples(mscurs, pgcurs)
    process_sample_table(mscurs, pgcurs, 'PilotDB.dbo.BugDrift', 'sample.drift', drift_callback)
    process_sample_table(mscurs, pgcurs, 'PilotDB.dbo.BugPlankton', 'sample.plankton', plankton_callback)


def migrate_samples(mscurs, pgcurs):

    labs = lookup_data(pgcurs, 'entity.organizations', 'organization_name', 'is_lab = True')
    methods = lookup_data(pgcurs, 'sample.sample_methods', 'sample_method_name')
    habitats = lookup_data(pgcurs, 'geo.habitats', 'habitat_name')
    sites = lookup_data(pgcurs, 'geo.sites', 'site_name')
    types = lookup_data(pgcurs, 'sample.sample_types', 'sample_type_name')

    unspecified_habitat = get_db_id(habitats, 'habitat_id', ['habitat_name'], 'Unspecified')
    unspecified_method = get_db_id(methods, 'sample_method_id', ['sample_method_name'], 'Unspecified')

    row_count = log_record_count(mscurs, 'PilotDB.dbo.BugSample')

    mscurs.execute("""
    SELECT S.*, NULL AS LabName, Plankton, Drift, Stomachs
    FROM PilotDB.dbo.BugSample S
         INNER JOIN
     (
         SELECT S.SampleID,
                Count(BP.SampleID)    Plankton,
                Count(BD.SampleID)    Drift,
                Count(BS.SampleID)  Stomachs
         FROM PilotDB.dbo.BugSample S
                  LEFT JOIN PilotDB.dbo.BugPlankton BP on S.SampleID = BP.SampleID
                  LEFT JOIN PilotDB.dbo.BugDrift BD ON S.SampleID = BD.SampleID
                  LEFT JOIN PilotDB.dbo.BugStomachs BS on S.SampleID = BS.SampleID
         GROUP BY S.SampleID
     ) C ON S.SampleID = C.SampleID
    """)

    counter = 0
    progbar = ProgressBar(row_count, 50, "samples")
    block_data = []
    columns = None
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        lab_id = get_db_id(labs, 'organization_id', ['organization_name', 'abbreviation'], sanitize_string(msdata['LabName']))
        method_id = get_db_id(methods, 'sample_method_id', ['sample_method_name'], sanitize_string(msdata['Method']))
        habitat_id = get_db_id(habitats, 'habitat_id', ['habitat_name'], sanitize_string(msdata['Habitat']))
        station = sanitize_string(msdata['Station'])
        site_id = get_db_id(sites, 'site_id', ['site_name'], station)

        # > 5,000 samples with NULL habitats
        habitat_id = habitat_id if habitat_id else unspecified_habitat

        # Method was not required in the old database
        method_id = method_id if method_id else unspecified_method

        sample_type = 'Benthic'
        if msdata['Plankton'] > 0:
            sample_type = 'Zooplankton'
        elif msdata['Drift'] > 0:
            sample_type = 'Drift'
        elif msdata['Stomachs'] > 0:
            sample_type = 'Fish Diet'

        metadata = {}
        if msdata['Station'] and not site_id:
            # Sample refers to a site that has a missing location and is not in new DB. Store metadata to keep track
            add_metadata(metadata, 'missingStation', station)

        data = {
            'sample_id': msdata['SampleID'],
            'box_id': msdata['BoxID'],
            'sample_date': msdata['SampDate'],
            'sample_time': sanitize_time(msdata['SampleTime']),
            'site_id': site_id,
            'type_id': get_db_id(types, 'sample_type_id', ['sample_type_name'], sample_type),
            'method_id': method_id,
            'habitat_id': habitat_id,
            'area': msdata['Area'],
            'field_split': msdata['FieldSplit'],
            'field_notes': sanitize_string_col('BugSample', 'SampleID', msdata, 'FieldNotes'),
            'lab_split': msdata['LabSplit'],
            'lab_notes': sanitize_string_col('BugSample', 'SampleID', msdata, 'LabNotes'),
            'qualitative': msdata['Qualitative'] == 'Y',
            'mesh': msdata['Mesh'] if msdata['Mesh'] and msdata['Mesh'] > 0 else None,
            'sorter_count': msdata['SorterCount'],
            'sorter_id': None,
            'sort_time': 0,
            'sort_start_date': None,
            'sort_end_date': None,
            'ider_id': None,
            'id_time': 0,
            'id_start_date': None,
            'id_end_date': None,
            'qa_sample_id': None,
            # 'jar_count': msdata['JarCount'],
            'lab_id': lab_id,
            'metadata': metadata
        }

        if not columns:
            columns = list(data.keys())

        block_data.append([data[key] for key in columns])

        if len(block_data) == block_size:
            insert_many_rows(pgcurs, table_name, columns, block_data)
            block_data = []
            progbar.update(counter)

        counter += 1

    # insert remaining rows
    if len(block_data) > 0:
        insert_many_rows(pgcurs, table_name, columns, block_data)

    progbar.finish()
    log_row_count(pgcurs, table_name, row_count)


def drift_callback(msdata):

    return {
        'sample_id': msdata['SampleID'],
        'net_area': math.pi * msdata['Diameter']**2 if msdata['Diameter'] else None,
        'net_duration': msdata['NetTime'],
        'stream_depth': msdata['StreamDepth'],
        'net_depth': msdata['NetDepth'],
        'net_velo': msdata['NetVelo'],
        'notes': sanitize_string(msdata['Notes'])
    }


def plankton_callback(msdata):

    tow_type = msdata['TowType'][0].upper() + msdata['TowType'][1:].lower() if msdata['TowType'] else None

    return {
        'sample_id': msdata['SampleID'],
        'diameter': msdata['Diameter'],
        'sub_sample_count': msdata['SubSampleCount'],
        'tow_length': msdata['TowLength'],
        'volume': msdata['Volume'],
        'all_quot': msdata['AllQuot'],
        'size_interval': msdata['SizeInterval'],
        'tow_type': tow_type,
        'notes': sanitize_string(msdata['Notes'])
    }


def process_sample_table(mscurs, pgcurs, source_table, target_table, call_back):

    row_count = log_record_count(mscurs, source_table)

    mscurs.execute('SELECT * FROM {}'.format(source_table))
    counter = 0
    progbar = ProgressBar(row_count, 50, target_table)
    block_data = []
    columns = None
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        data = call_back(msdata)

        if not columns:
            columns = list(data.keys())

        block_data.append([data[key] for key in columns])

        if len(block_data) == block_size:
            insert_many_rows(pgcurs, target_table, columns, block_data)
            block_data = []
            progbar.update(counter)

        counter += 1

    # insert remaining rows
    if len(block_data) > 0:
        insert_many_rows(pgcurs, target_table, columns, block_data)

    progbar.finish()
    log_row_count(pgcurs, target_table, row_count)
