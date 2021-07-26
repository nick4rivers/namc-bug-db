# pylint: disable=redefined-outer-name
import os
import random
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import pytest

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))


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
    cursor = cnxn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    yield cursor
    cnxn.rollback()


@pytest.fixture
def taxonomic_hierarchy(cursor):

    # insert top level taxa
    kid = insert_taxa(cursor, 'Animalia A', 'Kingdom', None)

    # Taxonomic hierarchy with two taxa at each level and one sample organism for each taxa
    for p in ['A', 'B']:
        pid = insert_taxa(cursor, 'Test Phylum {}'.format(p), 'Phylum', kid)
        for c in ['A', 'B']:
            cid = insert_taxa(cursor, 'Test Class {}{}'.format(p, c), 'Class', pid)
            for o in ['A', 'B']:
                oid = insert_taxa(cursor, 'Test Order {}{}{}'.format(p, c, o), 'Order', cid)
                for f in ['A', 'B']:
                    fid = insert_taxa(cursor, 'Test Family {}{}{}{}'.format(p, c, o, f), 'Family', oid)
                    for g in ['A', 'B']:
                        gid = insert_taxa(cursor, 'Test Genus {}{}{}{}{}'.format(p, c, o, f, g), 'Species', fid)
                        for s in ['A', 'B']:
                            insert_taxa(cursor, 'Test Species {}{}{}{}{}{}'.format(p, c, o, f, g, s), 'Species', gid)


@pytest.fixture
def taxonomic_attributes(cursor):

    ta1 = insert_attribute(cursor, 'Test Attribute 1')
    ta2 = insert_attribute(cursor, 'Test Attribute 2')

    # associate test attribute 1 with all taxa that end with A
    # associate test attribute 2 with all taxa that end with B
    for attribute_id, pattern in {ta1: '%A', ta2: '%B'}.items():
        cursor.execute("""INSERT INTO taxa.taxa_attributes (taxonomy_id, attribute_id, attribute_value)
                    SELECT taxonomy_id, %s, '1'
                    FROM taxa.taxonomy WHERE scientific_name like (%s)""", [attribute_id, pattern])


@pytest.fixture
def translation_data(cursor):

    # Insert an entity, box and sample
    sample_id = insert_test_sample(cursor)

    # insert top level taxa
    kid = insert_taxa(cursor, 'Animalia A', 'Kingdom', None)

    # Taxonomic hierarchy with two taxa at each level and one sample organism for each taxa
    for p in ['A', 'B']:
        pid = insert_taxa(cursor, 'Phylum {}'.format(p), 'Phylum', kid)
        for c in ['A', 'B']:
            cid = insert_taxa(cursor, 'Class {}{}'.format(p, c), 'Class', pid)
            insert_organism(cursor, sample_id, cid, 1)
            for o in ['A', 'B']:
                oid = insert_taxa(cursor, 'Order {}{}{}'.format(p, c, o), 'Order', cid)
                insert_organism(cursor, sample_id, oid, 1)

    # Need to refresh the taxonomic materialized view after inserting new taxa
    cursor.execute('REFRESH MATERIALIZED VIEW taxa.vw_taxonomy_crosstab;')

    # Test translation
    cursor.execute("INSERT INTO taxa.translations (translation_name) VALUES ('unit test translation') returning translation_id")
    translation_id = cursor.fetchone()[0]

    # Translation has one entry at ClassAA and one at Phylum B
    insert_taxa_translation(cursor, translation_id, 'Class AA', 'test at AA')
    insert_taxa_translation(cursor, translation_id, 'Phylum B', 'test phylum')


def insert_test_sample(cursor, customer_name='test organization', site_id=None):

    # Insert a customer box and sample
    cursor.execute("INSERT INTO entity.entities (country_id) VALUES (231) returning entity_id")
    entity_id = cursor.fetchone()[0]

    cursor.execute("INSERT INTO entity.organizations (entity_id, organization_name, organization_type_id) VALUES (%s, %s, 1)", [entity_id, customer_name])
    cursor.execute("INSERT INTO entity.individuals (entity_id, first_name, last_name) VALUES (%s, 'test first', 'test last')", [entity_id])

    cursor.execute('INSERT INTO sample.boxes (customer_id, submitter_id, box_state_id) VALUES (%s, %s, 1) returning box_id', [entity_id, entity_id])
    box_id = cursor.fetchone()[0]

    cursor.execute('INSERT INTO sample.samples (box_id, site_id, type_id, method_id, habitat_id, field_split, lab_split, area) VALUES (%s, %s, 1, 1, 1, 1, 1, 1) returning sample_id', [box_id, site_id])
    return cursor.fetchone()[0]


def insert_taxa(cursor, scientific_name, level, parent_id):

    cursor.execute("SELECT level_id FROM taxa.taxa_levels WHERE level_name ilike %s", [level])
    level_id = cursor.fetchone()[0]

    # parent_id = None
    # if parent is not None:
    #     cursor.execute("SELECT taxa_id FROM taxa.taxonomy WHERE scientific_name ilike %s", [parent])

    cursor.execute('INSERT INTO taxa.taxonomy (scientific_name, level_id, parent_id) VALUES (%s, %s, %s) returning taxonomy_id', [scientific_name, level_id, parent_id])
    return cursor.fetchone()[0]


def insert_attribute(cursor, attribute_name):

    cursor.execute("INSERT INTO taxa.attributes (attribute_name, attribute_type) VALUES (%s, 'Float') returning attribute_id", [attribute_name])
    return cursor.fetchone()[0]


