
create type taxa_info2 as
(
    taxonomy_id     smallint,
    scientific_name varchar(255),
    level_id        smallint,
    level_name      varchar(50),
    abundance       real
);
/*
 ******************************************************************************************************************
 */

drop function if exists metric.fn_calc_richness;
create or replace function metric.fn_calc_richness(p_taxa taxa_info2[])
    returns bigint
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
    returns double precision
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
create or replace function metric.fn_calc_shannons_diversity(p_taxa taxa_info2[])
    returns double precision
    language sql
    immutable
    returns null on null input
as
$$
select -1 * sum((taxa_abundance / total_abundance) * ln(taxa_abundance / total_abundance))
from (
         select sum(abundance) as taxa_abundance from unnest(p_taxa) group by taxonomy_id
     ) taxa
         join
     (
         select sum(abundance) total_abundance from unnest(p_taxa)
     ) total on true;
$$;
comment on function metric.fn_calc_shannons_diversity is 'Shannons Diversity Index.
-∑([Relative Abundance]taxa *ln([Relative Abundance]taxa))
https://en.wikipedia.org/wiki/Diversity_index#Shannon_index';

/*
 ******************************************************************************************************************
 */

drop function if exists metric.fn_calc_simpsons_diversity;
create or replace function metric.fn_calc_simpsons_diversity(p_taxa taxa_info2[])
    returns double precision
    language sql
    immutable
    returns null on null input
as
$$
select 1 - sum(pow(taxa_abundance / total_abundance, 2))
from (
         select sum(abundance) as taxa_abundance from unnest(p_taxa) group by taxonomy_id
     ) taxa
         join
     (
         select sum(abundance) total_abundance from unnest(p_taxa)
     ) total on true;
$$;
comment on function metric.fn_calc_simpsons_diversity is 'Simpsons Diversity Index.
1 - [Simpsons Diversity] = 1 - ∑([Relative Abundance]taxa)^2
https://en.wikipedia.org/wiki/Diversity_index#Simpson_index
Note how this function actually returns one minus simpsons diversity,
which is the value that NAMC actually reports.';
