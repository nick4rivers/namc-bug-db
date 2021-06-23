import pytest
from test.helper_functions import get_samples_by_customer_name
from test.helper_functions import print_organisms


def test_translations(cursor, translation_data):

    # Get the first sample associated with the test organization
    sample_id = get_samples_by_customer_name(cursor, 'test organization')

    # Get the test translation
    cursor.execute("SELECT translation_id from taxa.translations where translation_name ilike 'unit test translation'")
    translation_id = cursor.fetchone()[0]

    cursor.execute("SELECT * FROM sample.fn_sample_taxa(%s)", [sample_id])
    orig_rows = cursor.fetchall()
    print_organisms('original taxa', orig_rows)

    cursor.execute('SELECT * FROM sample.fn_sample_translation_taxa(%s, %s)', [sample_id, translation_id])
    trans_rows = cursor.fetchall()
    print_organisms('translation taxa', trans_rows)

    print('-- Translation taxa mapping --')
    for row in orig_rows:
        cursor.execute("SELECT * FROM taxa.fn_translation_taxa(%s, %s)", [translation_id, row['taxonomy_id']])
        trans = cursor.fetchone()
        if trans is not None:
            print("{} '{}' translates to {} '{}'".format(row['level_name'], row['scientific_name'], trans[4], trans[2]))

    assert False


def test_create_translation(cursor):

    translation_name = 'test translation'
    translation_description = 'test description'

    cursor.execute('SELECT taxa.fn_create_translation(%s, %s)', [translation_name, translation_description])
    translation_id = cursor.fetchone()[0]
    assert translation_id > 0

    cursor.execute('select * from taxa.fn_translations(100, 0)')
    translations = {row['translation_id']: row['translation_name'] for row in cursor.fetchall()}
    assert translations[translation_id] == translation_name

    # Attempt to insert a second translation with the same name
    try:
        cursor.execute('SELECT translation_id from taxa.fn_create_translation(%s, %s)', [translation_name, translation_description])
        assert False
    except Exception as ex:
        assert True

    # Attempt to insert translation with empty string
    try:
        cursor.execute('SELECT translation_id from taxa.fn_create_translation(%s, %s)', ['', translation_description])
        assert False
    except Exception as ex:
        assert True


def test_set_translation_taxa(cursor):

    # Create temporary taxa
    taxonomy_name = 'test taxa'
    cursor.execute('INSERT INTO taxa.taxonomy (scientific_name, level_id) VALUES (%s, %s) returning taxonomy_id', [taxonomy_name, 1])
    taxonomy_id = cursor.fetchone()[0]

    cursor.execute('SELECT taxa.fn_create_translation(%s, NULL)', ['test translation'])
    translation_id = cursor.fetchone()[0]

    # Add taxa 1 to translation, with no name
    cursor.execute('SELECT taxa.fn_set_translation_taxa(%s, %s, NULL, True)', [translation_id, taxonomy_id])
    assert cursor.fetchone()[0] == 1

    # Retrieve the taxa
    taxa = load_translation_taxa(cursor, translation_id)
    assert taxa[taxonomy_id] == taxonomy_name

    # Attempt to add the same taxa again but with different name
    alias = 'test alias'
    cursor.execute('SELECT taxa.fn_set_translation_taxa(%s, %s, %s, %s)', [translation_id, taxonomy_id, alias, True])
    taxa = load_translation_taxa(cursor, translation_id)
    assert taxa[taxonomy_id] == alias

    # Attempt to set the alias to empty string. Should set it to NULL, which results in taxonomy name being returned
    cursor.execute('SELECT taxa.fn_set_translation_taxa(%s, %s, %s, True)', [translation_id, taxonomy_id, ''])
    taxa = load_translation_taxa(cursor, translation_id)
    assert taxa[taxonomy_id] == taxonomy_name


def test_delete_translation_data(cursor):

    taxonomy_name = 'test taxa'
    cursor.execute('INSERT INTO taxa.taxonomy (scientific_name, level_id) VALUES (%s, %s) returning taxonomy_id', [taxonomy_name, 1])
    taxonomy_id = cursor.fetchone()[0]

    cursor.execute('SELECT taxa.fn_create_translation(%s, NULL)', ['test translation'])
    translation_id = cursor.fetchone()[0]

    # Add taxa 1 to translation, with no name
    cursor.execute('SELECT taxa.fn_set_translation_taxa(%s, %s, NULL, True)', [translation_id, taxonomy_id])

    cursor.callproc('taxa.fn_delete_translation_taxa', [translation_id, taxonomy_id])
    assert cursor.fetchone()[0] == 1


def load_translation_taxa(cursor, translation_id):

    cursor.execute('SELECT * FROM taxa.fn_translation_taxa(1000, 0, %s)', [translation_id])
    return {row['taxonomy_id']: row['translation_scientific_name'] for row in cursor.fetchall()}
