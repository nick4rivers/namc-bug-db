import csv
import json
import psycopg2
from psycopg2.extras import execute_values
from lib.logger import Logger
from lib.progress_bar import ProgressBar
from utilities import sanitize_string, format_values, add_metadata
from postgres_lookup_data import lookup_data, insert_row, log_row_count
from lookup_data import get_db_id

table_name = 'geo.predictors'


def migrate(csv_path, pgcurs):

    log = Logger(table_name)

    predictor_types = lookup_data(pgcurs, 'geo.predictor_types', 'predictor_type_name')
    translations = lookup_data(pgcurs, 'taxa.translations', 'translation_name')
    units = lookup_data(pgcurs, 'geo.units', 'abbreviation')

    raw_data = csv.DictReader(open(csv_path))
    log.info('Processing {:,} records for table geo.predictors'.format(len(list(raw_data))))

    predictors = {}
    counter = 0
    progbar = ProgressBar(len(list(raw_data)), 50, "predictors")
    raw_data = csv.DictReader(open(csv_path))
    for row in raw_data:
        predictor = row['Variable']
        predictor_type = row['Script'] if row['Script'] in predictor_types else 'Unknown'
        description = row['Variable Description']

        translation = row['Model']
        if translation not in translations:
            raise Exception('Missing translation {}'.format(translation))

        unit = row['Units']
        if not unit or len(unit) < 1 or unit not in units:
            unit = '??'

        metadata = {}
        add_metadata(metadata, 'function', row['Function Computed for Cells']),
        add_metadata(metadata, 'cellInfo', row['What do cells represent?']),
        add_metadata(metadata, 'cellSize', row['Cell size']),
        add_metadata(metadata, 'years', row['Years of data']),
        add_metadata(metadata, 'transformation', row['Transformation?']),
        add_metadata(metadata, 'dataPath', row['Data Path']),
        add_metadata(metadata, 'dataSource', row['Data Source']),
        add_metadata(metadata, 'exception', row['Exception for small sheds']),
        add_metadata(metadata, 'calculation', row['Calculation']),
        add_metadata(metadata, 'notes', row['Notes']),
        add_metadata(metadata, 'scriptConsolidated', row['Script Consolidated?']),
        add_metadata(metadata, 'coverageLevel', row['Coverage Level'])

        if predictor not in predictors:
            data = {
                'predictor_name': predictor,
                'abbreviation': predictor,
                'description': sanitize_string(description),
                'predictor_type_id': get_db_id(predictor_types, 'predictor_type_id', ['predictor_type_name'], predictor_type),
                'unit_id': get_db_id(units, 'unit_id', ['abbreviation'], unit),
                'metadata': json.dumps(metadata)
            }

            predictors[predictor] = insert_row(pgcurs, table_name, data, 'predictor_id')
        counter += 1
        progbar.update(counter)

    progbar.finish()
    log_row_count(pgcurs, table_name, len(predictors))
