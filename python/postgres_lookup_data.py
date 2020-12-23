import json
import psycopg2
from rscommons import Logger, ProgressBar
from psycopg2.extras import execute_values
from utilities import log_record_count

block_size = 5000


def lookup_data(pgcurs, table, id_field, where_clause=None):

    pgcurs.execute('SELECT * FROM {} {};'.format(table, ' WHERE {}'.format(where_clause) if where_clause else ''))
    column_names = [desc[0] for desc in pgcurs.description]
    return {row[id_field]: {col: row[col] for col in column_names} for row in pgcurs.fetchall()}


def insert_row(pgcurs, table, data, id_field=None):

    cols = list(data.keys())
    values = [json.dumps(data[col]) if isinstance(data[col], dict) else data[col] for col in cols]

    sql = 'INSERT INTO {} ({}) VALUES ({}){};'.format(
        table,
        ','.join(cols),
        ','.join('s' * len(cols)).replace('s', '%s'),
        ' RETURNING {}'.format(id_field) if id_field else '')

    pgcurs.execute(sql, values)
    return pgcurs.fetchone()[0] if id_field else None


def insert_many_rows(pgcurs, table, columns, data, sql=None):

    # Convert dictionaries to JSON
    values = []
    for item in data:
        values.append([json.dumps(value) if isinstance(value, dict) else value for value in item])

    if not sql:
        sql = 'INSERT INTO {} ({}) VALUES ({});'.format(
            table,
            ','.join(columns),
            ','.join('s' * len(columns)).replace('s', '%s'))

    pgcurs.executemany(sql, values)


def log_row_count(pgcurs, table, expected_rows=None):

    log = Logger(table)

    pgcurs.execute('SELECT Count(*) FROM {};'.format(table))
    total_rows = pgcurs.fetchone()[0]

    pgcurs.execute("SELECT pg_size_pretty( pg_total_relation_size('{}') )".format(table))
    size = pgcurs.fetchone()[0]

    msg = 'postgres {} contains {:,} records ({}).'.format(table, total_rows, size)

    if expected_rows and total_rows != expected_rows:
        log.warning('{}. Expected {:,}'.format(msg, expected_rows))
    else:
        log.info(msg)


def process_table(mscurs, pgcurs, source_table, target_table, call_back, lookup, select_sql=None):

    row_count = log_record_count(mscurs, source_table)

    if not select_sql:
        select_sql = 'SELECT * FROM {}'.format(source_table)

    mscurs.execute(select_sql)
    counter = 0
    progbar = ProgressBar(row_count, 50, target_table)
    block_data = []
    columns = None
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        data = call_back(msdata, lookup)

        if not columns:
            columns = list(data.keys())

        block_data.append([data[key] for key in columns])

        if len(block_data) == block_size:
            insert_many_rows(pgcurs, target_table, columns, block_data)
            block_data = []
            progbar.update(counter)

        counter += 1

    # insert remaining rows
    if len(block_data) > 0:
        insert_many_rows(pgcurs, target_table, columns, block_data)

    progbar.finish()
    log_row_count(pgcurs, target_table, row_count)
