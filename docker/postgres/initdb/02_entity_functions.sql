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