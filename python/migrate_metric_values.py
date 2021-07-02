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

block_size =500

columns =  ['sample_id',
    'model_id',
    'model_version',
    'fixed_count',
    'model_result',
    'metadata'
]

# # temporary list of taxa used for abundance metrics related to taxa
# metric_taxa = {
#     50: 'Ephemeroptera abundance',
#     52: 'Plecoptera abundance',
#     54: 'Trichoptera abundance',
#     56: 'Coleoptera abundance',
#     58: 'Elmidae abundance',
#     60: 'Megaloptera abundance',
#     62: 'Diptera abundance',
#     64: 'Chironomidae abundance',
#     66: 'Crustacea abundance',
#     68: 'Oligochaeta abundance',  # was 'Oligochaete'
#     70: 'Mollusca abundance',
#     72: 'Insecta abundance',
#     # 74: 'Non-insect abundance'
# }


def migrate(pgcurs, csv_path):
    """Migrates metric values from CSV to postgres database

    Args:
        pgcurs (cursor): Postgres cursor
        csv_path (str): path to CSV file containing metric values
    """

    log = Logger('metric values')

    samples = lookup_data(pgcurs, 'sample.samples', 'sample_id')
    # Simplify the samples down to just the ID and site ID
    samples = {sample_id: data['site_id'] for sample_id, data in samples}

    sites = lookup_data(pgcurs, 'geo.sites', 'site_name')
    models = lookup_data(pgcurs, 'geo.models', 'model_')

    if len(sites) < 1 or len(samples) < 1:
        raise Exception('You need to migrate sites and samples into the database first.')

    counter = 0
    raw_data = csv.DictReader(open(csv_path))
    progbar = ProgressBar(len(list(raw_data)), 50, "metric values")
    block_data = []
    for row in raw_data:

        sample_id = int(row['SAMPLEID'])
        station = row['STATION']

        if sample_id not in samples:
            log.warning('Sample {} not present in database. Skipping'.format(sample_id))
            continue

        model_id = get_db_id(models, 'model_id', ['model_name', 'abbreviation'], row['MODEL'],True)

        if samples[sample_id].lower() != station:
            log.error('Sample {} has site {} in CSV but is associated with site {} in postgres'.format(sample_id, station, samples[sample_id]))

        metadata = {}
        for col in ['UID', 'O', 'E', 'AIM_rtg', 'MODELTEST','INVASIVE_MACRO']:
            if row[col] is not None:
                metadata[col] = float(row[col]) if row[col].isnumeric() else row[col]
        
        model_result = float(row['OE']) if row['MMI'] is None else row['MMI']

        block_data.append({
            'model_id': model_id,
            'sample_id': sample_id,
            'model_version': '0.0.0',
            'fixed_count': int(row['COUNT']),
            'model_result': model_result,
            'metadata': metadata
        })

        if len(block_data) == block_size:
            insert_many_rows(pgcurs, 'sample.model_results', columns, block_data, None)
            block_data = []
            progbar.update(counter)

        counter += 1

    # insert remaining rows
    if len(block_data) > 0:
        insert_many_rows(pgcurs, 'sample.model_results', columns, block_data, None)

    progbar.finish()
    log_row_count(pgcurs, 'sample.model_results', len(raw_data))

        

    # print('{:,} site predictor values'.format(len(site_data)))
    # insert_many_rows(pgcurs, 'geo.site_predictors', ['site_id', 'predictor_id', 'metadata'], site_data)

    # print('{:,} sample predictor values'.format(len(samp_data)))
    # insert_many_rows(pgcurs, 'geo.sample_predictors', ['site_id', 'sample_id', 'predictor_id', 'metadata'], samp_data)


# def insert_metric_taxa(pgcurs):

#     # First set all the metrics to inactive except the overall sample abundance
#     pgcurs.execute('UPDATE metric.metrics SET is_active =false WHERE metric_id <> 21')

#     for metric_id, metric_name in metric_taxa.items():
#         taxa_name = metric_name.split(' ')[0]
#         print(taxa_name)
#         pgcurs.execute('SELECT taxonomy_id FROM taxa.taxonomy where scientific_name ilike (%s)', [taxa_name])
#         taxonomy_id = pgcurs.fetchone()[0]

#         pgcurs.execute('INSERT INTO metric.metric_taxa (metric_id, taxonomy_id) VALUES (%s, %s)', [metric_id, taxonomy_id])

#         # Set this metric to active
#         pgcurs.execute('UPDATE metric.metrics SET is_active = TRUE where metric_id = %s', [metric_id])
