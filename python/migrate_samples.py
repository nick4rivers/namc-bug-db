"""
Import samples and sample side tables from both PilotDB and BugLab
"""
import math
from lib.logger import Logger
from lib.progress_bar import ProgressBar
from utilities import sanitize_string_col, sanitize_string, sanitize_time, add_metadata, log_record_count
from utilities import reset_sequence
from postgres_lookup_data import lookup_data, insert_row, log_row_count, process_table, process_query
from lookup_data import get_db_id


def migrate(mscurs, pgcurs, db_name):

    lookup = {
        'mass_methods': lookup_data(pgcurs, 'sample.mass_methods', 'mass_method_name'),
        'mass_types': lookup_data(pgcurs, 'sample.mass_types', 'mass_type_name')
    }

    # BugLab is processed second and needs to issue new Sample IDs
    reset_sequence(pgcurs, 'sample.samples', 'sample_id')

    lookup['sample_ids'] = migrate_samples(db_name, mscurs, pgcurs)

    process_table(mscurs, pgcurs, '{}.dbo.BugDrift'.format(db_name), 'sample.drift', drift_callback, lookup)
    process_table(mscurs, pgcurs, '{}.dbo.BugPlankton'.format(db_name), 'sample.plankton', plankton_callback, lookup)

    # Sample ID 16988 exists in BugOMatter but not in BugSample. Use inner join to omit this record
    process_query(mscurs, pgcurs, 'SELECT B.* FROM {0}.dbo.BugOMatter B INNER JOIN {0}.dbo.BugSample S ON B.SampleID = S.SampleID'.format(db_name), 'sample.mass', mass_callback, lookup)

    # Data inserted with manual IDs need to reset the table sequence
    reset_sequence(pgcurs, 'sample.samples', 'sample_id')

    # Subsequent processes need the sample ID mapping
    return lookup['sample_ids']


def migrate_samples(db_name, mscurs, pgcurs):
    """
    db_name: PilotDB or BugLab
    """
    issue_new_sample_ids = db_name.lower() == 'buglab'
    box_table_name = 'BoxTracking' if db_name.lower() == 'pilotdb' else 'BugBoxes'

    # This dictionary maps BugLab SampleIDs to new postgres IDs.
    # It is only used when issusing new IDs for BugLab. When
    # processing PilotDB samples this dictionary will return empty.
    # This is because BugLab SampleIDs might overlap with PilotDB.
    new_sample_ids = {}

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

    sql = """SELECT TOP 10 S.*, NULL AS LabName, Plankton, Drift, Stomachs
    FROM {0}.dbo.BugSample S
         INNER JOIN
     (
         SELECT S.SampleID,
                Count(BP.SampleID)    Plankton,
                Count(BD.SampleID)    Drift,
                Count(BS.SampleID)  Stomachs
         FROM {0}.dbo.BugSample S
                  INNER JOIN {0}.dbo.{1} B on S.BoxID = b.BoxId
                  LEFT JOIN {0}.dbo.BugPlankton BP on S.SampleID = BP.SampleID
                  LEFT JOIN {0}.dbo.BugDrift BD ON S.SampleID = BD.SampleID
                  LEFT JOIN {0}.dbo.BugStomachs BS on S.SampleID = BS.SampleID
        {2}
         GROUP BY S.SampleID
     ) C ON S.SampleID = C.SampleID
    """.format(db_name, box_table_name, ' WHERE (Complete = 0) and ((Active <> 0) or (OnHold <> 0) or (waiting <> 0))' if issue_new_sample_ids else '')

    row_count = log_record_count(mscurs, 'Samples', 'SELECT count(*) FROM ({}) s'.format(sql))

    mscurs.execute(sql)
    counter = 0
    progbar = ProgressBar(row_count, 50, "samples")
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

        # Initialize the metadata with some helpful information about where the sample
        # came from; whether its from Pilot or BugLab as well as the original SampleID.
        # PilotDB SampleIDs are retained. BugLab SampleIDs are discarded and a new one
        # assigned.
        metadata = {
            "OriginalDatabase": db_name,
            "OriginalSampleID": msdata["SampleID"]
        }

        if msdata['Station'] and not site_id:
            # Sample refers to a site that has a missing location and is not in new DB. Store metadata to keep track
            add_metadata(metadata, 'missingStation', station)
            # continue

        data = {
            'box_id': msdata['BoxID'],
            'sample_date': msdata['SampDate'],
            'sample_time': sanitize_time(msdata['SampleTime']),
            'site_id': site_id,
            # 'location': sites[station].location,
            'type_id': get_db_id(types, 'sample_type_id', ['sample_type_name'], sample_type),
            'method_id': method_id,
            'habitat_id': habitat_id,
            'area': msdata['Area'],
            'field_split': convert_percent_to_ratio(msdata, 'FieldSplit', metadata),
            'field_notes': sanitize_string_col('BugSample', 'SampleID', msdata, 'FieldNotes'),
            'lab_split': convert_percent_to_ratio(msdata, 'LabSplit', metadata),
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
            'jar_count': msdata['JarCount'] if 'JarCount' in msdata else 1,
            # 'lab_id': lab_id,
            'metadata': metadata
        }

        if issue_new_sample_ids is False:
            data['sample_id'] = msdata['SampleID']

        if not columns:
            columns = list(data.keys())

        postgres_id = insert_row(pgcurs, 'sample.samples', data, 'sample_id')

        new_sample_ids[msdata['SampleID']] = postgres_id

        progbar.update(counter)
        counter += 1

    progbar.finish()
    log_row_count(pgcurs, 'sample.samples', row_count)
    return new_sample_ids


