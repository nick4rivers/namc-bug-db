"""Goal of this file is to verify that each SQL query
used by the API is functional and does not contain any
errors.

This isn't a true test of the API, but merely a low
level check that all stored procedures don't crash.
"""
import pytest


def test_samples(cursor):

    # Query by Sample IDs
    cursor.execute('SELECT * FROM sample.fn_samples(100, 0, Array[1, 10, 100, 1000, 10000])')
    assert True

    # Query by box IDs
    cursor.execute('SELECT * FROM sample.fn_box_samples(100, 0, Array[38, 39, 40])')
    assert True

    # Query by Project IDs
    cursor.execute('SELECT * FROM sample.fn_project_samples(100, 0, Array[1, 2, 5, 10, 50])')
    assert True

    # Query by Site IDs
    cursor.execute('SELECT * FROM sample.fn_site_samples(100, 0, Array[1, 100, 1000, 10000])')
    assert True

    # Query by Entity IDs
    cursor.execute('SELECT * FROM sample.fn_entity_samples(100, 0, Array[1782])')
    assert True

    # Query by polygon
    cursor.execute("""SELECT * FROM sample.fn_polygon_samples(100, 0, '{ "type": "Polygon", "coordinates": [ [ [ -112.4, 39.5 ], [ -107.1, 39.5 ], [ -107.1, 42.6 ], [ -112.4, 42.6 ], [ -112.4, 39.5 ] ] ]}')""")
    assert True

    # Query by point and distance
    cursor.execute('SELECT * FROM sample.fn_point_distance_samples(100, 0, -112.4, 39.5, 50000)')
    assert True


def test_sites(cursor):

    # Query by Site IDs
    cursor.execute('SELECT * FROM geo.fn_sites(100, 0, Array[1, 10, 100])')
    assert True

    # Query by box IDs
    cursor.execute('SELECT * FROM geo.fn_box_sites(100, 0, Array[38, 39, 40])')
    assert True

    # Query by Sample IDs
    cursor.execute('SELECT * FROM geo.fn_sample_sites(100, 0, Array[164634])')
    assert True

    # Query by Entity IDs
    cursor.execute('SELECT * FROM geo.fn_entity_sites(100, 0, Array[1782])')
    assert True

    # Query by polygon
    cursor.execute("""SELECT * FROM geo.fn_polygon_sites(100, 0, '{ "type": "Polygon", "coordinates": [ [ [ -112.4, 39.5 ], [ -107.1, 39.5 ], [ -107.1, 42.6 ], [ -112.4, 42.6 ], [ -112.4, 39.5 ] ] ]}')""")
    assert True

    # Query by point and distance
    cursor.execute('SELECT * FROM geo.fn_sites_point_distance(100, 0, -112.4, 39.5, 50000)')
    assert True


def test_site_info(cursor):

    cursor.execute('SELECT * FROM geo.fn_site_info(1)')
    assert True


def test_boxes(cursor):

    # Query by Box IDs
    cursor.execute('SELECT * FROM sample.fn_boxes(100, 0, Array[10, 100, 1000])')
    assert True

    # Query by Entity IDs
    cursor.execute('SELECT * FROM sample.fn_entity_boxes(100, 0, Array[1, 50, 500, 1000])')
    assert True


def test_projects(cursor):

    cursor.execute('SELECT * FROM sample.fn_projects(100, 0)')
    assert True


def test_taxonomy(cursor):

    cursor.execute('SELECT * FROM taxa.vw_taxonomy_crosstab ORDER BY taxonomy_id LIMIT 100 OFFSET 0')
    assert True


def test_predictors(cursor):

    cursor.execute('SELECT * FROM geo.fn_predictors(100, 0, 1)')
    assert True


def test_models(cursor):

    cursor.execute('SELECT * FROM geo.fn_models(100, 0)')
    assert True


def test_model_info(cursor):

    cursor.execute('SELECT * FROM geo.fn_model_info(1)')
    assert True


