create or replace function geo.fn_site_location_changed()
    returns trigger
    language plpgsql
as
$$
begin
    insert into geo.site_location_history (site_id, location)
    select old.site_id, old.location;
    return new;
end ;
$$;
CREATE TRIGGER tr_sites_location
    BEFORE UPDATE OF location
    ON geo.sites
    FOR EACH ROW
EXECUTE PROCEDURE geo.fn_site_location_changed();

create or replace function geo.fn_site_catchment_changed()
    returns trigger
    language plpgsql
as
$$
begin
    if (old.catchment is not null) then
        insert into geo.site_catchment_history (site_id, catchment)
        select old.site_id, old.catchment;
    end if;
    return new;
end;
$$;

CREATE TRIGGER tr_sites_catchment
    BEFORE UPDATE OF catchment
    ON geo.sites
    FOR EACH ROW
EXECUTE PROCEDURE geo.fn_site_catchment_changed();

drop function if exists geo.fn_model_conditions;
create or replace function geo.fn_model_conditions(p_model_id int)
    returns table
            (
                model_id     smallint,
                condition_id smallint,
                condition    numrange,
                display_text varchar(50),
                description  text
            )
    language sql
    immutable
as
$$
select model_id,
       condition_id,
       condition,
       display_text,
       description
from geo.model_conditions
where model_id = p_model_id;
$$;