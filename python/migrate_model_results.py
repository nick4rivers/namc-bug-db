""" Migrates the CSV file of metric values into the Postgres database

    The CSV file was obtained from Jennifer Courtright as an Excel file and
    exported to CSV for this process.
"""
import csv
import random
from lib.logger import Logger
from postgres_lookup_data import lookup_data, insert_row, log_row_count, insert_many_rows
from lookup_data import get_db_id

# Number of rows to be inserted in one go into the databaes
block_size = 500

# Columns of the sample.model_results table that will be inserted from this script
columns = ['sample_id',
           'model_id',
           'model_version',
           'fixed_count',
           'model_result',
           'metadata'
           ]

# Keys are the model identifiers from the CSV file. Postgres model aliases are on the right
model_aliases = {
    'NV_MMI': 'NV MMI',
    'NVMMI': 'NV MMI',
    'Westwide': 'WestWide2018_OtherEcoregions',
    'WestWide2017': 'WestWide2018_OtherEcoregions',
    'CO_EDAS-Biotype1': 'CO EDAS Biotype 1 (2009)',
    'CO_EDAS - Biotype1': 'CO EDAS Biotype 1 (2009)',
    'CO-EDAS2017 - Biotype 1': 'CO EDAS Biotype 1',
    'CO_EDAS-Biotype2': 'CO EDAS Biotype 2 (2009)',
    'CO_EDAS - Biotype2': 'CO EDAS Biotype 2 (2009)',
    'CO-EDAS2017 - Biotype 2': 'CO EDAS Biotype 2',
    'CO_EDAS-Biotype3': 'CO EDAS Biotype 3 (2009)',
    'CO_EDAS - Biotype3': 'CO EDAS Biotype 3 (2009)',
    'CO-EDAS2017 - Biotype 3': 'CO EDAS Biotype 3',
    'ColumbiaRiverBasin_PIBO': 'PIBO',
    'CA_CSCI': 'CSCI',
    'OR_WesternCordillera_ColumbiaPlateau': 'OR - WCCP',
    'OR_MarineWesternCoastalForest': 'OR - MWCF',
    'OR_Marine Western Coastal Forest': 'OR - MWCF',
    'OR_Northern Basin and Range': 'OR NBR',
    'OR_NorthernBasinRange': 'OR NBR',
    'WCCP': 'OR - WCCP',
    'MWCF': 'OR - MWCF',
    'WY2018_WYOMING BASIN': 'WY - Wyoming basin',
    'WY2018_BIGHORN BASIN FOOTHILLS': 'WY - Bighorn basin foothills',
    'WY2018_SEDIMENTARY MNTS': 'WY - Sedimentary mountains',
    'WY2018_HIGH VALLEYS': 'WY - High valleys',
    'WY2018_SOUTH FH LARAMIE RANGE': 'WY - Southern foothills and Laramie range',
    'WY2018_NE PLAINS': 'WY - NE Plains',
    'WY2018_GRANITIC MNTS': 'WY - Granitic mountains',
    'WY2018_SE PLAINS': 'WY - SE Plains',
    'Wyoming - SE Plains': 'WY - SE Plains',
    'WY2018_SOUTHERN ROCKIES': 'WY - Southern rockies'
}


# # temporary list of taxa used for abundance metrics related to taxa
# metric_taxa = {
#     50: 'Ephemeroptera abundance',
#     52: 'Plecoptera abundance',
#     54: 'Trichoptera abundance',
#     56: 'Coleoptera abundance',
#     58: 'Elmidae abundance',
#     60: 'Megaloptera abundance',
#     62: 'Diptera abundance',
#     64: 'Chironomidae abundance',
#     66: 'Crustacea abundance',
#     68: 'Oligochaeta abundance',  # was 'Oligochaete'
#     70: 'Mollusca abundance',
#     72: 'Insecta abundance',
#     # 74: 'Non-insect abundance'
# }


