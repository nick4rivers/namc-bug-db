import os
import csv
import argparse
from lib.api import QueryMonster


def create_otucode_ordeq(otu_name, csv_path):

    api = QueryMonster()
    api.auth_query()

    # Step 1 - Create the OTU parent record

    csv_data = csv.DictReader(open(csv_path))
    for row in csv_data:
        # parse the taxa
        print(row)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('otu_name', help='Name of the OTU to be generated', type=str)
    parser.add_argument('csv_path', help='CSV Path to OTU taxa', type=str)
    args = parser.parse_args()
    # args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    csv_path = os.path.join(os.path.dirname(__file__), args.csv_path)

    create_otucode_ordeq(args.otu_name, csv_path)


if __name__ == '__main__':
    main()
