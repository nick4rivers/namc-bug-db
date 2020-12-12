import pyodbc
from rscommons import Logger
from lookup_data import lookup_data, get_db_id
from utilities import sanitize_string_col, sanitize_string, write_sql_file


def migrate(mscon, boxes_path):

    organizations = lookup_data('organizations', '30_entity.organizations.sql', 'organization_name')
    box_states = lookup_data('box_states', '16_box_states.sql', 'box_state_name')
    individuals = lookup_data('individuals', '31_entity.individuals.sql', 'individual_id')

    # Recomposite the individual names
    individuals_by_full_name = {'{} {}'.format(data['first_name'], data['last_name']).replace("'", '').replace('.', ''): individual_id for individual_id, data in individuals.items()}

    mscurs = mscon.cursor()
    mscurs.execute("SELECT BT.*, C.Contact FROM PilotDB.dbo.BoxTracking BT INNER JOIN PilotDB.dbo.Customer C ON BT.CustId = C.CustID")
    log = Logger('Boxes')

    boxes = []
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        custId = sanitize_string(msdata['CustId'])
        entity_id = get_db_id(organizations, 'entity_id', ['abbreviation', 'organization_name'], custId)
        box_state_id = get_db_id(box_states, 'box_state_id', ['box_state_name'], 'Complete')

        # Default the submitter to the customer organization
        submitter_id = entity_id
        contact = sanitize_string(msdata['Contact'])
        if contact:
            contact = contact.replace("'", '').replace('.', '')
            if contact in individuals_by_full_name:
                submitter_id = individuals_by_full_name[contact]
            else:
                temp = contact + ' Unknown'
                if temp in individuals_by_full_name:
                    submitter_id = individuals_by_full_name[temp]
                else:
                    raise Exception('failed to find contact')

        boxes.append({
            'box_id': msdata['BoxId'],
            'customer_id': entity_id,
            'submitter_id': submitter_id,
            'box_recevied_date': msdata['DateIn'],
            'box_state_id': box_state_id,
            'description': sanitize_string_col('BoxTracking', 'BoxId', msdata, 'Notes')
        })

    write_sql_file(boxes_path, 'sample.boxes', boxes)
