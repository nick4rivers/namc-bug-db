from rscommons import Logger


class TableMigrator:

    def __init__(self, mscon, origin_table, target_table, origin_id_field):
        self.origin_table = origin_table
        self.target_table = target_table
        self.origin_id_field = origin_id_field

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
