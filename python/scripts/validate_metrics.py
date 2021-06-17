import os
import csv
import argparse
import psycopg2
import matplotlib.pyplot as plt
from scipy import stats
from psycopg2.extras import execute_values
from lib.dotenv import parse_args_env
from lib.logger import Logger

# database metric ID keyed to CSV column header
metric_ids = {
    21: 'Abundance'
}


def validate_metrics(pgcurs, metric_csv, output):

    csv_metrics = csv.DictReader(open(metric_csv))

    data = {}
    for csv_row in csv_metrics:

        sample_id = csv_row['SampleID']
        data[sample_id] = {'original': None, 'postgres': None}

        for metric_id, csv_column in metric_ids.items():
            data[sample_id]['original'] = float(csv_row[csv_column])

        # Check Sample Exists in database
        pgcurs.execute('SELECT * FROM sample.samples WHERE sample_id = %s', [sample_id])
        sample = pgcurs.fetchone()
        if sample is None:
            continue

        pgcurs.execute('SELECT * FROM metric.sample_metrics(%s, 1,1)', [sample_id])
        db_metrics = pgcurs.fetchall()

        for metric_id, csv_column in metric_ids.items():
            for row in db_metrics:
                if row['metric_id'] == metric_id:
                    data[sample_id]['postgres'] = float(row['metric_value'])

        # if len(data) >= 10:
        #     break

    for metric_id, csv_column in metric_ids.items():

        values = []
        for sample_id, sample_values in data.items():
            if sample_values['original'] is not None and sample_values['postgres'] is not None:
                values.append((sample_values['original'], sample_values['postgres']))

        img_path = os.path.join(os.path.dirname(output), '../assets/images/validation/{}_{}.png'.format(metric_id, csv_column))
        xyscatter(values, 'NAMC Legacy Values', 'Postgres', metric_id, img_path, True)


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
            raise Exception('Attempting linear regression with less than three data points.')

        m, c, r_value, p_value, std_err = stats.linregress(x, y)

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
