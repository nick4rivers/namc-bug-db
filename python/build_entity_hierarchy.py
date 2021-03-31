from postgres_lookup_data import lookup_data, insert_row, log_row_count
from lookup_data import get_db_id
from lib.logger import Logger


def build_entity_hierarchy(pgcurs):

    forest_service(pgcurs)
    bureau_land_management(pgcurs)
    national_parks_service(pgcurs)


def national_parks_service(pgcurs):
    """The NPS records from TypeCustomerSpecial are all formatted
    with NPS-XXXX-YYYY where XXXX is some kind of parent entity and 
    YYYY are child entities. Therefore find those parents by length 
    """

    # Insert top level entity
    nps_id = insert_new_organization(pgcurs, 'NPS - National Parks Service', 'NPS', None, 'Federal')

    # Make all regional entities children of the parent record
    associate_children(pgcurs, nps_id, "(abbreviation LIKE 'NPS-____') OR (abbreviation LIKE 'NPS-__')")

    # Load just the regional offices
    regional = lookup_data(pgcurs, 'entity.organizations', 'abbreviation', "(abbreviation LIKE 'NPS-%%') AND (length(abbreviation) <=8)")

    # associate all parks with this entity
    for region, data in regional.items():
        associate_children(pgcurs, data['entity_id'], "(abbreviation LIKE '{}-%%')".format(region))


def bureau_land_management(pgcurs):

    # Insert top level entity
    blm_id = insert_new_organization(pgcurs, 'BLM - Bureau of Land Management - Federal Agency', 'BLM', None, 'Federal')

    # Insert state offices and associate children
    pgcurs.execute('SELECT abbreviation, state_name from geo.states')
    states = [(row[0], row[1]) for row in pgcurs.fetchall()]

    for state, state_name in states:
        # insert state office and associate with parent BLM
        abbreviation = 'BLM-{}'.format(state)

        # skip states for which there are no customers
        pgcurs.execute("SELECT count(*) FROM entity.organizations where abbreviation LIKE '{}-%%'".format(abbreviation))
        if pgcurs.fetchone()[0] < 1:
            continue

        # Find existing state office record for this state
        pgcurs.execute("SELECT entity_id FROM entity.organizations where (abbreviation LIKE '{}-%%') AND (organization_name ILIKE '%% state %%')".format(abbreviation))
        row = pgcurs.fetchone()
        if row is not None:
            state_office = row[0]
        else:
            state_office = insert_new_organization(pgcurs, 'BLM - {} state office'.format(state_name), abbreviation, blm_id, 'Federal')

        # Associate the state office with the parent
        associate_children(pgcurs, blm_id, "(o.entity_id = {})".format(state_office))

        # associate field offices with the state office
        associate_children(pgcurs, state_office, "(abbreviation like '{}-%%') and (organization_name NOT iLIKE '%% state %%')".format(abbreviation))

    # Finally associate any special BLM customers that are not state offices with the national office
    associate_children(pgcurs, blm_id, "(abbreviation = 'BLM-REDROCK')")
    associate_children(pgcurs, blm_id, "(abbreviation = 'BLM-AIM')")


def forest_service(pgcurs):

    # Insert top level USFS entity
    usfs_id = insert_new_organization(pgcurs, 'USFS - Federal Agency', 'USFS', None, 'Federal')

    # Insert USFS region 8 and 10 offices
    insert_new_organization(pgcurs, 'USFS - Region 8 Southern Region', 'USFS-R8', usfs_id, 'Federal')
    insert_new_organization(pgcurs, 'USFS - Region 10 Alaska Region', 'USFS-R10', usfs_id, 'Federal')

    # Associate regional offices and special projects with top level federal agency
    associate_children(pgcurs, usfs_id, "(abbreviation like 'USFS_R_') OR (abbreviation LIKE 'USFS_R__') OR (abbreviation LIKE 'USFS_5__')")

    # Associate field offices with regional offices (NOTE THERE IS NOT REGION 7!!!!!)
    organizations = lookup_data(pgcurs, 'entity.organizations', 'abbreviation')
    for region in [1, 2, 3, 4, 5, 6, 8, 9, 10]:

        abbreviation = 'USFS-R{}'.format(region)
        region_id = get_db_id(organizations, 'entity_id', ['abbreviation'], abbreviation, True)
        associate_children(pgcurs, region_id, "(abbreviation LIKE '{}-%%')".format(abbreviation))


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
    log.info('Adding {} children to parent entity {}'.format(pgcurs.rowcount, parent_abbreviation))
