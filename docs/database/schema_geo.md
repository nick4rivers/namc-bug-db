---
title: geo Schema
---

Geospatial data and contextual layers.

![diagram](https://docs.google.com/drawings/d/e/2PACX-1vSgA3TKb1opj3_R2ijJprl7jI-9i_Qp9zHuiTPI7iKUrJehrJS9ikH9XYfZroszNBXcUKQUeSUWV50W/pub?w=1559&h=945)

# counties

|Column|Data Type|Null|Description|
|---|---|---|---|
|county_id (PK)|smallint|N||
|state_id|smallint|N||
|county_name|VarChar(255)|N||
|geom|USER-DEFINED|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# countries

|Column|Data Type|Null|Description|
|---|---|---|---|
|country_id (PK)|smallint|N||
|country_name|VarChar(50)|N||
|abbreviation|VarChar(5)|N||
|geom|USER-DEFINED|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# ecosystems

|Column|Data Type|Null|Description|
|---|---|---|---|
|ecosystem_id (PK)|smallint|N||
|ecosystem_name|VarChar(10)|N||
|is_active|boolean|N||
|description|text|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# habitats

|Column|Data Type|Null|Description|
|---|---|---|---|
|habitat_id (PK)|smallint|N||
|habitat_name|VarChar(50)|N||
|ecosystem_id|smallint|N||
|is_active|boolean|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# land_uses

|Column|Data Type|Null|Description|
|---|---|---|---|
|land_use_id (PK)|smallint|N||
|land_use_name|VarChar(50)|N||
|is_active|boolean|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# predictors

|Column|Data Type|Null|Description|
|---|---|---|---|
|predictor_id (PK)|smallint|N||
|predictor_name|VarChar(255)|N||
|abbreviation|VarChar(25)|N||
|unit_id|smallint|N||
|predictor_type_id|smallint|N||
|description|text|Y||
|metadata|json|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# predictor_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|predictor_type_id (PK)|smallint|N||
|predictor_type_name|VarChar(255)|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# sites

|Column|Data Type|Null|Description|
|---|---|---|---|
|site_id (PK)|integer|N||
|site_name|VarChar(50)|N||
|system_id|smallint|Y||
|ecosystem_id|smallint|Y||
|description|text|Y||
|waterbody|VarChar(255)|Y||
|location|USER-DEFINED|N||
|catchment|USER-DEFINED|Y||
|nhdplusid|bigint|Y||
|comid|bigint|Y||
|metadata|json|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# states

|Column|Data Type|Null|Description|
|---|---|---|---|
|state_id (PK)|smallint|N||
|country_id|smallint|N||
|state_name|VarChar(50)|N||
|abbreviation|VarChar(2)|N||
|geom|USER-DEFINED|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# systems

|Column|Data Type|Null|Description|
|---|---|---|---|
|system_id (PK)|smallint|N||
|system_name|VarChar(20)|N||
|ecosystem_id|smallint|N||
|is_active|boolean|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# units

|Column|Data Type|Null|Description|
|---|---|---|---|
|unit_id (PK)|smallint|N||
|unit_name|VarChar(50)|N||
|abbreviation|VarChar(10)|N||
|description|text|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||
