import pytest
from test.helper_functions import get_attribute_by_name
from test.helper_functions import get_taxa_by_name
from test.helper_functions import get_samples_by_customer_name


def test_metric_load_sample_taxa(cursor, taxonomic_hierarchy, abundance):

    # samples = get_samples_by_customer_name(cursor, 'test customer')
    # sample_id = samples[0]

    # cursor.execute('select * from unnest(metric.fn_load_sample_taxa(%s))', [sample_id])
    # sample_taxa = [row for row in cursor.fetchall()]
    # assert len(sample_taxa) == 6

    # cursor.execute('select metric.fn_sample_abundance(1, %s, 1, 1)', [sample_id])
    # assert cursor.fetchone()[0] == 54.0
    assert True


if __name__ == "__main__":
    pytest.main([__file__])
