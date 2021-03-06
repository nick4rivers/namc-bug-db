-- drop type sample_info_type;
create type sample_info_type as
(
    sample_id             int,
    box_id                int,
    customer_name         varchar,
    customer_abbreviation varchar,
    submitted_by          text,
    box_state             varchar,
    site_id               int,
    site_name             varchar,
    us_state              varchar,
    site_location         text,
    site_longitude        double precision,
    site_latitude         double precision,
    visit_id              varchar,
    customer_site_code    varchar,
    sample_date           char(10),
    sample_time           time,
    sample_type           varchar,
    sample_method         varchar,
    habitat               varchar,
    sample_location       text,
    sample_longitude      double precision,
    sample_latitude       double precision,
    area                  real,
    field_split           real,
    field_notes           text,
    lab_split             real,
    jar_count             smallint,
    qualitative           boolean,
    lab_notes             text,
    mesh                  smallint,
    created_date          text,
    updated_date          text,
    sample_date_changed   text,
    qa_sample_id          int,
    metadata              text
);

-- drop type taxa_info;
create type taxa_info as
(
    sample_id       int,
    taxonomy_id     smallint,
    scientific_name varchar(255),
    level_id        smallint,
    level_name      varchar(50),
    abundance       double precision
);
comment on type taxa_info is 'This type is reused as the basic structure of information returned
    where requesting taxonomic information about a sample.';

drop function if exists sample.fn_box_info;
CREATE OR REPLACE FUNCTION sample.fn_box_info(p_box_id INT)
    returns table
            (
                box_id                   INT,
                customer_id              smallint,
                customer_name            varchar(255),
                customer_abbreviation    varchar(50),
                submitter_id             smallint,
                submitted_by             text,
                box_state_id             smallint,
                box_state                varchar(50),
                box_received_date        text,
                processing_complete_date text,
                projected_complete_date  text,
                sample_count             bigint,
                description              text,
                metadata                 json,
                measurements             boolean,
                sorter_qa                boolean,
                taxa_qa                  boolean,
                created_date             text,
                updated_date             text
            )
    language plpgsql
    immutable
AS
$$
BEGIN
    return query
        SELECT b.box_id,
               b.customer_id,
               o.organization_name,
               o.abbreviation,
               b.submitter_id,
               i.first_name || ' ' || i.last_name,
               bs.box_state_id,
               bs.box_state_name,
               to_json(b.box_received_date) #>> '{}',
               to_json(b.processing_complete_date) #>> '{}',
               to_json(b.projected_complete_date) #>> '{}',
               s.sample_count,
               b.description,
               b.metadata,
               b.measurements,
               b.sorter_qa,
               b.taxa_qa,
               to_json(b.created_date) #>> '{}',
               to_json(b.updated_date) #>> '{}'
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

drop function if exists sample.fn_samples;
create or replace function sample.fn_samples(p_limit int, p_offset int, p_sample_ids int[])
    returns setof sample_info_type
    language sql
    immutable
as
$$
SELECT s.sample_id,
       s.box_id,
       b.customer_name,
       b.customer_abbreviation,
       b.submitted_by,
       b.box_state,
       gs.site_id,
       gs.site_name,
       gs.us_state,
       gs.location,
       gs.longitude,
       gs.latitude,
       s.visit_id,
       s.customer_site_code,
       CAST(TO_CHAR(s.sample_date :: DATE, 'yyyy-mm-dd') AS CHAR(10)),
       s.sample_time,
       t.sample_type_name,
       m.sample_method_name,
       h.habitat_name,
       ST_AsGeoJSON(s.location),
       st_x(s.location::geometry),
       st_y(s.location::geometry),
       s.area,
       s.field_split,
       s.field_notes,
       s.lab_split,
       s.jar_count,
       s.qualitative,
       s.lab_notes,
       s.mesh,
       to_json(s.created_date) #>> '{}',
       to_json(s.updated_date) #>> '{}',
       to_json(s.sample_date_changed) #>> '{}',
       s.qa_sample_id,
       cast(s.metadata as text)
