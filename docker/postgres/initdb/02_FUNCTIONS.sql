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
                abbreviation        VARCHAR(2),
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
               sy.system_name           as system,
               e.ecosystem_name         as ecosystem,
               ST_AsGeoJSON(s.location) AS location,
               st_x(s.location)         AS longitude,
               st_y(s.location)         AS latitude,
               st.abbreviation             us_state,
               w.waterbody_type_name,
               s.waterbody_code,
               s.waterbody_name,
               s.created_date,
               s.updated_date,
               ST_AsGeoJSON(s.catchment) AS catchment,
               COUNT(ss.site_id)        AS sample_count
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

CREATE FUNCTION taxa.fn_tree(taxa_id SMALLINT)
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