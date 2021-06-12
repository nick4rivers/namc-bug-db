drop function if exists metric.fn_metrics;
create or replace function metric.fn_metrics(p_limit int, p_offset int)
    returns table
            (
                metric_id             smallint,
                metric_name           varchar(255),
                group_id              smallint,
                group_name            varchar(255),
                formula_id            smallint,
                formula_name          text,
                formula_code_function varchar(100),
                is_standardized       boolean,
                perturb_direction     perturbation_directions,
                description           text,
                created_date          text,
                updated_date          text
            )
    language sql
    immutable
as
$$

select m.metric_id,
       m.metric_name,
       m.group_id,
       mg.group_name,
       m.formula_id,
       f.display_text,
       f.code_function,
       m.is_standardized,
       m.perturb_direction,
       m.description,
       to_json(m.created_date) #>> '{}',
       to_json(m.updated_date) #>> '{}'
from metric.metrics m
         inner join
     (
         select mm.*
         from metric.metrics mm
         order by mm.metric_id
         limit p_limit offset p_offset
     ) ml on m.metric_id = ml.metric_id
         inner join metric.metric_groups mg on m.group_id = mg.group_id
         left join metric.formulae f on m.formula_id = f.formula_id
$$;

drop function if exists metric.fn_sample_richness;
create or replace function metric.fn_sample_richness(p_metric_id int, p_sample_id int, p_translation_id int,
                                                     p_fixed_count int)
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select metric.fn_calc_richness(
               array_agg((p_sample_id, taxonomy_id, scientific_name, level_id, level_name, abundance)::taxa_info))::real
from sample.fn_translation_rarefied_taxa(p_sample_id, p_translation_id, p_fixed_count);
$$;

create or replace function metric.fn_taxa_richness(p_metric_id int, p_sample_id int, p_translation_id int,
                                                   p_fixed_count int)
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select metric.fn_calc_richness(
               array_agg((p_sample_id, t.taxonomy_id, scientific_name, level_id, level_name, abundance)::taxa_info))::real
from (
         -- Duplicate the rarefied taxa for all taxa up through the hierarchy
         select tt.taxonomy_id, tt.scientific_name, tt.level_id, tt.level_name, st.abundance
         from sample.fn_translation_rarefied_taxa(p_sample_id, p_translation_id, p_fixed_count) st
                  join
              taxa.fn_tree(taxonomy_id) tt on true
     ) t
         -- join the taxa to the metric taxa to filter to just the ones we want inner join
         inner join
     (
         select taxonomy_id
         from metric.metric_taxa
         where metric_id = p_metric_id
     ) mt
     on t.taxonomy_id = mt.taxonomy_id;
$$;



drop function if exists metric.fn_taxa_abundance;
create or replace function metric.fn_taxa_abundance(p_metric_id int, p_sample_id int, p_translation_id int,
                                                    p_fixed_count int)
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select coalesce(sum(abundance), 0)
from (
         -- select all the sample organisms and duplicate the abundance for each
         -- taxa up the hierarchy
         select tt.taxonomy_id, abundance
         from sample.fn_sample_taxa_raw(Array [p_sample_id]) st
                  join
              taxa.fn_tree(taxonomy_id) tt on true
     ) t
         -- join the duplicated sample taxa to metric taxa and filter for
         -- those taxa that exist in the metric
         inner join
     (
         select taxonomy_id
         from metric.metric_taxa
         where metric_id = p_metric_id
     ) mt
     on t.taxonomy_id = mt.taxonomy_id;
$$;

drop function if exists metric.fn_sample_abundance;
create or replace function metric.fn_sample_abundance(p_metric_id int, p_sample_id int, p_translation_id int,
                                                      p_fixed_count int)
    returns real
    language sql
    immutable
as
$$
select sum(abundance)
from sample.fn_sample_taxa_raw(Array [p_sample_id]);
$$;

