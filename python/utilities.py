from rscommons import Logger


def sanitize_string_col(origin_table, id_field, row, field, escape_single_quotes=True):

    log = Logger(origin_table)

    original = row[field]
    clean = sanitize_string(original, log=log, context='in field {} with key {}'.format(field, row[id_field]))
    return clean


def sanitize_string(original, log=None, context=None, escape_single_quotes=True):

    if not original:
        return None

    if original.lower() in ['<null>', 'null']:
        log.info('NULL literal "{}" {}'.format(original, context))
        return None

    stripped = original.strip()
    if len(stripped) != len(original):
        log.info('Stripped white space from "{}" {}'.format(original, context))
        original = stripped

    if escape_single_quotes and "'" in original:
        log.info('Escaping single quote in field {}'.format(context))
        original = original.replace("'", "''")

    if len(original) < 1:
        log.info('Empty string converted to NULL in field {} with key {}'.format(original, context))
        return None

    return original


def get_string_value(original):

    if original:
        return "'{}'".format(original)
    else:
        return 'NULL'


def get_date_value(original):

    if original:
        return "'{}'".format(original.strftime("%Y-%m-%d"))
    else:
        return 'NULL'


def sanitize_phone_fax(original):

    phone = sanitize_string(original)
    if original:
        if len(original) >= 10:
            temp = original.replace('.', '').replace('-', '').replace(' ', '').replace('_', '').replace('(', '').replace(')', '')
            if len(temp) == 10:
                phone = '({}) {}-{}'.format(temp[0:3], temp[3:6], temp[-4:])
                # print(original, phone)
            else:
                log = Logger('Email')
                log.warning("Non-standard telephone '{}'".format(phone))
        else:
            log = Logger('Phone')
            log.warning("Non-standard telephone '{}'".format(phone))

    return phone


def sanitize_email(original):

    email = sanitize_string(original)
    if email and '@' not in email:
        log = Logger('Email')
        log.warning("Invalid email address is missing ampersand '{}'".format(email))

    return email


def sanitize_url(original):

    url = sanitize_string(original)
    if url:
        url = url.replace(' ', '')

    return url
