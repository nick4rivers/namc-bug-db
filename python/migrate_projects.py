import pyodbc
import psycopg2
from psycopg2.extras import execute_values
from rscommons import Logger, ProgressBar
from utilities import sanitize_string_col, log_record_count
from postgres_lookup_data import lookup_data, insert_row, log_row_count, process_query
from lookup_data import get_db_id

table_name = 'sample.projects'


def migrate(mscurs, pgcurs):

    # Migrate the project records first!
    migrate_projects(mscurs, pgcurs)

    # Now associate all samples with the projects.
    process_query(mscurs, pgcurs,
                  """SELECT ProjectID, SampleID
FROM (SELECT P.ProjectID, Bs.SampleID
      FROM PilotDB.dbo.Project P
               INNER JOIN PilotDB.dbo.BoxTracking B ON P.ProjectID = B.ProjectID
               INNER JOIN PilotDB.dbo.BugSample BS on B.BoxId = BS.BoxID
      UNION
      SELECT ProjectID, SampleID
      FROM PilotDB.dbo.Collection
      WHERE SampleID IS NOT NULL
        AND ProjectID IS NOT NULL) T""",
                  'sample.project_samples', project_samples_callback)


def migrate_projects(mscurs, pgcurs):

    row_count = log_record_count(mscurs, 'PilotDB.dbo.Project')

    # Default all historical projects to customer project types
    project_types = lookup_data(pgcurs, 'sample.project_types', 'project_type_name')
    cust_project_type_id = get_db_id(project_types, 'project_type_id', ['project_type_name'], 'Customer Projects')

    progbar = ProgressBar(row_count, 50, "projects")
    mscurs.execute("SELECT * FROM PilotDB.dbo.Project")
    counter = 0
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))
        data = {
            'project_id': msdata['ProjectID'],
            'project_name': sanitize_string_col('Project', 'ProjectID', msdata, 'Name'),
            'description': sanitize_string_col('Project', 'ProjectID', msdata, 'ProjectDesc'),
            'project_type_id': cust_project_type_id,
            'is_private': True if not msdata['Privacy'] or msdata['Privacy'].lower() == 'p' else False
        }
        insert_row(pgcurs, table_name, data)
        counter += 1
        progbar.update(counter)

    progbar.finish()
    log_row_count(pgcurs, table_name, row_count)


def project_samples_callback(msdata, lookup):

    return {
        'sample_id': msdata['SampleID'],
        'project_id': msdata['ProjectID']
    }
