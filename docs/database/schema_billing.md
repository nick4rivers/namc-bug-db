---
title: billing Schema
---

Quotes, billing and financial aspects to box submissions.

# agreements

|Column|Data Type|Null|Description|
|---|---|---|---|
|agreement_id (PK)|smallint|N||
|entity_id|smallint|N||
|agreement_type_id|smallint|N||
|start_date|date|Y||
|end_date|date|Y||

# agreement_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|agreement_type_id (PK)|smallint|N||
|agreement_type_name|VarChar(255)|N||

# billing

|Column|Data Type|Null|Description|
|---|---|---|---|

# quote_items

|Column|Data Type|Null|Description|
|---|---|---|---|
|quote_id|smallint|N||
|line_item_type_id|smallint|N||
|quantity|smallint|N||
|unit_price|real|N||

# quotes

|Column|Data Type|Null|Description|
|---|---|---|---|
|quote_id (PK)|smallint|N||
|entity_id|smallint|N||
|is_fixed_price|boolean|N||
|notes|VarChar(255)|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||
