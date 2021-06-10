from test_helper_functions import get_attribute_by_name
from test_helper_functions import get_taxa_by_name
import pytest
from test_helper_functions import get_samples_by_customer_name


def test_cal_richness(cursor):
    """
    Test the core richness calculation on an array of organisms
    It is assumed that the organisms are already translated and rarefied.
    """

    # Zero taxa
    cursor.execute("""select * from metric.fn_calc_richness(Array[]::metric_taxa[])""")
    assert cursor.fetchone()[0] == 0

    # Null argument
    cursor.execute("""select * from metric.fn_calc_richness(null)""")
    assert cursor.fetchone()[0] == None

    # 4 distinct taxa
    cursor.execute("""select * from metric.fn_calc_richness(Array[
        (100,1,1,1,1)::metric_taxa,
        (200,2,1,1,2)::metric_taxa,
        (300,3,1,1,3)::metric_taxa,
        (100,4,1,1,4)::metric_taxa,
        (  1,5,1,1,5)::metric_taxa
        ])""")
    assert cursor.fetchone()[0] == 4


if __name__ == "__main__":

    pytest.main(['test/test_richness.py::test_cal_richness'])
