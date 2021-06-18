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

/********************************************************************************************************************
  ENTRY POINT FUNCTIONS
*/
-- drop type metric_result;
create type metric_result as
(
    group_id     smallint,
    group_name   varchar(255),
    metric_id    smallint,
    metric_name  varchar(255),
    metric_value text
);

drop function if exists metric.run_metric;
create or replace function metric.run_metric(p_metric_id int, p_code_function text, p_raw_taxa taxa_info2[],
                                             p_rarefied_taxa taxa_info2[])
    returns text
    language plpgsql
    immutable
as
$$
declare
    result text;
begin
    execute format('select %s(%L::int, %L::taxa_info2[], %L::taxa_info2[])::text',
                   p_code_function,
                   p_metric_id,
                   p_raw_taxa,
                   p_rarefied_taxa) into result;
    return result;
end
$$;

drop function if exists metric.sample_metrics;
create or replace function metric.sample_metrics(p_sample_id int, p_translation_id int, p_fixed_count int)
    returns setof metric_result
    language plpgsql
    immutable
as
$$
declare
    raw_taxa      taxa_info2[];
    rarefied_taxa taxa_info2[];
begin
    -- Load all the organisms for this sample using their original taxonomy
    select metric.fn_load_sample_taxa(p_sample_id) into raw_taxa;

    -- Load the organisms for this sample and standardize to OTU taxonomy, then select random organisms from this list
    select metric.fn_load_rarefied_taxa(p_sample_id, p_translation_id, p_fixed_count)
    into rarefied_taxa;

    return query
        select g.group_id,
               g.group_name,
               m.metric_id,
               m.metric_name,
               metric.run_metric(m.metric_id, m.code_function, raw_taxa, rarefied_taxa)
        from metric.metrics m
                 inner join metric.metric_groups g
                            on m.group_id = g.group_id
        where (m.is_active = true)
          and (m.code_function is not null)
        order by g.sort_order;
end
$$;

/********************************************************************************************************************
  SUPPORT FUNCTIONS
*/
drop function if exists metric.fn_load_sample_taxa;
create function metric.fn_load_sample_taxa(p_sample_id int)
    returns taxa_info2[]
    language sql
    immutable
    returns null on null input
as
$$
select array_agg((taxonomy_id, scientific_name, level_id, level_name, abundance)::taxa_info2)
from sample.fn_sample_taxa_raw(Array [p_sample_id]);
$$;

create or replace function metric.fn_load_rarefied_taxa(p_sample_id int, p_translation_id int, p_fixed_count int)
    returns taxa_info2[]
    language sql
    immutable
    returns null on null input
as
$$
select array_agg((taxonomy_id, scientific_name, level_id, level_name, abundance)::taxa_info2)
from sample.fn_translation_rarefied_taxa(p_sample_id, coalesce(p_translation_id, 3), coalesce(p_fixed_count, 300));
$$;

drop function if exists metric.fn_filter_taxa_by_taxa;
create or replace function metric.fn_filter_taxa_by_taxa(p_metric_id int, p_taxa taxa_info2[])
    returns taxa_info2[]
    language sql
    immutable
    returns null on null input
as
$$
select array_agg((t.taxonomy_id, t.scientific_name, t.level_id, t.level_name, t.abundance)::taxa_info2)
from unnest(p_taxa) t
         join metric.metric_taxa m on true
where (m.metric_id = p_metric_id)
  and (taxa.fn_is_descended_from(t.taxonomy_id, m.taxonomy_id::smallint));
$$;



drop function if exists metric.fn_filter_taxa_by_attribute;
create or replace function metric.fn_filter_taxa_by_attribute(p_taxa taxa_info2[], p_metric_id int)
    returns taxa_info2[]
    language sql
    immutable
    returns null on null input
as
$$
select array_agg((taxonomy_id, scientific_name, level_id, level_name, abundance)::taxa_info2)
from (
         select ti.taxonomy_id,
                ti.scientific_name,
                ti.level_id,
                ti.level_name,
                sum(ti.abundance) abundance
         from unnest(p_taxa) ti
                  inner join taxa.taxa_attributes ta on ti.taxonomy_id = ta.taxonomy_id
                  inner join metric.metric_attributes ma on ta.attribute_id = ma.attribute_id
         where (ma.metric_id = p_metric_id)
           and (ta.attribute_value ilike (ma.where_clause))
         group by ti.taxonomy_id, ti.scientific_name, ti.level_id, ti.level_name
     ) ta
