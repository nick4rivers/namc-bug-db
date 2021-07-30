import os
import csv
import argparse
from lib.api import QueryMonster


def create_otucode_ordeq(otu_name, csv_path):

    api = QueryMonster()

    # Define your query here. Yeah this is not ideal but we're not using a GraphQL library in python
    # So it's just all a big, awkward string.
    # The good news is that you can copy and paste this string directly from insomnia
    q = """
        query sampleMetrics($projectIds: [Int], $translationId: Int!, $fixedCount: Int!) {
            sampleMetrics(projectIds: $projectIds, translationId: $translationId, fixedCount: $fixedCount) {
                records {
                    sampleId
                    groupId
                    groupName
                    metricId
                    metricName
                    metricValue
                }
            }
        }
    """
    # Now here's how you run the query
    result = api.run_query(q, {
        "projectIds": [1],
        "translationId": 3,
        "fixedCount": 300
    })

    # And here's how the data returned looks:
    print(len(result['data']['sampleMetrics']['records']))

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
