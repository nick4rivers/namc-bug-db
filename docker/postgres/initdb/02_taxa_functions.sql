drop function if exists taxa.fn_attributes;
create or replace function taxa.fn_attributes(p_limit int, p_offset int)
    returns table
            (
                attribute_id   smallint,
                attribute_name varchar(255),
                attribute_type attribute_types,
                label          varchar(255),
                description    text,
                metadata       text,
                created_date   text,
                updated_date   text
            )
    language sql
    immutable
as
$$
select attribute_id,
       attribute_name,
       attribute_type,
       label,
       description,
       CAST(metadata AS TEXT),
       to_json(created_date) #>> '{}',
       to_json(updated_date) #>> '{}'
from taxa.attributes
order by attribute_id
limit p_limit offset p_offset;
$$;

drop function if exists taxa.fn_taxa_attributes;
create or replace function taxa.fn_taxa_attributes(p_taxonomy_id int, p_limit int, p_offset int)
    returns table
            (
                taxonomy_id     smallint,
                scientific_name varchar(255),
                level_id        smallint,
                level_name      varchar(50),
                attribute_name  varchar(255),
                attribute_type  attribute_types,
                label           varchar(255),
                attribute_value varchar(100)
            )
    language sql
    immutable
as
$$
select t.taxonomy_id,
       t.scientific_name,
       t.level_id,
       l.level_name,
       a.attribute_name,
       a.attribute_type,
       a.label,
       ta.attribute_value
from (
         select ta.taxonomy_id, ta.attribute_id, ta.attribute_value
         from taxa.taxa_attributes ta
         where taxonomy_id = p_taxonomy_id
         order by ta.attribute_id
         limit p_limit offset p_offset
     ) ta
         inner join taxa.taxonomy t on ta.taxonomy_id = t.taxonomy_id
         inner join taxa.taxa_levels l on t.level_id = l.level_id
         inner join taxa.attributes a on ta.attribute_id = a.attribute_id;
$$;


drop function if exists taxa.fn_translation_taxa;
create or replace function taxa.fn_translation_taxa(p_translation_id int, p_taxonomy_id int)
    returns table
            (
                taxonomy_id                 smallint,
                translation_taxonomy_id     smallint,
                translation_scientific_name varchar(255),
                translation_level_id        smallint,
                translation_level_name      varchar(50)
            )
    language plpgsql
    immutable
as
$$
begin
    return query
        /*
         1. Get the taxonomic hierarchy for the original taxa
         2. Join this hierarchy with the taxa in the translation
         3. Select the first item up the hierarchy (ensuring sorted lowest to highest
         */
        SELECT cast(p_taxonomy_id as smallint),
               tt.taxonomy_id,
               coalesce(tt.alias, t.scientific_name),
               l.level_id,
               l.level_name
        FROM taxa.fn_tree(cast(p_taxonomy_id as smallint)) t
                 inner join taxa.taxa_levels l on t.level_id = l.level_id
                 inner join taxa.translation_taxa tt on t.taxonomy_id = tt.taxonomy_id
        where tt.translation_id = p_translation_id
        order by l.rank_order desc
        limit 1;
end
$$;
comment on function taxa.fn_translation_taxa is
    'Function to retrieve the taxonomy ID of a taxa according to a specific translation.
    The result could be the same taxonomy ID that was passed in or one higher up in the taxonomic
    hierarchy.';


DROP FUNCTION IF EXISTS taxa.fn_tree;

CREATE OR REPLACE FUNCTION taxa.fn_tree(taxa_id smallint)
    returns table
            (
                taxonomy_id     SMALLINT,
                scientific_name VARCHAR(255),
                level_id        SMALLINT,
                level_name      VARCHAR(50),
                parent_id       SMALLINT
            )
    language plpgsql
    immutable
    returns null on null input
as
$$
begin
    RETURN QUERY
        WITH RECURSIVE taxa_tree AS (
            SELECT t.taxonomy_id,
                   t.scientific_name,
                   l.level_id,
                   l.level_name,
                   t.parent_id
            FROM taxa.taxonomy t
                     INNER JOIN taxa.taxa_levels l ON t.level_id = l.level_id
            WHERE t.taxonomy_id = taxa_id
            UNION
            SELECT t.taxonomy_id,
                   t.scientific_name,
                   t.level_id,
                   tl.level_name,
                   t.parent_id
            FROM taxa.taxonomy t
                     INNER JOIN taxa.taxa_levels tl on t.level_id = tl.level_id
                     INNER JOIN taxa_tree tt ON t.taxonomy_id = tt.parent_id
        )
        SELECT taxa_tree.taxonomy_id,
               taxa_tree.scientific_name,
               taxa_tree.level_id,
               taxa_tree.level_name,
               taxa_tree.parent_id
        FROM taxa_tree;
end
$$;

drop function if exists taxa.fn_is_descended_from;
create or replace function taxa.fn_is_descended_from(p_taxonomy_id int, p_parent_taxonomy_id int)
    returns boolean
    immutable
    returns null on null input
    language sql
as
$$
select count(*) > 0
from taxa.fn_tree(p_taxonomy_id)
where taxonomy_id = p_parent_taxonomy_id;
$$;
comment on function taxa.fn_is_descended_from is
'Returns true if the taxa (argument 1) is a descdendant of the parent taxa (argument 2).
Descendant means that the taxa is at the same or lower level of the taxonomic hierarchy
as the parent';