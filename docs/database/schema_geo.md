---
title: geo Schema
---

Geospatial data and contextual layers.

![diagram](https://docs.google.com/drawings/d/e/2PACX-1vSgA3TKb1opj3_R2ijJprl7jI-9i_Qp9zHuiTPI7iKUrJehrJS9ikH9XYfZroszNBXcUKQUeSUWV50W/pub?w=1559&h=945)

# counties

|Column|Data Type|Null|Description|
|---|---|---|---|
|county_id|smallint|NO|None|
|state_id|smallint|NO|None|
|county_name|character varying|NO|None|
|geom|USER-DEFINED|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# countries

|Column|Data Type|Null|Description|
|---|---|---|---|
|country_id|smallint|NO|None|
|country_name|character varying|NO|None|
|abbreviation|character varying|NO|None|
|geom|USER-DEFINED|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# ecosystems

|Column|Data Type|Null|Description|
|---|---|---|---|
|ecosystem_id|smallint|NO|None|
|ecosystem_name|character varying|NO|None|
|is_active|boolean|NO|None|
|description|text|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# habitats

|Column|Data Type|Null|Description|
|---|---|---|---|
|habitat_id|smallint|NO|None|
|habitat_name|character varying|NO|None|
|ecosystem_id|smallint|NO|None|
|is_active|boolean|NO|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# land_uses

|Column|Data Type|Null|Description|
|---|---|---|---|
|land_use_id|smallint|NO|None|
|land_use_name|character varying|NO|None|
|is_active|boolean|NO|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# predictors

|Column|Data Type|Null|Description|
|---|---|---|---|
|predictor_id|smallint|NO|None|
|predictor_name|character varying|NO|None|
|abbreviation|character varying|NO|None|
|unit_id|smallint|NO|None|
|predictor_type_id|smallint|NO|None|
|description|text|YES|None|
|metadata|json|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# predictor_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|predictor_type_id|smallint|NO|None|
|predictor_type_name|character varying|NO|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# sites

|Column|Data Type|Null|Description|
|---|---|---|---|
|site_id|integer|NO|None|
|site_name|character varying|NO|None|
|system_id|smallint|YES|None|
|ecosystem_id|smallint|YES|None|
|description|text|YES|None|
|waterbody|character varying|YES|None|
|location|USER-DEFINED|NO|None|
|catchment|USER-DEFINED|YES|None|
|nhdplusid|bigint|YES|None|
|comid|bigint|YES|None|
|metadata|json|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# states

|Column|Data Type|Null|Description|
|---|---|---|---|
|state_id|smallint|NO|None|
|country_id|smallint|NO|None|
|state_name|character varying|NO|None|
|abbreviation|character varying|NO|None|
|geom|USER-DEFINED|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# systems

|Column|Data Type|Null|Description|
|---|---|---|---|
|system_id|smallint|NO|None|
|system_name|character varying|NO|None|
|ecosystem_id|smallint|NO|None|
|is_active|boolean|NO|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# units

|Column|Data Type|Null|Description|
|---|---|---|---|
|unit_id|smallint|NO|None|
|unit_name|character varying|NO|None|
|abbreviation|character varying|NO|None|
|description|text|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|
