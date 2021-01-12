---
title: entity Schema
---

Information pertaining to customers, organizations, laboratories, individuals and employees.

![diagram](https://docs.google.com/drawings/d/e/2PACX-1vTRwXAmzNu33Fi78sR1WkjNCTWaW26mOSS7KuQCZCc3j-1FwcnS628sqgcCClQgucp-xCxqp1fd5xG4/pub?w=984&h=671)

# entities

|Column|Data Type|Null|Description|
|---|---|---|---|
|entity_id (PK)|smallint|N||
|parent_id|smallint|Y||
|address1|VarChar(255)|Y||
|address2|VarChar(255)|Y||
|city|VarChar(255)|Y||
|state_id|smallint|Y||
|country_id|smallint|N||
|zip_code|VarChar(20)|Y||
|phone|VarChar(50)|Y||
|fax|VarChar(50)|Y||
|website|VarChar(255)|Y||
|notes|text|Y||
|metadata|json|Y||
|created_date|TimeStamp|N||
|updated_date|TimeStamp|N||

# individual_roles

|Column|Data Type|Null|Description|
|---|---|---|---|
|individual_id|smallint|N||
|role_id|smallint|N||

# individuals

|Column|Data Type|Null|Description|
|---|---|---|---|
|individual_id (PK)|smallint|N||
|first_name|VarChar(50)|N||
|last_name|VarChar(50)|N||
|initials|VarChar(3)|Y||
|entity_id|smallint|N||
|affiliation_id|smallint|Y||
|email|VarChar(255)|Y||
|title|VarChar(255)|Y||
|cognito_sub|VarChar(255)|Y||

# lab_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|lab_type_id (PK)|smallint|N||
|lab_type_name|VarChar(255)|N||

# organizations

|Column|Data Type|Null|Description|
|---|---|---|---|
|organization_id (PK)|smallint|N||
|abbreviation|VarChar(50)|Y||
|organization_name|VarChar(255)|Y||
|entity_id|smallint|N||
|organization_type_id|smallint|N||
|is_lab|boolean|N||

# organization_types

|Column|Data Type|Null|Description|
|---|---|---|---|
|organization_type_id (PK)|smallint|N||
|organization_type_name|VarChar(50)|N||

# roles

|Column|Data Type|Null|Description|
|---|---|---|---|
|role_id (PK)|smallint|N||
|role_name|VarChar(255)|N||
|description|text|Y||
