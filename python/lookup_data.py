import sqlite3
import os
import re
from lib.logger import Logger

# These table column definitions are for temporary in-memory SQLite databases that get
# populated from the SQL files when the migration scripts need access to the data
# and primary Key IDs for data that's already in the Postgres database.
tables = {
    'indicator_types': 'indicator_type_id INT, indicator_type_name TEXT',
    'units': 'unit_id INT, unit_name TEXT, abbreviation TEXT, description TEXT',
    'translations': 'translation_id INT, translation_name TEXT',
    'organizations': 'organization_id INT, abbreviation TEXT, organization_name TEXT, entity_id INT, organization_type_id INT, is_lab BOOL',
    'sample_methods': 'sample_method_id INT, sample_method_name TEXT, is_active BOOL',
    'habitats': 'habitat_id INT, habitat_name TEXT, ecosystem_id INT, is_active BOOL',
    'systems': 'system_id INT, system_name TEXT, ecosystem_id INT',
    'ecosystems': 'ecosystem_id INT, ecosystem_name TEXT',
    'sites': 'site_id INT, site_name TEXT, system_id INT, ecosystem_id INT, location TEXT, description TEXT, metadata TEXT',
    'sample_types': 'sample_type_id INT, sample_type_name TEXT',
    'life_stages': 'life_stage_id INT, abbreviation TEXT, life_stage_name TEXT, is_active TEXT',
    'countries': 'country_id INT, country_name TEXT, abbreviation TEXT',
    'states': 'state_id INT, country_id INT, state_name TEXT, abbreviation TEXT',
    'organization_types': 'organization_type_id INT, organization_type_name TEXT',
    'box_states': 'box_state_id INT, box_state_name TEXT, box_state_order INT, description TEXT',
    'individuals': 'individual_id INT, first_name TEXT, last_name TEXT, initials TEXT, entity_id INT, affiliation_id INT, email TEXT',
    'project_types': 'project_type_id INT, project_type_name TEXT, description TEXT'
}


def lookup_data(table_name, sql_file_name, key, where_clause=None):
    """Loads data from a SQL file into a temporary in-memory
    SQLite database and then returns a dictionary.

    Args:
        table_name (str): table name without schema name
        sql_file_name (str): file name only for the SQL file to load data
        key (str): name of the field that will be the dictionary key of returned data
        where_clause (str, optional): Optional WHERE clause to filter data after load. Defaults to None.

    Returns:
        dict: Dictionary of objects (all fields) of data keyed to the key field specified.
    """

    conn = sqlite3.connect(':memory:')
    conn.row_factory = dict_factory
    curs = conn.cursor()

    # Create the database table from definition above
    table_sql = 'CREATE TABLE {} ({});'.format(table_name, tables[table_name])
    curs.execute(table_sql)

    # This is the folder where all the postgres insert SQL files reside relative to this file.
    sql_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', sql_file_name)

    with open(sql_path, mode='r') as f:
        sql_statements = f.read()
        individual_statements = sql_statements.split(';')

        # retrieve the schema name and table name from the first insert statement.
        result = re.search('\s([a-z]+\.)([a-z_]+)\s', individual_statements[0])
        schema = result[1]
        table = result[2]

        # strip off the schema name from every statement
        sql_statements = sql_statements.replace(schema, '')

        # Need to remove any PostGIS functions
        sql_statements = sql_statements.replace('ST_SetSRID(ST_MakePoint(', "'").replace('), 4326)', "'")

        # execute all the SQL insert statements
        conn.executescript(sql_statements)

    # Select all the data from the temporary table, filtering if necessary
    curs.execute('SELECT * FROM {} {}'.format(table, ' WHERE {}'.format(where_clause) if where_clause else ''))
    return {row[key]: row for row in curs.fetchall()}


def dict_factory(cursor, row):
    # used to generate a dictionary of SQLite data
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}


def get_db_id(data, id_field, keys, lookup_value, raise_exception=False, log_error_on_missing=True):
    """Get the postgres database ID of an item in a
    dictionary by looking up one or more keys

    Args:
        data (dict): Dictionary of data
        id_field (str): the key in each dictionary item that contains the database ID (typically primary key column name)
        keys (list): One or more key fields to use to look up items. Could be the name column and abbreviation column
        lookup_value (str): The value to match on of the keys

    Returns:
        int: The postgres database ID of the item that one of the keys matches the lookup value
    """

    if not lookup_value:
        return None

    for value in data.values():
        for key in keys:
            if value[key].lower() == lookup_value.lower():
                return value[id_field]

    if log_error_on_missing:
        log = Logger('DBLookup')
        log.error("Failed to find {} ID for value '{}'".format(id_field, lookup_value))

    if raise_exception:
        raise 'Database ID lookup failure'

    return None
