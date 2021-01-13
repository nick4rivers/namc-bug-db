---
title: billing Schema
---

Quotes, billing and financial aspects to box submissions.

![diagram](https://docs.google.com/drawings/d/e/2PACX-1vRiz3VzDePLBAiMvbUZJjn-YwIrf33A_eYmlemy8gDJYvbiBDKzGiaJfDaDfnUzYnqyXurY7q0XsTa4/pub?w=1434&h=763)

# agreement_items

|Column|Data Type|Null|Description|
|---|---|---|---|
|agreement_item_id (PK)|integer|N||
|agreement_id|smallint|N||
|line_item_type_id|smallint|N||
|units|smallint|N||
|unit_cost|integer|N||
|description|text|Y||

# agreements

|Column|Data Type|Null|Description|
|---|---|---|---|
|agreement_id (PK)|smallint|N||
|entity_id|smallint|N||
|agreement_type_id|smallint|N||
|a_number|VarChar(20)|Y||
|start_date|date|Y||
|end_date|date|Y||
|is_editable|boolean|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# agreement_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|agreement_type_id (PK)|smallint|N||
|agreement_type_name|VarChar(255)|N||
|description|text|Y||
|is_active|boolean|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# billing

|Column|Data Type|Null|Description|
|---|---|---|---|

# invoice_boxes

|Column|Data Type|Null|Description|
|---|---|---|---|
|invoice_id|smallint|N||
|box_id|smallint|N||

# invoice_items

|Column|Data Type|Null|Description|
|---|---|---|---|
|invoice_item_id (PK)|integer|N||
|invoice_id|smallint|N||
|line_item_type_id|smallint|N||
|units|smallint|N||
|unit_price|integer|N||

# invoices

|Column|Data Type|Null|Description|
|---|---|---|---|
|invoice_id (PK)|smallint|N||
|entity_id|smallint|N||
|agreement_id|smallint|Y||
|invoice_date|date|N||
|due_date|date|N||
|invoice_number|smallint|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# line_item_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|line_item_type_id (PK)|smallint|N||
|line_item_type_name|VarChar(255)|N||
|is_active|boolean|N||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||
