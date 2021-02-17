import os
import csv
import json
import psycopg2
import argparse
from psycopg2.extras import execute_values
from rscommons import Logger, ProgressBar, dotenv
from utilities import sanitize_string, format_values, add_metadata, write_sql_file
from postgres_lookup_data import lookup_data, insert_row, log_row_count, insert_many_rows
from lookup_data import get_db_id

table_name = 'geo.site_predictors'

def migrate(pgcurs, csv_path):

    log = Logger(table_name)

    predictors = lookup_data(pgcurs, 'geo.predictors', 'abbreviation')
    sites = lookup_data(pgcurs, 'geo.sites', 'site_name')

    if len(sites) < 1:
        raise Exception('You need to migrate sites into the database first.')

    counter = 0
    # progbar = ProgressBar(len(list(raw_data)), 50, "predictor values")
    raw_data = csv.DictReader(open(csv_path))
    data = []
    for row in raw_data:

        if counter == 0:
            # Report presence/absence of predictor columns
            valid_predictors = 0
            for predictor in predictors.keys():
                if predictor in row:
                    valid_predictors +=1
                else:
                    log.warning("No column in CSV for predictor {}".format(predictor))

            print("{} valid predictor columns".format(valid_predictors))

        counter += 1
        site_name = row['station']
        if site_name not in sites:
            log.warning('Site {} not present in database. Skipping.'.format(site_name))
            continue
        site_id = get_db_id(sites, 'site_id', ['site_name'], site_name)

        for predictor in predictors:
            if predictor in row:
                value = row[predictor]
                if str(value).lower() != 'na':
                    print(value)
                    json_value = {'value': value}
                    try:
                        data.append((site_id, predictors[predictor]['predictor_id'], json.dumps(json_value)))
                    except Exception as ex:
                        print(ex)


    insert_many_rows(pgcurs, table_name, ['site_id', 'predictor_id', 'metadata'], data)


        # predictors[predictor] = insert_row(pgcurs, table_name, data, 'predictor_id')
 
  
         # progbar.update(counter)

 
    # progbar.finish()
    # log_row_count(pgcurs, table_name, len(predictors))


# def main():
#     parser = argparse.ArgumentParser()
#     parser.add_argument('pghost', help='Postgres password', type=str)
#     parser.add_argument('pgport', help='Postgres password', type=str)
#     parser.add_argument('pgdb', help='Postgres password', type=str)
#     parser.add_argument('pguser_name', help='Postgres user name', type=str)
#     parser.add_argument('pgpassword', help='Postgres password', type=str)
#     parser.add_argument('csv_path', help='Input translation indicator CSV', type=str)
#     parser.add_argument('--verbose', help='verbose logging', default=False)

#     args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

#     predictors = os.path.join(os.path.dirname(__file__), args.csv_path)
#     sql_path = os.path.join(os.path.dirname(__file__),'../docker/postgres/initdb/30_geo_site_predictors.sql')
  
#     log = Logger('Predictor Migration')
#     log.setup(logPath=os.path.join(os.path.dirname(__file__), "bugdb_predictors.log"), verbose=args.verbose)

#     # Postgres connection
#     pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)
#     pgcurs = pgcon.cursor(cursor_factory=psycopg2.extras.DictCursor)

#     try:
#         migrate(sql_path, predictors, pgcurs)
#         pgcon.rollback()

#     except Exception as ex:
#         log.error(str(ex))
#         pgcon.rollback()


# if __name__ == '__main__':
#     main()
