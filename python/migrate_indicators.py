import csv
from rscommons import Logger, ProgressBar
from utilities import sanitize_string, write_sql_file, add_metadata
from lookup_data import lookup_data, get_db_id


def migrate(csv_path, output_path):

    log = Logger('geo.indicators')

    indicator_types = lookup_data('indicator_types', '24_geo_indicator_types.sql', 'indicator_type_name')
    translations = lookup_data('translations', '14_translations.sql', 'translation_name')
    units = lookup_data('units', '22_geo_units.sql', 'abbreviation')

    raw_data = csv.DictReader(open(csv_path))
    log.info('Processing {:,} records for table geo.indicators'.format(len(list(raw_data))))

    raw_data = csv.DictReader(open(csv_path))
    postgres_data = {}
    for row in raw_data:
        indicator = row['Variable']
        indicator_type = row['Script'] if row['Script'] in indicator_types else 'Unknown'
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

        if indicator not in postgres_data:
            postgres_data[indicator] = {
                'indicator_name': indicator,
                'abbreviation': indicator,
                'description': sanitize_string(description),
                'indicator_id': len(postgres_data) + 1,
                'indicator_type_id': get_db_id(indicator_types, 'indicator_type_id', ['indicator_type_name'], indicator_type),
                'unit_id': get_db_id(units, 'unit_id', ['abbreviation'], unit),
                'metadata': metadata
            }

    write_sql_file(output_path, 'geo.indicators', postgres_data.values())
