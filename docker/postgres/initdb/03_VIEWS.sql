/******************************************************************************************************************
 geo SCHEMA
 */

CREATE OR REPLACE VIEW geo.vw_sites AS
(
SELECT s.site_id,
       s.site_name,
       sy.system_name          as system,
       e.ecosystem_name        as ecosystem,
       st_x(location)          AS longitude,
       st_y(location)          AS latitude,
       st.abbreviation            us_state,
       w.waterbody_type_name,
       waterbody_code,
       waterbody_name,
       s.created_date,
       s.updated_date,
       s.catchment is NOT NULL AS has_catchment

FROM geo.sites s
         LEFT JOIN geo.states st ON st_contains(st.geom, s.location)
         LEFT JOIN geo.systems sy ON s.system_id = sy.system_id
         LEFT JOIN geo.ecosystems e ON sy.ecosystem_id = e.ecosystem_id
         LEFT JOIN geo.waterbody_types w ON s.waterbody_type_id = w.waterbody_type_id
    );

/******************************************************************************************************************
entity SCHEMA
*/

CREATE OR REPLACE VIEW entity.vw_organizations AS
(
SELECT o.*,
       t.organization_type_name,
       e.address1,
       e.address2,
       e.city,
       s.state_name,
       c.country_name,
       e.zip_code,
       e.phone,
       e.fax
FROM entity.organizations o
         INNER JOIN entity.entities e ON o.entity_id = e.entity_id
         INNER JOIN entity.organization_types t ON o.organization_type_id = t.organization_type_id
         INNER JOIN geo.countries c ON e.country_id = c.country_id
         LEFT JOIN geo.states s ON e.state_id = s.state_id
    );

DROP VIEW IF EXISTS entity.vw_individuals;

CREATE VIEW entity.vw_individuals AS
(
SELECT i.*,
       o.organization_name AS affiliation,
       e.address1,
       e.address2,
       e.city,
       s.state_name,
       c.country_name,
       e.zip_code,
       e.phone,
       e.fax
FROM entity.individuals i
         INNER JOIN entity.entities e ON i.entity_id = e.entity_id
         INNER JOIN geo.countries c ON e.country_id = c.country_id
         LEFT JOIN geo.states s ON e.state_id = s.state_id
         LEFT JOIN entity.organizations o ON i.affiliation_id = o.entity_id
    );

/******************************************************************************************************************
 sample SCHEMA
 */
CREATE OR REPLACE VIEW sample.vw_boxes AS
(
SELECT b.box_id,
       b.customer_id,
       o.organization_name                AS customer_name,
       COUNT(sample_id)                   AS samples,
       b.submitter_id,
       i.first_name || ' ' || i.last_name AS submitter_name,
       b.box_state_id,
       t.box_state_name,
       b.box_recevied_date,
       b.processing_complete_date,
       b.projected_complete_date
FROM sample.boxes b
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
         b.box_recevied_date,
         b.processing_complete_date,
         b.projected_complete_date
    );

CREATE OR REPLACE VIEW sample.vw_samples AS
(
SELECT s.sample_id,
       s.box_id,
       b.customer_id,
       b.customer_name,
       b.box_state_name,
       s.site_id,
       si.site_name,
       si.latitude          AS site_latitude,
       si.longitude         AS site_longitude,
       si.us_state          AS site_state,
       s.sample_date,
       st_y(s.location)     AS sample_latitude,
       st_x(s.location)     AS sample_longitude,
       s.sample_time,
       s.type_id,
       t.sample_type_name   AS sample_type,
       s.method_id,
       m.sample_method_name AS sample_method,
       s.habitat_id,
       h.habitat_name,
       s.area,
       s.field_split,
       s.lab_split,
       s.jar_count,
       s.qualitative,
       s.mesh,
       s.created_date,
       s.updated_date,
       s.qa_sample_id

FROM sample.samples s
         INNER JOIN sample.vw_boxes b ON s.box_id = b.box_id
         INNER JOIN sample.sample_types t ON s.type_id = t.sample_type_id
         INNER JOIN sample.sample_methods m ON s.method_id = m.sample_method_id
         INNER JOIN geo.habitats h ON s.habitat_id = h.habitat_id
         LEFT JOIN geo.vw_sites si ON s.site_id = si.site_id
    );

