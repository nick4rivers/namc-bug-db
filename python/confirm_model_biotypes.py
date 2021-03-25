# Temporary script to verify biotype assignment for sites in Colorado
# Takes a CSV with historical biotype designation. Then intersects the
# latitude and longitude from these points with the new ShapeFile of
# model extent polygons. Reports if the biotype in the ShapeFile matches
# that of the historical CSV file.
import os
import argparse
import csv
from lib.dotenv import parse_args_env
from osgeo import ogr
from shapely.geometry import Point


def confirm_model_biotypes(shp_path, csv_path):

    # StationID = NAMC sampleid
    # Waterbody Name = sitecode
    # Lat-Dec = lat
    # Long_Dec = long
    # SiteClassification = biotype

    driver = ogr.GetDriverByName("ESRI Shapefile")
    data_source = driver.Open(shp_path, 0)
    layer = data_source.GetLayer()
    in_spatial_ref = layer.GetSpatialRef()

    input_file = csv.DictReader(open(csv_path, encoding="ISO-8859-1"))
    matches = 0
    misses = []
    for result in input_file:
        station = result['WaterbodyName']
        biotype = result['SiteClassification']
        lat = result['Lat_Dec']
        lng = result['Long_Dec']

        try:
            point = ogr.CreateGeometryFromWkt(Point(float(lng), float(lat)).wkt)
            layer.SetSpatialFilter(point)

            for feature in layer:

                shp_biotype = feature.GetField(feature.GetFieldIndex("Model"))
                if shp_biotype is None:
                    print('Missing biotype')
                else:
                    if (shp_biotype.startswith('CO-')):
                        if biotype[-1] == shp_biotype[-1]:
                            matches += 1
                        else:
                            print('Site {} has biotype {} and ShapeFile has biotype {}'.format(station, biotype, shp_biotype))
        except:
            print('Error processing {}'.format(station))

    print('{} matches'.format(matches))


def main():
    parser = argparse.ArgumentParser()
    # parser.add_argument('msdb', help='SQLServer password', type=str)
    # parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    # parser.add_argument('mspassword', help='SQLServer password', type=str)

    # parser.add_argument('pghost', help='Postgres password', type=str)
    # parser.add_argument('pgport', help='Postgres password', type=str)
    # parser.add_argument('pgdb', help='Postgres password', type=str)
    # parser.add_argument('pguser_name', help='Postgres user name', type=str)
    # parser.add_argument('pgpassword', help='Postgres password', type=str)

    parser.add_argument('shp_path', help='Model polygons Shapefile', type=str)
    parser.add_argument('csv_path', help='Model Results CSV with biotype designation', type=str)
    parser.add_argument('--verbose', help='verbose logging', default=False)

    args = parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    # catchments_json = os.path.join(os.path.dirname(__file__), args.metric_values)

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    # mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    # Postgres connection
    # pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)
    # pgcurs = pgcon.cursor()

    try:
        confirm_model_biotypes(args.shp_path, args.csv_path)
    # pgcon.commit()
    except Exception as ex:
        # pgcon.rollback()
        print(ex)


if __name__ == '__main__':
    main()
