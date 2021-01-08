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
|analysis_type_id|smallint|NO|None|
|analysis_type_name|character varying|NO|None|
|report_id|smallint|NO|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# metrics

|Column|Data Type|Null|Description|
|---|---|---|---|
|metric_id|integer|NO|None|
|sample_id|integer|NO|None|
|metric_type_id|smallint|NO|None|
|translation_id|smallint|NO|None|

# metric_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|metric_type_id|smallint|NO|None|
|metric_name|character varying|NO|None|
|description|text|YES|None|
|unit_id|smallint|NO|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# reports

|Column|Data Type|Null|Description|
|---|---|---|---|
|report_id|smallint|NO|None|
|report_name|character varying|NO|None|
|description|text|YES|None|
|is_active|boolean|NO|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|
