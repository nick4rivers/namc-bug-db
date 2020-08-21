"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldDefs = exports.catchmentPoly = exports.upstreamCatchment = exports.getRecord = exports.getGeoRecord = exports.getGeoRecordEPSG = exports.getPool = void 0;
var config_1 = __importDefault(require("../config"));
var pg_1 = require("pg");
var loglevel_1 = __importDefault(require("loglevel"));
exports.getPool = function () {
    return new pg_1.Pool(config_1.default.aws.Postgres);
};
var pgPromise = function (pool, query, vars) {
    return new Promise(function (resolve, reject) {
        var cb = function (error, results) {
            if (error) {
                loglevel_1.default.error('PG ERROR', error);
                return reject(error);
            }
            else
                return resolve(results.rows);
        };
        pool.query(query, vars, cb);
    });
};
var geoRecordEPSGQuery = "\nSELECT ST_Distance_Sphere(reach_geom, pt) As spheroid_dist,\n    n.nhdplusid,\n    n.reachcode,\n    n.vpuid,\n    n.fcode,\n    n.gnis_id,\n    n.gnis_name,\n    n.catch_metrics,\n    n.wing_metrics,\n    n.permanent_identifier,\n    n.catch_json,\n    st_asgeojson(ST_ClosestPoint(reach_geom,pt)) As cp_line_pt,\n    st_asgeojson(st_envelope(n.catch_geom)) as catch_bbox,\n    st_asgeojson(st_envelope(n.reach_geom)) as reach_bbox\nFROM ( SELECT *, ST_Transform(st_setsrid(st_makepoint($1, $2),$3), 4326) AS pt FROM network ) n\nORDER BY reach_geom <-> pt\nLIMIT 1;\n";
exports.getGeoRecordEPSG = function (pool, coords, epsg) {
    return pgPromise(pool, geoRecordEPSGQuery, __spreadArrays(coords, [epsg]));
};
var geoRecordQuery = "\nSELECT ST_Distance_Sphere(reach_geom, pt) As spheroid_dist,\n    n.nhdplusid,\n    n.reachcode,\n    n.vpuid,\n    n.fcode,\n    n.gnis_id,\n    n.gnis_name,\n    n.catch_metrics,\n    n.wing_metrics,\n    n.permanent_identifier,\n    n.catch_json,\n    st_asgeojson(ST_ClosestPoint(reach_geom,pt)) As cp_line_pt,\n    st_asgeojson(st_envelope(n.catch_geom)) as catch_bbox,\n    st_asgeojson(st_envelope(n.reach_geom)) as reach_bbox\nFROM ( SELECT  *, st_setsrid(st_makepoint($1, $2),4326) AS pt FROM network ) n\nORDER BY reach_geom <-> pt\nLIMIT 1;\n";
exports.getGeoRecord = function (pool, coords) { return pgPromise(pool, geoRecordQuery, coords); };
var getRecordQuery = "\nSELECT n.catch_json,\n    n.nhdplusid,\n    n.reachcode,\n    n.vpuid,\n    n.fcode,\n    n.gnis_id,\n    n.gnis_name,\n    n.catch_metrics,\n    n.wing_metrics,\n    n.permanent_identifier,\n    n.catch_json,\n    st_asgeojson(st_envelope(n.catch_geom)) as catch_bbox,\n    st_asgeojson(st_envelope(n.reach_geom)) as reach_bbox\nFROM network as n\nWHERE n.nhdplusid = $1\n";
exports.getRecord = function (pool, nhdplusid) { return pgPromise(pool, getRecordQuery, [nhdplusid]); };
var upstreamCatchmentQuery = "SELECT catch_json FROM network where nhdplusid = $1;";
exports.upstreamCatchment = function (pool, nhdplusid) { return pgPromise(pool, upstreamCatchmentQuery, [nhdplusid]); };
var catchmentPolyQuery = "SELECT catch_json, ST_AsGeoJSON(reach_geom) as reach FROM network where nhdplusid = $1;";
exports.catchmentPoly = function (pool, nhdplusid) { return pgPromise(pool, catchmentPolyQuery, [nhdplusid]); };
var fieldDefsQuery = "\nSELECT\n    md.display_name as metric_name,\n    md.description,\n    md.format_string,\n    md.is_visible,\n    md.metric_id,\n    md.metric_key,\n    md.metric_type,\n    mg.display_name as group_name\nFROM metric_defs md\nINNER JOIN metric_groups mg on md.group_id = mg.group_id;\n;";
exports.fieldDefs = function (pool) { return pgPromise(pool, fieldDefsQuery, []); };
//# sourceMappingURL=index.js.map