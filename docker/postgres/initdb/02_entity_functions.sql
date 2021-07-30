-- returns the argument entity as well as all child entities
-- so if you pass in the id of the blm, you get all child entities for the blm as well.
-- note this is virtually identical query to taxa.fn_tree except that it looks
-- recursively down through the hierarchy for child organizations instead of
-- upwards for parent taxa.
drop function if exists entity.fn_tree;
create or replace function entity.fn_tree(p_entity_id int)
    returns table
            (
                entity_id         smallint,
                organization_name varchar,
                abbreviation      varchar,
                parent_id         smallint
            )
    language sql
    immutable
    returns null on null input
as
$$
with recursive entity_tree as (
    select e.entity_id,
           o.organization_name,
           o.abbreviation,
           e.parent_id
    from entity.entities e
             inner join entity.organizations o on e.entity_id = o.entity_id
    where e.entity_id = p_entity_id
    union
    select e.entity_id,
           o.organization_name,
           o.abbreviation,
           e.parent_id
    from entity.entities e
             inner join entity.organizations o on e.entity_id = o.entity_id
             inner join entity_tree et on e.parent_id = et.entity_id
)
select entity_tree.entity_id,
       entity_tree.organization_name,
       entity_tree.abbreviation,
       entity_tree.parent_id
from entity_tree;
$$;

drop function if exists entity.fn_organizations;
create or replace function entity.gn_organizations(p_limit int, p_offset int, p_search_term text = null)
    returns table
            (
                entity_id         smallint,
                organization_name varchar,
                organization_type varchar,
                is_lab            bool,
                address1          varchar,
                address2          varchar,
                city              varchar,
                us_state          varchar,
                country           varchar,
                zip_code          varchar,
                phone             varchar,
                fax               varchar,
                website           varchar,
                notes             text,
                metadata          text,
                created_date      text,
                updated_date      text
            )
    immutable
    language sql
as
$$
select e.entity_id,
       o.organization_name,
       t.organization_type_name,
       o.is_lab,
       e.address1,
       e.address2,
       e.city,
       s.state_name,
       e.country_id,
       e.zip_code,
       e.phone,
       e.fax,
       e.website,
       e.notes,
       e.metadata,
       e.created_date,
       e.updated_date
from (
         select *
         from entity.organizations
         where ((organization_name ilike p_search_term) or (p_search_term is null))
         order by entity_id
         limit p_limit offset p_offset
     ) o
         inner join entity.entities e on o.entity_id = e.entity_id
         inner join entity.organization_types t on o.organization_type_id = t.organization_type_id
         inner join geo.counties c on e.country_id = c.county_id
         left join geo.states s on e.state_id = s.state_id
$$;