def migrate(pgcurs, csv_path):
    """Migrates metric values from CSV to postgres database

    Args:
        pgcurs (cursor): Postgres cursor
        csv_path (str): path to CSV file containing metric values
    """

    log = Logger('metric values')

    # Simplify the samples down to just the ID and site ID to save on RAM
    samples = lookup_data(pgcurs, 'sample.samples', 'sample_id')
    samples = {sample_id: data['site_id'] for sample_id, data in samples.items()}

    sites = lookup_data(pgcurs, 'geo.sites', 'site_id')
    models = lookup_data(pgcurs, 'geo.models', 'model_id')

    # This script requires both sites and samples to have been imported into the database
    if len(sites) < 1 or len(samples) < 1:
        raise Exception('You need to migrate sites and samples into the database first.')

    unique_model_results = {}
    for row in csv.DictReader(open(csv_path)):

        sample_id = int(row['SAMPLEID'])
        if sample_id not in samples:
            log.warning('Sample {} not present in database. Skipping'.format(sample_id))
            continue

        # No longer using site ID
        # The station values actually refer to ReachID. Ignore and do not user
        # station = row['STATION']
        # Verify that the site in the database is associated with the same site as that specified in the CSV
        # if sites[samples[sample_id]]['site_name'].lower() != station.lower():
        #     log.error('Sample {} has site {} in CSV but is associated with site {} in postgres'.format(sample_id, station, sites[samples[sample_id]]['site_name']))

        # Store all the miscellaneous CSV columns as JSON metadata in postgres
        metadata = {}
        for col in ['UID', 'O', 'E', 'AIM_rtg', 'MODELTEST', 'INVASIVE_MACRO']:
            if row[col] is not None and len(row[col]) > 0:
                if row[col].isnumeric():
                    metadata[col] = int(row[col])
                elif isfloat(row[col]):
                    metadata[col] = float(row[col])
                else:
                    metadata[col] = row[col]

        # Both OE can't be NULL
        if row['OE'] == '' and row['MMI'] == '':
            log.error('Both OE and MMI are None')
            continue

        # Fixed count can't be NULL
        if row['COUNT'] == '':
            log.warning('Fixed count is empty. Skipping sample {}'.format(sample_id))
            continue
        fixed_count = int(row['COUNT'])

        o2e_result = float(row['OE']) if len(row['OE']) > 0 else None
        mmi_result = float(row['MMI']) if len(row['MMI']) > 0 else None

        for model_result, model_suffix in ((o2e_result, 'OE'), (mmi_result, 'MMI')):
            if model_result is None:
                continue

            model_name = row['MODEL']
            if model_name.lower() == 'aremp':
                # AREMP has become two models.
                model_name = 'AREMP {}'.format(model_suffix)
            else:
                # Check the model aliases at the top of this file
                if model_name in model_aliases:
                    model_name = model_aliases[model_name]

            # Now try to find the correct model ID
            model_id = get_db_id(models, 'model_id', ['model_name', 'abbreviation'], model_name, True)

            # Build a dictionary of all the relevant values. This will get flattened to a list before inserting into the database
            data = {
                'model_id': model_id,
                'sample_id': sample_id,
                'model_version': '0.0.0',
                'fixed_count': fixed_count,
                'model_result': model_result,
                'metadata': metadata
            }

            # Track unique results and skip duplicates
            key = '{}_{}_{}'.format(sample_id, model_id, fixed_count)
            if key not in unique_model_results:
                unique_model_results[key] = []
            unique_model_results[key].append(data)

    # Now insert the data into the database. Needs flattening first.
    block_data = []
    for key, list_of_data in unique_model_results.items():

        # pick one of the model results at random
        data = random.choice(list_of_data)

        # flatten data ready for database insert
        block_data.append([data[col] for col in columns])

        # insert the data if the block size has been reached
        if len(block_data) == block_size:
            insert_many_rows(pgcurs, 'sample.model_results', columns, block_data, None)
            block_data = []

    # insert remaining rows
    if len(block_data) > 0:
        insert_many_rows(pgcurs, 'sample.model_results', columns, block_data, None)

    log_row_count(pgcurs, 'sample.model_results', len(list(unique_model_results)))


def isfloat(value):
    try:
        float(value)
        return True
    except ValueError:
        return False
