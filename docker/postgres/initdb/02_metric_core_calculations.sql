create type metric_taxa as
(
    taxonomy_id  smallint,
    split_count  real,
    lab_split    real,
    field_split  real,
    area_sampled real
);
comment on type metric_taxa is 'basic set of data required to calculate metrics.
The taxonomy_id and split_count come from sample.organisms while the lab_split
field_split and area_sampled are from sample.samples';
/*
 ******************************************************************************************************************
 */

drop function if exists metric.fn_richness;
create or replace function metric.fn_calc_richness(p_taxa metric_taxa[])
    returns int
    language sql
    immutable
    returns null on null input
as
$$
select count(*)
from (
         select taxonomy_id
         from unnest(p_taxa)
         group by taxonomy_id
     ) mt;
$$;
comment on function metric.fn_calc_richness is
'Core richness calculation on an array of organisms. It assumes that the organisms
have already be translated and rarefied. This is purely a count of distinct taxa.';

/*
 ******************************************************************************************************************
 */
drop function if exists metric.fn_calc_abundance;
create or replace function metric.fn_calc_abundance(split_count real, lab_split real, field_split real, area_sampled real)
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select (split_count * (1 / nullif(lab_split, 0)) * (1 / nullif(field_split, 0)) * (1 / nullif(area_sampled, 0)));
$$;
comment on function metric.fn_calc_abundance is 'Abundance calculation taken from NAMC metric report spreadsheet.
 ( ([Split Count] * (100/[Lab Split])) + [Big_Rare Count]) *(100/[Field Split]) *(1/[Area Sampled])
8 Jun 2021, Trip Armstrong requested removing big rare from this equation';

/*
 ******************************************************************************************************************
 */

drop function if exists metric.fn_calc_shannons_diversity;
create or replace function metric.fn_calc_shannons_diversity(p_taxa metric_taxa[])
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select -1 * sum(relative_abundance * ln(relative_abundance))
from (
         select (metric.fn_calc_abundance(split_count, lab_split, field_split, area_sampled) /
                 total_abundance) relative_abundance
         from unnest(p_taxa) s,
              (
                  select sum(split_count) total_abundance
                  from unnest(p_taxa)
              ) t
     ) ra;
$$;
comment on function metric.fn_calc_shannons_diversity is 'Shannons Diversity Index.
-∑([Relative Abundance]taxa *ln([Relative Abundance]taxa))
https://en.wikipedia.org/wiki/Diversity_index#Shannon_index';

/*
 ******************************************************************************************************************
 */

drop function if exists metric.fn_calc_simpsons_diversity;
create or replace function metric.fn_calc_simpsons_diversity(p_taxa metric_taxa[])
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select 1 - sum(pow(relative_abundance, 2))
from (
         select (metric.fn_calc_abundance(split_count, lab_split, field_split, area_sampled) /
                 total_abundance) relative_abundance
         from unnest(p_taxa) s,
              (
                  select sum(split_count) total_abundance
                  from unnest(p_taxa)
              ) t
     ) ra;
$$;
comment on function metric.fn_calc_simpsons_diversity is 'Simpsons Diversity Index.
1 - [Simpsons Diversity] = 1 - ∑([Relative Abundance]taxa)^2
https://en.wikipedia.org/wiki/Diversity_index#Simpson_index
Note how this function actually returns one minus simpsons diversity,
which is the value that NAMC actually reports.';