FROM (
         select sample_id
         from unnest(p_sample_ids) ss(sample_id)
         order by sample_id
         limit p_limit offset p_offset
     ) ss
         inner join sample.samples s on s.sample_id = ss.sample_id
         inner join sample.fn_box_info(s.box_id) b on s.box_id = b.box_id
         inner join sample.sample_types t on s.type_id = t.sample_type_id
         inner join sample.sample_methods m on s.method_id = m.sample_method_id
         inner join geo.habitats h on s.habitat_id = h.habitat_id
         left join geo.fn_site_info(s.site_id) gs on s.site_id = gs.site_id;
$$;

drop function if exists sample.fn_project_samples;
create or replace function sample.fn_project_samples(p_limit int, p_offset int, p_project_ids int[])
    returns setof sample_info_type
    language sql
    immutable
as
$$
with filtered_samples as
         (
             select array_agg(sample_id) sample_ids
             from (
                      select ps.sample_id
                      from unnest(p_project_ids) p(project_id)
                               inner join sample.project_samples ps on p.project_id = ps.project_id
                      order by sample_id
                      limit p_limit offset p_offset
                  ) arr_samples
         ),
     sample_info as
         (
             select * from sample.fn_samples(p_limit, p_offset, (select * from filtered_samples))
         )
select *
from sample_info;
$$;


drop function if exists sample.fn_box_samples;
create or replace function sample.fn_box_samples(p_limit int, p_offset int, p_box_ids int[])
    returns setof sample_info_type
    language sql
    immutable
as
$$
with filtered_samples as
         (
             select array_agg(sample_id) sample_ids
             from (
                      select sample_id
                      from unnest(p_box_ids) b(box_id)
                               inner join sample.samples s on b.box_id = s.box_id
                      order by sample_id
                      limit p_limit offset p_offset
                  ) arr_samples
         ),
     sample_info as
         (
             select * from sample.fn_samples(p_limit, p_offset, (select * from filtered_samples))
         )
select *
from sample_info;
$$;


drop function if exists sample.fn_site_samples;
create or replace function sample.fn_site_samples(p_limit int, p_offset int, p_site_ids int[])
    returns setof sample_info_type
    language sql
    immutable
as
$$
with filtered_samples as
         (
             select array_agg(sample_id) sample_ids
             from (
                      select sample_id
                      from unnest(p_site_ids) b(site_id)
                               inner join sample.samples s on b.site_id = s.site_id
                      order by sample_id
                      limit p_limit offset p_offset
                  ) arr_samples
         ),
     sample_info as
         (
             select * from sample.fn_samples(p_limit, p_offset, (select * from filtered_samples))
         )
select *
from sample_info;
$$;

drop function if exists sample.fn_entity_samples;
create or replace function sample.fn_entity_samples(p_limit int, p_offset int, p_entity_ids int[])
    returns setof sample_info_type
    language sql
    immutable
as
$$
with filtered_samples as
         (
             select array_agg(sample_id) sample_ids
             from (
                      select sample_id
                      from (
                               -- Select all child entities of the argument entities
                               select t.entity_id
                               from unnest(p_entity_ids) e(entity_id)
                                        inner join lateral entity.fn_tree(e.entity_id::smallint) t on true
                               group by t.entity_id
                           ) e
                               inner join sample.boxes b on e.entity_id = b.customer_id
                               inner join sample.samples s on s.box_id = b.box_id
                      order by sample_id
                      limit p_limit offset p_offset
                  ) arr_samples
         ),
     sample_info as
         (
             select * from sample.fn_samples(p_limit, p_offset, (select * from filtered_samples))
         )
select *
from sample_info;
$$;

drop function if exists sample.fn_polygon_samples;
create or replace function sample.fn_polygon_samples(p_limit int, p_offset int, p_polygon text)
    returns setof sample_info_type
    language sql
    immutable
as
$$
with filtered_samples as
         (
             select array_agg(sample_id) sample_ids
             from (
                      select sample_id
                      from geo.fn_polygon_sites(null, null, p_polygon) ss
                               inner join sample.samples s on ss.site_id = s.site_id
                      group by sample_id
                      order by sample_id
                      limit p_limit offset p_offset
                  ) arr_samples
         ),
     sample_info as
         (
             select * from sample.fn_samples(p_limit, p_offset, (select * from filtered_samples))
         )
select *
from sample_info;
$$;

drop function if exists sample.fn_point_distance_samples;
create or replace function sample.fn_point_distance_samples(p_limit int, p_offset int,
                                                            p_longitude double precision,
                                                            p_latitude double precision,
                                                            p_distance double precision)
    returns setof sample_info_type
    language sql
    immutable
