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