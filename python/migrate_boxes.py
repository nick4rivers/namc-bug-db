import pyodbc
from rscommons import Logger, ProgressBar
from utilities import sanitize_string_col, sanitize_string, write_sql_file, log_record_count
from postgres_lookup_data import lookup_data, insert_row, log_row_count
from lookup_data import get_db_id


def migrate(mscurs, pgcurs):

    organizations = lookup_data(pgcurs, 'entity.organizations', 'entity_id')
    box_states = lookup_data(pgcurs, 'sample.box_states', 'box_state_name')
    individuals = lookup_data(pgcurs, 'entity.individuals', 'entity_id')

    # Recomposite the individual names
    individuals_by_full_name = {'{} {}'.format(data['first_name'], data['last_name']).replace("'", '').replace('.', ''): individual_id for individual_id, data in individuals.items()}

    # The unspecified user for boxes that don't have a contact individual
    unspecified_individual_id = individuals_by_full_name['Unspecified Unspecified']

    expected_rows = log_record_count(mscurs, 'PilotDB.dbo.BoxTracking')

    mscurs.execute("SELECT BT.*, C.Contact FROM PilotDB.dbo.BoxTracking BT LEFT JOIN PilotDB.dbo.Customer C ON BT.CustId = C.CustID")
    progbar = ProgressBar(expected_rows, 50, "boxes")
    counter = 0
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        custId = sanitize_string(msdata['CustId'])
        entity_id = get_db_id(organizations, 'entity_id', ['abbreviation', 'organization_name'], custId, True)
        box_state_id = get_db_id(box_states, 'box_state_id', ['box_state_name'], 'Complete')

        # Default the submitter to the customer organization
        submitter_id = unspecified_individual_id
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

        data = {
            'box_id': msdata['BoxId'],
            'customer_id': entity_id,
            'submitter_id': submitter_id,
            'box_recevied_date': msdata['DateIn'],
            'box_state_id': box_state_id,
            'description': sanitize_string_col('BoxTracking', 'BoxId', msdata, 'Notes')
        }
        insert_row(pgcurs, 'sample.boxes', data)
        counter += 1
        progbar.update(counter)

    progbar.finish()
    log_row_count(pgcurs, 'sample.boxes', expected_rows)
