/*
 This is the main query for the data table that goes along with the map.
 You can filter it using the parameters or pass them as NULL and they
 will be ignored.
 */

create or replace function sample.fn_map_data(
    filter_year INT,
    filter_state_id INT,
    filter_method_id INT,
    filter_habitat_id INT)
    RETURNS TABLE
            (
                sample_id          INT,
                site_id            INT,
                site_name          VARCHAR(50),
                sample_method_name VARCHAR(50),
                habitat_name       VARCHAR(50),
                area               REAL,
                lab_split          REAL,
                qualitative        BOOLEAN,
                mesh               SMALLINT,
                sample_date        date,
                life_stage         CHAR,
                split_count        REAL,
                latitude           DOUBLE PRECISION,
                longitude          DOUBLE PRECISION,
                state_abbreviation VARCHAR(2),
                country            VARCHAR(2),
                phylum             VARCHAR(255),
                class              VARCHAR(255),
                subclass           VARCHAR(255),
                "order"            VARCHAR(255),
                family             VARCHAR(255),
                genus              VARCHAR(255)
            )
    language plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT d.sample_id,
               d.site_id,
               d.site_name,
               d.sample_method_name,
               d.habitat_name,
               d.area,
               d.lab_split,
               d.qualitative,
               d.mesh,
               d.sample_date,
               d.life_stage,
               d.split_count,
               d.latitude,
               d.longitude,
               d.state_abbreviation,
               d.country,
               d.phylum,
               d.class,
               d.subclass,
               d."Order",
               d.family,
               d.genus
        FROM sample.vw_map_data d
        WHERE ((d.sample_year = filter_year) OR (filter_year IS NULL))
          AND ((d.state_id = filter_state_id) OR (filter_state_id IS NULL))
          AND ((d.sample_method_id = filter_method_id) OR (filter_method_id IS NULL))
          AND ((d.habitat_id = filter_habitat_id) OR (filter_habitat_id IS NULL));
end;

$$;


/*****************************************************************************************************
 Get all locations for the filtered set of samples.
 */
create or replace function sample.fn_map_sites(
    filter_xmin FLOAT,
    filter_ymin FLOAT,
    filter_xmax FLOAT,
    filter_ymax FLOAT,
    filter_year INT,
    filter_state_id INT,
    filter_method_id INT,
    filter_habitat_id INT)
    RETURNS TABLE
            (
                site_id      INT,
                site_name    VARCHAR(50),
                latitude     DOUBLE PRECISION,
                longitude    DOUBLE PRECISION,
                record_count BIGINT
            )
    language plpgsql
AS
$$
begin
    RETURN QUERY
        SELECT d.site_id,
               d.site_name,
               d.latitude,
               d.longitude,
               count(*) record_count
        FROM sample.vw_map_data d
        WHERE (st_contains(st_makeenvelope(filter_xmin, filter_ymin, filter_xmax, filter_ymax, 4326), d.location))
          AND ((d.sample_year = filter_year) OR (filter_year IS NULL))
          AND ((d.state_id = filter_state_id) OR (filter_state_id IS NULL))
          AND ((d.sample_method_id = filter_method_id) OR (filter_method_id IS NULL))
          AND ((d.habitat_id = filter_habitat_id) OR (filter_habitat_id IS NULL))
        GROUP BY d.site_id, d.site_name, d.latitude, d.longitude;
end;
$$;


/*****************************************************************************************************
 Get a list of US states that have samples for the given parameters
 as well as the number of samples in each state. Pass NULL for parameters
 you don't need and they will be ignored.
 */
create or replace function sample.fn_map_states(
    filter_year INT,
    filter_method_id INT,
    filter_habitat_id INT)
    RETURNS TABLE
            (
                state_name   VARCHAR(50),
                abbreviation VARCHAR(2),
                record_count BIGINT
            )
    language plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT d.state_name, d.state_abbreviation, count(*)
        FROM sample.vw_map_data d
        WHERE ((d.sample_year = filter_year) OR (filter_year IS NULL))
          AND ((d.sample_method_id = filter_method_id) OR (filter_method_id IS NULL))
          AND ((d.habitat_id = filter_habitat_id) OR (filter_habitat_id IS NULL))
        group by d.state_name, d.state_abbreviation;
end;

$$;

/*****************************************************************************************************
 Get a list of all years for which there are samples given the parameters
 as well as the number of samples in each year. Pass NULL for parameters
 you don't need and they will be ignored.
 */
create or replace function sample.fn_map_years(
    filter_state_id INT,
    filter_method_id INT,
    filter_habitat_id INT)
    RETURNS TABLE
            (
                sample_year  INT,
                record_count BIGINT
            )
    language plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT CAST(d.sample_year AS INT), count(*) record_count
        FROM sample.vw_map_data d
        WHERE ((d.state_id = filter_state_id) OR (filter_state_id IS NULL))
          AND ((d.sample_method_id = filter_method_id) OR (filter_method_id IS NULL))
          AND ((d.habitat_id = filter_habitat_id) OR (filter_habitat_id IS NULL))
        GROUP BY d.sample_year;
end;

$$;

/*****************************************************************************************************
 Get a list of all sample methods for which there are samples given the parameters
 as well as the number of samples for each method. Pass NULL for parameters
 you don't need and they will be ignored.
 */
create or replace function sample.fn_map_methods(
    filter_year INT,
    filter_state_id INT,
    filter_habitat_id INT)
    RETURNS TABLE
            (
                method       VARCHAR(50),
                record_count BIGINT
            )
    language plpgsql
AS
$$
begin
    RETURN QUERY
        SELECT d.sample_method_name, COUNT(*) record_count
        FROM sample.vw_map_data d
        WHERE ((d.sample_year = filter_year) OR (filter_year IS NULL))
          AND ((d.state_id = filter_state_id) OR (filter_state_id IS NULL))
          AND ((d.habitat_id = filter_habitat_id) OR (filter_habitat_id IS NULL))
        GROUP BY d.sample_method_name;
end;
$$;

/*****************************************************************************************************
 Get a list of all sample methods for which there are samples given the parameters
 as well as the number of samples for each method. Pass NULL for parameters
 you don't need and they will be ignored.
 */
create or replace function sample.fn_map_habitats(
    filter_year INT,
    filter_state_id INT,
    filter_method_id INT)
    RETURNS TABLE
            (
                method       VARCHAR(50),
                record_count BIGINT
            )
    language plpgsql
AS
$$
begin
    RETURN QUERY
        SELECT d.habitat_name, COUNT(*) record_count
        FROM sample.vw_map_data d
        WHERE ((d.sample_year = filter_year) OR (filter_year IS NULL))
          AND ((d.state_id = filter_state_id) OR (filter_state_id IS NULL))
          AND ((d.sample_method_id = filter_method_id) OR (filter_method_id IS NULL))
        GROUP BY d.habitat_name;
end;
$$;


