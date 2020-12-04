import os
import csv
import json
import argparse
from rscommons import Logger, ProgressBar, dotenv
import psycopg2
from utilities import sanitize_string_col


def migrate_translation_indicators(pgcon, csv_path, output_path):

    pgcurs = pgcon.cursor()

    # Load the list of indicators
    pgcurs.execute('SELECT indicator_type_id, indicator_type_name FROM geo.indicator_types')
    indicator_types = {row[1]: row[0] for row in pgcurs.fetchall()}

    pgcurs.execute('SELECT translation_id, translation_name FROM taxa.translations')
    translations = {row[1]: {'translation_id': row[0], 'indicators': []} for row in pgcurs.fetchall()}

    pgcurs.execute('SELECT unit_id, abbreviation FROM geo.units')
    units = {row[1]: row[0] for row in pgcurs.fetchall()}

    raw_data = csv.DictReader(open(csv_path))

    indicators = {}
    for row in raw_data:
        translation = row['Model']
        indicator = row['Variable']
        indicator_type = row['Script']
        description = row['Variable Description']
        unit = row['Units']
        metadata = {
            'function': sanitize_string_col('None', 'None', row, 'Function Computed for Cells'),
            'cellInfo': sanitize_string_col('None', 'None', row, 'What do cells represent?'),
            'cellSize': sanitize_string_col('None', 'None', row, 'Cell size'),
            'Years': sanitize_string_col('None', 'None', row, 'Years of data'),
            'Transformation': sanitize_string_col('None', 'None', row, 'Transformation?'),
            'DataPath': sanitize_string_col('None', 'None', row, 'Data Path'),
            'Data Source': sanitize_string_col('None', 'None', row, 'Data Source'),
            'Exception': sanitize_string_col('None', 'None', row, 'Exception for small sheds'),
            'Calculation': sanitize_string_col('None', 'None', row, 'Calculation'),
            'Notes': sanitize_string_col('None', 'None', row, 'Notes'),
            'ScriptConsolidated': sanitize_string_col('None', 'None', row, 'Script Consolidated?'),
            'CoverageLevel': sanitize_string_col('None', 'None', row, 'Coverage Level')
        }

        if translation not in translations:
            raise Exception('Missing translation {}'.format(translation))

        if not unit or len(unit) < 1 or unit not in units:
            unit = '??'

        if indicator_type not in indicator_types:
            indicator_type = 'Unknown'

        if indicator not in indicators:
            indicators[indicator] = {
                'description': sanitize_string_col('None', 'None', {'description': description}, 'description'),
                'indicator_id': len(indicators) + 1,
                'indicator_type_id': indicator_types[indicator_type],
                'unit_id': units[unit],
                'metadata': metadata
            }

    with open(output_path, 'w') as f:
        for indicator_name, indicator in indicators.items():
            f.write("INSERT INTO geo.indicators(indicator_id, indicator_name, unit_id, abbreviation, description, metadata) VALUES ({}, '{}', {}, '{}', '{}', '{}');\n".format(
                indicator['indicator_id'],
                indicator_name,
                indicator['unit_id'],
                indicator_name,
                indicator['description'],
                json.dumps(indicator['metadata'])
            ))

    print('{} models'.format(len(indicators)))
    # print('{} predictors'.format(predictors))


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument('pghost', help='Postgres password', type=str)
    parser.add_argument('pgport', help='Postgres password', type=str)
    parser.add_argument('pgdb', help='Postgres password', type=str)
    parser.add_argument('pguser_name', help='Postgres user name', type=str)
    parser.add_argument('pgpassword', help='Postgres password', type=str)
    parser.add_argument('csv_path', help='Input translation indicator CSV', type=str)
    parser.add_argument('output_sql', help='Name of the file for the output SQL', type=str)
    args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    input_path = os.path.join(os.path.dirname(__file__), args.csv_path)
    output_path = os.path.join(os.path.dirname(__file__), '../docker/postgres/initdb', args.output_sql)

    # Postgres Connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)

    migrate_translation_indicators(pgcon, input_path, output_path)


if __name__ == '__main__':
    main()
