import pytest


def test_rarefaction(cursor, rarefaction_data):

    # Get the first sample associated with the test organization
    sample_id = get_sample_id(cursor, 'test organization')

    # cursor.execute('select * from sample.fn_sample_taxa(%s)', [sample_id])
    # sample_rows = cursor.fetchall()
    # print(len(sample_rows))

    # cursor.execute('select * from sample.fn_rarified_taxa(%s, 2)', [sample_id])
    # rarify_rows = cursor.fetchall()
    # print(len(rarify_rows))

    # assert False
    # print('stop')


def get_sample_id(cursor, customer_name):

    cursor.execute("""SELECT s.sample_id
        FROM entity.organizations o
                inner join sample.boxes b on o.entity_id = b.customer_id
                inner join sample.samples s on b.box_id = s.box_id
        where o.organization_name ilike %s
        limit 1""", [customer_name])
    return cursor.fetchone()[0]


if __name__ == "__main__":
    pytest.main([__file__])
