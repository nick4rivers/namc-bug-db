""" Migrates the CSV file of predictor values into the Postgres database

    The CSV file was obtained from Jennifer Courtright as an Excel file and
    exported to CSV for this process.
"""
import os
import csv
import json
import psycopg2
import argparse
from psycopg2.extras import execute_values
from lib.logger import Logger
from lib.progress_bar import ProgressBar
from lib.dotenv import parse_args_env
from utilities import sanitize_string, format_values, add_metadata, write_sql_file
from postgres_lookup_data import lookup_data, insert_row, log_row_count, insert_many_rows
from lookup_data import get_db_id


def migrate(pgcurs, csv_path):
    """Migrates predictor values from CSV to postgres database

    Args:
        pgcurs (cursor): Postgres cursor
        csv_path (str): path to CSV file containing predictor values

    """

    log = Logger('predictor values')
    log.info('Starting Predictor Values')

    predictors = lookup_data(pgcurs, 'geo.predictors', 'abbreviation')
    sites = lookup_data(pgcurs, 'geo.sites', 'site_name')

    if len(sites) < 1:
        raise Exception('You need to migrate sites into the database first.')

    counter = 0
    # progbar = ProgressBar(len(list(raw_data)), 50, "predictor values")
    raw_data = csv.DictReader(open(csv_path))
    data = {}
    for row in raw_data:

        if counter == 0:
            # Report presence/absence of predictor columns
            valid_predictors = 0
            for predictor in predictors.keys():
                if predictor in row:
                    valid_predictors += 1
                else:
                    # There are StreamCAT predictors in DB. So not all will be present.
                    log.debug("No column in CSV for predictor {}".format(predictor))

            print("{} valid predictor columns".format(valid_predictors))

        counter += 1
        site_name = row['station']
        if site_name not in sites:
            log.warning('Site {} not present in database. Skipping.'.format(site_name))
            continue
        site_id = get_db_id(sites, 'site_id', ['site_name'], site_name)
        if site_id not in data:
            data[site_id] = {'sample_predictors': {}, 'site_predictors': {}}

        for predictor in predictors:
            if predictor not in row:
                continue

            value = row[predictor]
            if str(value).lower() == 'na':
                continue

            predictor_id = predictors[predictor]['predictor_id']

            if predictors[predictor]['is_temporal']:
                sample_id = row['sampleid']
                if predictor_id in data[site_id]['sample_predictors']:
                    if sample_id in data[site_id]['sample_predictors']:
                        if value != data[site_id]['sample_predictors'][sample_id]:
                            log.warning("Sample {} predictor {} value {} does not match {} for sample {}".format(site_name, predictor, value, site_predictor_values[site_id][predictor_id], sample_id))
                        continue
                else:
                    data[site_id][predictor_id] = {}

                data[site_id][predictor_id][sample_id] = value

            else:
                if predictor_id in data[site_id]['site_predictors']:
                    if value != data[site_id]['site_predictors'][predictor_id]:
                        log.warning("Site {} predictor {} value {} does not match {}".format(site_name, predictor, value, data[site_id]['site_predictors'][predictor_id]))
                    continue

                data[site_id]['site_predictors'][predictor_id] = value

    # unpack the data into a flat list of tuples for insertion into the database
    site_data = []
    samp_data = []
    for site_id, types in data.items():

        for predictor_id, samples in types['sample_predictors'].items():
            for sample_id, value in samples.items():
                samp_data.append((site_id, sample_id, predictor_id, {'value': value}))

        for predictor_id, value in types['site_predictors'].items():
            site_data.append((site_id, predictor_id, {'value': value}))

    print('{:,} site predictor values'.format(len(site_data)))
    insert_many_rows(pgcurs, 'geo.site_predictors', ['site_id', 'predictor_id', 'metadata'], site_data)

    print('{:,} sample predictor values'.format(len(samp_data)))
    insert_many_rows(pgcurs, 'geo.sample_predictors', ['site_id', 'sample_id', 'predictor_id', 'metadata'], samp_data)
