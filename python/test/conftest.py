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


@pytest.fixture
def translation_data(cursor):

    # Insert a customer box and sample
    cursor.execute("INSERT INTO entity.entities (country_id) VALUES (231) returning entity_id")
    entity_id = cursor.fetchone()[0]

    cursor.execute("INSERT INTO entity.organizations (entity_id, organization_name, organization_type_id) VALUES (%s, 'test organization', 1)", [entity_id])
    cursor.execute("INSERT INTO entity.individuals (entity_id, first_name, last_name) VALUES (%s, 'test first', 'test last')", [entity_id])

    cursor.execute('INSERT INTO sample.boxes (customer_id, submitter_id, box_state_id) VALUES (%s, %s, 1) returning box_id', [entity_id, entity_id])
    box_id = cursor.fetchone()[0]

    cursor.execute('INSERT INTO sample.samples (box_id, type_id, method_id, habitat_id) VALUES (%s, 1, 1, 1) returning sample_id', [box_id])
    sample_id = cursor.fetchone()[0]

    kid = insert_taxa(cursor, 'Anamilia A', 'Kingdom', None)

    # Taxonomic hierarchy with two taxa at each level and one sample organism for each taxa
    for p in ['A', 'B']:
        pid = insert_taxa(cursor, 'Phylum {}'.format(p), 'Phylum', kid)
        for c in ['A', 'B']:
            cid = insert_taxa(cursor, 'Class {}{}'.format(p, c), 'Class', pid)
            insert_organism(cursor, sample_id, cid, 1)
            for o in ['A', 'B']:
                oid = insert_taxa(cursor, 'Order {}{}{}'.format(p, c, o), 'Order', cid)
                insert_organism(cursor, sample_id, oid, 1)

    # Test translation
    cursor.execute("INSERT INTO taxa.translations (translation_name) VALUES ('unit test translation') returning translation_id")
    translation_id = cursor.fetchone()[0]

    # Translation has one entry at ClassAA
    insert_taxa_translation(cursor, translation_id, 'Class AA', 'Test At AA')
    insert_taxa_translation(cursor, translation_id, 'Phylum B', 'cool phylum')

    # Need to refresh the taxonomic materialized view!
    cursor.execute('REFRESH MATERIALIZED VIEW taxa.vw_taxonomy_crosstab;')


def insert_taxa(cursor, scientific_name, level, parent_id):

    cursor.execute("SELECT level_id FROM taxa.taxa_levels WHERE level_name ilike %s", [level])
    level_id = cursor.fetchone()[0]

    # parent_id = None
    # if parent is not None:
    #     cursor.execute("SELECT taxa_id FROM taxa.taxonomy WHERE scientific_name ilike %s", [parent])

    cursor.execute('INSERT INTO taxa.taxonomy (scientific_name, level_id, parent_id) VALUES (%s, %s, %s) returning taxonomy_id', [scientific_name, level_id, parent_id])
    return cursor.fetchone()[0]


def insert_taxa_translation(cursor, translation_id, original_taxa_name, replacement_taxa_name):

    cursor.execute("SELECT taxonomy_id FROM taxa.taxonomy WHERE scientific_name ilike %s", [original_taxa_name])
    taxonomy_id = cursor.fetchone()[0]

    cursor.execute("INSERT INTO taxa.taxa_translations (translation_id, taxonomy_id, translation_taxonomy_name) VALUES (%s, %s, %s) returning translation_taxonomy_id", [translation_id, taxonomy_id, replacement_taxa_name])
    return cursor.fetchone()[0]


def insert_organism(cursor, sample_id, taxonomy_id, split_count):

    cursor.execute('INSERT INTO sample.organisms (sample_id, taxonomy_id, life_stage_id) VALUES (%s, %s, 1) returning organism_id', [sample_id, taxonomy_id])
    return cursor.fetchone()[0]

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
