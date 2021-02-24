/******************************************************************************************************************
geo SCHEMA
*/
CREATE OR REPLACE FUNCTION geo.fn_site_info(p_site_id INT)
    RETURNS TABLE
            (
                site_id             INT,
                site_name           VARCHAR(50),
                system              VARCHAR(20),
                ecosystem           VARCHAR(10),
                location            TEXT,
                st_x                DOUBLE PRECISION,
                st_y                DOUBLE PRECISION,
                us_state            VARCHAR(2),
                waterbody_type_name VARCHAR(255),
                waterbody_code      VARCHAR(100),
                waterbody_name      VARCHAR(255),
                created_date        timestamptz,
                updated_date        timestamptz,
                catchment           TEXT,
                sample_count        BIGINT
            )
    language plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.site_id,
               s.site_name,
               sy.system_name            as system,
               e.ecosystem_name          as ecosystem,
               ST_AsGeoJSON(s.location)  AS location,
               st_x(s.location)          AS longitude,
               st_y(s.location)          AS latitude,
               st.abbreviation              us_state,
               w.waterbody_type_name,
               s.waterbody_code,
               s.waterbody_name,
               s.created_date,
               s.updated_date,
               ST_AsGeoJSON(s.catchment) AS catchment,
               COUNT(ss.site_id)         AS sample_count
        FROM geo.sites s
                 LEFT JOIN geo.states st ON st_contains(st.geom, s.location)
                 LEFT JOIN geo.systems sy ON s.system_id = sy.system_id
                 LEFT JOIN geo.ecosystems e ON sy.ecosystem_id = e.ecosystem_id
                 LEFT JOIN geo.waterbody_types w ON s.waterbody_type_id = w.waterbody_type_id
                 LEFT JOIN sample.samples ss ON s.site_id = ss.site_id
        WHERE s.site_id = p_site_id
        GROUP BY s.site_id, s.site_name, sy.system_name, e.ecosystem_name, ST_AsGeoJSON(s.location), st_x(s.location),
                 st_y(s.location), st.abbreviation, w.waterbody_type_name, s.waterbody_code, s.waterbody_name,
                 s.created_date,
                 s.updated_date, ST_AsGeoJSON(s.catchment);
end
$$;


CREATE OR REPLACE FUNCTION geo.fn_predictors(p_limit INT, p_offset INT, p_model_id INT = NULL)
    returns table
            (
                predictor_id        SMALLINT,
                predictor_name      VARCHAR(255),
                abbreviation        VARCHAR(25),
                description         TEXT,
                units               VARCHAR(20),
                calculation_script  varchar(255),
                predictor_type_id   SMALLINT,
                predictor_type_name VARCHAR(255),
                is_temporal         BOOLEAN,
                updated_date        timestamptz,
                created_date        timestamptz,
                model_count         BIGINT
            )
    language plpgsql
AS
$$
begin
    RETURN QUERY
        SELECT p.predictor_id,
               p.predictor_name,
               p.abbreviation,
               p.description,
               u.abbreviation as     units,
               p.calculation_script,
               p.predictor_type_id,
               t.predictor_type_name,
               p.is_temporal,
               p.updated_date,
               p.created_date,
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
        limit p_limit offset p_offset;
end
$$;

CREATE OR REPLACE FUNCTION geo.fn_site_predictor_values(p_limit INT, p_offset INT, p_site_id INT)
    returns table
            (
                predictor_id        SMALLINT,
                predictor_name      VARCHAR(255),
                abbreviation        VARCHAR(25),
                description         TEXT,
                predictor_type_name VARCHAR(255),
                metadata            JSON,
                created_date        timestamptz,
                updated_date        timestamptz,
                calculation_script  VARCHAR(255)
            )
    language plpgsql
