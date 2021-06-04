import os
import pytest
import psycopg2
from psycopg2.extras import execute_values
import textwrap
import random


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

    cursor.execute('INSERT INTO sample.samples (box_id, site_id, type_id, method_id, habitat_id, field_split, lab_split) VALUES (%s, %s, 1, 1, 1, 1, 1) returning sample_id', [box_id, site_id])
    return cursor.fetchone()[0]


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

    cursor.execute('INSERT INTO sample.organisms (sample_id, taxonomy_id, life_stage_id, split_count) VALUES (%s, %s, 1, %s) returning organism_id', [sample_id, taxonomy_id, split_count])
    return cursor.fetchone()[0]


def insert_site(cursor, site_name, longitude, latitude):

    cursor.execute('INSERT INTO geo.sites (site_name, location) VALUES (%s, ST_MakePoint(%s, %s)) returning site_id', [site_name, longitude, latitude])
    return cursor.fetchone()[0]


@pytest.fixture
def rarefaction_data(cursor):

    cursor.execute('SELECT taxonomy_id from taxa.taxonomy')
    taxa = [row[0] for row in cursor.fetchall()]

    # Insert an entity, box and sample
    sample_id = insert_test_sample(cursor)

    for n in range(0, 10):
        taxonomy_id = random.choice(taxa)
        cursor.execute('insert into sample.organisms (sample_id, taxonomy_id, life_stage_id, split_count) values (%s, %s, 1, %s)', [sample_id, taxonomy_id, random.randint(1, 15)])


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
        insert_organism(cursor, sample_id,)


@pytest.fixture
def abundance(cursor):

    # insert 5 samples (with no sites)
    for i in range(1, 5):
        sample_id = insert_test_sample(cursor, 'test customer', None)
        # insert some organisms


def insert_organism(cursor, sample_id, taxonomy_id, split_count, life_stage_id, bug_size):
    cursor.execute('INSERT INTO sample.organisms (sample_id, taxonomy_id, split_count, life_stage_id, bug_size) VALUES (%s, %s, %s, %s, %s)', [sample_id, taxonomy_id, split_count, life_stage_id, bug_size])


def get_taxonomy_id(cursor, scientific_name):
    cursor.execute('SELECT taxonomy_id where scientific_name = %s', [scientific_name])
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
