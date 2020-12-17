import pyodbc
from rscommons import Logger
from lookup_data import lookup_data, get_db_id
from utilities import sanitize_string_col, sanitize_string, add_metadata, format_values


def migrate(mscon, output_path):

    log = Logger('Samples')

    labs = lookup_data('organizations', '30_entity.organizations.sql', 'organization_name', 'is_lab = True')
    methods = lookup_data('sample_methods', '15_sample_methods.sql', 'sample_method_name')
    habitats = lookup_data('habitats', '07_habitats.sql', 'habitat_name')
    sites = lookup_data('sites', '33_geo_sites.sql', 'site_name')
    types = lookup_data('sample_types', '08_sample_types.sql', 'sample_type_name')

    mscurs = mscon.cursor()

    # SampleType is only available in the front end database. Use table joins to determine the sample type
    mscurs.execute("""
    SELECT S.SampleID,
        Count(BP.SampleID) CountBugPlankton,
        Count(BD.SampleID) CountBugDrift,
        Count(BS.SampleID) AS CountBugStomachs
    FROM PilotDB.dbo.BugSample S
        LEFT JOIN PilotDB.dbo.BugPlankton BP on S.SampleID = BP.SampleID
        LEFT JOIN PilotDB.dbo.BugDrift BD ON S.SampleID = BD.SampleID
        LEFT JOIN PilotDB.dbo.BugStomachs BS on S.SampleID = BS.SampleID
    GROUP BY S.SampleID    
    """)
    sample_types = {}
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))
        sample_id = msdata['SampleID']

        if msdata['CountBugPlankton'] > 0:
            sample_types[sample_id] = types['Zooplankton']['sample_type_id']
        elif msdata['CountBugDrift'] > 0:
            sample_types[sample_id] = types['Drift']['sample_type_id']
        elif msdata['CountBugStomachs'] > 0:
            sample_types[sample_id] = types['Fish Diet']['sample_type_id']
        else:
            sample_types[sample_id] = types['Benthic']['sample_type_id']

    mscurs.execute("""SELECT P.*, L.Name LabName, FE.SampleType FROM
        PilotDB.dbo.BugSample P
        LEFT JOIN BugLab.dbo.BugSample FE ON P.SampleID = FE.SampleID
        LEFT JOIN PilotDB.dbo.Lab L ON P.LabID = L.LabID""")

    cols = ['sample_id',
            'box_id',
            'sample_date',
            'type_id',
            'sample_time',
            'site_id',
            'type_id',
            'method_id',
            'habitat_id',
            'area',
            'field_split',
            'field_notes',
            'lab_split',
            'lab_notes',
            'qualitative',
            'mesh',
            'sorter_count',
            'sorter_id',
            'sort_time',
            'sort_start_date',
            'sort_end_date',
            'ider_id',
            'id_time',
            'id_start_date',
            'id_end_date',
            'qa_sample_id',
            # 'jar_count',
            'lab_id',
            'metadata'
            ]

    with open(output_path, 'w') as f:
        f.write('INSERT INTO sample.samples ({}) VALUES\n'.format(','.join(cols)))
        counter = 0
        for msrow in mscurs.fetchall():
            msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

            lab_id = get_db_id(labs, 'organization_id', ['organization_name', 'abbreviation'], sanitize_string(msdata['LabName']))
            method_id = get_db_id(methods, 'sample_method_id', ['sample_method_name'], sanitize_string(msdata['Method']))
            habitat_id = get_db_id(habitats, 'habitat_id', ['habitat_name'], sanitize_string(msdata['Habitat']))
            station = sanitize_string(msdata['Station'])
            site_id = get_db_id(sites, 'site_id', ['site_name'], station)

            metadata = {}
            if msdata['Station'] and not site_id:
                # Sample refers to a site that has a missing location and is not in new DB. Store metadata to keep track
                add_metadata(metadata, 'missingStation', station)

            data = {
                'sample_id': msdata['SampleID'],
                'box_id': msdata['BoxID'],
                'sample_date': msdata['SampDate'],
                'sample_time': msdata['SampleTime'],
                'site_id': site_id,
                'type_id': sample_types[msdata['SampleID']],
                'method_id': method_id,
                'habitat_id': habitat_id,
                'area': msdata['Area'],
                'field_split': msdata['FieldSplit'],
                'field_notes': sanitize_string_col('BugSample', 'SampleID', msdata, 'FieldNotes'),
                'lab_split': msdata['LabSplit'],
                'lab_notes': sanitize_string_col('BugSample', 'SampleID', msdata, 'LabNotes'),
                'qualitative': msdata['Qualitative'] == 'Y',
                'mesh': msdata['Mesh'] if msdata['Mesh'] and msdata['Mesh'] > 0 else None,
                'sorter_count': msdata['Count'],
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

            f.write('{}({})\n'.format(',' if counter > 0 else '', format_values(cols, data)))
            counter += 1
            # progbar.update(counter)

            if counter > 1000:
                break

        f.write(';\n')

    # progbar.finish()
