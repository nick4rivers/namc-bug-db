import csv
from rscommons import Logger, ProgressBar
from utilities import sanitize_string_col, write_sql_file, add_metadata
from lookup_data import lookup_data, get_db_id


def migrate(csv_path, output_path):

    log = Logger('geo.indicators')

    indicator_types = lookup_data('indicator_types', '24_geo_indicator_types.sql', 'indicator_type_name')
    translations = lookup_data('translations', '14_translations.sql', 'translation_name')
    units = lookup_data('units', '22_geo_units.sql', 'abbreviation')

    raw_data = csv.DictReader(open(csv_path))

    log.info('Processing {:,} records for table geo.indicators'.format(len(raw_data)))

    progbar = ProgressBar(len(raw_data), 50, "Migrating indicators")
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
        add_metadata(metadata, 'Years', row['Years of data']),
        add_metadata(metadata, 'Transformation', row['Transformation?']),
        add_metadata(metadata, 'DataPath', row['Data Path']),
        add_metadata(metadata, 'Data Source', row['Data Source']),
        add_metadata(metadata, 'Exception', row['Exception for small sheds']),
        add_metadata(metadata, 'Calculation', row['Calculation']),
        add_metadata(metadata, 'Notes', row['Notes']),
        add_metadata(metadata, 'ScriptConsolidated', row['Script Consolidated?']),
        add_metadata(metadata, 'CoverageLevel', row['Coverage Level'])

        if indicator not in postgres_data:
            postgres_data[indicator] = {
                'indicator_name': indicator,
                'abbreviation': indicator,
                'description': sanitize_string_col('None', 'None', {'description': description}, 'description'),
                'indicator_id': len(postgres_data) + 1,
                'indicator_type_id': get_db_id(indicator_types, 'indicator_type_id', ['indicator_name'], indicator_type),
                'unit_id': get_db_id(units, 'unit_id', ['abbreviation'], unit),
                'metadata': metadata
            }
        progbar.update(len(postgres_data))

    progbar.finish()

    write_sql_file(output_path, 'geo.indicators', postgres_data.values())
