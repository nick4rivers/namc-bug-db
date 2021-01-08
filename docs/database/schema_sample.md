---
title: sample Schema
---

Information pertaining to boxes, samples and other customer submitted data.

![diagram](https://docs.google.com/drawings/d/e/2PACX-1vQJvDxsCu2AJN1T2NNF_kkBXPSUXzpc32gIcT5UE0-6Mmq_gH7CbjD64S1-DZ9ULJH8vIgJUxJ3vGnQ/pub?w=1839&h=1196)

# assets

|Column|Data Type|Null|Description|
|---|---|---|---|
|asset_id|smallint|NO|None|
|asset_name|character varying|NO|None|
|description|text|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# benthic

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|NO|None|
|notes|text|YES|None|
|updated_date|timestamp with time zone|NO|None|

# boxes

|Column|Data Type|Null|Description|
|---|---|---|---|
|box_id|integer|NO|None|
|customer_id|smallint|NO|None|
|submitter_id|smallint|NO|None|
|box_state_id|smallint|NO|None|
|box_recevied_date|timestamp with time zone|YES|None|
|processing_complete_date|timestamp with time zone|YES|None|
|projected_complete_date|timestamp with time zone|YES|None|
|sort_time|double precision|YES|None|
|id_time|double precision|YES|None|
|description|text|YES|None|
|metadata|json|YES|None|
|project_id|smallint|YES|None|
|measurements|boolean|NO|None|
|sorter_qa|boolean|NO|None|
|taxa_qa|boolean|NO|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# box_states

|Column|Data Type|Null|Description|
|---|---|---|---|
|box_state_id|smallint|NO|None|
|box_state_name|character varying|NO|None|
|box_state_order|smallint|NO|None|
|description|text|YES|None|
|is_active|boolean|NO|None|

# drift

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|NO|None|
|net_area|double precision|YES|None|
|net_duration|double precision|YES|None|
|stream_depth|double precision|YES|None|
|net_depth|double precision|YES|None|
|net_velo|double precision|YES|None|
|notes|text|YES|None|
|updated_date|timestamp with time zone|NO|None|

# fish

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|NO|None|
|taxonomy_id|smallint|NO|None|
|fish_length|real|YES|None|
|fish_mass|real|YES|None|
|notes|text|YES|None|
|updated_date|timestamp with time zone|NO|None|

# mass

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|NO|None|
|mass_type_id|smallint|NO|None|
|mass_method_id|smallint|NO|None|
|mass|real|NO|None|
|notes|text|YES|None|
|updated_date|timestamp with time zone|NO|None|

# mass_methods

|Column|Data Type|Null|Description|
|---|---|---|---|
|mass_method_id|smallint|NO|None|
|mass_method_name|character varying|NO|None|
|abbreviation|character varying|NO|None|
|is_active|boolean|NO|None|

# mass_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|mass_type_id|smallint|NO|None|
|mass_type_name|character varying|NO|None|
|abbreviation|character varying|NO|None|
|is_active|boolean|NO|None|

# note_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|note_id|smallint|NO|None|
|note_name|character varying|NO|None|
|abbreviation|character|NO|None|
|description|text|YES|None|
|is_active|boolean|NO|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# organism_notes

|Column|Data Type|Null|Description|
|---|---|---|---|
|organism_id|integer|NO|None|
|note_id|smallint|NO|None|

# organisms

|Column|Data Type|Null|Description|
|---|---|---|---|
|organism_id|integer|NO|None|
|sample_id|integer|NO|None|
|taxonomy_id|smallint|NO|None|
|life_stage_id|smallint|NO|None|
|bug_size|real|YES|None|
|split_count|real|YES|None|
|big_rare_count|smallint|YES|None|
|invalidated_date|timestamp with time zone|YES|None|
|notes|text|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# plankton

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|NO|None|
|diameter|real|YES|None|
|sub_sample_count|smallint|YES|None|
|tow_length|real|YES|None|
|volume|real|YES|None|
|all_quot|real|YES|None|
|size_interval|real|YES|None|
|tow_type|USER-DEFINED|YES|None|
|notes|text|YES|None|
|updated_date|timestamp with time zone|NO|None|

# projects

|Column|Data Type|Null|Description|
|---|---|---|---|
|project_id|smallint|NO|None|
|project_name|character varying|NO|None|
|project_type_id|smallint|NO|None|
|is_private|boolean|YES|None|
|contact_id|smallint|YES|None|
|extent|USER-DEFINED|YES|None|
|auto_update_samples|boolean|NO|None|
|description|text|YES|None|
|metadata|json|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# project_samples

|Column|Data Type|Null|Description|
|---|---|---|---|
|project_id|smallint|NO|None|
|sample_id|integer|NO|None|

# project_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|project_type_id|smallint|NO|None|
|project_type_name|character varying|NO|None|
|description|text|YES|None|
|is_active|boolean|NO|None|

# sample_assets

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|NO|None|
|asset_id|integer|NO|None|

# sample_labs

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|NO|None|
|organization_id|smallint|NO|None|
|lab_type_id|smallint|NO|None|

# sample_methods

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_method_id|smallint|NO|None|
|sample_method_name|character varying|NO|None|
|is_active|boolean|NO|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# sample_predictors

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|NO|None|
|predictor_id|smallint|NO|None|
|location|USER-DEFINED|NO|None|
|catchment|USER-DEFINED|NO|None|
|metadata|jsonb|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# samples

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|NO|None|
|box_id|integer|NO|None|
|site_id|integer|YES|None|
|sample_date|date|YES|None|
|sample_time|time without time zone|YES|None|
|type_id|smallint|NO|None|
|method_id|smallint|NO|None|
|habitat_id|smallint|NO|None|
|area|real|YES|None|
|field_split|real|YES|None|
|field_notes|text|YES|None|
|lab_split|real|YES|None|
|jar_count|smallint|NO|None|
|qualitative|boolean|YES|None|
|lab_notes|text|YES|None|
|mesh|smallint|YES|None|
|sorter_count|smallint|YES|None|
|sorter_id|smallint|YES|None|
|sort_time|real|NO|None|
|sort_start_date|timestamp with time zone|YES|None|
|sort_end_date|timestamp with time zone|YES|None|
|ider_id|smallint|YES|None|
|id_time|real|NO|None|
|id_start_date|timestamp with time zone|YES|None|
|id_end_date|timestamp with time zone|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|
|qa_sample_id|smallint|YES|None|
|lab_id|smallint|YES|None|
|metadata|json|YES|None|

# sample_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_type_id|smallint|NO|None|
|sample_type_name|character varying|NO|None|
|is_active|boolean|NO|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# sort_qa

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|NO|None|
|sorter2_id|smallint|NO|None|
|sorted_date|timestamp with time zone|NO|None|
|bugs_resorted|smallint|NO|None|
|sorter_efficiency|real|YES|None|
|elutriation|boolean|NO|None|
|split|real|YES|None|
|sort_time|real|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# submission_data

|Column|Data Type|Null|Description|
|---|---|---|---|

# taxa_qa

|Column|Data Type|Null|Description|
|---|---|---|---|
|sample_id|integer|NO|None|
|taxa_qa|smallint|YES|None|
|taxa_qa_stage|USER-DEFINED|YES|None|
|start_date|timestamp with time zone|NO|None|
|ider1|smallint|NO|None|
|ider2|smallint|YES|None|
|sorter_count_diff|smallint|YES|None|
|taxa_count_diff|smallint|YES|None|
|code_count|smallint|YES|None|
|bray_curtis|real|YES|None|
|bray_curtis_class|boolean|YES|None|
|ptd|real|YES|None|
|ptd_class|boolean|YES|None|
|pde|real|YES|None|
|pde_class|boolean|YES|None|
|ptc1|real|YES|None|
|ptc2|real|YES|None|
|notes|text|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|
