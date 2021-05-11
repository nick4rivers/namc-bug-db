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

create type taxa_info as
(
    sample_id          int,
    taxonomy_id        smallint,
    scientific_name    varchar(255),
    level_id           smallint,
    level_name         varchar(50),
    raw_count          real,
    corrected_count    real,
    raw_big_rare_count bigint
);
comment on type taxa_info is 'This type is reused as the basic structure of information returned'
    'where requesting taxonomic information about a sample.';

drop function if exists sample.fn_sample_taxa_raw;
create or replace function sample.fn_sample_taxa_raw(p_sample_id int[])
    returns setof taxa_info
    language plpgsql
as
$$
begin
    return query
        select o.sample_id,
               o.taxonomy_id,
               t.scientific_name,
               t.level_id,
               l.level_name,
               sum(o.split_count),
               sum(o.split_count) * s.lab_split * s.field_split,
               sum(o.big_rare_count)
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
    select array(select sample_id from sample.project_samples where project_id = any (p_project_id)) into p_sample_ids;

    -- Retrieve all the taxa for these sample IDs
    return query
        select * from sample.fn_sample_taxa_raw(p_sample_ids);
end
$$;

drop function if exists sample.fn_box_taxa_raw;
create or replace function sample.fn_box_taxa_raw(p_box_id int[])
    returns setof taxa_info
    language plpgsql
as
$$
declare
    p_sample_ids int[];
begin
    -- Retrieve the array of sample IDs for this project
    select array(select sample_id from sample.samples where box_id = any (p_box_id)) into p_sample_ids;

    -- Retrieve all the taxa for these sample IDs
    return query
        select * from sample.fn_sample_taxa_raw(p_sample_ids);
end
$$;



drop function if exists sample.fn_sample_taxa_generalized;
create or replace function sample.fn_sample_taxa_generalized(p_sample_id int)
    returns table
            (
                taxonomy_id              smallint,
                scientific_name          varchar(255),
                level_id                 smallint,
                level_name               varchar(50),
                life_stage_id            smallint,
                life_stage               varchar(50),
                life_stage_abbreviation  char,
                bug_size                 real,
                raw_count                real,
                corrected_count          real,
                raw_big_rare_count       bigint,
                corrected_big_rare_count real
            )
    language plpgsql
as
$$
begin
    return query
        select o.taxonomy_id,
               t.scientific_name,
               t.level_id,
               l.level_name,
               ll.life_stage_id,
               ll.life_stage_name,
               ll.abbreviation,
               o.bug_size,
               sum(o.split_count),
               sum(o.split_count) * s.lab_split * s.field_split,
               sum(o.big_rare_count),
               cast(sum(o.big_rare_count) as real) * s.lab_split * s.field_split
        from sample.organisms o
                 inner join sample.samples s on o.sample_id = s.sample_id
                 inner join taxa.taxonomy t on o.taxonomy_id = t.taxonomy_id
                 inner join taxa.taxa_levels l on t.level_id = l.level_id
                 inner join taxa.life_stages ll on o.life_stage_id = ll.life_stage_id
                 left join taxa.vw_taxonomy_crosstab ct on o.taxonomy_id = ct.taxonomy_id
        where o.sample_id = p_sample_id
        group by o.taxonomy_id,
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
as
$$
begin
    return query
        /*
         Use a lateral join that runs "for each" organism in the original sample, it looks
         up the taxa from the translation.
         */
        select o.sample_id,
               tt.translation_taxonomy_id,
               coalesce(tt.translation_scientific_name, t.scientific_name) scientific_name,
               tt.translation_level_id,
               tt.translation_level_name,
               sum(o.split_count),
               sum(o.split_count) * s.lab_split * s.field_split,
               sum(o.big_rare_count),
               cast(sum(o.big_rare_count) as real) * s.lab_split * s.field_split
        FROM sample.organisms o
                 inner join sample.samples s on o.sample_id = s.sample_id
                 inner join taxa.taxonomy t on o.taxonomy_id = t.taxonomy_id
                 inner join lateral taxa.fn_translation_taxa(p_translation_id, o.taxonomy_id) tt on true
        where o.sample_id = p_sample_id
        group by o.sample_id,
                 tt.translation_taxonomy_id,
                 scientific_name,
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


create type rarefied_taxa_info as
(
    taxonomy_id     smallint,
    scientific_name varchar(2550),
    level_id        smallint,
    level_name      varchar(50),
    organism_count  bigint
);

drop function if exists sample.fn_rarefied_taxa;
create or replace function sample.fn_rarefied_taxa(p_sample_id int, p_fixed_count int)
    returns setof rarefied_taxa_info
    language plpgsql
as
$$
begin
    return query
        select c.taxonomy_id,
               t.scientific_name,
               l.level_id,
               l.level_name,
               count(*)
        from (
                 select ts.taxonomy_id
                 from (
                          select t.taxonomy_id, uuid_generate_v1() uid
                          from (
                                   SELECT o.taxonomy_id,
                                          cast(round(
                                                  sum(split_count) * s.field_split * s.lab_split) as int) corrected_count
                                   FROM sample.organisms o
                                            inner join sample.samples s on o.sample_id = s.sample_id
                                   where s.sample_id = p_sample_id
                                   group by o.taxonomy_id, field_split, lab_split) t, generate_series(1, t.corrected_count)
                      ) ts
                 order by uid
                 limit p_fixed_count
             ) c
                 inner join taxa.taxonomy t on c.taxonomy_id = t.taxonomy_id
                 inner join taxa.taxa_levels l on t.level_id = l.level_id
        group by c.taxonomy_id, t.scientific_name, c.taxonomy_id, l.level_id, l.level_name;
end
$$;

drop function if exists sample.fn_translation_rarefied_taxa;
create or replace function sample.fn_translation_rarefied_taxa(p_sample_id int, p_translation_id int, p_fixed_count int)
    returns setof rarefied_taxa_info
    language sql
as
$$
    -- This is the same query from fn_rarefied_taxa with the exception that it
    -- queries fn_translation_taxa as the root table instead of sample.organisms directly
select c.taxonomy_id,
       t.scientific_name,
       l.level_id,
       l.level_name,
       count(*)
from (
         select ts.taxonomy_id
         from (
                  select ts.taxonomy_id, uuid_generate_v1() uid
                  from (
                           SELECT taxonomy_id,
                                  corrected_count
                           FROM sample.fn_sample_translation_taxa(p_sample_id, p_translation_id) t, generate_series(1, cast(round(t.corrected_count) as int))
                       ) ts
              ) ts
         order by uid
         limit p_fixed_count
     ) c
         inner join taxa.taxonomy t on c.taxonomy_id = t.taxonomy_id
         inner join taxa.taxa_levels l on t.level_id = l.level_id
group by c.taxonomy_id, t.scientific_name, c.taxonomy_id, l.level_id, l.level_name;
$$;