import pyodbc
from lib.logger import Logger
from lib.progress_bar import ProgressBar
from utilities import sanitize_string_col, log_record_count, add_metadata, sanitize_string, reset_sequence
from postgres_lookup_data import lookup_data, insert_row, log_row_count, process_table, process_query


def migrate(mscurs, pgcurs):

    existing_taxa = lookup_data(pgcurs, 'taxa.taxonomy', 'taxonomy_id')

    # process_table(mscurs, pgcurs, 'PilotDB.taxa.taxonomy', 'taxa.taxonomy', taxonomy_callback, None)
    process_table(mscurs, pgcurs, 'PilotDB.taxa.synonym', 'taxa.synonyms', synonym_callback, existing_taxa)
    # process_table(mscurs, pgcurs, 'PilotDB.taxa.type_attribute', 'taxa.attributes', attributes_callback, None)
    process_query(mscurs, pgcurs,
                  'SELECT a.* FROM PilotDB.taxa.attributes a INNER JOIN PilotDB.taxa.taxonomy t ON a.code = t.code',
                  'taxa.taxa_attributes', taxa_attributes_callback, existing_taxa)

    reset_sequence(pgcurs, 'taxa.taxonomy', 'taxonomy_id')
    reset_sequence(pgcurs, 'taxa.attributes', 'attribute_id')
    # reset_sequence(pgcurs, 'taxa.taxa_attributes', 'attribute_id')


def taxonomy_callback(msdata, lookup):

    return {
        'taxonomy_id': msdata['code'],
        'parent_id': msdata['parent_code'],
        'level_id': msdata['taxa_level_id'],
        'scientific_name': sanitize_string_col('taxonomy', 'code', msdata, 'scientific_name'),
        'author': None,
        'year': None
    }


def synonym_callback(msdata, lookup):

    # ignore synonyms for missing taxa
    if msdata['code'] not in lookup:
        log = Logger('synonyms')
        log.warning('Skipping synonym')
        return None

    return {
        'taxonomy_id': msdata['code'],
        'synonym': sanitize_string_col('synonym', 'code', msdata, 'synonym')
    }


def attributes_callback(msdata, lookup):

    name = sanitize_string_col('attribute', 'attribute_id', msdata, 'attribute')
    attribute_type = 'Unknown'
    label = sanitize_string_col('attribute', 'attribute_id', msdata, 'label')
    desc = sanitize_string_col('attribute', 'attribute_id', msdata, 'description')

    if label and label.lower() == name.lower():
        label = None

    if desc and desc.lower() == name.lower():
        desc = None

    metadata = {}
    add_metadata(metadata, 'range_low', msdata['range_low'])
    add_metadata(metadata, 'range_high', msdata['range_high'])
    add_metadata(metadata, 'allowable_values', msdata['allowable_values'])

    return {
        'attribute_id': msdata['attribute_id'],
        'attribute_name': name,
        'label': label,
        'description': desc,
        'attribute_type': attribute_type,
        'metadata': metadata
    }


def taxa_attributes_callback(msdata, lookup):

    # ignore synonyms for missing taxa
    if msdata['Code'] not in lookup:
        log = Logger('tax atts')
        log.warning('Skipping taxonomy')
        return None

    return {
        'taxonomy_id': msdata['Code'],
        'attribute_id': msdata['Attribute_id'],
        'attribute_value': sanitize_string(msdata['Attribute_Value'])
    }
