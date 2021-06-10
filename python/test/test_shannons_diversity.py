from test_helper_functions import get_attribute_by_name
from test_helper_functions import get_taxa_by_name
import pytest
from test_helper_functions import get_samples_by_customer_name


def test_calc_shannons_diversity(cursor):

    # -1 * ((100/300) * ln(100/300)) + (200/300) * ln(200/300)))
    cursor.execute("""select * from metric.fn_calc_shannons_diversity(Array[
        (100,10,1,1,1)::metric_taxa,
        (200,20,1,1,1)::metric_taxa
        ])""")
    assert cursor.fetchone()[0] == pytest.approx(0.63651, 0.001)


if __name__ == "__main__":

    pytest.main(['test/test_shannons_diversity.py::test_calc_shannons_diversity'])