def test_predictor_values(cursor):

    cursor.execute('SELECT * FROM geo.fn_site_predictor_values(100, 0, 1)')
    assert True


def test_box_info(cursor):

    cursor.execute('SELECT * FROM sample.fn_box_info(2000)')
    assert True


def test_sample_predictor_values(cursor):

    cursor.execute('SELECT * FROM sample.fn_sample_predictor_values(1)')
    assert True


def test_model_predictors(cursor):

    cursor.execute('SELECT * FROM geo.fn_model_predictors(100, 0, 1)')
    assert True


def test_translations(cursor):

    cursor.execute('SELECT * FROM taxa.fn_translations(100, 0)')
    assert True


def test_translation_taxa(cursor):

    cursor.execute('SELECT * FROM taxa.fn_translation_taxa(100, 0, 3)')
    assert True


def test_plankton(cursor):
    cursor.execute('SELECT * FROM sample.fn_plankton(100, 0)')
    assert True


def test_drift(cursor):

    cursor.execute('SELECT * FROM sample.fn_drift(100, 0)')
    assert True


def test_fish(cursor):

    cursor.execute('SELECT * FROM sample.fn_fish(100, 0)')
    assert True


def test_mass(cursor):

    cursor.execute('SELECT * FROM sample.fn_mass(100, 0)')
    assert True


def test_Attributes(cursor):

    cursor.execute('SELECT * FROM taxa.fn_attributes(100, 0)')
    assert True


def test_taxa_attributes(cursor):

    cursor.execute('SELECT * FROM taxa.fn_taxa_attributes(100, 0, 1)')
    assert True


def test_model_thresholds(cursor):

    cursor.execute('SELECT * FROM geo.fn_model_conditions(1)')
    assert True


def test_metrics(cursor):

    cursor.execute('SELECT * FROM metric.fn_metrics(100, 0)')
    assert True


def test_sample_taxa_raw(cursor):

    cursor.execute('SELECT * FROM sample.fn_sample_taxa_raw(Array[164638])')
    assert True


def test_box_taxa_raw(cursor):

    cursor.execute('SELECT * FROM sample.fn_box_taxa_raw(Array[2000])')
    assert True


def test_project_taxa(cursor):

    cursor.execute('SELECT * FROM sample.fn_project_taxa_raw(Array[1])')
    assert True


def test_taxa_point_distaince(cursor):

    cursor.execute('SELECT * FROM sample.fn_taxa_raw_point_distance(-115, 23, 1000)')
    assert True


def test_taxa_polygon(cursor):

    # cursor.execute('SELECT * FROM sample.fn_taxa_raw_polygon($1)')
    assert True


def test_taxa_generalized(cursor):

    cursor.execute('SELECT * FROM sample.fn_sample_taxa_generalized(164638)')
    assert True


def test_taxa_translation(cursor):

    cursor.execute('SELECT * FROM sample.fn_sample_translation_taxa(164638, 3)')
    assert True


# This stored procedure was commented out. There is never a case when you
# # want to rarefy without translating
# def test_raxa_rarefied(cursor):

#     cursor.execute('SELECT * FROM sample.fn_rarefied_taxa(164638, 300)')
#     assert True


def test_taxa_translated_rarefied(cursor):

    cursor.execute('SELECT * FROM sample.fn_translation_rarefied_taxa(164638, 3, 300)')
    assert True


def test_sample_metrics(cursor):

    cursor.execute('SELECT * FROM metric.fn_sample_metrics_array(Array[164638], 3, 300)')
    assert True


def test_box_metrics(cursor):

    cursor.execute('SELECT * FROM metric.fn_box_metrics(Array[164638], 3, 300)')
    assert True


def test_project_metrics(cursor):

    cursor.execute('SELECT * FROM metric.fn_project_metrics(Array[164638], 3, 300)')
    assert True
