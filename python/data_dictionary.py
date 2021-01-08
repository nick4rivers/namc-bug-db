import os
import argparse
import psycopg2
from psycopg2.extras import execute_values
from rscommons import Logger, dotenv


def data_dictionary(pgcon):

    pgcurs = pgcon.cursor(cursor_factory=psycopg2.extras.DictCursor)
    pgcurs.execute('SELECT schema_id, schema_name FROM meta.schemas')
    schemas = {row['schema_name']: row['schema_id'] for row in pgcurs.fetchall()}

    for schema_name, schema_id in schemas.items():

        markdown_file = os.path.join(os.path.dirname(__file__), '../docs/database', 'schema_{}.md'.format(schema_name))

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