DROP VIEW IF EXISTS sample.vw_taxonomy_crosstab;
CREATE MATERIALIZED VIEW taxa.vw_taxonomy_crosstab AS
(
SELECT *
FROM crosstab(
             'SELECT t.taxonomy_id, f.level_name, t.scientific_name FROM taxa.taxonomy t, taxa.fn_tree(t.taxonomy_id) f',
             'SELECT level_name FROM taxa.taxa_levels where is_active = TRUE  and level_id > 1 order BY level_id')
         AS final_result(taxonomy_id INT,
                         Phylum varchar(255),
                         Class varchar(255),
                         Subclass varchar(255),
                         "Order" varchar(255),
                         Suborder varchar(255),
                         Family varchar(255),
                         Subfamily varchar(255),
                         Tribe varchar(255),
                         Genus varchar(255),
                         Subgenus varchar(255),
                         Species varchar(255),
                         Subspecies varchar(255)
        )
    );

/*
 This view includes all sample_id of samples that are part of one or
 more private projects. It can be used to filter out these samples
 from other views.
 */
CREATE OR REPLACE VIEW sample.vw_private_samples AS
(
SELECT s.sample_id
FROM sample.samples s
         left join sample.project_samples ps on s.sample_id = ps.sample_id
         left join sample.projects p on ps.project_id = p.project_id
WHERE p.is_private = TRUE
GROUP BY s.sample_id
HAVING count(p.project_id) > 0
    );

DROP MATERIALIZED VIEW IF EXISTS sample.vw_map_data;
CREATE MATERIALIZED VIEW sample.vw_map_data AS
(
SELECT s.sample_id,
       ss.site_id,
       ss.site_name,
       m.sample_method_id,
       m.sample_method_name,
       h.habitat_id,
       h.habitat_name,
       s.area,
       s.lab_split,
       s.qualitative,
       s.mesh,
       s.sample_date,
       extract(year from s.sample_date) as sample_year,
       l.abbreviation                      life_stage,
       o.split_count,
       ss.location,
       st_y(ss.location)                AS latitude,
       st_x(ss.location)                AS longitude,
       st.state_name,
       st.abbreviation                     state_abbreviation,
       st.state_id,
       c.abbreviation                      country,
       t.phylum,
       t.class,
       t.subclass,
       t."Order",
       t.family,
       t.genus
FROM sample.organisms o
         INNER JOIN taxa.life_stages l ON o.life_stage_id = l.life_stage_id
         INNER JOIN sample.samples s ON o.sample_id = s.sample_id
         INNER JOIN geo.sites ss ON s.site_id = ss.site_id
         INNER JOIN sample.sample_methods m ON s.method_id = m.sample_method_id
         INNER JOIN geo.habitats h ON s.habitat_id = h.habitat_id
         INNER JOIN geo.states st ON st_contains(st.geom, ss.location)
         INNER JOIN geo.countries c ON st.country_id = c.country_id
         INNER JOIN taxa.vw_taxonomy_crosstab t ON o.taxonomy_id = t.taxonomy_id
         LEFT JOIN sample.vw_private_samples p ON s.sample_id = p.sample_id
WHERE p.sample_id IS NULL
    );

CREATE INDEX gx_sample_vw_map_data_location ON sample.vw_map_data USING GIST (location);
CREATE INDEX ix_sample_vw_map_data_sample_method_id ON sample.vw_map_data (sample_method_id);
CREATE INDEX ix_sample_vw_map_data_habitat_id ON sample.vw_map_data (habitat_id);
CREATE INDEX ix_sample_vw_map_data_sample_year ON sample.vw_map_data (sample_year);
CREATE INDEX ix_sample_vw_map_data_state_id ON sample.vw_map_data (state_id);

CREATE OR REPLACE VIEW sample.vw_projects AS
(
SELECT p.project_id,
       p.project_name,
       t.project_type_name               as project_type,
       p.is_private,
       i.first_name || ' ' || i.last_name as contact,
       p.auto_update_samples,
       p.description,
       p.created_date,
       p.updated_date,
       Count(s.project_id)                  samples
FROM sample.projects p
         inner join sample.project_types t ON p.project_type_id = t.project_type_id
         left join entity.individuals i on p.contact_id = i.entity_id
         left join sample.project_samples s on p.project_id = s.project_id
GROUP BY p.project_id, p.project_name, t.project_type_name, p.is_private, i.first_name || ' '  || i.last_name,
         p.auto_update_samples, p.description, p.created_date, p.updated_date
    );