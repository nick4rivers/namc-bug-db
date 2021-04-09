import os
import pytest
import psycopg2
from psycopg2.extras import execute_values
import textwrap


@pytest.fixture(scope='module')
def cnxn():

    cnxn = psycopg2.connect(
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        host=os.getenv('POSTGRES_HOST'),
        port=os.getenv('POSTGRES_PORT'),
        database=os.getenv('POSTGRES_DB'))
    yield cnxn
    cnxn.close()


@pytest.fixture
def cursor(cnxn):
    cursor = cnxn.cursor()
    yield cursor
    cnxn.rollback()


# @pytest.fixture
# def birch_bookshelf_project(cursor):
#     stmt = textwrap.dedent('''
#     INSERT INTO projects(name, description)
#     VALUES ('bookshelf', 'Building a bookshelf from birch plywood')
#     RETURNING id
#     ''')
#     cursor.execute(stmt)
#     project_id = cursor.fetchone()[0]
#     stmt = textwrap.dedent('''
#     INSERT INTO project_supplies(project_id, name, quantity, unit_cost)
#     VALUES ({project_id}, 'Birch Plywood', 3, 48.50),
#            ({project_id}, 'Wood Glue', 1, 5.99),
#            ({project_id}, 'Screws', 2, 8.97),
#            ({project_id}, 'Stain', 1, 30.99)
#     ''')
#     cursor.execute(stmt.format(project_id=project_id))
#     yield project_id


# @pytest.fixture
# def raised_garden_bed_project(cursor):
#     stmt = textwrap.dedent('''
#     INSERT INTO projects(name, description)
#     VALUES ('bookshelf', 'Assemble a raised garden bed')
#     RETURNING id
#     ''')
#     cursor.execute(stmt)
#     project_id = cursor.fetchone()[0]
#     stmt = textwrap.dedent('''
#     INSERT INTO project_supplies(project_id, name, quantity, unit_cost)
#     VALUES ({project_id}, '4x4', 3, 3.75),
#            ({project_id}, '2x8', 8, 4.50),
#            ({project_id}, '2x4', 8, 2.50),
#            ({project_id}, 'Screws', 2, 8.97)
#     ''')
#     cursor.execute(stmt.format(project_id=project_id))
#     yield project_id
