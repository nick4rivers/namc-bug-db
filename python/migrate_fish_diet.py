"""
Migrate the fish diet data provided by Trip on 9 July 2021.
Green River data?
"""
import os
import csv
import psycopg2
from psycopg2.extras import execute_values
from lib.dotenv import parse_args_env
from lib.logger import Logger
from lib.progress_bar import ProgressBar
from lookup_data import get_db_id
from utilities import log_record_count, format_values, sanitize_string
from postgres_lookup_data import process_query, lookup_data

def migrate(pgcurs, csv_path):

    sites = lookup_data(pgcurs, 'geo.sites', 'site_id')
    taxa = lookup_data(pgcurs, 'taxa.taxonomy', 'scientific_name')
    life_stages = lookup_data(pgcurs, 'taxa.life_stages', 'abbreviation')

    # Loop over the CSV once. Build the nested hierarchy of 
    # samples containing multiple fish gut measurements
    data = {}
    sample_id = None
    for row in csv.DictReader(open(csv_path)):
        clean = {'raw': '{}'.format(row)}
        for col in row.keys():
            if row[col] == '':
                clean[col] = None
            else:
                row[col] = row[col].trim()
                if row[col].isnumeric():
                    clean[col] = int(row[col])
                elif isfloat(row[col]):
                    clean[col] = float(row[col])
                else:
                    clean[col] = row[col]

        sample_id = clean['Sample #']
        if sample_id in data:
            data[sample_id]['data'].append(clean)
        else:
            data[sample_id] = {
                'data': [clean], 
                'fish_gut_weights': {},
                'sample_id': sample_id, 
                'IDerDate': clean['IDerDate'],
                'IDerID': clean['IDerID'],
                'box_id': clean['Box #'],
                'sample_date': clean['SampleDate'],
                'site_id' : get_db_id(sites, 'site_id', ['site_name'], clean['SiteID'], True),
                'fish_taxonomy_id': get_db_id(taxa,'taxonomy_id', ['scientific_name'], True),
                'fish_length': clean['Fish_Length'],
                'fish_wight': clean['Fish_weight'],
                'organic': clean['Weight'] if clean['Name'].lower() == 'organic' else None,
                'inorganic': clean['Weight'] if clean['Name'].lower() == 'inorganic' else None,
                'other': clean['Weight'] if clean['Name'].lower() == 'other' else None
            }

    # Now loop over all the individual fish gut measurements
    for sample_id, sample_data in data.items():
        for fish_gut_data in sample_data['data']:

            type = fish_gut_data['Name']
            if type.lower() == 'organic' or type.lower() == 'inorganic' or type.lower() == 'other':
                #already accounted for
                continue
            
            fgd = {
                'taxonomy_id': get_db_id(taxa, 'taxonomy_id', ['scientific_name'], fish_gut_data['Name'], True),
                'weight': fish_gut_data['Weight'],
                'life_stage_id': get_db_id(life_stages, 'life_stage_id', ['abbreviation'], fish_gut_data['LifeStage'], True),
                'count': fish_gut_data['Count']
            }

    print('stop')



def isfloat(value):
    try:
        float(value)
        return True
    except ValueError:
        return False

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('pghost', help='Postgres password', type=str)
    parser.add_argument('pgport', help='Postgres password', type=str)
    parser.add_argument('pgdb', help='Postgres password', type=str)
    parser.add_argument('pguser_name', help='Postgres user name', type=str)
    parser.add_argument('pgpassword', help='Postgres password', type=str)
    parser.add_argument('fish_diet_csv', help='Fish diet CSV', type=str)
    parser.add_argument('--verbose', help='verbose logging', default=False)

    args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    fish_diet_csv = os.path.join(os.path.dirname(__file__), args.fish_diet_csv)

    log = Logger('Fish Diet')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "fish_diet.log"), verbose=args.verbose)

    # Postgres connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)

    try:
        migrate(pgcon, fish_diet_csv)
        pgcon.commit()
    except Exception as ex:
        log.error(str(ex))
        pgcon.rollback()



if __name__ == '__main__':
    main()
