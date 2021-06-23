import pytest
from test.helper_functions import get_attribute_by_name
from test.helper_functions import get_taxa_by_name
from test.helper_functions import get_samples_by_customer_name


def test_cal_richness(cursor):
    """
    Test the core richness calculation on an array of organisms
    It is assumed that the organisms are already translated and rarefied.
    """

    # Zero taxa
    cursor.execute("""select * from metric.fn_calc_richness(Array[]::taxa_info2[])""")
    assert cursor.fetchone()[0] == 0

    # Null argument
    cursor.execute("""select * from metric.fn_calc_richness(null)""")
    assert cursor.fetchone()[0] == None

    # 4 distinct taxa
    cursor.execute("""select * from metric.fn_calc_richness(Array[
        (1,'taxa 1',1,'level a',100)::taxa_info2,
        (2,'taxa 2',1,'level b',200)::taxa_info2,
        (3,'taxa 3',1,'level c',300)::taxa_info2,
        (1,'taxa 1',1,'level a',100)::taxa_info2,
        (5,'taxa 5',1,'level e',1)::taxa_info2
        ])""")
    assert cursor.fetchone()[0] == 4


if __name__ == "__main__":
    pytest.main([__file__])
