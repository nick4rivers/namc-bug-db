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

create type site_info as
(
    site_id             INT,
    site_name           VARCHAR(50),
    system              VARCHAR(50),
    ecosystem           VARCHAR(50),
    longitude           DOUBLE PRECISION,
    latitude            DOUBLE PRECISION,
    us_state            VARCHAR(2),
    waterbody_type_name VARCHAR(255),
    waterbody_code      VARCHAR(100),
    waterbody_name      VARCHAR(255),
    created_date        text,
    updated_date        text,
    has_catchment       BOOLEAN
);

drop function if exists geo.fn_site_info;
CREATE OR REPLACE FUNCTION geo.fn_site_info(p_site_id INT)
    RETURNS TABLE
            (
                site_id           INT,
                site_name         VARCHAR(50),
                system            VARCHAR(20),
                ecosystem         VARCHAR(10),
                location          TEXT,
                longitude         DOUBLE PRECISION,
                latitude          DOUBLE PRECISION,
                us_state          VARCHAR(2),
                waterbody_type    VARCHAR(255),
                waterbody_code    VARCHAR(100),
                waterbody_name    VARCHAR(255),
                sample_count      BIGINT,
                geography_changed text,
                created_date      text,
                updated_date      text,
                catchment         TEXT
            )
    language plpgsql
    immutable
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.site_id,
               s.site_name,
               sy.system_name             as system,
               e.ecosystem_name           as ecosystem,
               ST_AsGeoJSON(s.location)   AS location,
               st_x(s.location::geometry) AS longitude,
               st_y(s.location::geometry) AS latitude,
               st.abbreviation               us_state,
               w.waterbody_type_name,
               s.waterbody_code,
               s.waterbody_name,
               ss.sample_count,
               to_json(s.geography_changed) #>> '{}',
               to_json(s.created_date) #>> '{}',
               to_json(s.updated_date) #>> '{}',
               ST_AsGeoJSON(s.catchment)  AS catchment
        FROM geo.sites s
                 LEFT JOIN geo.states st ON st_covers(st.geom, s.location)
                 LEFT JOIN geo.systems sy ON s.system_id = sy.system_id
                 LEFT JOIN geo.ecosystems e ON sy.ecosystem_id = e.ecosystem_id
                 LEFT JOIN geo.waterbody_types w ON s.waterbody_type_id = w.waterbody_type_id
                 LEFT JOIN (
            select sc.site_id, count(*) sample_count from sample.samples sc group by sc.site_id
        ) ss ON s.site_id = ss.site_id
        WHERE s.site_id = p_site_id;
end
$$;

drop function if exists geo.fn_sites;
create or replace function geo.fn_sites(p_limit int, p_offset int, p_site_ids int[])
    returns setof site_info
    language sql
    immutable
as
$$

select s.site_id,
       s.site_name,
       sy.system_name,
       e.ecosystem_name,
       st_x(s.location::geometry),
       st_y(s.location::geometry),
       st.abbreviation,
       w.waterbody_type_name,
       s.waterbody_code,
       s.waterbody_name,
       to_json(s.created_date) #>> '{}',
       to_json(s.updated_date) #>> '{}',
       s.catchment is not null
from (
         select site_id
         from unnest(p_site_ids) sa(site_id)
         order by site_id
         limit p_limit offset p_offset
     ) sa
         inner join geo.sites s on s.site_id = sa.site_id
         inner join geo.states st on st_covers(st.geom, s.location)
         left join geo.systems sy on s.system_id = sy.system_id
         left join geo.ecosystems e on e.ecosystem_id = sy.ecosystem_id
         left join geo.waterbody_types w on s.waterbody_type_id = w.waterbody_type_id;
$$;

create or replace function geo.fn_box_sites(p_limit int, p_offset int, p_box_ids int[])
    returns setof site_info
    language sql
    immutable
as
$$
with filtered_sites as
         (
             select array_agg(site_id) site_ids
             from (
                      select site_id
                      from unnest(p_box_ids) b(box_id)
                               inner join sample.samples s on b.box_id = s.box_id
                      group by site_id
                      order by site_id
                      limit p_limit offset p_offset
                  ) arr_sites
         )
