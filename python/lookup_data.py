import sqlite3
import os
import re
from rscommons import Logger


def lookup_data(create_table, sql_path, key):

    conn = sqlite3.connect(':memory:')
    conn.row_factory = dict_factory
    curs = conn.cursor()

    curs.execute(create_table)

    with open(sql_path, mode='r') as f:
        sql_statements = f.read()
        individual_statements = sql_statements.split(';')
        result = re.search('\s([a-z]+\.)([a-z_]+)\s', individual_statements[0])
        schema = result[1]
        table = result[2]

        sql_statements = sql_statements.replace(schema, '')
        conn.executescript(sql_statements)

    curs.execute('SELECT * FROM {}'.format(table))
    results = {}
    for row in curs.fetchall():
        results[row[key]] = row

    return results


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def get_db_id(data, id_field, keys, lookup_value):

    if not lookup_value:
        return None

    for value in data.values():
        for key in keys:
            if value[key].lower() == lookup_value.lower():
                return value[id_field]

    log = Logger('DBLookup')
    log.error("Failed to find {} ID for value '{}'".format(id_field, lookup_value))
    return None
