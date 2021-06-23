from decimal import Decimal
import pytest


def test_set_site_catchment_success(cursor):

    # Valid polygon in Oregon
    cursor.execute("""SELECT sample.fn_set_site_catchment(1, '{ "type": "Polygon", "coordinates": [ [ [ -122.68432617187497, 42.77927536024188 ], [ -116.53198242187499, 42.77927536024188 ], [ -116.53198242187499, 44.308126684886126 ], [ -122.68432617187497, 44.308126684886126 ], [ -122.68432617187497, 42.77927536024188 ] ] ] }')""")
    assert cursor.fetchone()[0] == 1

    # Valid polygon spanning Oregon coast and Pacific Ocean
    cursor.execute("""SELECT sample.fn_set_site_catchment(1, '{ "type": "Polygon", "coordinates": [ [ [ -127.28759765624999, 41.21172151054787 ], [ -121.13525390625, 41.21172151054787 ], [ -121.13525390625, 42.779275360241904 ], [ -127.28759765624999, 42.779275360241904 ], [ -127.28759765624999, 41.21172151054787 ] ] ] }')""")
    assert cursor.fetchone()[0] == 1

    # Valid polygon spanning Canadian and US border
    cursor.execute("""SELECT sample.fn_set_site_catchment(1, '{ "type": "Polygon", "coordinates": [ [ [ -118.37768554687497, 48.312427904071754 ], [ -112.22534179687499, 48.312427904071754 ], [ -112.22534179687499, 49.696061819115634 ], [ -118.37768554687497, 49.696061819115634 ], [ -118.37768554687497, 48.312427904071754 ] ] ] }')""")
    assert cursor.fetchone()[0] == 1


def test_set_site_catchment_failure(cursor):

    # Valid polygon but site ID that does not exist in database. Affected rows = 0
    cursor.execute("""SELECT sample.fn_set_site_catchment(-1, '{ "type": "Polygon", "coordinates": [ [ [ -127.28759765624999, 41.21172151054787 ], [ -121.13525390625, 41.21172151054787 ], [ -121.13525390625, 42.779275360241904 ], [ -127.28759765624999, 42.779275360241904 ], [ -127.28759765624999, 41.21172151054787 ] ] ] }')""")
    assert cursor.fetchone()[0] == 0

    # Invalid polygon
    with pytest.raises(Exception) as exinfo:
        cursor.execute("""SELECT sample.fn_set_site_catchment(1, '{ "type": "Polygon", "coordinates": [ [[ -127.28759765624999, 41.21172151054787 ]]] }')""")
    assert "invalid" in str(exinfo.value)

    # Empty polygon
    # with pytest.raises(Exception) as exinfo:
    #     cursor.execute("""SELECT sample.fn_set_site_catchment(1, '{ "type": "Polygon", "coordinates": null }')""")
    # assert "empty" in str(exinfo.value)

    # Polygon off coast of Oregon in Pacific
    with pytest.raises(Exception) as exinfo:
        cursor.execute("""SELECT sample.fn_set_site_catchment(1, '{ "type": "Polygon", "coordinates": [ [ [ -131.91284179687497, 41.67291181960206 ], [ -125.76049804687499, 41.67291181960206 ], [ -125.76049804687499, 43.229195113965005 ], [ -131.91284179687497, 43.229195113965005 ], [ -131.91284179687497, 41.67291181960206 ] ] ] }')""")
    assert "catchment does not intersect the United States" in str(exinfo.value)

    # TODO: Invalid JSON
    with pytest.raises(Exception) as exinfo:
        cursor.execute("""SELECT sample.fn_set_site_catchment(1, 'Errors Suck')""")
    assert "catchment does not intersect the United States" in str(exinfo.value)


if __name__ == "__main__":
    pytest.main([__file__])
