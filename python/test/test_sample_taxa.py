import pytest
from test_helper_functions import get_samples_by_customer_name


def test_sample_taxa_raw(cursor, taxonomic_hierarchy, pacific_taxa):

    # Should be 2 samples in the pacific taxa fixture, each with 5 organisms
    samples = get_samples_by_customer_name(cursor, 'customer for sample at%')
    assert len(samples) == 2

    for sample_id in samples:
        cursor.execute('SELECT * FROM sample.fn_sample_taxa_raw(Array[%s])', [sample_id])
        organisms = {row['taxonomy_id']: row['raw_count'] for row in cursor.fetchall()}
        assert len(organisms) == 5


def test_box_taxa_raw(cursor, taxonomic_hierarchy, pacific_taxa):

    # Should be 2 samples in the pacific taxa fixture, each with 5 organisms
    samples = get_samples_by_customer_name(cursor, 'customer for sample at%')
    assert len(samples) == 2

    # Get the box IDs for the two samples
    box_ids = []
    for sample_id in samples:
        cursor.execute('SELECT box_id FROM sample.samples WHERE sample_id = %s', [sample_id])
        box_id = cursor.fetchone()[0]
        box_ids.append(box_id)

        cursor.execute('SELECT * FROM sample.fn_box_taxa_raw(Array[%s])', [box_id])
        organisms = {row['taxonomy_id']: row['raw_count'] for row in cursor.fetchall()}
        assert len(organisms) == 5

    # Now query all the boxes together
    cursor.execute('SELECT * FROM sample.fn_box_taxa_raw(Array[%s])', [box_ids])
    organisms = cursor.fetchall()
    assert len(organisms) == 10


def test_point_and_distance(cursor, taxonomic_hierarchy, pacific_taxa):
    """Tests the point and distance taxa retrieval query.

    It uses a sample located in the Pacifc Ocean and then queries
    at various distances from it.

    Technically doesn't need to be the Pacifc, but other unit
    tests can use these data.
    """

    # Should be 2 samples in the pacific taxa fixture, each with 5 organisms
    samples = get_samples_by_customer_name(cursor, 'customer for sample at%')
    assert len(samples) == 2

    # Searching 500km from this location should provide 2 samples with 5 organisms each
    # should be the same taxa, so count of 2 for each.
    cursor.execute("SELECT * FROM sample.fn_taxa_raw_point_distance(-150, 30, 500000)")
    orig_rows = cursor.fetchall()
    assert len(orig_rows) == 10
    for row in orig_rows:
        assert row['raw_count'] == 1

    # Verify that the procedure throw exception with invalid parmeters
    for data in [(-181, 30, 5), (181, 30, 5), (-150, -91, 5), (150, 91, 5), (-150, 30, -1)]:
        try:
            cursor.execute("SELECT * FROM sample.fn_taxa_raw_point_distance(%a, %s, %s)", data)
            assert False
        except Exception as ex:
            print(ex)
            assert True


def test_taxa_polygon(cursor, taxonomic_hierarchy, pacific_taxa):
    """ Test that the samples in the pacific can be retrieved using a polygon

    """
    # Should be 2 samples in the pacific taxa fixture, each with 5 organisms
    samples = get_samples_by_customer_name(cursor, 'customer for sample at%')
    assert len(samples) == 2

    polygon = '{"type": "Polygon", "coordinates":[[[-154, 29],[-148, 29],[-148,33],[-154,33],[-154,29]]]}'

    cursor.execute("SELECT * FROM sample.fn_taxa_raw_polygon(%s)", [polygon])
    orig_rows = cursor.fetchall()
    assert len(orig_rows) == 10
    for row in orig_rows:
        assert row['raw_count'] == 1


if __name__ == "__main__":
    pytest.main(['test/test_sample_taxa.py::test_box_taxa_raw'])