as
$$
with filtered_samples as
         (
             select array_agg(sample_id) sample_ids
             from (
                      select sample_id
                      from geo.fn_sites_point_distance(null, null, p_longitude, p_latitude, p_distance) ss
                               inner join sample.samples s on ss.site_id = s.site_id
                      group by sample_id
                      order by sample_id
                      limit p_limit offset p_offset
                  ) arr_samples
         ),
     sample_info as
         (
             select * from sample.fn_samples(p_limit, p_offset, (select * from filtered_samples))
         )
select *
from sample_info;
$$;



drop function if exists sample.fn_plankton;
create or replace function sample.fn_plankton(p_limit int, p_offset int)
    returns table
            (
                sample_id        int,
                diameter         real,
                sub_sample_count smallint,
                tow_length       real,
                volume           real,
                aliquot          real,
                size_interval    real,
                tow_type         tow_types,
                updated_date     text
            )
    language plpgsql
    immutable
as
$$
begin
    return query
        select p.sample_id,
               p.diameter,
               p.sub_sample_count,
               p.tow_length,
               p.volume,
               p.aliquot,
               p.size_interval,
               p.tow_type,
               to_json(p.updated_date) #>> '{}'
        From sample.plankton p
        order by p.sample_id
        limit p_limit offset p_offset;
end
$$;

drop function if exists sample.fn_drift;
create or replace function sample.fn_drift(p_limit int, p_offset int)
    returns table
            (
                sample_id    int,
                net_area     double precision,
                net_duration double precision,
                stream_depth double precision,
                net_depth    double precision,
                net_velocity double precision,
                updated_date text
            )
    language plpgsql
    immutable
as
$$
begin
    return query
        select d.sample_id,
               d.net_area,
               d.net_duration,
               d.stream_depth,
               d.net_depth,
               d.net_velocity,
               to_json(d.updated_date) #>> '{}'
        from sample.drift d
        order by d.sample_id
        limit p_limit offset p_offset;
end
$$;

drop function if exists sample.fn_fish;
create or replace function sample.fn_fish(p_limit int, p_offset int)
    returns table
            (
                sample_id       int,
                taxonomy_id     smallint,
                scientific_name varchar(255),
                level_id        smallint,
                level_name      varchar(50),
                fish_length     real,
                fish_mass       real,
                updated_date    text
            )
    language plpgsql
    immutable
as
$$
begin
    return query
        select f.sample_id,
               f.taxonomy_id,
               t.scientific_name,
               l.level_id,
               l.level_name,
               f.fish_length,
               f.fish_mass,
               to_json(f.updated_date) #>> '{}'
        FROM (
                 select *
                 from sample.fish
                 order by sample_id
                 limit p_limit offset p_offset
             ) f
                 inner join taxa.taxonomy t on f.taxonomy_id = t.taxonomy_id
                 inner join taxa.taxa_levels l on t.level_id = l.level_id;
end
$$;

drop function if exists sample.fn_mass;
create or replace function sample.fn_mass(p_limit int, p_offset int)
    returns table
            (
                sample_id           int,
                type_id             smallint,
                type_abbreviation   varchar(15),
                type_name           varchar(255),
                method_id           smallint,
                method_abbreviation varchar(15),
                method_name         varchar(255),
                mass                real,
                updated_date        text
            )
    language plpgsql
    immutable
as
$$
begin
    return query
        select m.sample_id,
               m.mass_type_id,
               t.abbreviation,
               t.mass_type_name,
               m.mass_method_id,
               mm.abbreviation,
               mm.mass_method_name,
               m.mass,
               to_json(m.updated_date) #>> '{}'
        From (
                 select *
                 from sample.mass
                 order by sample_id
                 limit p_limit offset p_offset
             ) m
                 inner join sample.mass_types t on m.mass_type_id = t.mass_type_id
                 inner join sample.mass_methods mm on m.mass_method_id = mm.mass_method_id;
end
$$;

/***************************************************************************************************************
  BOXES
 */

create type box_info as
(
    box_id                   INT,
    customer_id              SMALLINT,
    customer_name            VARCHAR(255),
    sample_count             BIGINT,
    submitter_id             SMALLINT,
    submitted_by             TEXT,
    box_state_id             SMALLINT,
    box_state                VARCHAR(50),
    box_received_date        text,
    processing_complete_date text,
    projected_complete_date  text
);

