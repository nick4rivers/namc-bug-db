

def get_samples_by_customer_name(cursor, customer_name):
    """
    get the first sample with the specified custoemr name.
    This is used by unit tests to get manually inserted data
    """

    cursor.execute("""SELECT s.sample_id
        FROM entity.organizations o
                inner join sample.boxes b on o.entity_id = b.customer_id
                inner join sample.samples s on b.box_id = s.box_id
        where o.organization_name ilike %s
        """, [customer_name])

    return [row[0] for row in cursor.fetchall()]


def print_organisms(label, rows):

    print('-- {} --'.format(label))
    if rows is not None:
        [print('{} ({}) at level {} has count {}'.format(
            row['scientific_name'], row['taxonomy_id'], row['level_name'], row['organism_count'])) for row in rows]
