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


if __name__ == "__main__":
    pytest.main([__file__])
