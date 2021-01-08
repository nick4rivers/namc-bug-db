---
title: billing Schema
---

Quotes, billing and financial aspects to box submissions.

# agreements

|Column|Data Type|Null|Description|
|---|---|---|---|
|agreement_id|smallint|NO|None|
|entity_id|smallint|NO|None|
|agreement_type_id|smallint|NO|None|
|start_date|date|YES|None|
|end_date|date|YES|None|

# agreement_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|agreement_type_id|smallint|NO|None|
|agreement_type_name|character varying|NO|None|

# billing

|Column|Data Type|Null|Description|
|---|---|---|---|

# quote_items

|Column|Data Type|Null|Description|
|---|---|---|---|
|quote_id|smallint|NO|None|
|line_item_type_id|smallint|NO|None|
|quantity|smallint|NO|None|
|unit_price|real|NO|None|

# quotes

|Column|Data Type|Null|Description|
|---|---|---|---|
|quote_id|smallint|NO|None|
|entity_id|smallint|NO|None|
|is_fixed_price|boolean|NO|None|
|notes|character varying|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|