AS
$$
begin
    RETURN QUERY
        SELECT sp.predictor_id,
               p.predictor_name,
               p.abbreviation,
               p.description,
               pt.predictor_type_name,
               sp.metadata,
               sp.created_date,
               sp.updated_date,
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

/******************************************************************************************************************
taxa SCHEMA
*/
DROP FUNCTION IF EXISTS taxa.fn_tree;

CREATE OR REPLACE FUNCTION taxa.fn_tree(taxa_id SMALLINT)
    returns table
            (
                taxonomy_id     SMALLINT,
                scientific_name VARCHAR(255),
                level_id        SMALLINT,
                level_name      VARCHAR(50),
                parent_id       SMALLINT
            )
    language plpgsql
as
$$
begin
    RETURN QUERY
        WITH RECURSIVE taxa_tree AS (
            SELECT t.taxonomy_id,
                   t.scientific_name,
                   l.level_id,
                   l.level_name,
                   t.parent_id
            FROM taxa.taxonomy t
                     INNER JOIN taxa.taxa_levels l ON t.level_id = l.level_id
            WHERE t.taxonomy_id = taxa_id
            UNION
            SELECT t.taxonomy_id,
                   t.scientific_name,
                   t.level_id,
                   tl.level_name,
                   t.parent_id
            FROM taxa.taxonomy t
                     INNER JOIN taxa.taxa_levels tl on t.level_id = tl.level_id
                     INNER JOIN taxa_tree tt ON t.taxonomy_id = tt.parent_id
        )
        SELECT taxa_tree.taxonomy_id,
               taxa_tree.scientific_name,
               taxa_tree.level_id,
               taxa_tree.level_name,
               taxa_tree.parent_id
        FROM taxa_tree;
end
$$;


CREATE OR REPLACE FUNCTION sample.fn_sample_organisms(p_sample_id INT)
    RETURNs TABLE
            (
                organism_id      INT,
                sample_id        INT,
                life_stage       CHAR,
                bug_size         REAL,
                split_count      REAL,
                lab_split        REAL,
                field_split      REAL,
                big_rare_count   SMALLINT,
                invalidated_date timestamp,
                created_date     timestamp,
                updated_date     timestamp,
                taxonomy_id      smallint,
                Phylum           varchar(255),
                Class            varchar(255),
                Subclass         varchar(255),
                "Order"          varchar(255),
                Suborder         varchar(255),
                Family           varchar(255),
                Subfamily        varchar(255),
                Tribe            varchar(255),
                Genus            varchar(255),
                Subgenus         varchar(255),
                Species          varchar(255),
                Subspecies       varchar(255)
            )
    LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT o.organism_id,
               o.sample_id,
               l.abbreviation as life_stage,
               o.bug_size,
               o.split_count,
               s.lab_split,
               s.field_split,
               o.big_rare_count,
               o.created_date,
               o.updated_date,
               o.taxonomy_id,
               t.Phylum,
               t.Class,
               t.Subclass,
               t."Order",
               t.Suborder,
               t.Family,
               t.Subfamily,
               t.Tribe,
               t.Genus,
               t.Subgenus,
               t.Species,
               t.Subspecies
        FROM sample.organisms o
                 inner join sample.samples s ON o.sample_id = o.sample_id
                 inner join taxa.vw_taxonomy_crosstab t ON o.taxonomy_id = t.taxonomy_id
                 inner join taxa.life_stages l on o.life_stage_id = l.life_stage_id
        WHERE sample_id = p_sample_id;
end
$$;

--  DROP FUNCTION sample.fn_samples(p_limit integer, p_offset integer, p_sample_id integer, p_box_id integer, p_site_id integer, p_sample_year integer, p_type_id smallint);