drop function if exists sample.fn_boxes;
create or replace function sample.fn_boxes(p_limit int, p_offset int, p_box_ids int[])
    returns setof box_info
    language sql
    immutable
as
$$
select b.box_id,
       b.customer_id,
       o.organization_name,
       s.sample_count,
       b.submitter_id,
       i.first_name || ' ' || i.last_name,
       b.box_state_id,
       t.box_state_name,
       to_json(b.box_received_date) #>> '{}',
       to_json(b.processing_complete_date) #>> '{}',
       to_json(b.projected_complete_date) #>> '{}'
from (
         select box_id
         from unnest(p_box_ids) b(box_id)
         order by box_id
         limit p_limit offset p_offset
     ) ab
         inner join sample.boxes b on b.box_id = ab.box_id
         inner join sample.box_states t on b.box_state_id = t.box_state_id
         inner join entity.individuals i on b.submitter_id = i.entity_id
         inner join entity.organizations o on b.customer_id = o.entity_id
         left join
     (
         select sc.box_id, count(sc.box_id) sample_count from sample.samples sc group by sc.box_id
     ) s on b.box_id = s.box_id;
$$;


drop function if exists sample.fn_entity_boxes;
create or replace function sample.fn_entity_boxes(p_limit int, p_offset int, p_entity_ids int[])
    returns setof box_info
    language sql
    immutable
as
$$
with filtered_boxes as
         (
             select array_agg(box_id) box_ids
             from (
                      select box_id
                      from (
                               -- Select all child entities of the argument entities
                               select t.entity_id
                               from unnest(p_entity_ids) e(entity_id)
                                        inner join lateral entity.fn_tree(e.entity_id::smallint) t on true
                               group by t.entity_id
                           ) e
                               inner join sample.boxes b on e.entity_id = b.customer_id
                      order by box_id
                      limit p_limit offset p_offset
                  ) arr_boxes
         ),
     box_info as (
         select * from sample.fn_boxes(p_limit, p_offset, (select * from filtered_boxes))
     )
select *
from box_info;
$$;


/******************************************************************************************************************************
  SAMPLE PREDICTORS
 */


drop function if exists sample.fn_sample_predictor_values;
CREATE OR REPLACE FUNCTION sample.fn_sample_predictor_values(p_sample_id INT)
    RETURNS TABLE
            (
                predictor_id                 SMALLINT,
                abbreviation                 VARCHAR(25),
                calculation_script           VARCHAR(255),
                is_temporal                  boolean,
                predictor_metadata           TEXT,
                predictor_value              varchar(255),
                predictor_value_updated_date text,
                status                       VARCHAR(20)
            )
    language plpgsql
    immutable
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
               to_json(sp.updated_date) #>> '{}',
               CAST(CASE
                        WHEN sp.updated_date IS NULL THEN 'Missing'
                        WHEN gs.geography_changed > sp.updated_date THEN 'Expired'
                        ELSE 'Current'
                   END AS VARCHAR(20)) Status
        FROM sample.samples s
                 inner join sample.box_models bm on s.box_id = bm.box_id
                 inner join geo.sites gs on s.site_id = gs.site_id
                 inner join geo.models m on st_covers(m.extent, gs.catchment) and bm.model_id = m.model_id
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
               to_json(sp.updated_date) #>> '{}',
               CAST(CASE
                        WHEN sp.updated_date IS NULL THEN 'Missing'
                        WHEN s.sample_date_changed > sp.updated_date THEN 'Expired'
                        ELSE 'Current'
                   END AS VARCHAR(20)) Status
        FROM sample.samples s
                 inner join sample.box_models bm on s.box_id = bm.box_id
                 inner join geo.sites gs on s.site_id = gs.site_id
                 inner join geo.models m on st_covers(m.extent, gs.catchment) and bm.model_id = m.model_id
                 inner join geo.model_predictors mp on m.model_id = mp.model_id
                 inner join geo.predictors p on mp.predictor_id = p.predictor_id
                 left join sample.sample_predictors sp
                           on s.sample_id = sp.sample_id and p.predictor_id = sp.predictor_id
        where (s.sample_id = p_sample_id)
          AND (p.is_temporal)
          AND (m.is_active);
END
$$;

/******************************************************************************************************************************
  PROJECTS
 */

