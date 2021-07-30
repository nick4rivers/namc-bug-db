""" Generate otucode
"""
import os
import csv
import argparse
from lib.api import QueryMonster

QUERY_DIR = os.path.join(os.path.dirname(__file__), 'gql')


def create_otucode_ordeq(otu_name: str, csv_path: str):
    """[summary]

    Args:
        otu_name ([type]): [description]
        csv_path ([type]): [description]
    """

    api = QueryMonster()

    # Define your query here. Yeah this is not ideal but we're not using a GraphQL library in python
    # So it's just all a big, awkward string.
    # The good news is that you can copy and paste this string directly from insomnia

    # Now here's how you run the query
    q_path = os.path.join(QUERY_DIR, 'sampleMetrics.gql')
    result = api.run_query_file(q_path, {
        "projectIds": [1],
        "translationId": 3,
        "fixedCount": 300
    })

    nextOffset = 0
    page = 0
    projects = 0
    hucs = {}

    # Get all projects
    while nextOffset or page == 0:
        page += 1

        # Here is the API Search
        result = api.run_query_file(os.path.join(QUERY_DIR, 'taxonomy.gql'), {
            "limit": 500,
            "offset": nextOffset
        })

        if 'nextOffset' in result:
            nextOffset = result['nextOffset']
        else:
            nextOffset = 0

    # And here's how the data returned looks:
    print(len(result['data']['sampleMetrics']['records']))

    # Step 1 - Create the OTU parent record

    csv_data = csv.DictReader(open(csv_path))
    for row in csv_data:
        # parse the taxa
        print(row)


def main():
    """Do the thing
    """
    parser = argparse.ArgumentParser()
    parser.add_argument('otu_name', help='Name of the OTU to be generated', type=str)
    parser.add_argument('csv_path', help='CSV Path to OTU taxa', type=str)
    args = parser.parse_args()
    # args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    csv_path = os.path.join(os.path.dirname(__file__), args.csv_path)

    create_otucode_ordeq(args.otu_name, csv_path)


if __name__ == '__main__':
    main()
