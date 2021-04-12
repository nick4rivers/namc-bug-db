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

DROP function if exists geo.fn_sites;
CREATE OR REPLACE FUNCTION geo.fn_sites(p_limit INT, p_offset INT)
    returns table
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
                created_date        TIMESTAMPTZ,
                updated_date        TIMESTAMPTZ,
                has_catchment       BOOLEAN
            )
    language plpgsql
AS
$$
begin
    RETURN QUERY
        SELECT s.site_id,
               s.site_name,
               sy.system_name,
               e.ecosystem_name,
               st_x(location),
               st_y(location),
               st.abbreviation,
               w.waterbody_type_name,
               s.waterbody_code,
               s.waterbody_name,
               s.created_date,
               s.updated_date,
               s.catchment is NOT NULL
        FROM geo.sites s
                 INNER JOIN (
            SELECT g.site_id
            FROM geo.sites g
                 -- where ((p_us_state IS NULL) OR (gst.abbreviation ~~ ANY (p_us_state)))
            ORDER BY g.site_id
            LIMIT p_limit OFFSET p_offset
        ) ss ON s.site_id = ss.site_id
                 LEFT JOIN geo.states st ON st_contains(st.geom, s.location)
                 LEFT JOIN geo.systems sy ON s.system_id = sy.system_id
                 LEFT JOIN geo.ecosystems e ON sy.ecosystem_id = e.ecosystem_id
                 LEFT JOIN geo.waterbody_types w ON s.waterbody_type_id = w.waterbody_type_id
                 LEFT JOIN geo.states gst ON st_contains(gst.geom, s.location);
end ;
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

CREATE OR REPLACE FUNCTION geo.fn_site_predictor_values(p_limit INT, p_offset INT = NULL, p_site_id INT = NULL)
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

CREATE OR REPLACE FUNCTION sample.fn_boxes(p_limit INT, p_offset INT)
    RETURNs TABLE
            (
                box_id                   INT,
                customer_id              SMALLINT,
                customer_name            VARCHAR(255),
                samples                  BIGINT,
                submitter_id             SMALLINT,
                submitter_name           VARCHAR(255),
                box_state_id             SMALLINT,
                box_state_name           VARCHAR(50),
                box_received_date        DATE,
                processing_complete_date TIMESTAMPTZ,
                projected_complete_date  TIMESTAMPTZ
            )
    LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT b.box_id,
               b.customer_id,
               o.organization_name,
               COUNT(sample_id),
               b.submitter_id,
               i.first_name || ' ' || i.last_name,
               b.box_state_id,
               t.box_state_name,
               b.box_received_date,
               b.processing_complete_date,
               b.projected_complete_date
        FROM sample.boxes b
                 INNER JOIN (
            SELECT g.box_id FROM sample.boxes g ORDER BY g.box_id LIMIT p_limit OFFSET p_offset
        ) bg ON b.box_id = bg.box_id
                 INNER JOIN sample.box_states t ON b.box_state_id = t.box_state_id
                 INNER JOIN entity.individuals i ON b.submitter_id = i.entity_id
                 INNER JOIN entity.organizations o ON b.customer_id = o.entity_id
                 LEFT JOIN sample.samples s ON b.box_id = s.box_id
        GROUP BY b.box_id,
                 b.customer_id,
                 o.organization_name,
                 b.submitter_id,
                 submitter_name,
                 b.box_state_id,
                 t.box_state_name,
                 b.box_received_date,
                 b.processing_complete_date,
                 b.projected_complete_date;
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

CREATE OR REPLACE FUNCTION sample.fn_sample_predictor_values(p_sample_id INT)
    RETURNS TABLE
            (
                predictor_id                 SMALLINT,
                abbreviation                 VARCHAR(25),
                calculation_script           VARCHAR(255),
                is_temporal                  boolean,
                predictor_metadata           TEXT,
                predictor_value              varchar(255),
                predictor_value_updated_date timestamptz,
                status                       VARCHAR(20)
            )
    language plpgsql
AS
$$
BEGIN
    RETURN QUERY
        SELECT p.predictor_id,
               p.abbreviation,
               p.calculation_script,
               p.is_temporal,
               CAST(p.metadata AS TEXT),
               sp.predictor_value,
               sp.updated_date,
               CAST(CASE
                        WHEN sp.updated_date IS NULL THEN 'Missing'
                        WHEN gs.geometry_changed > sp.updated_date THEN 'Expired'
                        ELSE 'Current'
                   END AS VARCHAR(20)) Status
        FROM sample.samples s
                 inner join sample.box_models bm on s.box_id = bm.box_id
                 inner join geo.sites gs on s.site_id = gs.site_id
                 inner join geo.models m on st_contains(m.extent, gs.catchment) and bm.model_id = m.model_id
                 inner join geo.model_predictors mp on m.model_id = mp.model_id
                 inner join geo.predictors p on mp.predictor_id = p.predictor_id
                 left join geo.site_predictors sp on sp.site_id = gs.site_id and p.predictor_id = sp.predictor_id
        where (s.sample_id = p_sample_id)
          AND (NOT p.is_temporal)
          AND (m.is_active)
        UNION
        SELECT p.predictor_id,
               p.abbreviation,
               p.calculation_script,
               p.is_temporal,
               CAST(p.metadata AS TEXT),
               sp.predictor_value,
               sp.updated_date,
               CAST(CASE
                        WHEN sp.updated_date IS NULL THEN 'Missing'
                        WHEN s.sample_date_changed > sp.updated_date THEN 'Expired'
                        ELSE 'Current'
                   END AS VARCHAR(20)) Status
        FROM sample.samples s
                 inner join sample.box_models bm on s.box_id = bm.box_id
                 inner join geo.sites gs on s.site_id = gs.site_id
                 inner join geo.models m on st_contains(m.extent, gs.catchment) and bm.model_id = m.model_id
                 inner join geo.model_predictors mp on m.model_id = mp.model_id
                 inner join geo.predictors p on mp.predictor_id = p.predictor_id
                 left join sample.sample_predictors sp
                           on s.sample_id = sp.sample_id and p.predictor_id = sp.predictor_id
        where (s.sample_id = p_sample_id)
          AND (p.is_temporal)
          AND (m.is_active);