drop function if exists sample.fn_projects;
create or replace function sample.fn_projects(p_limit int, p_offset int)
    returns table
            (
                project_id   smallint,
                project_name varchar(255),
                is_private   boolean,
                contact_id   smallint,
                contact_name text,
                description  text,
                sample_count bigint,
                model_count  bigint,
                created_date text,
                updated_date text
            )
    language plpgsql
    immutable
as
$$
begin
    return query
        SELECT p.project_id,
               p.project_name,
               p.is_private,
               i.entity_id,
               i.first_name || ' ' || i.last_name,
               p.description,
               coalesce(sc.sample_count, 0),
               coalesce(mc.model_count, 0),
               to_json(p.created_date) #>> '{}',
               to_json(p.updated_date) #>> '{}'
        FROM sample.projects p
                 inner join (select pc.project_id
                             from sample.projects pc
                             order by pc.project_id
                             limit p_limit offset p_offset) pg
                            on p.project_id = pg.project_id
                 left join entity.individuals i on p.contact_id = i.entity_id
                 left join (select ps.project_id, count(*) sample_count
                            from sample.project_samples ps
                            group by ps.project_id) sc
                           on sc.project_id = p.project_id
                 left join (select pm.project_id, count(*) model_count
                            from sample.project_models pm
                            group by pm.project_id) mc
                           on mc.project_id = p.project_id;
end
$$;

drop function if exists sample.fn_corrected_count;
create or replace function sample.fn_corrected_count(split_count real, lab_split real, field_split real)
    returns double precision
    language sql
    immutable
    returns null on null input
as
$$
select (split_count * (1 / nullif(lab_split, 0)) * (1 / nullif(field_split, 0)));
$$;

drop function if exists sample.fn_sample_taxa_raw;
create or replace function sample.fn_sample_taxa_raw(p_sample_id int[])
    returns setof taxa_info
    language plpgsql
    immutable
as
$$
begin
    return query
        select o.sample_id,
               o.taxonomy_id,
               t.scientific_name,
               t.level_id,
               l.level_name,
               sum(metric.fn_calc_abundance(split_count, lab_split, field_split, area))
        from sample.organisms o
                 inner join sample.samples s on o.sample_id = s.sample_id
                 inner join taxa.taxonomy t on o.taxonomy_id = t.taxonomy_id
                 inner join taxa.taxa_levels l on t.level_id = l.level_id
                 left join taxa.vw_taxonomy_crosstab ct on o.taxonomy_id = ct.taxonomy_id
        where o.sample_id = any (p_sample_id)
        group by o.sample_id,
                 o.taxonomy_id,
                 t.scientific_name,
                 t.level_id,
                 l.level_name,
                 s.lab_split,
                 s.field_split;
end
$$;
comment on function sample.fn_sample_taxa_raw is
    'returns the organisms within a particular in their original taxonomic classification';

drop function if exists sample.fn_project_taxa_raw;
create or replace function sample.fn_project_taxa_raw(p_project_id int[])
    returns setof taxa_info
    language plpgsql
as
$$
declare
    p_sample_ids int[];
begin
    -- Retrieve the array of sample IDs for this project
    select array(select sample_id from sample.project_samples where project_id = any (p_project_id))
    into p_sample_ids;

-- Retrieve all the taxa for these sample IDs
    return query
        select *
        from sample.fn_sample_taxa_raw(p_sample_ids);
end
$$;

drop function if exists sample.fn_box_taxa_raw;
create or replace function sample.fn_box_taxa_raw(p_box_id int[])
    returns setof taxa_info
    language plpgsql
    immutable
as
$$
declare
    p_sample_ids int[];
begin
    -- Retrieve the array of sample IDs for this project
    select array(select sample_id from sample.samples where box_id = any (p_box_id))
    into p_sample_ids;

-- Retrieve all the taxa for these sample IDs
    return query
        select *
        from sample.fn_sample_taxa_raw(p_sample_ids);
end
$$;

drop function if exists sample.fn_taxa_raw_point_distance;
create or replace function sample.fn_taxa_raw_point_distance(p_longitude double precision, p_latitude double precision,
                                                             p_distance double precision)
    returns setof taxa_info
    language plpgsql
    immutable
