---
title: entity Schema
---

Information pertaining to customers, organizations, laboratories, individuals and employees.

![diagram](https://docs.google.com/drawings/d/e/2PACX-1vTRwXAmzNu33Fi78sR1WkjNCTWaW26mOSS7KuQCZCc3j-1FwcnS628sqgcCClQgucp-xCxqp1fd5xG4/pub?w=984&h=671)

# entities

|Column|Data Type|Null|Description|
|---|---|---|---|
|entity_id|smallint|NO|None|
|parent_id|smallint|YES|None|
|address1|character varying|YES|None|
|address2|character varying|YES|None|
|city|character varying|YES|None|
|state_id|smallint|YES|None|
|country_id|smallint|NO|None|
|zip_code|character varying|YES|None|
|phone|character varying|YES|None|
|fax|character varying|YES|None|
|website|character varying|YES|None|
|notes|text|YES|None|
|metadata|json|YES|None|
|created_date|timestamp with time zone|NO|None|
|updated_date|timestamp with time zone|NO|None|

# individual_roles

|Column|Data Type|Null|Description|
|---|---|---|---|
|individual_id|smallint|NO|None|
|role_id|smallint|NO|None|

# individuals

|Column|Data Type|Null|Description|
|---|---|---|---|
|individual_id|smallint|NO|None|
|first_name|character varying|NO|None|
|last_name|character varying|NO|None|
|initials|character varying|YES|None|
|entity_id|smallint|NO|None|
|affiliation_id|smallint|YES|None|
|email|character varying|YES|None|
|title|character varying|YES|None|

# lab_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|lab_type_id|smallint|NO|None|
|lab_type_name|character varying|NO|None|

# organizations

|Column|Data Type|Null|Description|
|---|---|---|---|
|organization_id|smallint|NO|None|
|abbreviation|character varying|YES|None|
|organization_name|character varying|YES|None|
|entity_id|smallint|NO|None|
|organization_type_id|smallint|NO|None|
|is_lab|boolean|NO|None|

# organization_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|organization_type_id|smallint|NO|None|
|organization_type_name|character varying|NO|None|

# roles

|Column|Data Type|Null|Description|
|---|---|---|---|
|role_id|smallint|NO|None|
|role_name|character varying|NO|None|
|description|text|YES|None|