select s.*
from filtered_sites fs
         inner join geo.fn_sites(p_limit, p_offset, fs.site_ids) s on true;
$$;

drop function if exists geo.fn_project_sites;
create or replace function geo.fn_project_sites(p_limit int, p_offset int, p_project_ids int[])
    returns setof site_info
    language sql
    immutable
as
$$
with filtered_sites as
         (
             select array_agg(site_id) site_ids
             from (
                      select site_id
                      from unnest(p_project_ids) p(project_id)
                               inner join sample.project_samples s on p.project_id = s.project_id
                               inner join sample.samples ss on s.sample_id = ss.sample_id
                      group by site_id
                      order by site_id
                      limit p_limit offset p_offset
                  ) arr_sites
         )
select s.*
from filtered_sites fs
         inner join geo.fn_sites(p_limit, p_offset, fs.site_ids) s on true;
$$;


drop function if exists geo.fn_sample_sites;
create or replace function geo.fn_sample_sites(p_limit int, p_offset int, p_sample_ids int[])
    returns setof site_info
    language sql
    immutable
as
$$
with filtered_sites as
         (
             select array_agg(site_id) site_ids
             from (
                      select site_id
                      from unnest(p_sample_ids) s(sample_id)
                               inner join sample.samples ss on s.sample_id = ss.sample_id
                      group by site_id
                      order by site_id
                      limit p_limit offset p_offset
                  ) arr_sites
         )
select s.*
from filtered_sites fs
         inner join geo.fn_sites(p_limit, p_offset, fs.site_ids) s on true;
$$;


drop function if exists geo.fn_entity_sites;
create or replace function geo.fn_entity_sites(p_limit int, p_offset int, p_entity_ids int[])
    returns setof site_info
    language sql
    immutable
as
$$
with filtered_sites as
         (
             select array_agg(site_id) site_ids
             from (
                      select site_id
                      from (
                               select et.entity_id
                               from unnest(p_entity_ids) e(entity_id)
                                        inner join entity.fn_tree(e.entity_id) et on true
                               group by et.entity_id
                           ) fe
                               inner join sample.boxes b on fe.entity_id = b.customer_id
                               inner join sample.samples s on b.box_id = s.box_id

                      group by site_id
                      order by site_id
                      limit p_limit offset p_offset
                  ) arr_sites
         )
select s.*
from filtered_sites fs
         inner join geo.fn_sites(p_limit, p_offset, fs.site_ids) s on true;
$$;

create or replace function geo.fn_polygon_sites(p_limit int, p_offset int, p_search_polygon json)
    returns setof site_info
    language plpgsql
    immutable
as
$$
declare
    p_search_geography geometry(MultiPolygon, 4326);
begin
    if
        (p_search_polygon IS NULL)
    then
        raise exception 'The search polygon cannot be NULL.';
    end if;
    p_search_geography := st_multi(st_geomfromgeojson(p_search_polygon));
    if
        (NOT st_isvalid(p_search_geography))
    then
        raise exception 'The search polygon is invalid.';
    end if;
    if
        (st_isempty(p_search_geography))
    then
        raise exception 'The search polygon is empty';
    end if;

    return query with filtered_sites as
                          (
                              select array_agg(site_id) site_ids
                              from (
                                       select site_id
                                       from geo.sites
                                       where st_covers(p_search_geography::geography, location)
                                       order by site_id
                                       limit p_limit offset p_offset
                                   ) arr_sites
                          )
                 select s.*
                 from filtered_sites fs
                          inner join geo.fn_sites(p_limit, p_offset, fs.site_ids) s on true;
end
$$;

drop function if exists geo.fn_sites_point_distance;
create or replace function geo.fn_sites_point_distance(p_limit int, p_offset int, p_longitude double precision,
                                                       p_latitude double precision,
                                                       p_distance double precision)
    returns setof site_info
    language plpgsql
    immutable
