import pytest


def test_abundance_core_calc(cursor):

    # arguments are split_count, big_rare_count, labl_split, field_split, area_sampled

    # Most common example are lab split = 1, field split 1, area = 1
    cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [100, 1, 1, 1, 1])
    assert cursor.fetchone()[0] == 101

    # No split counts no big rare
    cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [0, 0, 1, 1, 1])
    assert cursor.fetchone()[0] == 0

    # lab split mid point
    cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [100, 10, 0.5, 1, 1])
    assert cursor.fetchone()[0] == 210

    # field split mid point
    cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [100, 10, 1, 0.5, 1])
    assert cursor.fetchone()[0] == 220

    # Floating point area
    cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [100, 10, 1, 1, 0.5])
    assert cursor.fetchone()[0] == 220

    # Zero lab split
    # cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [100, 10, 0, 1, 1])
    # assert cursor.fetchone()[0] == 10

    # Zero field split
    # cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [100, 10, 1, 0, 1])
    # assert cursor.fetchone()[0] == 0

    # Zero area
    # cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [100, 10, 1, 1, 0])
    # assert cursor.fetchone()[0] == 0

    # Zero big rare
    cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [100, 0, 1, 1, 1])
    assert cursor.fetchone()[0] == 100

    # Test all the nulls
    cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [None, 0, 1, 1, 1])
    assert True if cursor.fetchone()[0] is None else False

    cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [100, None, 1, 1, 1])
    assert True if cursor.fetchone()[0] is None else False

    cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [100, 10, None, 1, 1])
    assert True if cursor.fetchone()[0] is None else False

    cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [100, 0, 1, None, 1])
    assert True if cursor.fetchone()[0] is None else False

    cursor.execute('select metric.fn_abundance(%s, %s, %s, %s, %s);', [100, 10, 1, 1, None])
    assert True if cursor.fetchone()[0] is None else False


def test_sample_abundance(cursor, taxonomic_hierarchy, abundance):


if __name__ == "__main__":

    pytest.main(['test/test_abundance.py::test_abundance_core_calc'])
