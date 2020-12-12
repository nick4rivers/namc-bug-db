import pyodbc
from rscommons import Logger, ProgressBar, dotenv
from utilities import sanitize_string_col, log_record_count, write_sql_file


def migrate(mscon, output_path):

    log_record_count(mscon, 'PilotDB.dbo.Projects')

    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.dbo.Project")
    postgres_data = []
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))
        postgres_data.append({
            'project_id': msdata['ProjectID'],
            'project_name': sanitize_string_col('Project', 'ProjectID', msdata, 'Name'),
            'description': sanitize_string_col('Project', 'ProjectID', msdata, 'ProjectDesc'),
            'is_private': True if not msdata['Privacy'] or msdata['Privacy'].lower() == 'p' else False
        })

    write_sql_file(output_path, 'sample.projects', postgres_data)