def convert_percent_to_ratio(msdata, field_name, metadata):
    """Used to convert LabSplit and FieldSplit from
    percentages to ratios. Also converts NULLs and
    negative values to zero.

    Args:
        msdata (dict): original SQL Server data
        field_name (str): name of SQLServer field
    """

    result = None

    if msdata[field_name] is None:
        result = 0
        add_metadata(metadata, field_name, '{} converted from NULL to zero.'.format(field_name))
    else:
        if msdata[field_name] <= 0:
            result = 0
            add_metadata(metadata, field_name, '{} altered from {} to zero.'.format(field_name, msdata[field_name]))
        else:
            result = msdata[field_name] / 100.0

    return result


def drift_callback(msdata, lookup):
    """Process drift sample side table"""

    # PilotDB.BugSample.SampleID = 1271 has NetVelo 98 which should be 0.98 m/s (issue #36)

    # Lookup the new postgres SampleID if BugLab data and substitues are available
    sample_ids = lookup['sample_ids']
    sample_id = sample_ids[msdata['SampleID']] if msdata['SampleID'] in sample_ids else msdata['SampleID']

    return {
        'sample_id': sample_id,
        'net_area': math.pi * msdata['Diameter']**2 if msdata['Diameter'] else None,
        'net_duration': msdata['NetTime'],
        'stream_depth': msdata['StreamDepth'],
        'net_depth': msdata['NetDepth'],
        'net_velocity': msdata['NetVelo'] if msdata['NetVelo'] != 98 else 0.98
    }


def plankton_callback(msdata, lookup):
    """
    process plankton sample side table
    """

    tow_type = msdata['TowType'][0].upper() + msdata['TowType'][1:].lower() if msdata['TowType'] else None

    # Lookup the new postgres SampleID
    # For Pilot these should match one to one. For BugLab these will map to newly issued postgres IDs
    # If the SampleID is not found then skip record. It could be a legacy sample in BugLab that was
    # not removed. i.e. Its not associated with an active, onhold or pending box.
    if msdata['SampleID'] not in lookup['sample_ids']:
        return None

    return {
        'sample_id': lookup['sample_ids'][msdata['SampleID']],
        'diameter': msdata['Diameter'] if msdata['Diameter'] and msdata['Diameter'] > 0 else None,
        'sub_sample_count': msdata['SubSampleCount'],
        'tow_length': msdata['TowLength'] if msdata['TowLength'] and msdata['TowLength'] > 0 else None,
        'volume': msdata['Volume'] if msdata['Volume'] and msdata['Volume'] > 0 else None,
        'aliquot': msdata['AllQuot'],
        'size_interval': msdata['SizeInterval'] if msdata['SizeInterval'] and msdata['SizeInterval'] > 0 else None,
        'tow_type': tow_type
    }


def mass_callback(msdata, lookup):
    """Process mass side table"""

    type_id = get_db_id(lookup['mass_types'], 'mass_type_id', ['mass_type_name', 'abbreviation'], msdata['Type'])
    method_id = get_db_id(lookup['mass_methods'], 'mass_method_id', ['abbreviation'], 'AFDM')

    # Lookup the new postgres SampleID
    # For Pilot these should match one to one. For BugLab these will map to newly issued postgres IDs
    # If the SampleID is not found then skip record. It could be a legacy sample in BugLab that was
    # not removed. i.e. Its not associated with an active, onhold or pending box.
    if msdata['SampleID'] not in lookup['sample_ids']:
        return None

    return {
        'sample_id': lookup['sample_ids'][msdata['SampleID']],
        'mass_type_id': type_id,
        'mass_method_id': method_id,
        'mass': msdata['AFDM']
    }
