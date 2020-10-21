import psycopg2
import getpass
import datetime
from psycopg2.extras import execute_values
import pyodbc
from rscommons import Logger, ProgressBar
from TableMigrator import TableMigrator


class ProjectMigrator(TableMigrator):

    def __init__(self, mscon):
        super().__init__(mscon, 'Project', 'projects', 'ProjectID')

        self.cols['ProjectID'] = 'project_id'
        self.cols['Name'] = 'project_name'
        self.cols['ProjectDesc'] = 'description'
        self.cols['Privacy'] = ('is_private', {'T': True, 'F': False, None: True})

    def migrate(self, mscon, pgcon, lookup):

        log = Logger(self.origin_table)
        error_count = 0

        pgcurs = pgcon.cursor()
        mscurs = mscon.cursor()
        mscurs.execute('SELECT * FROM PilotDB.dbo.{}'.format(self.origin_table))
        for row in mscurs.fetchall():
            row = dict(zip([t[0] for t in row.cursor_description], row))

            data = {}
            for origin_field, target_field in self.cols.items():
                if isinstance(target_field, tuple):
                    data[target_field[0]] = target_field[1][row[origin_field]]
                elif isinstance(row[origin_field], str):
                    data[target_field] = self.sanitize_string_col(self.origin_id_field, row, origin_field)

            cols = list(data.keys())
            values = [data[col] for col in cols]
            try:
                pgcurs.execute('INSERT INTO {} ({}) VALUES ({})'.format(self.target_table, ','.join(cols), ','.join('s' * len(cols)).replace('s', '%s')), values)
            except Exception as ex:
                log.error(str(ex))
                error_count += 1

        if error_count > 0:
            raise 'Aborting table {} due to {} errors.'.format(self.origin_table, error_count)

        pgcurs.execute('SELECT Count(*) FROM {}'.format(self.target_table))
        target_rows = pgcurs.fetchone()[0]

        if target_rows != self.origin_rows:
            log.warning('{} has {} rows, while origin table {} has {} rows.'.format(self.target_table, target_rows, self.origin_table, self.origin_rows))
        else:
            log.info('Table {} ({}) migrated to {} ({}) successfully.'.format(self.origin_table, self.origin_rows, self.target_table, target_rows))
