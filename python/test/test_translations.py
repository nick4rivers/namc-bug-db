import pytest


def test_translations(cursor, translation_data):

    # Get the first sample associated with the test organization
    sample_id = get_sample_id(cursor, 'test organization')

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


def print_organisms(label, rows):

    print('-- {} --'.format(label))
    if rows is not None:
        [print('{} ({}) at level {} has count {}'.format(
            row['scientific_name'], row['taxonomy_id'], row['level_name'], row['organism_count'])) for row in rows]


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
