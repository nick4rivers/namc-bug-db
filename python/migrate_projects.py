import pyodbc
from rscommons import Logger, ProgressBar
from utilities import sanitize_string_col, log_record_count, write_sql_file
from lookup_data import lookup_data, get_db_id


def migrate(mscon, output_path):

    log = Logger('projects')

    row_count = log_record_count(mscon, 'PilotDB.dbo.Project')

    # Default all historical projects to customer project types
    project_types = lookup_data('project_types', '23_sample.project_types.sql', 'project_type_name')
    cust_project_type_id = get_db_id(project_types, 'project_type_id', ['project_type_name'], 'Customer Projects')

    progbar = ProgressBar(row_count, 50, "Migrating projects")
    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.dbo.Project")
    postgres_data = []
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))
        postgres_data.append({
            'project_id': msdata['ProjectID'],
            'project_name': sanitize_string_col('Project', 'ProjectID', msdata, 'Name'),
            'description': sanitize_string_col('Project', 'ProjectID', msdata, 'ProjectDesc'),
            'project_type_id': cust_project_type_id,
            'is_private': True if not msdata['Privacy'] or msdata['Privacy'].lower() == 'p' else False
        })
        progbar.update(len(postgres_data))

    progbar.finish()

    write_sql_file(output_path, 'sample.projects', postgres_data)
