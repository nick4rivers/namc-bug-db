---
title: taxa Schema
---

Taxonomy, trait and translations.

![diagram](https://docs.google.com/drawings/d/e/2PACX-1vSHGBTqsVpZussbgHDz-mGBpskz2aXWFNF7Yl0LA0M5izbnZUlWcGhXo9sCANACI_1oH4lB5d_bD8jI/pub?w=1346&h=973)

# external_ids

|Column|Data Type|Null|Description|
|---|---|---|---|
|source_id|smallint|N||
|taxonomy_id|smallint|N||
|external_source_id|VarChar(255)|Y||
|scientific_name|VarChar(255)|Y||

# life_stages

|Column|Data Type|Null|Description|
|---|---|---|---|
|life_stage_id (PK)|smallint|N||
|abbreviation|character|N||
|life_stage_name|VarChar(50)|N||
|is_active|boolean|N||

# synonyms

|Column|Data Type|Null|Description|
|---|---|---|---|
|synonym_id (PK)|smallint|N||
|taxonomy_id|smallint|N||
|synonym|VarChar(255)|N||

# taxa_attributes

|Column|Data Type|Null|Description|
|---|---|---|---|
|taxonomy_id|smallint|N||
|attribute_id|smallint|N||
|attribute_value|VarChar(100)|N||

# taxa_levels

|Column|Data Type|Null|Description|
|---|---|---|---|
|level_id (PK)|smallint|N||
|level_name|VarChar(50)|N||
|parent_level_id|smallint|Y||
|is_active|boolean|N||
|description|text|Y||

# taxa_sources

|Column|Data Type|Null|Description|
|---|---|---|---|

# taxonomy

|Column|Data Type|Null|Description|
|---|---|---|---|
|taxonomy_id (PK)|smallint|N||
|scientific_name|VarChar(255)|N||
|level_id|smallint|N||
|parent_id|smallint|Y||
|author|VarChar(255)|Y||
|year|smallint|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# translation_predictors

|Column|Data Type|Null|Description|
|---|---|---|---|
|translation_id|smallint|N||
|predictor_id|smallint|N||

# translations

|Column|Data Type|Null|Description|
|---|---|---|---|
|translation_id (PK)|smallint|N||
|translation_name|VarChar(255)|N||
|description|text|Y||
|is_active|boolean|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||
