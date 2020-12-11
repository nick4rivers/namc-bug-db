import sqlite3
import os
import re
from rscommons import Logger

tables = {
    'organizations': 'CREATE TABLE organizations (organization_id INT, abbreviation TEXT, organization_name TEXT, entity_id INT, organization_type_id INT, is_lab BOOL);',
    'sample_methods': 'CREATE TABLE sample_methods (sample_method_id INT, sample_method_name TEXT, is_active BOOL);',
    'habitats': 'CREATE TABLE habitats (habitat_id INT, habitat_name TEXT, ecosystem_id INT, is_active BOOL);',
    'systems': 'CREATE TABLE systems (system_id INT, system_name TEXT, ecosystem_id INT);',
    'ecosystems': 'CREATE TABLE ecosystems (ecosystem_id INT, ecosystem_name TEXT);',
    'sites': 'CREATE TABLE sites (site_id INT, site_name TEXT, system_id INT, ecosystem_id INT, location TEXT, description TEXT, metadata TEXT);',
    'sample_types': 'CREATE TABLE sample_types (sample_type_id INT, sample_type_name TEXT);',
    'life_stages': 'CREATE TABLE life_stages (life_stage_id INT, abbreviation TEXT, life_stage_name TEXT);'
}


def lookup_data(table_name, sql_file_name, key, where_clause=None):

    conn = sqlite3.connect(':memory:')
    conn.row_factory = dict_factory
    curs = conn.cursor()

    curs.execute(tables[table_name])

    sql_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', sql_file_name)

    with open(sql_path, mode='r') as f:
        sql_statements = f.read()
        individual_statements = sql_statements.split(';')
        result = re.search('\s([a-z]+\.)([a-z_]+)\s', individual_statements[0])
        schema = result[1]
        table = result[2]

        sql_statements = sql_statements.replace(schema, '')

        # Need to remove any PostGIS functions
        sql_statements = sql_statements.replace('ST_SetSRID(ST_MakePoint(', "'").replace('), 4326)', "'")

        conn.executescript(sql_statements)

    curs.execute('SELECT * FROM {} {}'.format(table, ' WHERE {}'.format(where_clause) if where_clause else ''))
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
