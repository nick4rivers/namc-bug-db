import pyodbc
from rscommons import Logger, ProgressBar, dotenv
from lookup_data import lookup_data, get_db_id
from utilities import get_string_value, sanitize_string_col, sanitize_string, get_date_value, get_string_value
from utilities import add_metadata
from utilities import write_sql_file


def migrate(mscon, samples_path):

    log = Logger('Samples')

    labs = lookup_data('organizations', '30_entity.organizations.sql', 'organization_name', 'is_lab = True')
    methods = lookup_data('sample_methods', '15_sample_methods.sql', 'sample_method_name')
    habitats = lookup_data('habitats', '07_habitats.sql', 'habitat_name')
    sites = lookup_data('sites', '33_geo_sites.sql', 'site_name')
    types = lookup_data('sample_types', '08_sample_types.sql', 'sample_type_name')

    mscurs = mscon.cursor()
    mscurs.execute("""SELECT P.*, L.Name LabName, FE.SampleType FROM
PilotDB.dbo.BugSample P
LEFT JOIN BugLab.dbo.BugSample FE ON P.SampleID = FE.SampleID
LEFT JOIN PilotDB.dbo.Lab L ON P.LabID = L.LabID""")

    postgres_data = {}
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        lab_id = get_db_id(labs, 'organization_id', ['organization_name', 'abbreviation'], sanitize_string(msdata['LabName']))
        method_id = get_db_id(methods, 'sample_method_id', ['sample_method_name'], sanitize_string(msdata['Method']))
        habitat_id = get_db_id(habitats, 'habitat_id', ['habitat_name'], sanitize_string(msdata['Habitat']))
        type_id = get_db_id(types, 'sample_type_id', ['sample_type_name'], sanitize_string(msdata['SampleType']))
        site_id = get_db_id(sites, 'site_id', ['site_name'], sanitize_string(msdata['Station']))
        # station = msdata['Station']
        # if station:
        #     if station not in sites:
        #         log.warning('Site {} set to null because site does not exist.'.format(station))
        #     e
        metadata = None
        if msdata['Station'] and not site_id:
            # Sample refers to a site that has a missing location and is not in new DB. Store metadata to keep track
            add_metadata(metadata, 'station', sanitize_string('Station'))
            add_metadata(metadata, 'missingStation', True)

        postgres_data[msdata['SampleID']] = {
            'box_id': msdata['BoxID'],
            'sample_date': msdata['SampDate'],
            'sample_time': msdata['SampleTime'],
            'site_id': site_id,
            'type_id': type_id,
            'method_id': method_id,
            'habitat_id': habitat_id,
            'area': msdata['Area'],
            'field_split': msdata['FieldSplit'],
            'field_notes': sanitize_string_col('BugSample', 'SampleID', msdata, 'FieldNotes'),
            'lab_split': msdata['LabSplit'],
            'lab_notes': sanitize_string_col('BugSample', 'SampleID', msdata, 'LabNotes'),
            'qualitative': msdata['Qualitative'] == 'Y',
            'mesh': msdata['Mesh'],
            'sorter_count': msdata['Count'],
            'sorter_id': None,
            'sort_time': None,
            'sort_start_date': None,
            'sort_end_date': None,
            'ider_id': None,
            'id_time': None,
            'id_start_date': None,
            'id_end_date': None,
            'qa_sample_id': None,
            # 'jar_count': msdata['JarCount'],
            'lab_id': lab_id,
            'metadata': metadata
        }

    write_sql_file(samples_path, 'sample.samples', postgres_data.values())
