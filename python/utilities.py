import os
import json
from rscommons import Logger, ProgressBar


def sanitize_string_col(origin_table, id_field, row, field, escape_quotes=True):

    log = Logger(origin_table)

    original = row[field]
    clean = sanitize_string(original, log=log, context='in field {} with key {}'.format(field, row[id_field]), escape_single_quotes=escape_quotes)
    return clean


def sanitize_string(original, log=None, context='', escape_single_quotes=True):

    if not original:
        return None

    if not log:
        log = Logger('String')

    if original.lower() in ['<null>', 'null']:
        log.info('NULL literal "{}" {}'.format(original, context))
        return None

    stripped = original.strip()
    if len(stripped) != len(original):
        log.info('Stripped white space from "{}" {}'.format(original, context))
        original = stripped

    # double spaces
    while '  ' in original:
        log.info('Stripped double space from "{}" {}'.format(original, context))
        original = original.replace('  ', ' ')

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
    """ Standardize phone and fax number formats to
    (xxx) xxx-xxxx

    Args:
        original (str): Original phone or fax number

    Returns:
         str: Formatted phone number
    """

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
    """ Warns if email addresses don't have at sign.
    Removes any trailing spaces

    Args:
        original (str): raw email address

    Returns:
        str: Cleaned email address
    """

    email = sanitize_string(original)
    if email and '@' not in email:
        log = Logger('Email')
        log.warning("Invalid email address is missing ampersand '{}'".format(email))

    return email


def sanitize_url(original):
    """ Removes spaces from URLs

    Args:
        original (str): raw URL

    Returns:
        str: URLs with spaces removed.
    """

    url = sanitize_string(original)
    if url:
        url = url.replace(' ', '')

    return url


def add_metadata(metadata, key, value):
    """ Add an item to a metadata dictionary
    that will be writen to the SQL files as JSON.
    Creates the dictionary if it doesn't exist.

    Args:
        metadata (dict): Existing metadata dictionary or None if not instantiated yet
        key (str): metadata key (JSON property)
        value (str): metadata value
    """

    if not value:
        return

    if not metadata:
        metadata = {}

    if key in metadata:
        log = Logger('Metadata')
        log.warning('Duplicate key for metadata {}'.format(key))

    metadata[key] = sanitize_string(value) if isinstance(value, str) else value


def write_sql_file(output_path, table_name, data):
    """ Generic method to write any list of dictionaries
    to a SQL file. Every column must appear as a key in
    every dictionary in the list.

    Each dictionary must only have the keys for the columns that
    will go in the database. No spare or unused keys.

    Args:
        output_path (str): full path to the SQL file that will get generated
        table_name (str): postgres database table name with schema prefix
        data (list): List of dictionaries containing data to be written.
    """

    # Get the column names from the keys in the first item in the list.
    columns = next(iter(data)).keys()

    sql_statement = 'INSERT INTO {} ({}) VALUES ({});\n'.format(table_name, ','.join(columns), (','.join('{' * len(columns)).replace('{', '{}')))

    progbar = ProgressBar(len(data), 50, "Writing {} SQL".format(table_name))
    with open(output_path, 'w') as f:
        counter = 1
        for item in data:
            values = []
            for col in columns:
                value = item[col]
                if value:
                    if isinstance(value, str):
                        if value.lower().startswith('st_setsrid('):
                            # PostGIS operation. Write as literal string.
                            values.append(value)
                        else:
                            values.append(get_string_value(value))
                    elif isinstance(value, dict):
                        values.append("'{}'".format(json.dumps(value)))
                    else:
                        values.append(value)
                else:
                    values.append('NULL')

            counter += 1
            progbar.update(counter)
            f.write(sql_statement.format(*values))

    progbar.finish()
    log = Logger(table_name)
    print('{:,} records written to {}'.format(len(data), os.path.basename(output_path)))


def log_record_count(mscon, table_name, sql=None):

    if not sql:
        sql = 'SELECT Count(*) FROM {}'.format(table_name)

    mscurs = mscon.cursor()
    mscurs.execute(sql)
    log = Logger(table_name)
    log.info('Processing {:,} records for table {}'.format(mscurs.fetchone()[0], table_name))
