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
    returns smallint
    language sql
as
$$
insert into sample.projects (project_name, is_private, contact_id, description, metadata)
values (p_project_name, p_is_private, p_contact_id, p_description, p_metadata)
returning project_id;
$$;

drop function if exists sample.add_project_samples;
CREATE or replace function sample.add_project_samples(p_project_id int, p_sample_ids int[])
    returns bigint
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
    returns bigint
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
    returns bigint
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

/******************************************************************************************************************************
  Translation Functions
 */

create or replace function taxa.fn_create_translation(p_translation_name text, p_description text)
    returns smallint
    language sql
as
$$
insert into taxa.translations (translation_name, description)
values (p_translation_name, p_description)
returning translation_id;
$$;

create or replace function taxa.fn_set_translation_taxa(p_translation_id int, p_taxonomy_id int, p_alias text,
                                                        p_is_final boolean)
    returns bigint
    language plpgsql
as
$$
declare
    rows_affected       bigint;
    declare clean_alias text;
begin
    select case
               when p_alias is null then null
               when length(p_alias) < 1 then NULL
               else p_alias end
    into clean_alias;

    insert into taxa.translation_taxa (translation_id, taxonomy_id, alias, is_final)
    values (p_translation_id, p_taxonomy_id, clean_alias, p_is_final)
    on conflict on constraint pk_translation_taxa do update set alias    =clean_alias,
                                                                is_final = p_is_final;
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    return rows_affected;
end
$$;

create or replace function taxa.fn_delete_translation_taxa(p_translation_id int, p_taxonomy_id int)
    returns bigint
    language plpgsql
as
$$
declare
    rows_affected bigint;
begin
    delete from taxa.translation_taxa where (translation_id = p_translation_id) and (taxonomy_id = p_taxonomy_id);

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    return rows_affected;
end
$$;

create or replace function taxa.fn_set_taxonomy(p_taxonomy_id int,
                                                p_scientific_name varchar,
                                                p_level_id int,
                                                p_parent_id int,
                                                p_author varchar,
                                                p_year int,
                                                p_notes text,
                                                p_metadata json)
    returns bigint
    language plpgsql
as
$$
declare
    rows_affected bigint;
begin
    update taxa.taxonomy
    set scientific_name = p_scientific_name,
        level_id        = p_level_id,
        parent_id       = p_parent_id,
        author          = p_author,
        year            = p_year,
        notes           = p_notes,
        metadata        = p_metadata
    where taxonomy_id = p_taxonomy_id;

    -- Get the number of rows affected BEFORE refreshing materialized view
    get diagnostics rows_affected = row_count;

    -- Need to refresh the taxonomy materialized view
    refresh materialized view taxa.vw_taxonomy_crosstab;

    return rows_affected;
end
$$;