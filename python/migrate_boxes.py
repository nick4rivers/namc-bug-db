""" Import boxes
"""
import csv
from lib.logger import Logger
from lib.progress_bar import ProgressBar
from utilities import log_record_count, sanitize_string, reset_sequence
from postgres_lookup_data import lookup_data, insert_row, log_row_count, insert_many_rows
from lookup_data import get_db_id


def migrate(mscurs, pgcurs, db_name):
    """Migrating boxes"""

    log = Logger('Boxes')
    organizations = lookup_data(pgcurs, 'entity.organizations', 'entity_id')
    box_states = lookup_data(pgcurs, 'sample.box_states', 'box_state_name')
    individuals = lookup_data(pgcurs, 'entity.individuals', 'entity_id')
    existing_boxes = lookup_data(pgcurs, 'sample.boxes', 'box_id')

    # Recomposite the individual names
    individuals_by_full_name = {'{} {}'.format(data['first_name'], data['last_name']).replace("'", '').replace('.', ''): individual_id for individual_id, data in individuals.items()}

    # The unspecified user for boxes that don't have a contact individual
    unspecified_individual_id = individuals_by_full_name['Unspecified Unspecified']

    sql = """SELECT BT.*, C.Contact
        FROM {0}.dbo.{1} BT
        LEFT JOIN {0}.dbo.Customer C ON BT.CustId = C.CustID
        {2}""".format(
        db_name,
        'BoxTracking' if db_name.lower() == 'pilotdb' else 'BugBoxes',
        ' where (Complete = 0) ' if db_name == 'buglab' else '')

    existing_box_count = 0
    expected_rows = log_record_count(mscurs, '{} Boxes'.format(db_name), sql)
    progbar = ProgressBar(expected_rows, 50, "boxes")
    mscurs.execute(sql)
    counter = 0
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        # Most boxes should exist in both databases. Only process once.
        if msdata['BoxId'] in existing_boxes:
            existing_box_count += 1
            continue

        cust_id = sanitize_string(msdata['CustId'])

        # Forest service customer IDs were tweaked during import. Use old format for lookup
        if cust_id.startswith('USFS_'):
            cust_id = cust_id.replace('_', '-')
        if cust_id.startswith('USFS-R0'):
            cust_id = 'USFS-R' + cust_id[7:]

        entity_id = get_db_id(organizations, 'entity_id', ['abbreviation', 'organization_name'], cust_id, True)
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
            'box_received_date': msdata['DateIn'],
            'box_state_id': box_state_id,
            'description': sanitize_string(msdata['Notes'], None, 'Boxes') if 'Notes' in msdata else None
        }
        insert_row(pgcurs, 'sample.boxes', data)
        counter += 1
        progbar.update(counter)

    progbar.finish()
    log_row_count(pgcurs, 'sample.boxes', expected_rows)

    log.info('{} boxes skipped because they already existed in the database.'.format(existing_box_count))

    # Data inserted with manual IDs need to reset the table sequence
    reset_sequence(pgcurs, 'sample.boxes', 'box_id')


def associate_models_with_boxes(pgcurs, csv_path):
    """ Associate models with the boxes"""

    model_aliases = {
        'OR_WCCP': 'OR - WCCP',
        'OR_MWCF': 'OR - MWCF'
    }

    log = Logger('Models')
    log.info('Associating models with boxes')

    all_models = lookup_data(pgcurs, 'geo.models', 'abbreviation')

    raw_data = csv.DictReader(open(csv_path))
    data = {}
    for row in raw_data:

        if row['boxid'] == 'NA':
            continue

        model = row['model']

        if model in model_aliases:
            model = model_aliases[model]

        # associate box with all three Colorado models
        if model.startswith('CO_') or model == 'CO':
            model = ['CO EDAS Biotype 1', 'CO EDAS Biotype 2', 'CO EDAS Biotype 3']

        if model == 'AREMP_MMI_and_OE':
            model = ['AREMP OE', 'AREMP MMI']

        box_id = int(row['boxid'])
        if box_id not in data:
            data[box_id] = []

        # Convert the models that apply to this box to a list if it is not already
        if not isinstance(model, list):
            model = [model]

        # Loop over all models that apply to this box
        for box_model in model:
            model_id = get_db_id(all_models, 'model_id', ['abbreviation'], box_model, True)
            if model_id not in data[box_id]:
                data[box_id].append(model_id)

    # Flatten the data to insert into the database table
    db_data = []
    for box_id, models in data.items():
        for model_id in models:
            db_data.append((box_id, model_id))

    insert_many_rows(pgcurs, 'sample.box_models', ['box_id', 'model_id'], db_data)
    log_row_count(pgcurs, 'sample.box_models')

    # Data inserted with manual IDs need to reset the table sequence
    reset_sequence(pgcurs, 'sample.boxes', 'box_id')


def update_box_states(mscurs, pgcurs):
    """
    BugLab maintains the accurate box status. Update boxes in postgres
    with the status from BugLab for Active, OnHold and Waiting
    """

    log = Logger('Boxes')
    statuses = lookup_data(pgcurs, 'sample.box_states', 'box_state_name')

    for status in ['Active', 'Waiting', "OnHold"]:

        # Get the new postgres status ID
        status_id = get_db_id(statuses, 'box_state_id', ['box_state_name'], 'On Hold' if status.lower() == 'onhold' else status, True)

        mscurs.execute('SELECT BoxID From BugLab.dbo.BugBoxes WHERE ( ({} <> 0) AND (Complete = 0))'.format(status))
        box_ids = [(status_id, row[0]) for row in mscurs.fetchall()]
        log.info('Update {} boxes with status of {}'.format(len(box_ids), status))
        pgcurs.executemany('UPDATE sample.boxes SET box_state_id = %s WHERE (box_id = %s)', box_ids)
