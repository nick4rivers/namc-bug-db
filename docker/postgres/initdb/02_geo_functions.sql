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

drop function if exists geo.fn_predictors;
CREATE OR REPLACE FUNCTION geo.fn_predictors(p_limit INT, p_offset INT, p_model_id INT = NULL)
    returns table
            (
                predictor_id        SMALLINT,
                predictor_name      VARCHAR(255),
                abbreviation        VARCHAR(25),
                description         TEXT,
                source              TEXT,
                units               VARCHAR(20),
                calculation_script  varchar(255),
                predictor_type_id   SMALLINT,
                predictor_type_name VARCHAR(255),
                is_temporal         BOOLEAN,
                updated_date        text,
                created_date        text,
                model_count         BIGINT
            )
    language plpgsql
    immutable
AS
$$
begin
    RETURN QUERY
        SELECT p.predictor_id,
               p.predictor_name,
               p.abbreviation,
               p.description,
               p.source,
               u.abbreviation as     units,
               p.calculation_script,
               p.predictor_type_id,
               t.predictor_type_name,
               p.is_temporal,
               to_json(p.updated_date) #>> '{}',
               to_json(p.created_date) #>> '{}',
               count(m.predictor_id) model_count
        FROM geo.predictors p
                 inner join geo.predictor_types t On p.predictor_type_id = t.predictor_type_id
                 inner join geo.units u on p.unit_id = u.unit_id
                 left join geo.model_predictors m on p.predictor_id = m.predictor_id
        where ((m.model_id = p_model_id) OR (p_model_id is NULL))
        group by p.predictor_id,
                 p.predictor_name,
                 p.abbreviation,
                 p.description,
                 units,
                 p.calculation_script,
                 p.predictor_type_id,
                 t.predictor_type_name,
                 p.updated_date,
                 p.created_date
        ORDER BY p.predictor_id
        limit p_limit offset p_offset;
end
$$;

CREATE OR REPLACE FUNCTION geo.fn_models(p_limit INT, p_offset INT, p_is_active BOOLEAN = TRUE)
    returns table
            (
                model_id        SMALLINT,
                model_name      VARCHAR(255),
                abbreviation    VARCHAR(50),
                is_active       BOOLEAN,
                description     TEXT,
                predictor_count BIGINT
            )
    language plpgsql
    immutable
AS
$$
begin
    RETURN QUERY
        SELECT m.model_id,
               m.model_name,
               m.abbreviation,
               m.is_active,
               m.description,
               count(p.model_id) predictor_count
        FROM geo.models m
                 left join geo.model_predictors p ON m.model_id = p.model_id
        group by m.model_id, m.model_name, m.abbreviation, m.is_active, m.description
        order by m.model_id
        limit p_limit offset p_offset;
end
$$;

drop function if exists geo.fn_site_predictor_values;
CREATE OR REPLACE FUNCTION geo.fn_site_predictor_values(p_limit INT, p_offset INT = NULL, p_site_id INT = NULL)
    returns table
            (
                predictor_id       SMALLINT,
                predictor_name     VARCHAR(255),
                abbreviation       VARCHAR(25),
                description        TEXT,
                predictor_type     VARCHAR(255),
                predictor_value    varchar(255),
                created_date       text,
                updated_date       text,
                calculation_script VARCHAR(255)
            )
    language plpgsql
    immutable
AS
$$
begin
    RETURN QUERY
        SELECT sp.predictor_id,
               p.predictor_name,
               p.abbreviation,
               p.description,
               pt.predictor_type_name,
               sp.predictor_value,
               to_json(sp.created_date) #>> '{}',
               to_json(sp.updated_date) #>> '{}',
               p.calculation_script
        FROM geo.site_predictors sp
                 inner join geo.predictors p on sp.predictor_id = p.predictor_id
                 inner join geo.predictor_types pt on p.predictor_type_id = pt.predictor_type_id
                 inner join geo.units u on p.unit_id = u.unit_id
        WHERE sp.site_id = p_site_id
        ORDER BY sp.predictor_id
        LIMIT p_limit OFFSET p_offset;
end
$$;