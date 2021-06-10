import os
import argparse
import sqlite3
import csv
# import psycopg2
# from psycopg2.extras import execute_values
import pyodbc
from lib.dotenv import parse_args_env

# Lookup a translation name from
otu_map = {
    'PIBO': 'OTUCodePIBO',
    'AREMP': 'OTUCode2',
    'CSCI': 'OTUCodeCSCIswamp',
    'WestWide': 'OTUCodeWestWide18',
    'WY': 'OTUCodeWY18',
    'NV': 'OTUCodeNV',
    'ORWCCP': 'OTUCodeORPred05WCCP',
    'ORMWCF': 'OTUCodeORPred05MWCF',
    # 'ORNBR': ''
    'COMMI': 'OTUCodeCOedas17',
    'UTDEQ': 'OTUCode_UTDEQ15',
    'AK': 'OTUCodeSEAK',
    'OTUCode2': 'OTUCode2'
}


def build_translation_taxa(mscurs, translations_sql, input_csv, output_sql):

    # load the translations into an in-memory SQLite database just to get the IDs
    sqconn = sqlite3.connect(':memory:')
    sqconn.row_factory = dict_factory
    sqcurs = sqconn.cursor()
    sqcurs.execute('CREATE TABLE translations (translation_id int, translation_name text, description TEXT, is_active BOOLEAN )')
    with open(translations_sql, 'r') as sql_file:
        sql_script = sql_file.read()
        sql_script = sql_script.replace('INSERT INTO taxa.translations', 'INSERT INTO translations')
        # remove coalesce statement at end
        sql_script = sql_script[0:sql_script.index('SELECT')]

    sqcurs.executescript(sql_script)
    sqcurs.execute('select translation_id, translation_name from translations')
    translations = {row['translation_name']: row['translation_id'] for row in sqcurs.fetchall()}

    last_otu_name = ''
    csv_data = csv.DictReader(open(input_csv))
    data = []
    for csv_row in csv_data:
        raw_otu_alias = csv_row['scientific_name']
        raw_otu_name = csv_row['model_abbreviation']

        if raw_otu_name != last_otu_name:
            print('Processing', raw_otu_name)
            last_otu_name = raw_otu_name

        if raw_otu_name not in otu_map:
            continue

        otu_column = otu_map[raw_otu_name]
        otu_name_column = otu_column.replace('Code', 'Name')

        if raw_otu_name.lower() == 'aremp':
            translation_id = translations['OTUAREMP']
        else:
            translation_id = translations[otu_map[raw_otu_name]]

        mscurs.execute("""SELECT TOP 1 OTUCodeNone, OTUNameNone, OTUCodePIBO, OTUNamePIBO, l.taxalevel
            FROM PilotDB.dbo.BugOTU b
            INNER JOIN PilotDB.dbo.taxonomy t on b.OTUCodeNone = t.Code
            INNER JOIN PilotDB.dbo.typetaxalevels l on t.TaxaLevel = l.TaxaLevel
            WHERE  {} LIKE (?)
            ORDER BY l.TaxaLevelRank ASC""".format(otu_name_column), raw_otu_alias)
        msrows = mscurs.fetchall()

        taxonomy_id = None
        if msrows is None or len(msrows) != 1:
            print('No taxonomy found for {} and alias "{}"'.format(raw_otu_name, raw_otu_alias))
        else:
            msrow = msrows[0]
            msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

            taxonomy_id = int(msdata['OTUCodeNone'])

        data.append({'translation_id': translation_id, 'taxonomy_id': taxonomy_id, 'alias': raw_otu_alias})

    with open(output_sql, 'w') as f:
        for d in data:
            f.write("INSERT INTO taxa.translation_taxa (translation_id, taxonomy_id, alias, is_final) VALUES ({}, {}, '{}', True);\n".format(d['translation_id'], d['taxonomy_id'] if d['taxonomy_id'] is not None else 'NULL', d['alias']))

    print('process complete')


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
    parser.add_argument('translations_sql', help='Translation SQL file', type=str)
    parser.add_argument('input_csv', help='Translation Taxa CSV File', type=str)
    parser.add_argument('output_sql', help='Output path to translation SQL file that will be built', type=str)

    args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    # Postgres connection
    # pgconn = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)
    # pgcurs = pgconn.cursor()

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))
    mscurs = mscon.cursor()

    build_translation_taxa(mscurs, args.translations_sql, args.input_csv, args.output_sql)


if __name__ == '__main__':
    main()
