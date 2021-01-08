import os
import argparse
import psycopg2
from psycopg2.extras import execute_values
from rscommons import Logger, dotenv


def data_dictionary(pgcon):

    output_dir = os.path.join(os.path.dirname(__file__), '../docs/database')

    pgcurs = pgcon.cursor(cursor_factory=psycopg2.extras.DictCursor)
    pgcurs.execute('SELECT schema_id, schema_name FROM meta.schemas')
    schemas = {row['schema_name']: row['schema_id'] for row in pgcurs.fetchall()}

    # Key = old table name, value = list of new tables where data reside
    migrations = {}

    for schema_name, schema_id in schemas.items():

        markdown_file = os.path.join(output_dir, 'schema_{}.md'.format(schema_name))

        pgcurs.execute('SELECT diagram_url, description FROM meta.schemas WHERE schema_id = %s', [schema_id])
        row = pgcurs.fetchone()
        schema_description = row['description']
        diagram_url = row['diagram_url']

        with open(markdown_file, 'w') as f:
            f.write('---\ntitle: {} Schema\n---\n'.format(schema_name))

            if schema_description:
                f.write('\n{}\n'.format(schema_description))

            if diagram_url:
                f.write('\n![diagram]({})\n'.format(diagram_url))

            pgcurs.execute('SELECT * FROM meta.tables WHERE schema_id = %s ORDER BY table_name', [schema_id])
            for row in pgcurs.fetchall():

                # Build the table mapping information from the old databases to the new database
                source_data = row['source_data']
                if source_data:
                    old_table_names = source_data.split(',')
                    for old_table in old_table_names:
                        if old_table not in migrations:
                            migrations[old_table] = []
                        migrations[old_table].append('{}.{}'.format(schema_name, row['table_name']))

                f.write('\n# {}\n'.format(row['table_name']))

                f.write('\n|Column|Data Type|Null|Description|\n')
                f.write('|---|---|---|---|\n')
                pgcurs.execute('SELECT * FROM information_schema.columns WHERE table_schema = %s AND table_name = %s ORDER BY ordinal_position;', [schema_name, row['table_name']])
                for c in pgcurs.fetchall():

                    pk = ''
                    if c['is_identity'].lower() == 'yes':
                        pk = ' (PK)'

                    nullable = 'Y' if c['is_nullable'] == 'YES' else 'N'

                    data_type = c['data_type']
                    if data_type.lower() == 'character varying':
                        data_type = 'VarChar({})'.format(c['character_maximum_length'])
                    elif data_type.lower() == 'timestamp with time zone':
                        data_type = 'TimeStamp'

                    f.write('|{}{}|{}|{}|{}|\n'.format(c['column_name'], pk, data_type, nullable, ''))

    # Output the migrations information
    markdown_file = os.path.join(output_dir, 'data_migration.md')
    with open(markdown_file, 'w') as f:
        f.write('---\ntitle: Data Migration\n---\n')
        f.write("""\nThe table below describes where data has moved from in the old front and back end databases to the new database.
        You can search for the name of an old front or back end database table and see which tables in the new system now hold the relevant data.
        Note that some data has been split into two or more tables.\n
        """)
        f.write('\n|Old Table|New Table(s)|\n')
        f.write('|---|---|\n')

        for old_table, new_tables in migrations.items():
            new_table_markdown = []
            for t in new_tables:
                schema, table = t.split('.')
                new_table_markdown.append('[{}](schema_{}.html#{})'.format(t, schema, table))

            f.write('|{}|{}|\n'.format(old_table, ', '.join(t for t in new_table_markdown)))

    print('data dictionary complete')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('pghost', help='Postgres password', type=str)
    parser.add_argument('pgport', help='Postgres password', type=str)
    parser.add_argument('pgdb', help='Postgres password', type=str)
    parser.add_argument('pguser_name', help='Postgres user name', type=str)
    parser.add_argument('pgpassword', help='Postgres password', type=str)
    args = dotenv.parse_args_env(parser, os.path.join(os.path.dirname(os.path.realpath(__file__)), '.env'))

    # Postgres connection
    pgcon = psycopg2.connect(user=args.pguser_name, password=args.pgpassword, host=args.pghost, port=args.pgport, database=args.pgdb)
    data_dictionary(pgcon)


if __name__ == '__main__':
    main()
