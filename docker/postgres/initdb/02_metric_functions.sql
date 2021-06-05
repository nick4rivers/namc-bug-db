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

create or replace function metric.fn_taxa_abundance(p_sample_id int, p_taxonomy_id int)
    returns real
    language sql
    immutable
as
$$
select metric.fn_abundance(sum(split_count),
                           sum(big_rare_count),
                           lab_split,
                           field_split,
                           area) abundance
from (
         select taxonomy_id,
                sum(split_count)    split_count,
                sum(big_rare_count) big_rare_count
         from sample.organisms
         where sample_id = p_sample_id
         group by taxonomy_id
     ) o
         inner join lateral taxa.fn_tree(o.taxonomy_id) t
                    on true
         join
     (
         select area, lab_split, field_split from sample.samples where sample_id = p_sample_id
     ) s on true
where (t.taxonomy_id = p_taxonomy_id)
group by lab_split, field_split, area;
$$;

create or replace function metric.fn_sample_abundance(p_sample_id int)
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select metric.fn_abundance(sum(coalesce(split_count, 0)),
                           sum(coalesce(big_rare_count, 0)),
                           lab_split,
                           field_split,
                           area)
from sample.samples s
         inner join
     sample.organisms o on s.sample_id = o.sample_id
where s.sample_id = p_sample_id
group by lab_split, field_split, area;
$$;

create or replace function metric.fn_attribute_abundance(p_sample_id int, p_attribute_id int)
    returns real
    language sql
    immutable
as
$$
select metric.fn_abundance(sum(split_count),
                           sum(big_rare_count),
                           lab_split,
                           field_split,
                           area)
from sample.samples s
         inner join sample.organisms o on o.sample_id = s.sample_id
         inner join taxa.taxa_attributes a on o.taxonomy_id = a.taxonomy_id
where (s.sample_id = p_sample_id)
  and (a.attribute_id = p_attribute_id)
group by lab_split, field_split, area;
$$;

drop function if exists metric.fn_abundance;
create or replace function metric.fn_abundance(split_count real,
                                               big_rare_count real,
                                               lab_split real,
                                               field_split real,
                                               area_sampled real)
    returns real
    language sql
    immutable
    returns null on null input
as
$$
select ((split_count * (1 / lab_split) + big_rare_count) * (1 / field_split) * (1 / area_sampled));
$$;
comment on function metric.fn_abundance is 'Abundance calculation taken from NAMC metric report spreadsheet.
 ( ([Split Count] * (100/[Lab Split])) + [Big_Rare Count]) *(100/[Field Split]) *(1/[Area Sampled])';

-- create or replace function metric.fn_sample_richness(p_rarefaction_id int)
--     returns int
--     language sql
-- as
-- $$
-- select count(taxonomy_id)
-- from sample.rarefied_taxa
-- where rarefaction_id = p_rarefaction_id
-- group by taxonomy_id;
-- $$;
--
-- create or replace function metric.fn_taxa_richness(p_rarefaction_id int, p_taxonomy_id int)
--     returns int
--     language sql
-- as
-- $$
--
-- $$;