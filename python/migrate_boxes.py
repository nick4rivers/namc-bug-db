import psycopg2
import getpass
import datetime
from psycopg2.extras import execute_values
import pyodbc
from rscommons import Logger, ProgressBar


class box_migrator():

    def __init__(self, mscon):
        self.origin_table = 'BoxTracking'
        self.target_table = 'boxes'

        mscurs = mscon.cursor()
        mscurs.execute('SELECT Count(*) FROM BoxTracking')
        self.origin_rows = next(mscurs.fetchone())

        cols = {
            'BoxId': 'box_id',
            'CustId': ('customers', 'CustId'),
            'DateIn': 'date_in',
            'DateOut': 'date_out',
            'ReportOut': 'report_out',
            'SortTime': 'sort_time',
            'IdTime': 'id_time',
            'Overhead': 'overhead',
            'TotalTime': 'total_time',
            'POrder': 'porder',
            'ICost': 'icost',
            'TCost': 'tcost',
            'Notes': 'notes',
            'CustID_Billing': ('customers', 'CustId')

        }

        print('box')

    def migrate(self, mscon, pgcon, lookup):

        log = Logger('B')

        mscurs = mscon.cursor()
        mscurs.execute('SELECT * FROM BoxTracking')
        original_rows = next(mscurs.fetchone())