as
$$
declare
    p_sample_ids int[];
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

    select array(
                   select sample_id
                   from sample.samples s
                            inner join geo.sites ss on s.site_id = ss.site_id
                   where st_dwithin(ss.location, ST_SetSRID(st_point(p_longitude, p_latitude), 4326), p_distance, false)
               )
    into p_sample_ids;

    return query
        select *
        from sample.fn_sample_taxa_raw(p_sample_ids);

end
$$;

drop function if exists sample.fn_taxa_raw_polygon;
create or replace function sample.fn_taxa_raw_polygon(p_search_polygon text)
    returns setof taxa_info
    language plpgsql
    immutable
as
$$
declare
    p_search_geography geometry(MultiPolygon, 4326);
    p_sample_ids       int[];
begin

    if
        (p_search_polygon IS NULL)
    then
        raise exception 'The search polygon cannot be NULL.';
    end if;

    p_search_geography := st_multi(st_setsrid(st_geomfromgeojson(p_search_polygon), 4326));

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

    select array(
                   select sample_id
                   from sample.samples s
                            inner join geo.sites ss on s.site_id = ss.site_id
                   where st_covers(p_search_geography::geography, ss.location)
               )
    into p_sample_ids;

    return query
        select *
        from sample.fn_sample_taxa_raw(p_sample_ids);
end
$$;

drop function if exists sample.fn_sample_taxa_generalized;
create or replace function sample.fn_sample_taxa_generalized(p_sample_id int)
    returns table
            (
                sample_id               int,
                taxonomy_id             smallint,
                scientific_name         varchar(255),
                level_id                smallint,
                level_name              varchar(50),
                life_stage_id           smallint,
                life_stage              varchar(50),
                life_stage_abbreviation char,
                bug_size                real,
                raw_count               real,
                lab_split               real,
                field_split             real,
                corrected_count         real,
                raw_big_rare_count      bigint
            )
    language plpgsql
    immutable
as
$$
begin
    return query
        select s.sample_id,
               o.taxonomy_id,
               t.scientific_name,
               t.level_id,
               l.level_name,
               ll.life_stage_id,
               ll.life_stage_name,
               ll.abbreviation,
               o.bug_size,
               sum(o.split_count),
               s.lab_split,
               s.field_split,
               sum(o.split_count) * s.lab_split * s.field_split,
               sum(o.big_rare_count)
        from sample.organisms o
                 inner join sample.samples s on o.sample_id = s.sample_id
                 inner join taxa.taxonomy t on o.taxonomy_id = t.taxonomy_id
                 inner join taxa.taxa_levels l on t.level_id = l.level_id
                 inner join taxa.life_stages ll on o.life_stage_id = ll.life_stage_id
                 left join taxa.vw_taxonomy_crosstab ct on o.taxonomy_id = ct.taxonomy_id
        where o.sample_id = p_sample_id
        group by s.sample_id,
                 o.taxonomy_id,
                 t.scientific_name,
                 t.level_id,
                 l.level_name,
                 ll.life_stage_id,
                 ll.life_stage_name,
                 ll.abbreviation,
                 o.bug_size,
                 s.lab_split,
                 s.field_split;
end
$$;


drop function if exists sample.fn_sample_translation_taxa;
create or replace function sample.fn_sample_translation_taxa(p_sample_id int, p_translation_id int)
    returns setof taxa_info
    language plpgsql
    immutable
as
$$
begin
    return query
        /*
         Use a lateral join that runs "for each" organism in the original sample, it looks
         up the taxa from the translation.
         */
        select o.sample_id,
               tt.taxonomy_id,
               cast(tt.translation_scientific_name as varchar(255)),
               tt.translation_level_id,
               cast(tt.translation_level_name as varchar(50)),
               sum(metric.fn_calc_abundance(o.split_count, s.lab_split, s.field_split, s.area))
        FROM sample.organisms o
                 inner join sample.samples s on o.sample_id = s.sample_id
                 inner join lateral taxa.fn_translation_taxonomy(p_translation_id, o.taxonomy_id) tt on true
        where o.sample_id = p_sample_id
        group by o.sample_id,
                 tt.taxonomy_id,
                 tt.translation_scientific_name,
                 tt.translation_level_id,
                 tt.translation_level_name,
                 s.lab_split,
                 s.field_split;
end
$$;
comment on function sample.fn_sample_translation_taxa is
    'Returns the organisms for a particular sample mapped to a particular translation.
    Note that the output taxonomy_id and scientific name are those of the translation, not
    the original taxa used by the lab!';


