create or replace function fn_site_location_changed()
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

create or replace function fn_site_catchment_changed()
    returns trigger
    language plpgsql
as
$$
begin
    if (old.catchment is not null) then
        insert into geo.site_catchment_history (site_id, catchment)
        select old.site_id, old.catchment;
    end if;
end;
$$;

drop function if exists geo.fn_model_thresholds;
create or replace function geo.fn_model_thresholds(p_model_id int)
    returns table
            (
                model_id     smallint,
                threshold_id smallint,
                threshold    numrange,
                display_text varchar(50),
                description  text
            )
    language sql
as
$$
select model_id,
       threshold_id,
       threshold,
       display_text,
       description
from geo.model_thresholds
where model_id = p_model_id;
$$;