END
$$;

CREATE OR REPLACE FUNCTION sample.fn_box_info(p_box_id INT)
    returns table
            (
                box_id                    INT,
                customer_id               smallint,
                organization_name         varchar(255),
                organization_abbreviation varchar(50),
                submitter_id              smallint,
                submitted_by              text,
                box_state_id              smallint,
                box_state_name            varchar(50),
                box_received_date         timestamptz,
                processing_complete_date  timestamptz,
                projected_complete_date   timestamptz,
                sample_count              bigint,
                description               text,
                metadata                  json,
                measurements              boolean,
                sorter_qa                 boolean,
                taxa_qa                   boolean,
                created_date              timestamptz,
                updated_date              timestamptz
            )
    language plpgsql
AS
$$
BEGIN
    return query
        SELECT b.box_id,
               b.customer_id,
               o.organization_name,
               o.abbreviation                     organization_abbreviation,
               b.submitter_id,
               i.first_name || ' ' || i.last_name submitted_by,
               bs.box_state_id,
               bs.box_state_name,
               b.box_received_date,
               b.processing_complete_date,
               b.projected_complete_date,
               s.sample_count,
               b.description,
               b.metadata,
               b.measurements,
               b.sorter_qa,
               b.taxa_qa,
               b.created_date,
               b.updated_date
        FROM sample.boxes b
                 inner join entity.organizations o on b.customer_id = o.entity_id
                 inner join entity.individuals i on b.submitter_id = i.entity_id
                 inner join sample.box_states bs on b.box_state_id = bs.box_state_id
                 inner join
             (
                 select b.box_id, count(s.box_id) sample_count
                 from sample.boxes b
                          left join sample.samples s on b.box_id = s.box_id
                 where b.box_id = p_box_id
                 group by b.box_id
             ) s on b.box_id = s.box_id
        where b.box_id = p_box_id;
end
$$;

create or replace function sample.fn_sample_info(p_sample_id int)
    returns table
            (
                sample_id                 int,
                box_id                    int,
                organization_name         varchar(255),
                organization_abbreviation varchar(50),
                submitted_by              text,
                box_state_name            varchar(50),
                site_id                   int,
                site_name                 varchar(50),
                us_state                  varchar(2),
                visit_id                  varchar(100),
                sample_date               date,
                sample_time               time,
                sample_type_name          varchar(50),
                sample_method_name        varchar(50),
                habitat_name              varchar(50),
                area                      real,
                field_split               real,
                field_notes               text,
                lab_split                 real,
                jar_count                 smallint,
                qualitative               boolean,
                lab_notes                 text,
                mesh                      smallint,
                created_date              timestamptz,
                updated_date              timestamptz,
                sample_date_changed       timestamptz,
                qa_sample_id              int,
                metadata                  json
            )
    language plpgsql
AS
$$
begin
    return query
        SELECT s.sample_id,
               s.box_id,
               b.organization_name,
               b.organization_abbreviation,
               b.submitted_by,
               b.box_state_name,
               gs.site_id,
               gs.site_name,
               gs.us_state,
               s.visit_id,
               s.sample_date,
               s.sample_time,
               t.sample_type_name,
               m.sample_method_name,
               h.habitat_name,
               s.area,
               s.field_split,
               s.field_notes,
               s.lab_split,
               s.jar_count,
               s.qualitative,
               s.lab_notes,
               s.mesh,
               s.created_date,
               s.updated_date,
               s.sample_date_changed,
               s.qa_sample_id,
               s.metadata
        FROM sample.samples s
                 inner join sample.fn_box_info(s.box_id) b on s.box_id = b.box_id
                 inner join geo.fn_site_info(s.site_id) gs on s.site_id = gs.site_id
                 inner join sample.sample_types t on s.type_id = t.sample_type_id
                 inner join sample.sample_methods m on s.method_id = m.sample_method_id
                 inner join geo.habitats h on s.habitat_id = h.habitat_id
        WHERE s.sample_id = p_sample_id;
end
$$;



CREATE OR REPLACE FUNCTION sample.fn_project_samples(
    p_limit INT,
    p_offset INT,
    p_project_id INT[])
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
                 INNER JOIN sample.project_samples p ON s.sample_id = p.sample_id
        WHERE CAST(p.project_id AS INT) = ANY (p_project_id)
        ORDER BY s.sample_id
        LIMIT p_limit OFFSET p_offset;
end
$$;

create or replace function geo.fn_model_info(p_model_id smallint)
    returns table
            (
                model_id           smallint,
                model_name         varchar(255),
                abbreviation       varchar(50),
                model_type_name    varchar(20),
                translation_name   varchar(255),
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
                created_date       timestamptz,
                updated_date       timestamptz,
                extent text
            )
    language plpgsql
AS
$$
begin
    return query
        SELECT m.model_id,
               m.model_name,
               m.abbreviation,
               mt.model_type_name,
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
               u.abbreviation units,
               m.description,
               m.metadata,
               p.predictor_count,
               m.created_date,
               m.updated_date,
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
end;
$$