CREATE OR REPLACE FUNCTION sample.fn_samples(
    p_limit INT,
    p_offset INT,
    p_sample_id INT = NULL,
    p_box_id INT = NULL,
    p_site_id INT = NULL,
    p_sample_year INT = NULL,
    p_type_id SMALLINT = NULL)
    RETURNS TABLE
            (
                sample_id        INT,
                box_id           INT,
                customer_id      SMALLINT,
                customer_name    VARCHAR(255),
                box_state_name   VARCHAR(50),
                box_state_id     SMALLINT,
                submitter_name   TEXT,
                site_id          INT,
                site_name        VARCHAR(50),
                site_latitude    DOUBLE PRECISION,
                site_longitude   DOUBLE PRECISION,
                site_state       VARCHAR(2),
                sample_date      CHAR(10),
                sample_latitude  DOUBLE PRECISION,
                sample_longitude DOUBLE PRECISION,
                sample_time      TIME,
                type_id          SMALLINT,
                sample_type      VARCHAR(50),
                method_id        SMALLINT,
                sample_method    VARCHAR(50),
                habitat_id       SMALLINT,
                habitat_name     VARCHAR(50),
                area             REAL,
                field_split      REAL,
                lab_split        REAL,
                jar_count        SMALLINT,
                qualitative      BOOLEAN,
                mesh             SMALLINT,
                created_date     TIMESTAMPTZ,
                updated_date     TIMESTAMPTZ,
                qa_sample_id     SMALLINT,
                diameter         REAL,
                sub_sample_count SMALLINT,
                tow_length       REAL,
                volume           REAL,
                aliquot          REAL,
                size_interval    REAL,
                tow_type         tow_types,
                net_area         DOUBLE PRECISION,
                net_duration     DOUBLE PRECISION,
                stream_depth     DOUBLE PRECISION,
                net_depth        DOUBLE PRECISION,
                net_velocity     DOUBLE PRECISION,
                taxonomy_id      smallint,
                life_stage       CHAR(1),
                bug_size         REAL,
                split_count      REAL,
                big_rare_count   SMALLINT,
                phylum           VARCHAR(255),
                class            VARCHAR(255),
                subclass         VARCHAR(255),
                "Order"          VARCHAR(255),
                family           VARCHAR(255),
                genus            VARCHAR(255),
                is_private       BOOLEAN
            )
    LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.sample_id,
               s.box_id,
               s.customer_id,
               s.customer_name,
               s.box_state_name,
               s.box_state_id,
               s.submitter_name,
               s.site_id,
               s.site_name,
               s.site_latitude,
               s.site_longitude,
               s.site_state,
               CAST(TO_CHAR(s.sample_date :: DATE, 'yyyy-mm-dd') AS CHAR(10)),
               s.sample_latitude,
               s.sample_longitude,
               s.sample_time,
               s.type_id,
               s.sample_type,
               s.method_id,
               s.sample_method,
               s.habitat_id,
               s.habitat_name,
               s.area,
               s.field_split,
               s.lab_split,
               s.jar_count,
               s.qualitative,
               s.mesh,
               s.created_date,
               s.updated_date,
               s.qa_sample_id,
               s.diameter,
               s.sub_sample_count,
               s.tow_length,
               s.volume,
               s.aliquot,
               s.size_interval,
               s.tow_type,
               s.net_area,
               s.net_duration,
               s.stream_depth,
               s.net_depth,
               s.net_velocity,
               s.taxonomy_id,
               s.life_stage,
               s.bug_size,
               s.split_count,
               s.big_rare_count,
               s.phylum,
               s.class,
               s.subclass,
               s."Order",
               s.family,
               s.genus,
               s.is_private
        FROM sample.vw_samples s
        WHERE ((s.sample_id = p_sample_id) OR (p_sample_id IS NULL))
          AND ((s.box_id = p_box_id) OR (p_box_id IS NULL))
          AND ((s.site_id = p_site_id) OR (p_site_id IS NULL))
          AND ((extract(year from s.sample_date) = p_sample_year) OR (p_sample_year IS NULL))
          AND ((s.type_id = p_type_id) OR (p_type_id IS NULL))
        ORDER BY s.sample_id
        LIMIT p_limit OFFSET p_offset;
