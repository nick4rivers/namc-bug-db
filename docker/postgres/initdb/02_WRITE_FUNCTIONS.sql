DROP FUNCTION IF EXISTS sample.fn_set_site_catchment;
CREATE OR REPLACE FUNCTION sample.fn_set_site_catchment(p_site_ID INT, p_catchment JSON) RETURNS INT
    language plpgsql
AS
$$
DECLARE
    catch_geom       GEOMETRY(MultiPolygon, 4326);
    catch_country_id smallint;
    rows_affected    int;
BEGIN

    if (p_catchment IS NULL) then
        raise exception 'The site catchment cannot be NULL. Use the clear catchment dedicated method to erase the catchment for a site.';
    end if;

    catch_geom := st_multi(st_geomfromgeojson(p_catchment));

    if (NOT st_isvalid(catch_geom)) then
        raise exception 'The site catchment geometry is invalid.';
    end if;

    if (st_isempty(catch_geom)) then
        raise exception 'The site catchment geometry is empty';
    end if;

    if (st_area(catch_geom) <= 0) then
        raise exception 'The site catchment polygon cannot have zero area.';
    end if;

    SELECT country_id INTO catch_country_id FROM geo.countries WHERE st_intersects(geom, catch_geom) limit 1;
    if (catch_country_id IS NULL or catch_country_id <> 231) then
        raise exception 'The catchment does not intersect the United States.';
    end if;

    UPDATE geo.sites set catchment = catch_geom where site_id = p_site_ID;
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    return rows_affected;
END
$$;

CREATE OR REPLACE FUNCTION sample.fn_set_site_predictor_value(p_site_ID INT, p_predictor_id INT, p_value varchar(255)) RETURNS INT
    language plpgsql
AS
$$
DECLARE
    rows_affected INT;
BEGIN
    INSERT INTO geo.site_predictors (site_id, predictor_id, predictor_value)
    VALUES (p_site_ID, p_predictor_id, p_value)
    ON CONFLICT ON CONSTRAINT pk_site_predictors DO UPDATE SET predictor_value = p_value;

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    return rows_affected;
END
$$;

CREATE OR REPLACE FUNCTION sample.fn_set_sample_predictor_value(p_sample_id INT, p_predictor_id INT, p_value varchar(255)) RETURNS INT
    language plpgsql
AS
$$
DECLARE
    rows_affected INT;
BEGIN
    INSERT INTO sample.sample_predictors (sample_id, predictor_id, predictor_value)
    VALUES (p_sample_id, p_predictor_id, p_value)
    ON CONFLICT ON CONSTRAINT pk_sample_predictors DO UPDATE SET predictor_value = p_value;

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    return rows_affected;
END
$$;

/******************************************************************************************************************************
  PROJECT creation functions
 */
drop function if exists sample.fn_create_project(varchar(255), boolean, smallint, text, json);
create or replace function sample.fn_create_project(p_project_name varchar(255), p_is_private bool,
                                                    p_contact_id smallint, p_description text, p_metadata json)
    returns int
    language sql
as
$$
insert into sample.projects (project_name, is_private, contact_id, description, metadata)
values (p_project_name, p_is_private, p_contact_id, p_description, p_metadata)
returning project_id;
$$;

drop function if exists sample.add_project_samples;
CREATE or replace function sample.add_project_samples(p_project_id int, p_sample_ids int[])
    returns int
    language sql
as
$$
insert into sample.project_samples(project_id, sample_id)
select p_project_id, sample_id
from sample.samples
where sample_id = any (p_sample_ids)
ON CONFLICT ON CONSTRAINT pk_project_samples
    DO NOTHING;

    -- return the new number of samples in the project
select count(*)
from sample.project_samples
where project_id = p_project_id;
$$;

create or replace function sample.add_project_boxes(p_project_id int, p_box_ids int[])
    returns int
    language sql
as
$$
insert into sample.project_samples(project_id, sample_id)
select p_project_id, sample_id
from sample.samples
where box_id = any (p_box_ids)
ON CONFLICT ON CONSTRAINT pk_project_samples
    DO NOTHING;

    -- return the new number of samples in the project
select count(*)
from sample.project_samples
where project_id = p_project_id;
$$;

create or replace function sample.remove_project_samples(p_project_id int, p_sample_ids int[])
    returns int
    language sql
as
$$
delete
from sample.project_samples
where (project_id = p_project_id)
  AND (sample_id = any (p_sample_ids));

-- return the new number of samples in the project
select count(*)
from sample.project_samples
where project_id = p_project_id;
$$;

create or replace function sample.delete_project(p_project_id int)
    returns void
    language sql
as
$$
delete
from sample.projects
where project_id = p_project_id;
$$;
