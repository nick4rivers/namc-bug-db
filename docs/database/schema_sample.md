---
title: sample Schema
---

Information pertaining to boxes, samples and other customer submitted data.

![diagram](https://docs.google.com/drawings/d/e/2PACX-1vQJvDxsCu2AJN1T2NNF_kkBXPSUXzpc32gIcT5UE0-6Mmq_gH7CbjD64S1-DZ9ULJH8vIgJUxJ3vGnQ/pub?w=1839&h=1196)

# assets

|Column|Data Type|Null|Description|
|---|---|---|---|
|asset_id (PK)|smallint|N||
|asset_name|VarChar(255)|N||
|description|text|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# benthic

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|N||
|notes|text|Y||
|updated_date|TimeStamp|N||

# boxes

|Column|Data Type|Null|Description|
|---|---|---|---|
|box_id (PK)|integer|N||
|customer_id|smallint|N||
|submitter_id|smallint|N||
|box_state_id|smallint|N||
|box_recevied_date|TimeStamp|Y||
|processing_complete_date|TimeStamp|Y||
|projected_complete_date|TimeStamp|Y||
|sort_time|double precision|Y||
|id_time|double precision|Y||
|description|text|Y||
|metadata|json|Y||
|project_id|smallint|Y||
|measurements|boolean|N||
|sorter_qa|boolean|N||
|taxa_qa|boolean|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# box_states

|Column|Data Type|Null|Description|
|---|---|---|---|
|box_state_id (PK)|smallint|N||
|box_state_name|VarChar(50)|N||
|box_state_order|smallint|N||
|description|text|Y||
|is_active|boolean|N||

# drift

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|N||
|net_area|double precision|Y||
|net_duration|double precision|Y||
|stream_depth|double precision|Y||
|net_depth|double precision|Y||
|net_velo|double precision|Y||
|notes|text|Y||
|updated_date|TimeStamp|N||

# fish

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|N||
|taxonomy_id|smallint|N||
|fish_length|real|Y||
|fish_mass|real|Y||
|notes|text|Y||
|updated_date|TimeStamp|N||

# mass

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|N||
|mass_type_id|smallint|N||
|mass_method_id|smallint|N||
|mass|real|N||
|notes|text|Y||
|updated_date|TimeStamp|N||

# mass_methods

|Column|Data Type|Null|Description|
|---|---|---|---|
|mass_method_id (PK)|smallint|N||
|mass_method_name|VarChar(255)|N||
|abbreviation|VarChar(15)|N||
|is_active|boolean|N||

# mass_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|mass_type_id (PK)|smallint|N||
|mass_type_name|VarChar(255)|N||
|abbreviation|VarChar(15)|N||
|is_active|boolean|N||

# note_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|note_id (PK)|smallint|N||
|note_name|VarChar(25)|N||
|abbreviation|character|N||
|description|text|Y||
|is_active|boolean|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# organism_notes

|Column|Data Type|Null|Description|
|---|---|---|---|
|organism_id|integer|N||
|note_id|smallint|N||

# organisms

|Column|Data Type|Null|Description|
|---|---|---|---|
|organism_id (PK)|integer|N||
|sample_id|integer|N||
|taxonomy_id|smallint|N||
|life_stage_id|smallint|N||
|bug_size|real|Y||
|split_count|real|Y||
|big_rare_count|smallint|Y||
|invalidated_date|TimeStamp|Y||
|notes|text|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# plankton

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|N||
|diameter|real|Y||
|sub_sample_count|smallint|Y||
|tow_length|real|Y||
|volume|real|Y||
|all_quot|real|Y||
|size_interval|real|Y||
|tow_type|USER-DEFINED|Y||
|notes|text|Y||
|updated_date|TimeStamp|N||

# projects

|Column|Data Type|Null|Description|
|---|---|---|---|
|project_id (PK)|smallint|N||
|project_name|VarChar(255)|N||
|project_type_id|smallint|N||
|is_private|boolean|Y||
|contact_id|smallint|Y||
|extent|USER-DEFINED|Y||
|auto_update_samples|boolean|N||
|description|text|Y||
|metadata|json|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# project_samples

|Column|Data Type|Null|Description|
|---|---|---|---|
|project_id|smallint|N||
|sample_id|integer|N||

# project_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|project_type_id (PK)|smallint|N||
|project_type_name|VarChar(255)|N||
|description|text|Y||
|is_active|boolean|N||

# sample_assets

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|N||
|asset_id|integer|N||

# sample_labs

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|N||
|organization_id|smallint|N||
|lab_type_id|smallint|N||

# sample_methods

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_method_id (PK)|smallint|N||
|sample_method_name|VarChar(50)|N||
|is_active|boolean|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# sample_predictors

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|N||
|predictor_id|smallint|N||
|location|USER-DEFINED|N||
|catchment|USER-DEFINED|N||
|metadata|jsonb|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# samples

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id (PK)|integer|N||
|box_id|integer|N||
|site_id|integer|Y||
|sample_date|date|Y||
|sample_time|time without time zone|Y||
|type_id|smallint|N||
|method_id|smallint|N||
|habitat_id|smallint|N||
|area|real|Y||
|field_split|real|Y||
|field_notes|text|Y||
|lab_split|real|Y||
|jar_count|smallint|N||
|qualitative|boolean|Y||
|lab_notes|text|Y||
|mesh|smallint|Y||
|sorter_count|smallint|Y||
|sorter_id|smallint|Y||
|sort_time|real|N||
|sort_start_date|TimeStamp|Y||
|sort_end_date|TimeStamp|Y||
|ider_id|smallint|Y||
|id_time|real|N||
|id_start_date|TimeStamp|Y||
|id_end_date|TimeStamp|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||
|qa_sample_id|smallint|Y||
|lab_id|smallint|Y||
|metadata|json|Y||

# sample_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_type_id (PK)|smallint|N||
|sample_type_name|VarChar(50)|N||
|is_active|boolean|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# sort_qa

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|N||
|sorter2_id|smallint|N||
|sorted_date|TimeStamp|N||
|bugs_resorted|smallint|N||
|sorter_efficiency|real|Y||
|elutriation|boolean|N||
|split|real|Y||
|sort_time|real|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# submission_data

|Column|Data Type|Null|Description|
|---|---|---|---|

# taxa_qa

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|N||
|taxa_qa|smallint|Y||
|taxa_qa_stage|USER-DEFINED|Y||
|start_date|TimeStamp|N||
|ider1|smallint|N||
|ider2|smallint|Y||
|sorter_count_diff|smallint|Y||
|taxa_count_diff|smallint|Y||
|code_count|smallint|Y||
|bray_curtis|real|Y||
|bray_curtis_class|boolean|Y||
|ptd|real|Y||
|ptd_class|boolean|Y||
|pde|real|Y||
|pde_class|boolean|Y||
|ptc1|real|Y||
|ptc2|real|Y||
|notes|text|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||
