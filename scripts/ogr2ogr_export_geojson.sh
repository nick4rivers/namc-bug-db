# Nation
ogr2ogr -nlt MULTIPOLYGON -dim XY -t_srs EPSG:4326 -nln us_nation \
    -select NAME \
    ~/code/bugdb/namc-bug-db/docker/postgres/initdb/us_nation.geojson \
    /Users/philip/GISData/bugdb/nation/cb_2018_us_nation_5m/cb_2018_us_nation_5m.shp

# States
ogr2ogr -nlt MULTIPOLYGON -dim XY -t_srs EPSG:4326 -nln us_states \
    -select STUSPS,NAME \
    ~/code/bugdb/namc-bug-db/docker/postgres/initdb/us_states.geojson \
    /Users/philip/GISData/bugdb/states/cb_2018_us_state_500k/cb_2018_us_state_500k.shp

# Counties
ogr2ogr -nlt MULTIPOLYGON -dim XY -t_srs EPSG:4326 -nln us_counties \
    -select STATEFP,COUNTYFP,NAME \
    ~/code/bugdb/namc-bug-db/docker/postgres/initdb/us_counties.geojson \
    /Users/philip/GISData/bugdb/counties/cb_2018_us_county_500k/cb_2018_us_county_500k.shp