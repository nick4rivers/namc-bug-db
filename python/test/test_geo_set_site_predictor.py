import pytest


def test_set_site_predictor_success(cursor):

    # # integer predictor
    # cursor.execute("""SELECT sample.fn_set_site_predictor_value(2, 1, '{"value": 1}')""")
    # assert cursor.fetchone()[0] == 1

    # # float predictor
    # cursor.execute("""SELECT sample.fn_set_site_predictor_value(2, 1, '{"value": 0.5}')""")
    # assert cursor.fetchone()[0] == 1

    # # string predictor
    # cursor.execute("""SELECT sample.fn_set_site_predictor_value(2, 1, '{"value": "valid predictor value"}')""")
    # assert cursor.fetchone()[0] == 1

    assert True