as
$$
begin
    if
        (p_longitude < -180 or p_longitude > 180)
    then
        raise 'Invalid longitude %. It must be between -180 and 180 degrees.', p_longitude;
    end if;

    if
        (p_latitude < -90 or p_latitude > 90)
    then
        raise 'Invalid latitude %. It must be between -90 and 90 degrees.', p_latitude;
    end if;

    if
        (p_distance <= 0)
    then
        raise 'Invalid distance %. The distance must be greater than zero, meters.', p_distance;
    end if;

    return query with filtered_sites as
                          (
                              select array_agg(site_id) site_ids
                              from (
                                       select site_id
                                       from geo.sites s
                                       where st_dwithin(s.location, ST_SetSRID(st_point(p_longitude, p_latitude), 4326),
                                                        p_distance, false)
                                       order by site_id
                                       limit p_limit offset p_offset
                                   ) arr_sites
                          )
                 select s.*
                 from filtered_sites fs
                          inner join geo.fn_sites(p_limit, p_offset, fs.site_ids) s on true;
end
$$;


drop function if exists geo.fn_model_info;
create or replace function geo.fn_model_info(p_model_id int)
    returns table
            (
                model_id           smallint,
                model_name         varchar(255),
                abbreviation       varchar(50),
                model_type         varchar(20),
                translation_id     smallint,
                translation        varchar(255),
                extent_description text,
                platform           varchar(255),
                reference_sites    smallint,
                group_count        smallint,
                minimum_count      smallint,
                oe_mean            real,
                oe_stdev           real,
                taxonomic_effort   text,
                is_active          bool,
                fixed_count        smallint,
                units              varchar(20),
                description        text,
                metadata           json,
                predictor_count    bigint,
                created_date       text,
                updated_date       text,
                extent             text
            )
    language plpgsql
    immutable
AS
$$
begin
    return query
        SELECT m.model_id,
               m.model_name,
               m.abbreviation,
               mt.model_type_name,
               t.translation_id,
               t.translation_name,
               m.extent_description,
               m.platform,
               m.reference_sites,
               m.group_count,
               m.minimum_count,
               m.oe_mean,
               m.oe_stdev,
               CAST(m.taxonomic_effort as text),
               m.is_active,
               m.fixed_count,
               u.abbreviation,
               m.description,
               m.metadata,
               p.predictor_count,
               to_json(m.created_date) #>> '{}',
               to_json(m.updated_date) #>> '{}',
               ST_AsGeoJSON(m.extent) extent
        FROM geo.models m
                 inner join geo.model_types mt on m.model_type_id = mt.model_type_id
                 inner join geo.units u on m.unit_id = u.unit_id
                 left join taxa.translations t on m.translation_id = t.translation_id
                 left join
             (SELECT mp.model_id, count(*) predictor_count
              from geo.model_predictors mp
              group by mp.model_id) p ON m.model_id = p.model_id
        where m.model_id = p_model_id;
end
$$;

drop function if exists geo.fn_model_predictors;
create or replace function geo.fn_model_predictors(p_limit INT, p_offset INT, p_model_id int)
    returns table
            (
                predictor_id       smallint,
                predictor_name     varchar(255),
                abbreviation       varchar(25),
                units              varchar(20),
                predictor_type     varchar(255),
                is_temporal        boolean,
                description        text,
                metadata           text,
                calculation_script varchar(255),
                model_count        bigint,
                created_date       text,
                updated_date       text
            )
    language plpgsql
    immutable
AS
$$
begin
    return query
        select p.predictor_id,
               p.predictor_name,
               p.abbreviation,
               u.abbreviation,
               t.predictor_type_name,
               p.is_temporal,
               p.description,
               cast(p.metadata as text),
               p.calculation_script,
               pc.model_count,
               to_json(p.created_date) #>> '{}',
               to_json(p.updated_date) #>> '{}'
        from geo.predictors p
                 inner join geo.predictor_types t on p.predictor_type_id = t.predictor_type_id
                 inner join geo.units u on p.unit_id = u.unit_id
                 inner join geo.model_predictors mp on p.predictor_id = mp.predictor_id
                 left join (
            select mc.predictor_id, count(*) model_count from geo.model_predictors mc group by mc.predictor_id
        ) pc on p.predictor_id = pc.predictor_id
        where mp.model_id = p_model_id
        order by p.predictor_id
        limit p_limit offset p_offset;
end
$$;

