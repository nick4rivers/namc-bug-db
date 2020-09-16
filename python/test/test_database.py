from decimal import Decimal

def test_project_table_exists(cursor, birch_bookshelf_project):
    cursor.execute('select id from projects')
    rs = cursor.fetchall()
    assert len(rs) == 1


def test_project_supplies_table_exists(cursor, birch_bookshelf_project):
    cursor.execute('select id from project_supplies')
    rs = cursor.fetchall()
    assert len(rs) == 4


def test_project_steps_table_exists(cursor):
    cursor.execute('select id from project_steps')
    rs = cursor.fetchall()
    assert len(rs) == 0


def test_get_project_costs(cursor, birch_bookshelf_project):
    """This one is failing because I don't really know how to write procedures in postgres

    Args:
        cursor ([type]): [description]
        birch_bookshelf_project ([type]): [description]
    """
    cursor.callproc('get_project_costs',[birch_bookshelf_project,])
    cost = cursor.fetchval()
    assert cost == Decimal('200.42')


def test_projects_and_supplies(cursor, raised_garden_bed_project, birch_bookshelf_project):
    stmt = 'SELECT * from projects_and_supplies'
    cursor.execute(stmt)
    rs = cursor.fetchall()
    assert len(rs) == 8
