from test_helper_functions import get_taxa_by_name
import pytest
from test_helper_functions import get_samples_by_customer_name


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

    samples = get_samples_by_customer_name(cursor, 'test customer')
    sample_id = samples[0]

    cursor.callproc('metric.fn_sample_abundance', [sample_id])
    # cursor.execute('SELECT metric.fn_sample_abundance(%s)', [sample_id])
    sa = cursor.fetchone()
    assert sa[0] == 20


def test_taxa_abundance(cursor, taxonomic_hierarchy, abundance):

    samples = get_samples_by_customer_name(cursor, 'test customer')
    sample_id = samples[0]

    # Abundance at the Phylum should be all organisms for the sample
    phyluma = get_taxa_by_name(cursor, 'Test Phylum A')
    cursor.execute('SELECT * FROM metric.fn_taxa_abundance(%s, %s)', [sample_id, phyluma])
    phyluma_abundance = cursor.fetchone()[0]
    assert phyluma_abundance == 20

    # Abundance at the class under the phylum should just be the class
    classaa = get_taxa_by_name(cursor, 'Test Class AA')
    cursor.execute('SELECT metric.fn_taxa_abundance(%s, %s)', [sample_id, classaa])
    classaa_abundance = cursor.fetchone()[0]
    assert classaa_abundance == 10


if __name__ == "__main__":

    pytest.main(['test/test_abundance.py::test_taxa_abundance'])