-- create or replace function metric.fn_attribute_abundance(p_sample_id int, p_attribute_id int)
--     returns real
--     language sql
--     immutable
-- as
-- $$
-- select metric.fn_abundance(coalesce(sum(split_count), 0), lab_split, field_split, area)
-- from sample.samples s
--          inner join sample.organisms o on o.sample_id = s.sample_id
--          inner join taxa.taxa_attributes a on o.taxonomy_id = a.taxonomy_id
-- where (s.sample_id = p_sample_id)
--   and (a.attribute_id = p_attribute_id)
-- group by lab_split, field_split, area;
-- $$;

-- create type metric_taxa as
-- (
--     taxonomy_id  smallint,
--     split_count  real,
--     lab_split    real,
--     field_split  real,
--     area_sampled real
-- );

drop function if exists metric.fn_sample_shannons_diversity;
create or replace function metric.fn_sample_shannons_diversity(p_metric_id int, p_sample_id int, p_translation_id int,
                                                               p_fixed_count int)
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select metric.fn_calc_shannons_diversity(
               array_agg((p_sample_id, taxonomy_id, scientific_name, level_id, level_name, abundance)::taxa_info))
from sample.fn_translation_rarefied_taxa(p_sample_id, p_translation_id, p_fixed_count);
$$;

drop function metric.fn_sample_simpsons_diversity;
create or replace function metric.fn_sample_simpsons_diversity(p_metric_id int, p_sample_id int, p_translation_id int,
                                                               p_fixed_count int)
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select metric.fn_calc_simpsons_diversity(
               array_agg((p_sample_id, taxonomy_id, scientific_name, level_id, level_name, abundance)::taxa_info))
from sample.fn_translation_rarefied_taxa(p_sample_id, p_translation_id, p_fixed_count);
$$;

create or replace function metric.fn_sample_evenness(p_metric_id int, p_sample_id int, p_translation_id int,
                                                     p_fixed_count int)
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select metric.fn_calc_shannons_diversity(
               array_agg((p_sample_id, taxonomy_id, scientific_name, level_id, level_name, abundance)::taxa_info))
           / ln(metric.fn_calc_richness(
            array_agg((p_sample_id, taxonomy_id, scientific_name, level_id, level_name, abundance)::taxa_info)))
from sample.fn_translation_rarefied_taxa(p_sample_id, p_translation_id, p_fixed_count); k$$;

-- drop function if exists metric.fn_sample_taxa;
-- create or replace function metric.fn_sample_taxa(p_sample_id int, p_translation_id int, p_fixed_count int)
--     returns setof taxa_info
--     language plpgsql
-- as
-- $$
--     declare p_rarefaction_id int;
-- begin
--     if (p_translation_id IS NULL) then
--         return query select * from sample.fn_sample_taxa_raw(Array[p_sample_id]);
--     else
--         if (p_fixed_count IS NULL) then
--             return query select * FROM sample.fn_sample_translation_taxa(p_sample_id, p_translation_id);
--         else
--             return query select * from sample.fn_translation_rarefied_taxa(p_sample_id, p_translation_id, p_fixed_count);
--         end if;
--     end if;
-- end;
-- $$;

drop type metric_result;
create type metric_result as
(
    group_id     smallint,
    group_name   varchar(255),
    metric_id    smallint,
    metric_name  varchar(255),
    metric_value real
);

drop function if exists metric.run_metric;
create or replace function metric.run_metric(p_metric_id int, p_metric_function text,
                                             p_sample_id int, p_translation_id int, p_fixed_count int)
    returns setof real
    language plpgsql
as
$$
begin
    return query execute format('select %s(%L::int, %L::int, %L::int, %L::int)',
                                p_metric_function,
                                p_metric_id,
                                p_sample_id,
                                p_translation_id,
                                p_fixed_count);
end
$$;

drop function if exists metric.sample_metrics;
create or replace function metric.sample_metrics(p_sample_id int, p_translation_id int, p_fixed_count int)
    returns setof metric_result
    language sql
as
$$
select g.group_id,
       g.group_name,
       m.metric_id,
       m.metric_name,
       metric.run_metric(metric_id::int,
                         m.display_text,
                         p_sample_id,
                         p_translation_id,
                         p_fixed_count) metric_value
from metric.metrics m
         inner join metric.metric_groups g on m.group_id = g.group_id
where is_active = true
order by g.sort_order;
$$;