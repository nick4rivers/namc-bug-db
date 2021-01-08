---
title: taxa Schema
---

Taxonomy, trait and translations.

![diagram](https://docs.google.com/drawings/d/e/2PACX-1vSHGBTqsVpZussbgHDz-mGBpskz2aXWFNF7Yl0LA0M5izbnZUlWcGhXo9sCANACI_1oH4lB5d_bD8jI/pub?w=1346&h=973)

# external_ids

|Column|Data Type|Null|Description|
|---|---|---|---|
|source_id|smallint|NO|None|
|taxonomy_id|smallint|NO|None|
|external_source_id|character varying|YES|None|
|scientific_name|character varying|YES|None|

# life_stages

|Column|Data Type|Null|Description|
|---|---|---|---|
|life_stage_id|smallint|NO|None|
|abbreviation|character|NO|None|
|life_stage_name|character varying|NO|None|
|is_active|boolean|NO|None|

# synonyms

|Column|Data Type|Null|Description|
|---|---|---|---|
|synonym_id|smallint|NO|None|
|taxonomy_id|smallint|NO|None|
|synonym|character varying|NO|None|

# taxa_attributes

|Column|Data Type|Null|Description|
|---|---|---|---|
|taxonomy_id|smallint|NO|None|
|attribute_id|smallint|NO|None|
|attribute_value|character varying|NO|None|

# taxa_levels

|Column|Data Type|Null|Description|
|---|---|---|---|
|level_id|smallint|NO|None|
|level_name|character varying|NO|None|
|parent_level_id|smallint|YES|None|
|is_active|boolean|NO|None|
|description|text|YES|None|

# taxa_sources

|Column|Data Type|Null|Description|
|---|---|---|---|

# taxonomy

|Column|Data Type|Null|Description|
|---|---|---|---|
|taxonomy_id|smallint|NO|None|
|scientific_name|character varying|NO|None|
|level_id|smallint|NO|None|
|parent_id|smallint|YES|None|
|author|character varying|YES|None|
|year|smallint|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# translation_predictors

|Column|Data Type|Null|Description|
|---|---|---|---|
|translation_id|smallint|NO|None|
|predictor_id|smallint|NO|None|

# translations

|Column|Data Type|Null|Description|
|---|---|---|---|
|translation_id|smallint|NO|None|
|translation_name|character varying|NO|None|
|description|text|YES|None|
|is_active|boolean|NO|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|