end
$$;


CREATE OR REPLACE FUNCTION sample.fn_project_samples(
    p_limit INT,
    p_offset INT,
    p_project_id INT)
    RETURNS TABLE
            (
                sample_id        INT,
                box_id           INT,
                customer_id      SMALLINT,
                customer_name    VARCHAR(255),
                box_state_name   VARCHAR(50),
                box_state_id     SMALLINT,
                submitter_name   TEXT,
                site_id          INT,
                site_name        VARCHAR(50),
                site_latitude    DOUBLE PRECISION,
                site_longitude   DOUBLE PRECISION,
                site_state       VARCHAR(2),
                sample_date      CHAR(10),
                sample_latitude  DOUBLE PRECISION,
                sample_longitude DOUBLE PRECISION,
                sample_time      TIME,
                type_id          SMALLINT,
                sample_type      VARCHAR(50),
                method_id        SMALLINT,
                sample_method    VARCHAR(50),
                habitat_id       SMALLINT,
                habitat_name     VARCHAR(50),
                area             REAL,
                field_split      REAL,
                lab_split        REAL,
                jar_count        SMALLINT,
                qualitative      BOOLEAN,
                mesh             SMALLINT,
                created_date     TIMESTAMPTZ,
                updated_date     TIMESTAMPTZ,
                qa_sample_id     SMALLINT,
                diameter         REAL,
                sub_sample_count SMALLINT,
                tow_length       REAL,
                volume           REAL,
                aliquot          REAL,
                size_interval    REAL,
                tow_type         tow_types,
                net_area         DOUBLE PRECISION,
                net_duration     DOUBLE PRECISION,
                stream_depth     DOUBLE PRECISION,
                net_depth        DOUBLE PRECISION,
                net_velocity     DOUBLE PRECISION,
                taxonomy_id      smallint,
                life_stage       CHAR(1),
                bug_size         REAL,
                split_count      REAL,
                big_rare_count   SMALLINT,
                phylum           VARCHAR(255),
                class            VARCHAR(255),
                subclass         VARCHAR(255),
                "Order"          VARCHAR(255),
                family           VARCHAR(255),
                genus            VARCHAR(255),
                is_private       BOOLEAN
            )
    LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.sample_id,
               s.box_id,
               s.customer_id,
               s.customer_name,
               s.box_state_name,
               s.box_state_id,
               s.submitter_name,
               s.site_id,
               s.site_name,
               s.site_latitude,
               s.site_longitude,
               s.site_state,
               CAST(TO_CHAR(s.sample_date :: DATE, 'yyyy-mm-dd') AS CHAR(10)),
               s.sample_latitude,
               s.sample_longitude,
               s.sample_time,
               s.type_id,
               s.sample_type,
               s.method_id,
               s.sample_method,
               s.habitat_id,
               s.habitat_name,
               s.area,
               s.field_split,
               s.lab_split,
               s.jar_count,
               s.qualitative,
               s.mesh,
               s.created_date,
               s.updated_date,
               s.qa_sample_id,
               s.diameter,
               s.sub_sample_count,
               s.tow_length,
               s.volume,
               s.aliquot,
               s.size_interval,
               s.tow_type,
               s.net_area,
               s.net_duration,
               s.stream_depth,
               s.net_depth,
               s.net_velocity,
               s.taxonomy_id,
               s.life_stage,
               s.bug_size,
               s.split_count,
               s.big_rare_count,
               s.phylum,
               s.class,
               s.subclass,
               s."Order",
               s.family,
               s.genus,
               s.is_private
        FROM sample.vw_samples s
                 INNER JOIN sample.project_samples p ON s.sample_id = p.project_id
        WHERE p.project_id = p_project_id
        ORDER BY s.sample_id
        LIMIT p_limit OFFSET p_offset;
end
$$;