import pytest


def test_translations(cursor, translation_data):

    # Get the first sample associated with the test organization
    sample_id = get_sample_id(cursor, 'test organization')

    # Get the test translation
    cursor.execute("SELECT translation_id from taxa.translations where translation_name ilike 'unit test translation'")
    translation_id = cursor.fetchone()[0]

    cursor.execute("SELECT * FROM sample.fn_sample_taxa(%s)", [sample_id])
    rows = cursor.fetchall()

    for row in rows:
        cursor.execute("SELECT * FROM taxa.fn_translation_taxa(%s, %s)", [translation_id, row[0]])
        trans = cursor.fetchone()
        if trans is not None:
            print("{} '{}' translates to {} '{}'".format(row[2], row[3], trans[3], trans[1]))

    assert False


def get_sample_id(cursor, customer_name):

    cursor.execute("""SELECT s.sample_id
        FROM entity.organizations o
                inner join sample.boxes b on o.entity_id = b.customer_id
                inner join sample.samples s on b.box_id = s.box_id
        where o.organization_name ilike %s
        limit 1""", [customer_name])
    return cursor.fetchone()[0]


if __name__ == "__main__":
    pytest.main(['test/test_translations.py::test_translations'])
