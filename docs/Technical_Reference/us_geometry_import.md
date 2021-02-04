---
title: US Geometry Import
---

This document describes the process for importing the US States, Counties and Nation boundaries into the bugdb.

The goal is to produce SQL INSERT statements in the `initdb` folder within the docker configuration. This file is then executed during the initialization of the docker box, producing a database table populated with all the necessary rows including their geometries. The SQL files are large and bloat git.

The following instructions are for one of three layers in question - US States. The process is identical for the county and national boundaries.

## 1 - Import the ShapeFile using OGR.

Use ogr2gr to import the original ShapeFiles into Postgres. This will generate a new table in the public schema called `temp_us_states`.

```bash
ogr2ogr -f PostgreSQL -progress -nlt MULTIPOLYGON -dim XY -t_srs EPSG:4326 -nln temp_us_states PG:"host=$1 port=$2 user=$3 password=$4 dbname=$5" <path_to_shapefile>
```

## 2 - Create Temporary table

Create another temporary table in the public schema with a design that matches the target table. In the case of the US States you will also need to insert the ID for the US country code.

If you have an empty copy of the bugdb database you can skip creating this temporary table and jump to the next step.

## 3 - Insert the geometries into the target table

Update the target table with the geometries from the ogr2ogr table:

```sql
UPDATE geo.states SET geom = st.wkb_geometry FROM public.temp_us_states st WHERE geo.states.abbreviation = st.stusps;
```

## 4 - Export the target table to SQL.

Right click on the target table in DataGrip and choose "Export with pgdump":

* Make sure its "Insert statements with columns"
* Choose "Data Only".
* Specify the correct SQL file in the initdb folder.

## 5 - Run the file

Create the database using docker and the database should be initiated with geometries already populated.

