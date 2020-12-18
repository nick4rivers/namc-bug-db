import json
import psycopg2
from rscommons import Logger
from psycopg2.extras import execute_values


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
