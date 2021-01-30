-- These queries populate the bug database with US state and county
-- geometries. They assume that the the census gemoetries have been
-- loaded into temp tables in the public schema.

-- This first query copies geometries for the US states into 
-- existing records in the geo.states table.
UPDATE geo.states SET geom  = public.temp_us_states.wkb_geometry
FROM public.temp_us_states
WHERE geo.states.abbreviation = public.temp_us_states.stusps;

-- This query inserts the US counties, associating them with
-- the correct state.
INSERT INTO geo.counties (state_id, county_name, geom)
SELECT S.state_id, TC.name, ST_MULTI(ST_UNION(TC.wkb_geometry))
FROM geo.states S
         INNER JOIN public.temp_us_states TS ON S.abbreviation = TS.stusps
         INNER JOIN public.temp_us_counties TC ON TS.statefp = TC.statefp
GROUP BY S.state_id, TC.name;