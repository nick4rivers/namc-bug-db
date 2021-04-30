import pyodbc
from lib.logger import Logger
from lib.progress_bar import ProgressBar
from utilities import sanitize_string_col, log_record_count, reset_sequence
from lookup_data import get_db_id
from postgres_lookup_data import lookup_data, insert_many_rows, log_row_count, process_query

# Key = PilotDB, value = new database
translation_alias = {
    'OTUCodeEcoaTIN': 'OTUCodeEcoaTI'
}


def migrate(mscurs, pgcurs):

    # Get the list of translations (OTU) in the new database
    translations = lookup_data(pgcurs, 'taxa.translations', 'translation_name')
    process_query(mscurs, pgcurs, 'SELECT OTUName, OTUCode FROM PilotDB.dbo.BugOTU_pivot WHERE OTUCode IS NOT NULL GROUP BY OTUName, OTUCode', 'taxa.translation_taxa', taxa_translations_callback, translations)


def taxa_translations_callback(msdata, lookup):

    translation_name = msdata['OTUName']
    if translation_name in translation_alias:
        translation_name = translation_alias[translation_name]

    return {
        'translation_id': get_db_id(lookup, 'translation_id', ['translation_name'], translation_name, True),
        'taxonomy_id': msdata['OTUCode']
    }


# def migrate(mscurs, pgcurs):

#     # Get the list of translations (OTU) in the new database
#     translations = lookup_data(pgcurs, 'taxa.translations', 'translation_name')

#     log = Logger('Translation Taxa')
#     log.info('Migrating translation taxa')

#     taxa = []
#     mscurs.execute('SELECT OTUName, OTUCode FROM PilotDB.dbo.BugOTU_pivot WHERE OTUCode IS NOT NULL GROUP BY OTUName, OTUCode')
#     for msrow in mscurs.fetchall():
#         msdata = dict(zip([t[0] for t in msrow.cursor_description], msrow))

#         translation_name = msdata['OTUName']
#         if translation_name in translation_alias:
#             translation_name = translation_alias[translation_name]

#         taxa.append((
#             get_db_id(translations, 'translation_id', ['translation_name'], translation_name, True),
#             msdata['OTUCode']
#         ))

#     insert_many_rows(pgcurs, 'taxa.taxa_translations', ['translation_id', 'taxonomy_id'], taxa)
#     log_row_count(pgcurs, 'taxa.taxa_translations', )

#     reset_sequence(pgcurs, 'taxa.taxa_translations', 'taxonomy_id')
