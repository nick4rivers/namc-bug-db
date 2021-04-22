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
as
$$
select p_taxonomy_id,
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