import config from '../config'
import { Pool } from 'pg'
import log from 'loglevel'

export const getPool = (): Pool => {
    return new Pool(config.pg)
}

const pgPromise = (pool: Pool, query: string, vars: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        const cb = (error, results) => {
            if (error) {
                log.error('PG ERROR', error)
                return reject(error)
            } else return resolve(results.rows)
        }
        pool.query(query, vars, cb)
    })
}

const geoRecordEPSGQuery = `
SELECT ST_Distance_Sphere(reach_geom, pt) As spheroid_dist,
    n.nhdplusid,
    n.reachcode,
    n.vpuid,
    n.fcode,
    n.gnis_id,
    n.gnis_name,
    n.catch_metrics,
    n.wing_metrics,
    n.permanent_identifier,
    n.catch_json,
    st_asgeojson(ST_ClosestPoint(reach_geom,pt)) As cp_line_pt,
    st_asgeojson(st_envelope(n.catch_geom)) as catch_bbox,
    st_asgeojson(st_envelope(n.reach_geom)) as reach_bbox
FROM ( SELECT *, ST_Transform(st_setsrid(st_makepoint($1, $2),$3), 4326) AS pt FROM network ) n
ORDER BY reach_geom <-> pt
LIMIT 1;
`
export const getGeoRecordEPSG = (pool, coords, epsg): Promise<any> =>
    pgPromise(pool, geoRecordEPSGQuery, [...coords, epsg])

const geoRecordQuery = `
SELECT ST_Distance_Sphere(reach_geom, pt) As spheroid_dist,
    n.nhdplusid,
    n.reachcode,
    n.vpuid,
    n.fcode,
    n.gnis_id,
    n.gnis_name,
    n.catch_metrics,
    n.wing_metrics,
    n.permanent_identifier,
    n.catch_json,
    st_asgeojson(ST_ClosestPoint(reach_geom,pt)) As cp_line_pt,
    st_asgeojson(st_envelope(n.catch_geom)) as catch_bbox,
    st_asgeojson(st_envelope(n.reach_geom)) as reach_bbox
FROM ( SELECT  *, st_setsrid(st_makepoint($1, $2),4326) AS pt FROM network ) n
ORDER BY reach_geom <-> pt
LIMIT 1;
`
export const getGeoRecord = (pool, coords): Promise<any> => pgPromise(pool, geoRecordQuery, coords)

const getRecordQuery = `
SELECT n.catch_json,
    n.nhdplusid,
    n.reachcode,
    n.vpuid,
    n.fcode,
    n.gnis_id,
    n.gnis_name,
    n.catch_metrics,
    n.wing_metrics,
    n.permanent_identifier,
    n.catch_json,
    st_asgeojson(st_envelope(n.catch_geom)) as catch_bbox,
    st_asgeojson(st_envelope(n.reach_geom)) as reach_bbox
FROM network as n
WHERE n.nhdplusid = $1
`
export const getRecord = (pool, nhdplusid): Promise<any> => pgPromise(pool, getRecordQuery, [nhdplusid])

const upstreamCatchmentQuery = `SELECT catch_json FROM network where nhdplusid = $1;`
export const upstreamCatchment = (pool, nhdplusid): Promise<any> => pgPromise(pool, upstreamCatchmentQuery, [nhdplusid])

const catchmentPolyQuery = `SELECT catch_json, ST_AsGeoJSON(reach_geom) as reach FROM network where nhdplusid = $1;`
export const catchmentPoly = (pool, nhdplusid): Promise<any> => pgPromise(pool, catchmentPolyQuery, [nhdplusid])

const fieldDefsQuery = `
SELECT
    md.display_name as metric_name,
    md.description,
    md.format_string,
    md.is_visible,
    md.metric_id,
    md.metric_key,
    md.metric_type,
    mg.display_name as group_name
FROM metric_defs md
INNER JOIN metric_groups mg on md.group_id = mg.group_id;
;`
export const fieldDefs = (pool): Promise<any> => pgPromise(pool, fieldDefsQuery, [])
