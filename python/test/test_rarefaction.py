import pytest


def test_rarefaction(cursor, rarefaction_data):
    """This test currently works on the translated rarefaction because 
    this query does not used UUIDs and is the method used by metrics.

    Args:
        cursor ([type]): [description]
        rarefaction_data ([type]): [description]
    """

    # Get the first sample associated with the test organization
    sample_id = get_sample_id(cursor, 'test organization')

    fixed_count = 300
    cursor.execute('select * from sample.fn_translation_rarefied_taxa(%s, 3, %s)', [sample_id, fixed_count])
    abundance = 0
    for row in cursor.fetchall():
        abundance += row['abundance']
    assert abundance == fixed_count


def get_sample_id(cursor, customer_name):

    cursor.execute("""SELECT s.sample_id
        FROM entity.organizations o
                inner join sample.boxes b on o.entity_id = b.customer_id
                inner join sample.samples s on b.box_id = s.box_id
        where o.organization_name ilike %s
        limit 1""", [customer_name])
    return cursor.fetchone()[0]
