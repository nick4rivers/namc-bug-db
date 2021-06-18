import os
import csv
import json
import argparse
import psycopg2
import matplotlib.pyplot as plt
from scipy import stats
from psycopg2.extras import execute_values
from lib.dotenv import parse_args_env
from lib.logger import Logger

# database metric ID keyed to CSV column header
# The original CSV column headers had asterix after those columns
# that use standardized names (e.g. "Richness*"). These asterix
# were removed when saving the file to disk.
# Only those metrics whose column header don't match the database
# metric name are listed below.
metric_aliases = {
    '# of Long-lived Taxa': 'Long-lived Taxa',
    '# of Elmidae taxa': '# of Elmidae Taxa',
    '# of non-insect taxa': '# of Non-insect taxa'

}

models = {
    'OTUcode2': 3,
    'OTUcode_PIBO': 17
}


def validate_metrics(pgcurs, metric_csv, output):

    csv_metrics = csv.DictReader(open(metric_csv))

    pgcurs.execute('SELECT * FROM metric.metric_groups order by sort_order')
    groups = [{'group_id': row['group_id'], 'group_name': row['group_name'], 'metrics':[]} for row in pgcurs.fetchall()]

    # Load metrics into dictionary keyed by name (skip dominant family and dominant taxa)
    pgcurs.execute('SELECT * FROM metric.metrics where (is_active) and (code_function is not null) and (metric_id not in (27, 29)) order by metric_id')
    metrics = {}
    for row in pgcurs.fetchall():
        metrics[row['metric_name']] = {'metric_id': row['metric_id']}

        for group in groups:
            if group['group_id'] == row['group_id']:
                group['metrics'].append(row['metric_name'])
                break

    data = {}
    for csv_row in csv_metrics:

        sample_id = csv_row['SampleID']
        data[sample_id] = {}

        for metric_name, metric_data in metrics.items():
            csv_column = metric_name if metric_name in csv_row else metric_aliases[metric_name]
            metric_id = metric_data['metric_id']

            data[sample_id][metric_id] = {'original': None, 'postgres': None}

            if csv_row[csv_column] is not None and csv_row[csv_column] != 'NULL':
                data[sample_id][metric_id]['original'] = float(csv_row[csv_column])

        # Check Sample Exists in database
        pgcurs.execute('SELECT * FROM sample.samples WHERE sample_id = %s', [sample_id])
        sample = pgcurs.fetchone()
        if sample is None:
            continue

        translation_id = models[csv_row['Model code']]

        pgcurs.execute('SELECT * FROM metric.sample_metrics(%s, %s,300)', [sample_id, translation_id])
        db_metrics = pgcurs.fetchall()

        for metric_name, metric_data in metrics.items():
            metric_id = metric_data['metric_id']
            for row in db_metrics:
                if row['metric_id'] == metric_id and row['metric_value'] is not None:
                    data[sample_id][metric_id]['postgres'] = float(row['metric_value'])
                    break

        # if len(data) >= 10:
        #     break

    # Loop over metrics and generate graphic and add to markdown string
    markdown = '---\ntitle: Metric Validation\n---\n'

    for group in groups:

        if len(group['metrics']) < 1:
            continue

        markdown += '\n# {}\n\n'.format(group['group_name'])

        for metric_name in group['metrics']:
            metric_data = metrics[metric_name]
            metric_id = metric_data['metric_id']

            values = []
            for sample_id, sample_values in data.items():
                if sample_values[metric_id]['original'] is not None and sample_values[metric_id]['postgres'] is not None:
                    values.append((sample_values[metric_id]['original'], sample_values[metric_id]['postgres']))

            img_path = os.path.join(os.path.dirname(output), '../assets/images/validation/{}_{}.png'.format(metric_id, metric_name.replace("'", "").replace("#", "").replace(' ', '_')))
            xyscatter(values, '{} (Legacy Values)'.format(metric_name), '{} (Postgres)'.format(metric_name), metric_name, img_path, True)
            markdown += '## {}\n\n'.format(metric_name)
            markdown += '![{}]({{{{ site.baseurl }}}}/assets/images/{})\n\n'.format(metric_name, os.path.basename(img_path))

    # Write the markdown file
    with open(output, 'w+') as f:
        f.write(markdown)


def xyscatter(values, xlabel, ylabel, chart_title, file_path, one2one=False):
    """
    Generate an XY scatter plot
    :param values: List of tuples containing the pairs of X and Y values
    :param xlabel: X Axis label
    :param ylabel: Y Axis label
    :param chart_title: Chart title (code appends sample size)
    :param file_path: RELATIVE file path where the figure will be saved
    :return: none
    """

    x = [x for x, y in values]
    y = [y for x, y in values]

    plt.clf()
    plt.scatter(x, y, c='#DA8044', alpha=0.5, label='{} (n = {:,})'.format(chart_title, len(x)))
    plt.title = chart_title
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    # TODO: add timestamp text element to the chart (to help when reviewing validation charts)

    if one2one:
        if len(x) < 3:
            print('Skipping regression because less than 3 data points')
            # raise Exception('Attempting linear regression with less than three data points.')
        else:
            m, c, r_value, _p_value, _std_err = stats.linregress(x, y)

            min_value = min(x)  # min(min(x), min(y))
            max_value = max(x)  # max(max(x), max(y))

            plt.plot([min_value, max_value], [m * min_value + c, m * max_value + c], 'blue', lw=1, label='regression m: {:.2f}, r2: {:.2f}'.format(m, r_value))

            plt.plot([min_value, max_value], [min_value, max_value], 'red', lw=1, label='1:1')

    plt.legend(loc='upper left')
    plt.tight_layout()

    if not os.path.isdir(os.path.dirname(file_path)):
        os.makedirs(os.path.dirname(file_path))

    plt.savefig(file_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('pghost', help='Postgres password', type=str)
    parser.add_argument('pgport', help='Postgres password', type=str)
    parser.add_argument('pgdb', help='Postgres password', type=str)
    parser.add_argument('pguser_name', help='Postgres user name', type=str)
    parser.add_argument('pgpassword', help='Postgres password', type=str)

    parser.add_argument('metric_csv', help='CSV containing historical metric calculations', type=str)
    parser.add_argument('--verbose', help='verbose logging', default=False)

    args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    output_folder = os.path.join(os.path.dirname(__file__), '../../docs/validation/metric_validation.md')

    log = Logger('DB Migration')
    log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_migration.log"), verbose=args.verbose)

    # Postgres connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)

    try:
        validate_metrics(pgcon.cursor(cursor_factory=psycopg2.extras.DictCursor), args.metric_csv, output_folder)

    except Exception as ex:
        log.error(str(ex))
        pgcon.rollback()


if __name__ == '__main__':
    main()
