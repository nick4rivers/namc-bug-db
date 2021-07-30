import os
import csv
import argparse
import psycopg2
from psycopg2.extras import execute_values
from lib.dotenv import parse_args_env
from lib.logger import Logger
from postgres_lookup_data import lookup_data


def create_otucode_ordeq(pgcurs, otu_name, csv_path):

    log = Logger('Create OTU')

    taxa = lookup_data(pgcurs, 'taxa.taxonomy', 'scientific_name')

    # Step 1 - Create the OTU parent record
    pgcurs.execute('INSERT INTO taxa.translations (translation_name) VALUES (%s) returning translation_id', [otu_name])
    translation_id = pgcurs.fetchone()[0]

    # parse the taxa
    csv_data = csv.DictReader(open(csv_path))
    for row in csv_data:
        taxa_name = row['Taxon']
        alias = row['OTU']

        if taxa_name not in taxa:
            log.warning('Missing taxa: {}'.format(taxa_name))

    print('Process Complete')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('pghost', help='Postgres password', type=str)
    parser.add_argument('pgport', help='Postgres password', type=str)
    parser.add_argument('pgdb', help='Postgres password', type=str)
    parser.add_argument('pguser_name', help='Postgres user name', type=str)
    parser.add_argument('pgpassword', help='Postgres password', type=str)

    parser.add_argument('otu_name', help='Name of the OTU to be generated', type=str)
    parser.add_argument('csv_path', help='CSV Path to OTU taxa', type=str)
    args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    csv_path = os.path.join(os.path.dirname(__file__), args.csv_path)

    # Postgres connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)
    pgcurs = pgcon.cursor(cursor_factory=psycopg2.extras.DictCursor)

    log = Logger('Create OTU')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "create_otu.log"), verbose=True)

    try:
        create_otucode_ordeq(pgcurs, args.otu_name, csv_path)
        # pgcon.commit()
    except Exception as ex:
        log.error(str(ex))
        pgcon.rollback()


if __name__ == '__main__':
    main()