$$;

drop function if exists metric.fn_filter_taxa_by_level;
create or replace function metric.fn_filter_taxa_by_level(p_taxa taxa_info2[], p_level_id int)
    returns taxa_info2[]
    language sql
    immutable
    returns null on null input
as
$$
select array_agg((taxonomy_id, scientific_name, level_id, level_name, abundance)::taxa_info2)
from (
         select t2.taxonomy_id, t2.scientific_name, t2.level_id, t2.level_name, sum(t2.abundance) abundance
         from (
                  -- Duplicate the individual taxa abundance for all parents up through the NAMC hierarchy
                  select tt.taxonomy_id, tt.scientific_name, tt.level_id, tt.level_name, t.abundance
                  from unnest(p_taxa) t
                           join taxa.fn_tree(t.taxonomy_id) tt on true
              ) t2
              -- select the abundances for the specific level
         where level_id = p_level_id
         group by t2.taxonomy_id, t2.scientific_name, t2.level_id, t2.level_name
     ) ta
$$;


/********************************************************************************************************************
  ABUNDANCE
*/
drop function if exists metric.sample_abundance;
create or replace function metric.fn_sample_abundance(p_metric_id int, p_raw_taxa taxa_info2[],
                                                      p_rarefied_taxa taxa_info2[])
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select sum(abundance)
from unnest(p_raw_taxa);
$$;

drop function if exists metric.fn_taxa_abundance;
create or replace function metric.fn_taxa_abundance(p_metric_id int, p_raw_taxa taxa_info2[],
                                                    p_rarefied_taxa taxa_info2[])
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select sum(abundance)
from unnest(p_raw_taxa) t
         join metric.metric_taxa m on true
where (m.metric_id = p_metric_id)
  and (taxa.fn_is_descended_from(t.taxonomy_id, m.taxonomy_id::smallint));
$$;


drop function if exists metric.fn_attribute_abundance;
create or replace function metric.fn_attribute_abundance(p_metric_id int, p_raw_taxa taxa_info2[],
                                                         p_rarefied_taxa taxa_info2[])
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select sum(abundance)
from unnest(metric.fn_filter_taxa_by_attribute(p_raw_taxa, p_metric_id));
$$;


drop function if exists metric.fn_exclude_taxa_abundance;
create or replace function metric.fn_exclude_taxa_abundance(p_metric_id int, p_raw_taxa taxa_info2[],
                                                            p_rarefied_taxa taxa_info2[])
    returns real
    language sql
    immutable
    returns null on null input
as
$$
    -- Sample abundance - abundance of selected taxa;
select metric.fn_sample_abundance(p_metric_id, p_raw_taxa, p_rarefied_taxa)
           - metric.fn_taxa_abundance(p_metric_id, p_raw_taxa, p_rarefied_taxa);
$$;

/********************************************************************************************************************
  RICHNESS
*/

drop function if exists metric.sample_richness;
create or replace function metric.fn_sample_richness(p_metric_id int, p_raw_taxa taxa_info2[],
                                                     p_rarefied_taxa taxa_info2[])
    returns bigint
    language sql
    immutable
    returns null on null input
as
$$
select metric.fn_calc_richness(p_rarefied_taxa);
$$;

drop function if exists metric.taxa_richness;
create or replace function metric.fn_taxa_richness(p_metric_id int, p_raw_taxa taxa_info2[],
                                                   p_rarefied_taxa taxa_info2[])
    returns bigint
    language sql
    immutable
    returns null on null input
as
$$
select metric.fn_calc_richness(metric.fn_filter_taxa_by_taxa(p_metric_id, p_rarefied_taxa));
$$;

drop function if exists metric.attribute_richness;
create or replace function metric.fn_attribute_richness(p_metric_id int, p_raw_taxa taxa_info2[],
                                                        p_rarefied_taxa taxa_info2[])
    returns bigint
    language sql
    immutable
    returns null on null input
as
$$
select metric.fn_calc_richness(metric.fn_filter_taxa_by_attribute(p_rarefied_taxa, p_metric_id));
$$;

drop function if exists metric.fn_exclude_taxa_richness;
create or replace function metric.fn_exclude_taxa_richness(p_metric_id int, p_raw_taxa taxa_info2[],
                                                           p_rarefied_taxa taxa_info2[])
    returns bigint
    language sql
    immutable
    returns null on null input
