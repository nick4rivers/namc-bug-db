import pytest


def test_set_taxonomy(cursor):

    cursor.execute('INSERT INTO taxa.taxonomy (scientific_name, level_id) VALUES (%s, %s) returning taxonomy_id', ['test parent 1', 1])
    parent1_id = cursor.fetchone()[0]

    cursor.execute('INSERT INTO taxa.taxonomy (scientific_name, level_id) VALUES (%s, %s) returning taxonomy_id', ['test parent 2', 1])
    parent2_id = cursor.fetchone()[0]

    taxonomy_name = 'test child'
    cursor.execute('INSERT INTO taxa.taxonomy (scientific_name, level_id, parent_id) VALUES (%s, %s) returning taxonomy_id', [taxonomy_name, 1, parent1_id])
    taxonomy_id = cursor.fetchone()[0]

    new_name = 'new_name'
    new_level = 2
    cursor.callproc('taxa.fn_set_taxonomy', [taxonomy_id, new_name, new_level, parent2_id, None, None, None, None])

    cursor.execute('select * from taxa.taxonomy where taxonomy_id = %s', [taxonomy_id])
    row = cursor.fetchone()
    assert row['scientific_name'] == new_name
    assert row['level_id'] == new_level
    assert row['parent_id'] == parent2_id

    # Test that the name cannot be empty
    with pytest.raises(Exception):
        cursor.callproc('taxa.fn_set_taxonomy', [taxonomy_id, '', new_level, parent2_id, None, None, None, None])

    # Test that taxa cannot be its own parent!
    with pytest.raises(Exception):
        cursor.callproc('taxa.fn_set_taxonomy', [taxonomy_id, taxonomy_name, new_level, taxonomy_id, None, None, None, None])
