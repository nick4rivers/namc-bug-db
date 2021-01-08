---
title: metric Schema
---

Metrics, models and reporting.

![diagram](https://docs.google.com/drawings/d/e/2PACX-1vTrvMsqMQd2LTcCZpdaBQbuSBmev_PfFRRjv0Rsd7IvBXUNSvBaqpGVhVaAqZjm-BQpDuBGP1leq9Pc/pub?w=1087&h=619)

# analysis

|Column|Data Type|Null|Description|
|---|---|---|---|

# analysis_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|analysis_type_id (PK)|smallint|N||
|analysis_type_name|VarChar(255)|N||
|report_id|smallint|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# metrics

|Column|Data Type|Null|Description|
|---|---|---|---|
|metric_id (PK)|integer|N||
|sample_id|integer|N||
|metric_type_id|smallint|N||
|translation_id|smallint|N||

# metric_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|metric_type_id (PK)|smallint|N||
|metric_name|VarChar(255)|N||
|description|text|Y||
|unit_id|smallint|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# reports

|Column|Data Type|Null|Description|
|---|---|---|---|
|report_id (PK)|smallint|N||
|report_name|VarChar(255)|N||
|description|text|Y||
|is_active|boolean|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||
