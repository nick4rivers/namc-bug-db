"""Creates and populates a SQLite database with the taxonomic information
    from PilotDB.
    """
import os
import argparse
import sqlite3
# import psycopg2
# from psycopg2.extras import execute_values
import pyodbc
from migrate_taxonomy_pivot import migrate as taxonomy
from lib.dotenv import parse_args_env
from utilities import sanitize_string_col
from postgres_lookup_data import process_table, process_query, lookup_data
from migrate_translation_taxa import taxa_translations_callback


def build_sqlite(mscurs, sqcurs):

    # Implement the schema
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    with open(schema_path, 'r') as f:
        sqcurs.executescript(f.read())

    # Load the lookup information from SQL files
    for file_name in ['10_taxa_translations.sql', '20_taxa_levels.sql', '10_taxa_external_sources.sql']:
        file_path = os.path.join(os.path.dirname(__file__), '../../../docker/postgres/initdb', file_name)
        with open(file_path, 'r') as f:
            for line in f.readlines():
                if line.lower().startswith('select'):
                    continue
                fixed_line = line.replace('taxa.', '')
                sqcurs.execute(fixed_line)
    # Load the taxonomy
    process_table(mscurs, sqcurs, 'PilotDB.taxa.taxonomy', 'taxonomy', taxonomy_callback, None, '?', False)

    # Insert Animalia
    sqcurs.execute('SELECT Max(taxonomy_id) taxonomy_id from taxonomy')
    taxonomy_id = sqcurs.fetchone()['taxonomy_id'] + 1
    sqcurs.execute("INSERT INTO taxonomy (taxonomy_id, scientific_name, level_id) VALUES (?, 'Animalia', 1)", [taxonomy_id])
    sqcurs.execute("UPDATE taxonomy SET parent_id = ? WHERE level_id = 5", [taxonomy_id])

    # Load the translation taxa
    # Get the list of translations (OTU) in the new database
    translations = lookup_data(sqcurs, 'translations', 'translation_name')
    process_query(mscurs, sqcurs, 'SELECT OTUName, OTUCode FROM PilotDB.dbo.BugOTU_pivot WHERE OTUCode IS NOT NULL GROUP BY OTUName, OTUCode', 'translation_taxa', taxa_translations_callback, translations, '?', False)


def taxonomy_callback(msdata, lookup):

    return {
        'taxonomy_id': msdata['code'],
        'parent_id': msdata['parent_code'],
        'level_id': msdata['taxa_level_id'],
        'scientific_name': sanitize_string_col('taxaonomy', 'code', msdata, 'scientific_name'),
        'author': None,
        'year': None
    }


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('msdb', help='SQLServer password', type=str)
    parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    parser.add_argument('mspassword', help='SQLServer password', type=str)
    args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    # Postgres connection
    # pgconn = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)
    # pgcurs = pgconn.cursor()

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))
    mscurs = mscon.cursor()

    sqlite_path = os.path.join(os.path.dirname(__file__), 'namc_taxa.sqlite')
    sqconn = sqlite3.connect(sqlite_path)
    sqconn.row_factory = dict_factory
    sqcurs = sqconn.cursor()

    build_sqlite(mscurs, sqcurs)

    sqconn.commit()


if __name__ == '__main__':
    main()
