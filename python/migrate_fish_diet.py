"""
Migrate the fish diet data provided by Trip on 9 July 2021.
Green River data?
"""
import os
import csv
import argparse
import psycopg2
from psycopg2.extras import execute_values
from lib.dotenv import parse_args_env
from lib.logger import Logger
from lib.progress_bar import ProgressBar
from lookup_data import get_db_id
from utilities import log_record_count, format_values, sanitize_string
from postgres_lookup_data import process_query, lookup_data


def migrate(pgcurs, csv_path):

    log = Logger('Fish Diet')

    sites = lookup_data(pgcurs, 'geo.sites', 'site_id')
    taxa = lookup_data(pgcurs, 'taxa.taxonomy', 'scientific_name')
    life_stages = lookup_data(pgcurs, 'taxa.life_stages', 'abbreviation')

    # Loop over the CSV once. Build the nested hierarchy of
    # samples containing multiple fish gut measurements
    data = {}
    sample_id = None
    for row in csv.DictReader(open(csv_path, encoding='mac_roman')):
        # print(row)
        clean = {'raw': '{}'.format(row)}
        for col in row.keys():
            if row[col] == '':
                clean[col] = None
            else:
                row[col] = row[col].strip()
                if row[col].isnumeric():
                    clean[col] = int(row[col])
                elif isfloat(row[col]):
                    clean[col] = float(row[col])
                else:
                    if row[col].lower() == 'na':
                        clean[col] = None
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
                'sample_date': clean['SampDate'],
                'site_id': get_db_id(sites, 'site_id', ['site_name'], clean['SiteID'], True),
                'fish_taxonomy_id': get_db_id(taxa, 'taxonomy_id', ['scientific_name'], clean['ScientificName'], True),
                'fish_length': clean['Fish_length'],
                'fish_wight': clean['Fish_weight'],
                'organic': None,
                'inorganic': None,
                'other': None
            }

    log.info('{} distinct fish diet samples loaded'.format(len(data)))

    # Now loop over all the individual fish gut measurements
    for sample_id, sample_data in data.items():
        for fish_gut_data in sample_data['data']:

            # Retain NULL weights. Record simply becomes presence/absence of taxa
            weight = fish_gut_data['Sample (g)']
            # if weight is None:
            #     log.warning('Null Weight')
            #     print(fish_gut_data['raw'])
            #     continue

            fgtype = fish_gut_data['Name']
            if fgtype.lower() == 'organic':
                sample_data['organic'] = weight
            elif fgtype.lower() == 'inorganic':
                sample_data['inorganic'] = weight
            elif fgtype.lower() == 'other':
                sample_data['other'] = weight
            else:
                # special cases
                life_stage = fish_gut_data['LifeStage']
                if life_stage is None:
                    life_stage = 'Unspecified'
                elif life_stage.lower() == 'exuviae':
                    life_stage = 'Exuvia'
                life_stage_id = get_db_id(life_stages, 'life_stage_id', ['abbreviation', 'life_stage_name'], life_stage, True)

                taxa_name = fish_gut_data['Name']
                if taxa_name.lower() == 'empty':
                    log.warning('taxonomy is specified as "Empty"')
                    continue
                elif taxa_name.lower() == 'diplopeda':
                    taxa_name = 'Diplostraca'
                elif taxa_name.lower() == 'turbellaria':
                    # TODO: need taxa here!
                    continue

                taxonomy_id = get_db_id(taxa, 'taxonomy_id', ['scientific_name'], taxa_name, True)

                key = '{}_{}'.format(taxonomy_id, life_stage_id)
                if key in sample_data['fish_gut_weights']:
                    if weight is not None:
                        if sample_data['fish_gut_weights'][key]['weight'] is None:
                            sample_data['fish_gut_weights'][key]['weight'] = weight
                        else:
                            sample_data['fish_gut_weights'][key]['weight'] += weight
                    # log.error('Duplicate fish gut key for row {}'.format(fish_gut_data['raw']))
                else:
                    sample_data['fish_gut_weights'][key] = {
                        'taxonomy_id': taxonomy_id,
                        'weight': weight,
                        'life_stage_id': life_stage_id,
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
    pgcurs = pgcon.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        migrate(pgcurs, fish_diet_csv)
        pgcon.commit()
    except Exception as ex:
        log.error(str(ex))
        pgcon.rollback()


if __name__ == '__main__':
    main()
