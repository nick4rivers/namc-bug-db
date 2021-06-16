"""Exports the taxonomic information from SQLite
    to SQL files for building the postgres database
    """
import os
import argparse
import sqlite3
import json


def export_sqlite(sqcurs):

    output_folder = os.path.join(os.path.dirname(__file__), '../../../docker/postgres/initdb')

    sql_path = os.path.join(output_folder, '20_taxa_taxonomy.sql')
    sqcurs.execute('SELECT t.*, s.status_name FROM taxonomy t inner join statuses s on t.status_id = s.status_id ORDER BY taxonomy_id')
    taxa_names = {}
    with open(sql_path, 'w+') as f:
        for row in sqcurs.fetchall():

            taxa_names[row['taxonomy_id']] = row['scientific_name']

            f.write("insert into taxa.taxonomy (taxonomy_id, scientific_name, level_id, parent_id, author, year, notes, metadata) values ({}, '{}', {}, {}, {}, {}, {}, '{}');\n".format(
                row['taxonomy_id'],
                row['scientific_name'],
                row['level_id'],
                row['parent_id'],
                row['author'],
                row['year'],
                row['notes'],
                json.dumps({"status": row['status_name']})
            ))

    sql_path = os.path.join(output_folder, '30_translation_taxa.sql')
    sqcurs.execute('SELECT * FROM translation_taxa where taxonomy_id IS NOT NULL ORDER BY translation_id, translation_taxonomy_id')
    with open(sql_path, 'w+') as f:
        for row in sqcurs.fetchall():

            alias = 'NULL' if taxa_names[row['taxonomy_id']].lower() == row['alias'].lower() else "'{}'".format(row['alias'])

            f.write("insert into taxa.translation_taxa (translation_id, taxonomy_id, alias) values ({}, {}, {});\n".format(
                row['translation_id'],
                row['taxonomy_id'],
                alias
            ))


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('sqlite', help='SQLite database containing curated taxonomic information', type=str)
    args = parser.parse_args()

    sqconn = sqlite3.connect(args.sqlite)
    sqconn.row_factory = dict_factory
    sqcurs = sqconn.cursor()

    export_sqlite(sqcurs)


if __name__ == '__main__':
    main()
