from rscommons import Logger


def sanitize_string_col(origin_table, id_field, row, field, escape_single_quotes=True):

    original = row[field]

    if not row[field]:
        return None

    if row[field].lower() in ['<null>', 'null']:
        log = Logger(origin_table)
        log.info('NULL literal "{}" in field {} with key {}'.format(row[field], field, row[id_field]))
        return None

    stripped = original.strip()
    if len(stripped) != len(original):
        log = Logger(origin_table)
        log.info('Stripped white space from "{}" in field {} with key {}'.format(row[field], field, row[id_field]))
        original = stripped

    if escape_single_quotes and "'" in original:
        log = Logger(origin_table)
        log.info('Escaping single quote in field {}'.format(field))
        original = original.replace("'", "''")

    if len(original) < 1:
        log = Logger(origin_table)
        log.info('Empty string converted to NULL in field {} with key {}'.format(field, row[id_field]))
        return None

    return original


def get_string_value(original):

    if original:
        return "'{}'".format(original)
    else:
        return 'NULL'