as
$$
    -- Total sample richness - taxa richness;
select metric.fn_sample_richness(p_metric_id, p_raw_taxa, p_rarefied_taxa)
           - metric.fn_taxa_richness(p_metric_id, p_raw_taxa, p_rarefied_taxa);
$$;

/********************************************************************************************************************
  SHANNON'S DIVERSITY
*/
drop function if exists metric.fn_shannons_diversity;
create or replace function metric.fn_shannons_diversity(p_metric_id int, p_raw_taxa taxa_info2[],
                                                        p_rarefied_taxa taxa_info2[])
    returns double precision
    language sql
    immutable
    returns null on null input
as
$$
select metric.fn_calc_shannons_diversity(p_rarefied_taxa);
$$;

/********************************************************************************************************************
  SIMPSON'S DIVERSITY
*/
drop function if exists metric.fn_simpsons_diversity;
create or replace function metric.fn_simpsons_diversity(p_metric_id int, p_raw_taxa taxa_info2[],
                                                        p_rarefied_taxa taxa_info2[])
    returns double precision
    language sql
    immutable
    returns null on null input
as
$$
select metric.fn_calc_simpsons_diversity(p_rarefied_taxa);
$$;

/********************************************************************************************************************
  Hilsenhoff
*/

drop function if exists metric.fn_hilsenhoff;
create or replace function metric.fn_hilsenhoff(p_metric_id int, p_raw_taxa taxa_info2[], p_rarefied_taxa taxa_info2[])
    returns double precision
    language sql
    immutable
    returns null on null input
as
$$
select sum(t.abundance * ta.attribute_value::int) /
       metric.fn_sample_abundance(p_metric_id, p_rarefied_taxa, p_rarefied_taxa)
from unnest(p_rarefied_taxa) t
         inner join taxa.taxa_attributes ta on t.taxonomy_id = ta.taxonomy_id
where (ta.attribute_id = 6) and (ta.attribute_value <> '11');
$$;
comment on function metric.fn_hilsenhoff is '∑([Abundance]taxa *[Tolerance]taxa) /[Abundance]Total';


/********************************************************************************************************************
  EVENNESS
*/
drop function if exists metric.fn_evenness;
create or replace function metric.fn_evenness(p_metric_id int, p_raw_taxa taxa_info2[], p_rarefied_taxa taxa_info2[])
    returns real
    language plpgsql
    immutable
    returns null on null input
as
$$
declare
    richness bigint;
    result   real;
begin
    richness = metric.fn_calc_richness(p_rarefied_taxa);
    if (richness <= 1) then
        return 0;
    end if;

    select metric.fn_calc_shannons_diversity(p_rarefied_taxa) / ln(richness) into result;
    return result;
end
$$;

/********************************************************************************************************************
  DOMINANCE
*/

create or replace function metric.fn_dominant_family(p_metric_id int, p_raw_taxa taxa_info2[],
                                                     p_rarefied_taxa taxa_info2[])
    returns text
    language sql
    immutable
    returns null on null input
as
$$
-- level_id 19 = family
select scientific_name
from unnest(metric.fn_filter_taxa_by_level(p_raw_taxa, 19))
order by abundance DESC
limit 1;
$$;

create or replace function metric.fn_dominant_family_abundance(p_metric_id int, p_raw_taxa taxa_info2[],
                                                               p_rarefied_taxa taxa_info2[])
    returns real
    language sql
    immutable
    returns null on null input
as
$$
-- level_id 19 = family
select abundance
from unnest(metric.fn_filter_taxa_by_level(p_raw_taxa, 19))
order by abundance DESC
limit 1;
$$;

drop function if exists metric.fn_dominant_taxa;
create or replace function metric.fn_dominant_taxa(p_metric_id int, p_raw_taxa taxa_info2[],
                                                   p_rarefied_taxa taxa_info2[])
    returns text
    language sql
    immutable
    returns null on null input
as
$$
select scientific_name
from unnest(p_raw_taxa)
order by abundance DESC
limit 1;
$$;

drop function if exists metric.fn_dominant_taxa_abundance;
create or replace function metric.fn_dominant_taxa_abundance(p_metric_id int, p_raw_taxa taxa_info2[],
                                                             p_rarefied_taxa taxa_info2[])
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select abundance
from unnest(p_raw_taxa)
order by abundance DESC
limit 1;
$$;
