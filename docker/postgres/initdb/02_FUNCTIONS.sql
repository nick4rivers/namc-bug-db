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
                box_state_name   VARCHAR(255),
                box_state_id     SMALLINT,
                submitter_name   VARCHAR(255),
                site_id          INT,
                site_name        VARCHAR(255),
                site_latitude    DOUBLE PRECISION,
                site_longitude    DOUBLE PRECISION,
                site_state       VARCHAR(2),
                sample_date      TIMESTAMPTZ,
                sample_year      INT,
                sample_latitude  DOUBLE PRECISION,
                sample_longitude DOUBLE PRECISION,
                sample_time     TIME,
                type_id          SMALLINT,
                sample_type      VARCHAR(50),
                method_id        SMALLINT,
                sample_method    VARCHAR(50),
                habitat_id       SMALLINT,
                habitat_name     VARCHAR(50),
                area             FLOAT,
                field_split      FLOAT,
                lab_split        FLOAT,
                jar_count        SMALLINT,
                qualitative      BOOLEAN,
                mesh             FLOAT,
                created_date     TIMESTAMPTZ,
                updated_date     TIMESTAMPTZ,
                qa_sample_id     INT,
                diameter         FLOAT,
                sub_sample_count FLOAT,
                tow_length       FLOAT,
                volume           FLOAT,
                aliquot          FLOAT,
                size_interval    FLOAT,
                tow_type         VARCHAR(255),
                net_area         FLOAT,
                net_duration     FLOAT,
                stream_depth     FLOAT,
                net_depth        FLOAT,
                net_velocity     FLOAT,
                taxonomy_id      smallint,
                life_stage       CHAR,
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
        SELECT sample_id,
               box_id,
               customer_id,
               customer_name,
               box_state_name,
               box_state_id,
               submitter_name,
               site_id,
               site_name,
               site_latitude,
               site_longitude,
               site_state,
               sample_date,
               sample_year,
               sample_latitude,
               sample_longitude,
               sample_time,
               type_id,
               sample_type,
               method_id,
               sample_method,
               habitat_id,
               habitat_name,
               area,
               field_split,
               lab_split,
               jar_count,
               qualitative,
               mesh,
               created_date,
               updated_date,
               qa_sample_id,
               diameter,
               sub_sample_count,
               tow_length,
               volume,
               aliquot,
               size_interval,
               tow_type,
               net_area,
               net_duration,
               stream_depth,
               net_depth,
               net_velocity,
               taxonomy_id,
               life_stage,
               bug_size,
               split_count,
               big_rare_count,
               phylum,
               class,
               subclass,
               "Order",
               family,
               genus,
               is_private
        FROM sample.vw_samples
        WHERE ((sample_id = p_sample_id) OR (sample_id IS NULL))
          AND ((p_box_id = p_sample_id) OR (p_box_id IS NULL))
          AND ((p_site_id = p_sample_id) OR (p_site_id IS NULL))
          AND ((p_sample_year = p_sample_id) OR (p_sample_year IS NULL))
          AND ((p_type_id = p_sample_id) OR (p_type_id IS NULL))
        ORDER BY sample_id
        LIMIT p_limit OFFSET p_offset;
end
$$;