-- This function is no longer used. There is never a case when you want to rarefy without first translating.
-- Use sample.fn_fn_translation_rarefied_taxa() instead.

-- drop function if exists sample.fn_rarefied_taxa;
-- create or replace function sample.fn_rarefied_taxa(p_sample_id int, p_fixed_count int)
--     returns setof taxa_info
--     language plpgsql
--     immutable
-- as
-- $$
-- begin
--     return query
--         select p_sample_id,
--                c.taxonomy_id,
--                t.scientific_name,
--                l.level_id,
--                l.level_name,
--                count(*)::double precision
--         from (
--                  select ts.taxonomy_id
--                  from (
--                           select t.taxonomy_id, uuid_generate_v1() uid
--                           from (
--                                    SELECT o.taxonomy_id,
--                                           round(sum(
--                                                   sample.fn_corrected_count(o.split_count, s.lab_split,
--                                                                             s.field_split)))::int corrected_count
--                                    FROM sample.organisms o
--                                             inner join sample.samples s
--                                                        on o.sample_id = s.sample_id
--                                    where s.sample_id = p_sample_id
--                                    group by o.taxonomy_id, field_split, lab_split) t, generate_series(1, t.corrected_count)
--                       ) ts
--                  order by uid
--                  limit p_fixed_count) c
--                  inner join taxa.taxonomy t on c.
--                                                    taxonomy_id = t.taxonomy_id
--                  inner join taxa.taxa_levels l on t.
--                                                       level_id = l.level_id
--         group by c.taxonomy_id, t.scientific_name, c.taxonomy_id, l.level_id, l.level_name;
-- end
-- $$;

drop function if exists sample.fn_translation_rarefied_taxa;
create or replace function sample.fn_translation_rarefied_taxa(p_sample_id int, p_translation_id int, p_fixed_count int)
    returns setof taxa_info
    language sql
    immutable
    returns null on null input
as
$$
    -- This is the same query from fn_rarefied_taxa with the exception that it
    -- queries fn_translation_taxa as the root table instead of sample.organisms directly
select p_sample_id,
       c.taxonomy_id,
       t.scientific_name,
       l.level_id,
       l.level_name,
       count(*)::double precision
from (
         select ts.taxonomy_id
         from (
                  select ts.taxonomy_id
                  from (
                           -- Duplicates each row the number of times there are in the correct count
                           SELECT taxonomy_id,
                                  abundance
                           FROM sample.fn_sample_translation_taxa(p_sample_id, p_translation_id) t, generate_series(1, cast(round(t.abundance) as int))
                       ) ts
              ) ts
         order by random()
         limit p_fixed_count
     ) c
         inner join taxa.taxonomy t on c.taxonomy_id = t.taxonomy_id
         inner join taxa.taxa_levels l on t.level_id = l.level_id
group by c.taxonomy_id, t.scientific_name, l.level_id, l.level_name;
$$;

create or replace function sample.fn_model_results(p_limit int, p_offset int, p_sample_ids int[])
    returns table
            (
                sample_id     int,
                site_id       int,
                site_name     varchar,
                model_id      smallint,
                model_name    varchar,
                model_version varchar,
                model_result  real,
                condition     varchar,
                fix_count     smallint,
                notes         text,
                metadata      text,
                created_date  text,
                updated_date  text
            )
    immutable
    returns null on null input
    language sql
as
$$

select s.sample_id,
       si.site_id,
       si.site_name,
       m.model_id,
       m.model_name,
       mr.model_version,
       mr.model_result,
       mt.display_text,
       mr.fixed_count,
       mr.notes,
       cast(mr.metadata as text),
       to_json(s.created_date) #>> '{}',
       to_json(s.updated_date) #>> '{}'
from sample.model_results mr
         inner join unnest(p_sample_ids) p(sample_id) on mr.sample_id = p.sample_id
         inner join sample.samples s on p.sample_id = s.sample_id
         inner join geo.sites si on s.site_id = si.site_id
         inner join geo.models m on mr.model_id = m.model_id
         left join geo.model_conditions mt on m.model_id = mt.model_id and mr.model_result::numeric <@ mt.condition
order by mr.sample_id, mr.model_id, mr.model_version, mr.fixed_count
limit p_limit offset p_offset;
$$;
