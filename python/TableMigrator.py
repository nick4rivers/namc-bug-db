from rscommons import Logger


class TableMigrator:

    def __init__(self, mscon, origin_table, target_table, origin_id_field, target_id_field=None, target_name_field=None):
        self.origin_table = origin_table
        self.target_table = target_table
        self.origin_id_field = origin_id_field
        self.target_id_field = target_id_field
        self.target_name_field = target_name_field

        mscurs = mscon.cursor()
        mscurs.execute('SELECT Count(*) FROM PilotDB.dbo.{}'.format(origin_table))
        self.origin_rows = mscurs.fetchone()[0]

        self.cols = {}

    def sanitize_string_col(self, id_field, row, field):

        original = row[field]

        if not row[field]:
            return None

        if row[field].lower() in ['<null>', 'null']:
            log = Logger(self.origin_table)
            log.info('NULL literal "{}" in field {} with key {}'.format(row[field], field, row[id_field]))
            return None

        stripped = original.strip()
        if len(stripped) != len(original):
            log = Logger(self.origin_table)
            log.info('Stripped white space from "{}" in field {} with key {}'.format(row[field], field, row[id_field]))
            original = stripped

        if len(original) < 1:
            log = Logger(self.origin_table)
            log.info('Empty string converted to NULL in field {} with key {}'.format(field, row[id_field]))
            return None

        return original

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
            pgcon.rollback()
            raise 'Aborting table {} due to {} errors.'.format(self.origin_table, error_count)

        pgcon.commit()

        pgcurs.execute('SELECT Count(*) FROM {}'.format(self.target_table))
        target_rows = pgcurs.fetchone()[0]

        if target_rows != self.origin_rows:
            log.warning('{} has {} rows, while origin table {} has {} rows.'.format(self.target_table, target_rows, self.origin_table, self.origin_rows))
        else:
            log.info('Table {} ({}) migrated to {} ({}) successfully.'.format(self.origin_table, self.origin_rows, self.target_table, target_rows))

        # Return the values as a dictionary so that they can be used as lookup
        if self.target_id_field and self.target_name_field:
            pgcurs.execute('SELECT {}, {} FROM {}'.format(self.target_id_field, self.target_name_field, self.target_table))
            return {row[1]: row[0] for rows in pgcurs.fetchall()}

        return None
