#!/bin/bash

# Parameter 1 is the destination postgres host
# Parameter 2 is the destination postgres port
# Parameter 3 is the destination postgres user_name
# Parameter 4 is the destination postgres password
# Parameter 5 is the destination postgres database_name
# parameter 6 is the output layer name (.e.g us_states)
# Parameter 7 is the full path to the input Shapefile.

# After you have run this script you can copy the geometries from the layer in PostGres to the bug database table using
# UPDATE geo.states SET geom = wkb_geometry
# FROM public.us_states
# WHERE public.us_states.stusps = geo.states.abbreviation;

ogr2ogr -f PostgreSQL -progress -nlt MULTIPOLYGON -dim XY -t_srs EPSG:4326 -nln $6 PG:"host=$1 port=$2 user=$3 password=$4 dbname=$5" $7

