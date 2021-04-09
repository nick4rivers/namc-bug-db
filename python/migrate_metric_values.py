""" Migrates the CSV file of metric values into the Postgres database

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
    """Migrates metric values from CSV to postgres database

    Args:
        pgcurs (cursor): Postgres cursor
        csv_path (str): path to CSV file containing metric values

    """

    log = Logger('metric values')

    predictors = lookup_data(pgcurs, 'geo.predictors', 'abbreviation')
    sites = lookup_data(pgcurs, 'geo.sites', 'site_name')

    if len(sites) < 1:
        raise Exception('You need to migrate sites into the database first.')

    counter = 0
    # progbar = ProgressBar(len(list(raw_data)), 50, "predictor values")
    raw_data = csv.DictReader(open(csv_path))
    data = {}
    # for row in raw_data:

    # print('{:,} site predictor values'.format(len(site_data)))
    # insert_many_rows(pgcurs, 'geo.site_predictors', ['site_id', 'predictor_id', 'metadata'], site_data)

    # print('{:,} sample predictor values'.format(len(samp_data)))
    # insert_many_rows(pgcurs, 'geo.sample_predictors', ['site_id', 'sample_id', 'predictor_id', 'metadata'], samp_data)
