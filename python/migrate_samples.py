import math
import pyodbc
from lib.logger import Logger
from lib.progress_bar import ProgressBar
from utilities import sanitize_string_col, sanitize_string, sanitize_time, add_metadata, format_values, log_record_count
from postgres_lookup_data import lookup_data, insert_row, log_row_count, insert_many_rows, process_table, process_query
from lookup_data import get_db_id

table_name = 'sample.samples'

block_size = 5000


def migrate(mscurs, pgcurs):

    lookup = {
        'mass_methods': lookup_data(pgcurs, 'sample.mass_methods', 'mass_method_name'),
        'mass_types': lookup_data(pgcurs, 'sample.mass_types', 'mass_type_name')
    }

    migrate_samples(mscurs, pgcurs)
    process_table(mscurs, pgcurs, 'PilotDB.dbo.BugDrift', 'sample.drift', drift_callback, None)
    process_table(mscurs, pgcurs, 'PilotDB.dbo.BugPlankton', 'sample.plankton', plankton_callback, None)

    # Sample ID 16988 exists in BugOMatter but not in BugSample. Use inner join to omit this record
    process_query(mscurs, pgcurs, 'SELECT B.* FROM PilotDB.dbo.BugOMatter B INNER JOIN PilotDB.dbo.BugSample S ON B.SampleID = S.SampleID',
                  'sample.mass', mass_callback, lookup)


def migrate_samples(mscurs, pgcurs):

    labs = lookup_data(pgcurs, 'entity.organizations', 'organization_name', 'is_lab = True')
    methods = lookup_data(pgcurs, 'sample.sample_methods', 'sample_method_name')
    habitats = lookup_data(pgcurs, 'geo.habitats', 'habitat_name')
    sites = lookup_data(pgcurs, 'geo.sites', 'site_name')
    types = lookup_data(pgcurs, 'sample.sample_types', 'sample_type_name')

    unspecified_habitat = get_db_id(habitats, 'habitat_id', ['habitat_name'], 'Unspecified')
    unspecified_method = get_db_id(methods, 'sample_method_id', ['sample_method_name'], 'Unspecified')

    # old EmployeeID keyed to new individual ID for sorter and taxonomist
    pgcurs.execute('SELECT i.entity_id, metadata FROM entity.individuals i INNER JOIN entity.entities e ON i.entity_id = e.entity_id WHERE metadata IS NOT NULL')
    employees = {}
    for row in pgcurs.fetchall():
        metadata = row['metadata']
        if 'employeeId' in metadata:
            employees[int(metadata['employeeId'])] = row['entity_id']

            # Beth Carlson (235, 236) and Carlos Frias (201, 202) appear twice in PilotDB.Employee
            if 'employeeId2' in metadata:
                employees[int(metadata['employeeId2'])] = row['entity_id']

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

        lab_id = get_db_id(labs, 'entity_id', ['organization_name', 'abbreviation'], sanitize_string(msdata['LabName']))
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
            # continue

        data = {
            'sample_id': msdata['SampleID'],
            'box_id': msdata['BoxID'],
            'sample_date': msdata['SampDate'],
            'sample_time': sanitize_time(msdata['SampleTime']),
            'site_id': site_id,
            # 'location': sites[station].location,
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
            # 'sorter_count': msdata['SorterCount'],
            # 'sorter_id': employees[msdata['SorterID']] if msdata['SorterID'] else None,
            # 'sort_time': 0,
            # 'sort_start_date': None,
            # 'sort_end_date': None,
            # 'ider_id': employees[msdata['IderID']] if msdata['IderID'] else None,
            # 'id_time': 0,
            # 'id_start_date': None,
            # 'id_end_date': None,
            'qa_sample_id': None,
            # 'jar_count': msdata['JarCount'],
            # 'lab_id': lab_id,
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


def drift_callback(msdata, lookup):

    # PilotDB.BugSample.SampleID = 1271 has NetVelo 98 which should be 0.98 m/s (issue #36)

    return {
        'sample_id': msdata['SampleID'],
        'net_area': math.pi * msdata['Diameter']**2 if msdata['Diameter'] else None,
        'net_duration': msdata['NetTime'],
        'stream_depth': msdata['StreamDepth'],
        'net_depth': msdata['NetDepth'],
        'net_velocity': msdata['NetVelo'] if msdata['NetVelo'] != 98 else 0.98,
        'notes': sanitize_string(msdata['Notes'])
    }


def plankton_callback(msdata, lookup):

    tow_type = msdata['TowType'][0].upper() + msdata['TowType'][1:].lower() if msdata['TowType'] else None

    return {
        'sample_id': msdata['SampleID'],
        'diameter': msdata['Diameter'] if msdata['Diameter'] and msdata['Diameter'] > 0 else None,
        'sub_sample_count': msdata['SubSampleCount'],
        'tow_length': msdata['TowLength'] if msdata['TowLength'] and msdata['TowLength'] > 0 else None,
        'volume': msdata['Volume'] if msdata['Volume'] and msdata['Volume'] > 0 else None,
        'aliquot': msdata['AllQuot'],
        'size_interval': msdata['SizeInterval'] if msdata['SizeInterval'] and msdata['SizeInterval'] > 0 else None,
        'tow_type': tow_type,
        'notes': sanitize_string(msdata['Notes'])
    }


def mass_callback(msdata, lookup):

    type_id = get_db_id(lookup['mass_types'], 'mass_type_id', ['mass_type_name', 'abbreviation'], msdata['Type'])
    method_id = get_db_id(lookup['mass_methods'], 'mass_method_id', ['abbreviation'], 'AFDM')

    return {
        'sample_id': msdata['SampleID'],
        'mass_type_id': type_id,
        'mass_method_id': method_id,
        'mass': msdata['AFDM'],
        'notes': sanitize_string(msdata['Notes'])
    }
