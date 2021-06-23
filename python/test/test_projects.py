import pytest


def test_create_project(cursor, project_data):

    project_name = 'unit test project'
    cursor.execute('SELECT * FROM sample.fn_create_project(%s, %s, %s, %s, %s)', [project_name, False, None, None, None])
    project_id = cursor.fetchone()[0]
    assert project_id > 0

    # Check the new project, plus the existing fixture test one makes 2
    cursor.execute('SELECT count(*) from sample.projects where project_id = %s', [project_id])
    assert cursor.fetchone()[0] == 1

    try:
        # Duplicate names not allowd
        cursor.execute('SELECT * FROM sample.fn_create_project(%s, %s, %s, %s, %s)', [project_name, False, None, None, None])
        project_id = cursor.fetchone()[0]
        assert False
    except Exception as ex:
        assert True

    try:
        # Empty names not allowd
        cursor.execute('SELECT * FROM sample.fn_create_project(%s, %s, %s, %s, %s)', ['', False, None, None, None])
        project_id = cursor.fetchone()[0]
        assert False
    except Exception as ex:
        assert True

    try:
        # NULL names not allowd
        cursor.execute('SELECT * FROM sample.fn_create_project(%s, %s, %s, %s, %s)', [None, False, None, None, None])
        project_id = cursor.fetchone()[0]
        assert False
    except Exception as ex:
        assert True


def test_list_projects(cursor, project_data):

    cursor.execute('SELECT * FROM sample.fn_projects(100, 0)')
    projects = cursor.fetchall()
    assert len(projects) > 0


def test_add_project_samples(cursor, project_data):

    cursor.execute('SELECT * FROM sample.fn_create_project(%s, %s, %s, %s, %s)', ['unit test project', False, None, None, None])
    project_id = cursor.fetchone()[0]

    cursor.execute('SELECT sample_id from sample.samples limit 10;')
    sample_ids = [row['sample_id'] for row in cursor.fetchall()]

    # Add single sample
    cursor.execute('SELECT * FROM sample.add_project_samples(%s, %s)', [project_id, [sample_ids[0]]])
    assert cursor.fetchone()[0] == 1

    # Add all the samples. This should return the length of the samples array
    # Note that the one already inserted should cause an upsert
    cursor.execute('SELECT * FROM sample.add_project_samples(%s, %s)', [project_id, sample_ids])
    assert cursor.fetchone()[0] == len(sample_ids)


def test_add_project_boxes(cursor, project_data):

    cursor.execute('SELECT * FROM sample.fn_create_project(%s, %s, %s, %s, %s)', ['unit test project', False, None, None, None])
    project_id = cursor.fetchone()[0]

    cursor.execute('SELECT box_id from sample.samples group by box_id limit 10;')
    box_ids = [row['box_id'] for row in cursor.fetchall()]

    cursor.execute('select count(*) from sample.samples where box_id = any(%s)', [box_ids])
    sample_count = cursor.fetchone()[0]

    # Add all the boxes
    cursor.execute('SELECT * FROM sample.add_project_boxes(%s, %s)', [project_id, box_ids])
    assert cursor.fetchone()[0] == sample_count


def test_remove_project_samples(cursor, project_data):

    cursor.execute('SELECT * FROM sample.fn_create_project(%s, %s, %s, %s, %s)', ['unit test project', False, None, None, None])
    project_id = cursor.fetchone()[0]

    cursor.execute('SELECT sample_id from sample.samples limit 10;')
    sample_ids = [row['sample_id'] for row in cursor.fetchall()]

    # Add single sample
    cursor.execute('SELECT * FROM sample.add_project_samples(%s, %s)', [project_id, [sample_ids[0]]])
    assert cursor.fetchone()[0] == 1

    # remove the sample
    cursor.execute('SELECT * FROM sample.remove_project_samples(%s, %s)', [project_id, [sample_ids[0]]])
    assert cursor.fetchone()[0] == 0


def test_delete_project(cursor, project_data):

    cursor.execute('SELECT * FROM sample.fn_create_project(%s, %s, %s, %s, %s)', ['unit test project', False, None, None, None])
    project_id = cursor.fetchone()[0]

    cursor.execute('SELECT sample_id from sample.samples limit 10;')
    sample_ids = [row['sample_id'] for row in cursor.fetchall()]

    # Add single sample
    cursor.execute('SELECT * FROM sample.add_project_samples(%s, %s)', [project_id, [sample_ids[0]]])
    assert cursor.fetchone()[0] == 1

    # Delete the project
    cursor.execute('SELECT * FROM sample.delete_project(%s)', [project_id])

    cursor.execute('select count(*) from sample.projects where project_id = %s', [project_id])
    assert cursor.fetchone()[0] == 0


if __name__ == "__main__":
    pytest.main([__file__])
