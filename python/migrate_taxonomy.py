import pyodbc
from rscommons import Logger, ProgressBar
from utilities import sanitize_string_col, write_sql_file, log_record_count, add_metadata


def migrate_taxonomy(mscon, output_path):

    row_count = log_record_count(mscon, 'PilotDB.taxa.Taxonomy')

    progbar = ProgressBar(row_count, 50, "Taxa")
    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.taxa.Taxonomy")
    taxa = []
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        if msdata['code'] in taxa:
            raise Exception('duplicate code {} in raw data'.format(msdata['code']))

        taxa.append({
            'taxonomy_id': msdata['code'],
            'parent_id': msdata['parent_code'],
            'level_id': msdata['taxa_level_id'],
            'scientific_name': sanitize_string_col('taxaonomy', 'code', msdata, 'scientific_name'),
            'author': None,
            'year': None
        })
        progbar.update(len(taxa))

    progbar.finish()

    write_sql_file(output_path, 'taxa.taxonomy', taxa)


def migrate_attributes(mscon, output_path):

    row_count = log_record_count(mscon, 'PilotDB.taxa.type_attribute')

    progbar = ProgressBar(row_count, 50, "Attributes")
    mscurs = mscon.cursor()
    mscurs.execute("SELECT * FROM PilotDB.taxa.type_attribute")
    atts = {}
    for msrow in mscurs.fetchall():
        msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

        if msdata['attribute_id'] in atts:
            raise Exception('duplicate attribute ID {} in raw data'.format(msdata['attribute_id']))

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

        atts[msdata['attribute_id']] = {
            'attribute_id': msdata['attribute_id'],
            'attribute_name': name,
            'label': label,
            'description': desc,
            'attribute_type': attribute_type,
            'metadata': metadata
        }

        progbar.update(len(atts))

    progbar.finish()

    write_sql_file(output_path, 'taxa.attributes', atts.values())
