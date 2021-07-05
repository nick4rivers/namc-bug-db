import pytest
from test.helper_functions import get_attribute_by_name
from test.helper_functions import get_taxa_by_name
from test.helper_functions import get_samples_by_customer_name


def test_abundance_core_calc(cursor):

    # arguments are split_count, lab_split, field_split, area_sampled

    # Most common example are lab split = 1, field split 1, area = 1
    cursor.execute('select metric.fn_calc_abundance(%s, %s, %s, %s);', [100, 1, 1, 1])
    assert cursor.fetchone()[0] == 100

    # No split counts no big rare
    cursor.execute('select metric.fn_calc_abundance(%s, %s, %s, %s);', [0, 1, 1, 1])
    assert cursor.fetchone()[0] == 0

    # lab split mid point
    cursor.execute('select metric.fn_calc_abundance(%s, %s, %s, %s);', [100, 0.5, 1, 1])
    assert cursor.fetchone()[0] == 200

    # field split mid point
    cursor.execute('select metric.fn_calc_abundance(%s, %s, %s, %s);', [100, 1, 0.5, 1])
    assert cursor.fetchone()[0] == 200

    # Floating point area
    cursor.execute('select metric.fn_calc_abundance(%s, %s, %s, %s);', [100, 1, 1, 0.5])
    assert cursor.fetchone()[0] == 200

    # Zero lab split
    cursor.execute('select metric.fn_calc_abundance(%s, %s, %s, %s);', [100, 0, 1, 1])
    assert True if cursor.fetchone()[0] is None else False

    # Zero field split
    cursor.execute('select metric.fn_calc_abundance(%s, %s, %s, %s);', [100, 1, 0, 1])
    assert True if cursor.fetchone()[0] is None else False

    # Zero area
    cursor.execute('select metric.fn_calc_abundance(%s, %s, %s, %s);', [100, 1, 1, 0])
    assert True if cursor.fetchone()[0] is None else False

    # Test all the nulls
    cursor.execute('select metric.fn_calc_abundance(%s, %s, %s, %s);', [None, 1, 1, 1])
    assert True if cursor.fetchone()[0] is None else False

    cursor.execute('select metric.fn_calc_abundance(%s, %s, %s, %s);', [100, None, 1, 1])
    assert True if cursor.fetchone()[0] is None else False

    cursor.execute('select metric.fn_calc_abundance(%s, %s, %s, %s);', [100, 1, None, 1])
    assert True if cursor.fetchone()[0] is None else False

    cursor.execute('select metric.fn_calc_abundance(%s, %s, %s, %s);', [100, 1, 1, None])
    assert True if cursor.fetchone()[0] is None else False


def test_sample_abundance(cursor, taxonomic_hierarchy, abundance):

    samples = get_samples_by_customer_name(cursor, 'test customer')
    sample_id = samples[0]

    cursor.callproc('metric.fn_sample_abundance', [sample_id, 0, 0])
    sa = cursor.fetchone()
    assert sa[0] == 20


def test_richness_by_taxa(cursor):
    """ Need to test that when calculating the richness for a specific
    metric that filters by taxa, the result is zero if there are no
    occurrences of that taxa in the sample
    """

    cursor.execute("INSERT INTO taxa.taxonomy (scientific_name, level_id) VALUES ('test taxa', 15) returning taxonomy_id")
    taxonomy_id = cursor.fetchone()[0]

    cursor.execute("INSERT INTO metric.metrics (metric_name, group_id) VALUES ('Test Metric', 1) returning metric_id")
    metric_id = cursor.fetchone()[0]

    cursor.execute('INSERT INTO metric.metric_taxa(metric_id, taxonomy_id) VALUES (%s, %s)', [metric_id, taxonomy_id])

    # test a sample that does include the metric taxa
    cursor.execute("""select * from metric.fn_taxa_abundance(%s, Array[
        (1,'taxa 1',1,'level a',100)::taxa_info2,
        (2,'taxa 2',1,'level b',200)::taxa_info2,
        (3,'taxa 3',1,'level c',300)::taxa_info2,
        (1,'taxa 1',1,'level a',100)::taxa_info2,
        ({0},'taxa {0}',1,'level e',1)::taxa_info2
        ], Array[]::taxa_info2[])""".format(taxonomy_id), [metric_id])
    assert cursor.fetchone()[0] == 1

    # Now test a sample that does NOT include the metric taxa
    cursor.execute("""select * from metric.fn_taxa_abundance(%s, Array[
        (1,'taxa 1',1,'level a',100)::taxa_info2,
        (2,'taxa 2',1,'level b',200)::taxa_info2,
        (3,'taxa 3',1,'level c',300)::taxa_info2,
        (1,'taxa 1',1,'level a',100)::taxa_info2,
        (5,'taxa 5',1,'level e',1)::taxa_info2
        ], Array[]::taxa_info2[])""", [metric_id])
    assert cursor.fetchone()[0] == 0


# def test_attribute_abundance(cursor, taxonomic_hierarchy, taxonomic_attributes, abundance):

#     samples = get_samples_by_customer_name(cursor, 'test customer')
#     sample_id = samples[0]

#     # Taxa ending in A should all have attribute 1
#     attributea = get_attribute_by_name(cursor, 'Test Attribute 1')
#     phyluma = get_taxa_by_name(cursor, 'Test Phylum A')
#     cursor.execute('SELECT metric.fn_attribute_abundance(%s, %s)', [sample_id, attributea])
#     atta_abundance = cursor.fetchone()[0]
#     assert atta_abundance == 20
