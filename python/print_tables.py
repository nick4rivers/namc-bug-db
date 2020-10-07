# Script to parse countries from SQLServer and print to screen for inclusion in postgrees DB build
# Philip Bailey
# 7 Oct 2020

import os
import argparse
from rscommons import dotenv
import datetime
import pyodbc


def print_tables(mscon):

    cursor = mscon.cursor()
    # cursor.execute("SELECT ID, Country, CountryName FROM BugLab.dbo.GeoCountries")
    # for row in cursor.fetchall():
    #     print('INSERT INTO countries (country_id, country_name, abbreviation) VALUES ({}, \'{}\', \'{}\');'.format(row[0], row[2], row[1]))

    cursor.execute('SELECT ID, StateName, State FROM BugLab.dbo.GeoStates')
    for row in cursor.fetchall():
        print('INSERT INTO states (state_id, country_id, state_name, abbreviation) VALUES ({}, 231, \'{}\', \'{}\');'.format(row[0], row[1], row[2]))

    cursor.execute('SELECT County, StateID FROM BugLab.dbo.GeoCounties')
    county_id = 1
    for row in cursor.fetchall():
        print('INSERT INTO counties (county_id, state_id, county_name) VALUES ({}, {}, \'{}\');'.format(county_id, row[1], row[0]))
        county_id += 1


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument('msdb', help='SQLServer password', type=str)
    parser.add_argument('msuser_name', help='SQLServer user name', type=str)
    parser.add_argument('mspassword', help='SQLServer password', type=str)

    # args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))
    args = dotenv.parse_args_env(parser)

    # Microsoft SQL Server Connection
    # https://github.com/mkleehammer/pyodbc/wiki/Connecting-to-SQL-Server-from-Mac-OSX
    mscon = pyodbc.connect('DSN={};UID={};PWD={}'.format(args.msdb, args.msuser_name, args.mspassword))

    print_tables(mscon)


if __name__ == '__main__':
    main()
