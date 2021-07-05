import pytest
from test.helper_functions import get_attribute_by_name
from test.helper_functions import get_taxa_by_name
from test.helper_functions import get_samples_by_customer_name


def test_calc_richness(cursor):
    """
    Test the core richness calculation on an array of organisms
    It is assumed that the organisms are already translated and rarefied.
    """

    # Zero taxa
    cursor.execute("""select * from metric.fn_calc_richness(Array[]::taxa_info2[])""")
    assert cursor.fetchone()[0] == 0

    # Null argument
    # Note that this used to produce None. But removing the
    # "returns null on null input" clause from the function
    # now causes this to return zero. This is needed so that
    # all uses of this function return zero, such as when requesting
    # the richness of a specific taxa. This needs to return zero,
    # but the taxa filtering produces an empty array that is then
    # passed to fn_calc_richness.
    cursor.execute("""select * from metric.fn_calc_richness(null)""")
    assert cursor.fetchone()[0] == 0

    # 4 distinct taxa
    cursor.execute("""select * from metric.fn_calc_richness(Array[
        (1,'taxa 1',1,'level a',100)::taxa_info2,
        (2,'taxa 2',1,'level b',200)::taxa_info2,
        (3,'taxa 3',1,'level c',300)::taxa_info2,
        (1,'taxa 1',1,'level a',100)::taxa_info2,
        (5,'taxa 5',1,'level e',1)::taxa_info2
        ])""")
    assert cursor.fetchone()[0] == 4


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
    cursor.execute("""select * from metric.fn_taxa_richness(%s, Array[]::taxa_info2[], Array[
        (1,'taxa 1',1,'level a',100)::taxa_info2,
        (2,'taxa 2',1,'level b',200)::taxa_info2,
        (3,'taxa 3',1,'level c',300)::taxa_info2,
        (1,'taxa 1',1,'level a',100)::taxa_info2,
        ({0},'taxa {0}',1,'level e',1)::taxa_info2
        ])""".format(taxonomy_id), [metric_id])
    assert cursor.fetchone()[0] == 1

    # Now test a sample that does NOT include the metric taxa
    cursor.execute("""select * from metric.fn_taxa_richness(%s, Array[]::taxa_info2[], Array[
        (1,'taxa 1',1,'level a',100)::taxa_info2,
        (2,'taxa 2',1,'level b',200)::taxa_info2,
        (3,'taxa 3',1,'level c',300)::taxa_info2,
        (1,'taxa 1',1,'level a',100)::taxa_info2,
        (5,'taxa 5',1,'level e',1)::taxa_info2
        ])""", [metric_id])
    assert cursor.fetchone()[0] == 0
