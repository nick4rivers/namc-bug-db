/******************************************************************************************************************
 geo SCHEMA
 */

DROP VIEW IF EXISTS geo.vw_sites;

CREATE VIEW geo.vw_sites AS
(
SELECT s.site_id,
       s.site_name,
       s.system_id,
       sy.system_name,
       s.ecosystem_id,
       e.ecosystem_name,
       s.waterbody,
       ST_X(s.location) longitude,
       ST_Y(s.location) latitude,
       s.created_date,
       s.updated_date
FROM geo.sites s
         LEFT JOIN geo.systems sy ON s.system_id = sy.system_id
         LEFT JOIN geo.ecosystems e ON s.ecosystem_id = e.ecosystem_id
    );

/******************************************************************************************************************
entity SCHEMA
*/

DROP VIEW IF EXISTS entity.vw_organizations;

CREATE VIEW entity.vw_organizations AS
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

DROP VIEW IF EXISTS sample.vw_boxes;

CREATE VIEW sample.vw_boxes AS
(
SELECT b.box_id,
       b.customer_id,
       o.organization_name,
       COUNT(sample_id) AS samples,
       b.submitter_id,
       i.first_name || ' ' || i.last_name AS submitter_name,
       b.box_state_id,
       t.box_state_name,
       b.box_recevied_date,
       b.processing_complete_date,
       b.projected_complete_date,
       b.project_id,
       p.project_name
FROM sample.boxes b
         INNER JOIN sample.box_states t ON b.box_state_id = t.box_state_id
            INNER JOIN entity.individuals i ON b.submitter_id = i.entity_id
    INNER JOIN entity.organizations o ON b.customer_id = o.entity_id
         LEFT JOIN sample.samples s ON b.box_id = s.box_id
         LEFT JOIN sample.projects p ON b.project_id = p.project_id
GROUP BY b.box_id,
         b.customer_id,
         o.organization_name,
         b.submitter_id,
         submitter_name,
         b.box_state_id,
         t.box_state_name,
         b.box_recevied_date,
         b.processing_complete_date,
         b.projected_complete_date,
        --  b.sort_time,
        --  b.id_time,
         b.project_id,
         b.project_id,
         p.project_name
    );

DROP VIEW IF EXISTS sample.vw_samples;
CREATE VIEW sample.vw_samples AS
(
SELECT s.sample_id,
       s.box_id,
       b.customer_id,
       b.organization_name,
       s.site_id,
       si.site_name,
       s.sample_date,
       s.sample_time,
       s.type_id,
       t.sample_type_name,
       s.method_id,
       m.sample_method_name,
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
         LEFT JOIN geo.sites si ON s.site_id = si.site_id
    );