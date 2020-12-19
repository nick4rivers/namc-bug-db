import psycopg2
import pyodbc
from psycopg2.extras import execute_values
from rscommons import Logger, ProgressBar
from utilities import sanitize_string_col, sanitize_string, sanitize_time, add_metadata, format_values, log_record_count
from postgres_lookup_data import lookup_data, insert_row, log_row_count, insert_many_rows
from lookup_data import get_db_id


def migrate(mscurs, pgcurs):

    levels = lookup_data(pgcurs, 'taxa.taxa_levels', 'level_name')
    levels_by_id = {level['level_id']: level for level in levels.values()}

    pgcurs.execute('SELECT level_id, level_name FROM taxa.taxa_levels WHERE is_active = True ORDER BY level_id DESC')
    level_names = [row[1].lower() for row in pgcurs.fetchall()]

    expected_rows = log_record_count(mscurs, 'PilotDB.dbo.BoxTracking')

    hierarchy = {level: {} for level in level_names}

    hierarchy['kingdom']['Animalia'] = {
        'taxonomy_id': -1,
        'taxonomy_name': 'Animalia',
        'level_id': get_db_id(levels, 'level_id', ['level_name'], 'Kingdom'),
        'parent_id': None,
        'author': None,
        'year': None
    }

    log = Logger('taxonomy')
    mscurs.execute('SELECT T.* FROM PilotDB.dbo.Taxonomy T INNER JOIN PilotDB.dbo.TypeTaxaLevels TTL on T.TaxaLevel = TTL.TaxaLevel ORDER BY TTL.TaxaLevelRank')
    progbar = ProgressBar(expected_rows, 50, "taxonomy")
    counter = 0
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        # ensure all taxa fields are referred to in lower case
        for key in list(msdata.keys()):
            if key.lower() in level_names and key != key.lower():
                msdata[key.lower()] = msdata[key]
                del msdata[key]

        msdata['TaxaLevel'] = msdata['TaxaLevel'].lower()

        level_name = msdata['TaxaLevel'].lower()
        org_scientific_name = sanitize_string_col('PilotDB.Taxonomy', 'Code', msdata, 'ScientificName')
        org_name = sanitize_string_col('PilotDB.Taxonomy', 'Code', msdata, level_name)

        level_index = level_names.index(level_name)
        parent_index = level_index + 1
        while parent_index < len(level_names):
            parent_level_name = level_names[parent_index]
            if msdata[parent_level_name]:
                if msdata[parent_level_name] in hierarchy[parent_level_name]:
                    parent = hierarchy[parent_level_name][msdata[parent_level_name]]
                    break
                else:
                    log.error('Failed to find organism in hierarchy called {} at level {} for code {}'.format(msdata[parent_level_name], parent_level_name, msdata['Code']))

            parent_index += 1

        data = {
            'taxonomy_id': msdata['Code'],
            'taxonomy_name': org_scientific_name,
            'level_id': get_db_id(levels, 'level_id', ['level_name'], msdata['TaxaLevel']),
            'parent_id': parent['taxonomy_id'],
            'author': sanitize_string(msdata['Author']),
            'year': int(msdata['Year']) if msdata['Year'] else None
        }

        hierarchy[level_name][org_scientific_name] = data

        # insert_row(pgcurs, 'taxa.taxonomy', data)
        counter += 1
        progbar.update(counter)

    progbar.finish()
    log_row_count(pgcurs, 'taxa.taxonomy', expected_rows)
