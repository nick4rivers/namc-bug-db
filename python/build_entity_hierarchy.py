from postgres_lookup_data import lookup_data, insert_row, log_row_count
from lookup_data import get_db_id
from lib.logger import Logger


def build_entity_hierarchy(pgcurs):

    # Get the IDs of existing entities
    organizations = lookup_data(pgcurs, 'entity.organizations', 'abbreviation')

    # Insert top level USFS entity
    usfs_id = insert_new_organization(pgcurs, 'USFS - Federal Agency', 'USFS', None, 'Federal')

    # Insert USFS region 10 offices
    usfs_r10 = insert_new_organization(pgcurs, 'USFS  Region 10 Offices', 'USFS-R10', usfs_id, 'Federal')

    # Associate regional offices and special projects with top level federal agency
    associate_children(pgcurs, usfs_id, "(abbreviation like 'USFS_R_') OR (abbreviation LIKE 'USFS_R__') OR (abbreviation LIKE 'USFS_5__')")

    # # Associate region 1, 5 and 6 offices with parent
    usfs_r1 = get_db_id(organizations, 'entity_id', ['abbreviation'], 'USFS-R1', True)
    associate_children(pgcurs, usfs_r1, "(abbreviation LIKE 'USFS-R1-%%')")

    usfs_r5 = get_db_id(organizations, 'entity_id', ['abbreviation'], 'USFS-R5', True)
    associate_children(pgcurs, usfs_r5, "(abbreviation like 'USFS-R5-%%')")

    usfs_r6 = get_db_id(organizations, 'entity_id', ['abbreviation'], 'USFS-R6', True)
    associate_children(pgcurs, usfs_r6, "(abbreviation like 'USFS-R6-%%')")

    associate_children(pgcurs, usfs_r10, "(abbreviation like 'USFS-R10-%%')")


def insert_new_organization(pgcurs, organization_name, abbreviation, parent_id, entity_type):

    # Get the country code for USA
    pgcurs.execute("SELECT country_id FROM geo.countries WHERE abbreviation = 'USA'")
    usa_id = pgcurs.fetchone()[0]

    notes = 'system generated from python during database construction'

    entity_types = lookup_data(pgcurs, 'entity.organization_types', 'organization_type_name')
    organization_type_id = get_db_id(entity_types, 'organization_type_id', ['organization_type_name'], entity_type, True)

    # Insert the entity first
    pgcurs.execute('INSERT INTO entity.entities (country_id, notes) VALUES (%s, %s) RETURNING entity_id', [usa_id, notes])
    entity_id = pgcurs.fetchone()[0]

    # Now insert the organization associated with the entity
    organization_type_id = get_db_id(entity_types, 'organization_type_id', ['organization_type_name'], entity_type, True)
    pgcurs.execute('INSERT INTO entity.organizations (entity_id, organization_name, abbreviation, organization_type_id) VALUES (%s, %s, %s, %s)', [entity_id, organization_name, abbreviation, organization_type_id])

    log = Logger('Entity Hierarchy')
    log.info('New organization with abbreviation {} has entity_id {}'.format(abbreviation, entity_id))

    return entity_id


def associate_children(pgcurs, parent_id, where_clause):

    pgcurs.execute('SELECT abbreviation FROM entity.organizations WHERE entity_id = %s', [parent_id])
    parent_abbreviation = pgcurs.fetchone()[0]

    pgcurs.execute('UPDATE entity.entities e SET parent_id = %s FROM entity.organizations o WHERE (e.entity_id = o.entity_id) AND ({})'.format(where_clause), [parent_id])

    log = Logger('Entity Hierarchy')
    log.info('Parent entity {} has {} children'.format(parent_abbreviation, pgcurs.rowcount))
