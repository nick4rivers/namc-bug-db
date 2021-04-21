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
                to_json         text
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