def insert_taxa_translation(cursor, translation_id, original_taxa_name, replacement_taxa_name):

    cursor.execute("SELECT taxonomy_id FROM taxa.taxonomy WHERE scientific_name ilike %s", [original_taxa_name])
    taxonomy_id = cursor.fetchone()[0]

    cursor.execute("INSERT INTO taxa.translation_taxa (translation_id, taxonomy_id, alias) VALUES (%s, %s, %s)", [translation_id, taxonomy_id, replacement_taxa_name])
    return taxonomy_id


def insert_organism(cursor, sample_id, taxonomy_id, split_count):

    cursor.execute('INSERT INTO sample.organisms (sample_id, taxonomy_id, life_stage_id, split_count, big_rare_count) VALUES (%s, %s, 1, %s, 0) returning organism_id', [sample_id, taxonomy_id, split_count])
    return cursor.fetchone()[0]


def insert_site(cursor, site_name, longitude, latitude):

    cursor.execute('INSERT INTO geo.sites (site_name, location) VALUES (%s, ST_MakePoint(%s, %s)) returning site_id', [site_name, longitude, latitude])
    return cursor.fetchone()[0]


@pytest.fixture
def rarefaction_data(cursor):

    cursor.execute('SELECT taxonomy_id from taxa.taxonomy limit 10')
    taxa = [row[0] for row in cursor.fetchall()]

    cursor.execute('SELECT life_stage_id from taxa.life_stages limit 1')
    life_stage_id = cursor.fetchone()[0]

    # Insert an entity, box and sample
    sample_id = insert_test_sample(cursor)

    # insert 10 records, each with 1000 bugs
    for taxonomy_id in taxa:
        cursor.execute('insert into sample.organisms (sample_id, taxonomy_id, life_stage_id, split_count, big_rare_count) values (%s, %s, %s, 1000, 0)', [sample_id, taxonomy_id, life_stage_id])


def get_test_taxa(cursor, level, limit):

    cursor.execute("""SELECT taxonomy_id, scientific_name FROM taxa.taxonomy t inner join taxa.taxa_levels l on t.level_id = l.level_id
    WHERE (level_name ilike %s)
        AND (scientific_name ilike 'Test%%')
    ORDER BY scientific_name
    LIMIT  %s
    """, [level, limit])
    return {row['taxonomy_id']: row['scientific_name'] for row in cursor.fetchall()}


@pytest.fixture
def pacific_taxa(cursor):
    """Inserts two samples into the Pacific Ocean near -150, 30
    Add more tuples to first loop to get more samples
    """

    # Insert the test taxonomic hierarchy
    # taxonomic_hierarchy(cursor)

    taxa = get_test_taxa(cursor, 'Species', 5)

    for location in [(-150, 30), (-151, 31)]:
        site_id = insert_site(cursor, 'site {0}, {1}'.format(location[0], location[1]), location[0], location[1])
        sample_id = insert_test_sample(cursor, 'customer for sample at {}'.format(site_id), site_id)
        for taxonomy_id, scientific_name in taxa.items():
            insert_organism(cursor, sample_id, taxonomy_id, 1)


@pytest.fixture
def project_data(cursor):

    x, y = -115, 20
    site_id = insert_site(cursor, 'site {0}, {1}'.format(x, y), x, y)

    cursor.execute("INSERT INTO sample.projects (project_name) VALUES ('test project') returning project_id")
    project_id = cursor.fetchone()[0]

    for i in range(1, 5):
        sample_id = insert_test_sample(cursor, 'customer for sample at {}'.format(site_id), site_id)
        cursor.execute("INSERT INTO sample.project_samples (project_id, sample_id) VALUES (%s, %s)", [project_id, sample_id])
        # insert_organism_by_ (cursor, sample_id,)


@pytest.fixture
def abundance(cursor):

    # insert 5 samples (with no sites)
    for i in range(1, 5):
        sample_id = insert_test_sample(cursor, 'test customer', None)
        # insert some organisms

        insert_organism_by_name(cursor, sample_id, 'Test Phylum A', 10, 0)
        insert_organism_by_name(cursor, sample_id, 'Test Class AA', 10, 0)
        insert_organism_by_name(cursor, sample_id, 'Test Class AA', 30, 0)
        insert_organism_by_name(cursor, sample_id, 'Test Order AAA', 1, 0)
        insert_organism_by_name(cursor, sample_id, 'Test Order ABA', 1, 0)
        insert_organism_by_name(cursor, sample_id, 'Test Order BBA', 1, 0)
        insert_organism_by_name(cursor, sample_id, 'Test Order BBB', 1, 0)

    # Insert a sample with no organisms
    insert_test_sample(cursor, 'customer with sample containing no organisms', None)


def insert_organism_by_name(cursor, sample_id, scientific_name, split_count, big_rare_count):

    # any old life stage
    cursor.execute('SELECT life_stage_id FROM taxa.life_stages LIMIT 1')
    life_stage_id = cursor.fetchone()[0]

    cursor.execute('SELECT taxonomy_id from taxa.taxonomy where scientific_name ilike (%s)', [scientific_name])
    taxonomy_id = cursor.fetchone()[0]

    cursor.execute('INSERT INTO sample.organisms (sample_id, taxonomy_id, split_count, big_rare_count, life_stage_id) VALUES (%s, %s, %s, %s, %s)', [sample_id, taxonomy_id, split_count, big_rare_count, life_stage_id])


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
