"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndividuals = exports.getSites = exports.getBoxStates = exports.getSamples = exports.getPool = void 0;
var config_1 = __importDefault(require("../config"));
var pg_1 = require("pg");
var loglevel_1 = __importDefault(require("loglevel"));
exports.getPool = function () {
    return new pg_1.Pool(config_1.default.pg);
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
var samplesQuery = 'SELECT sample_id FROM "sample"."samples"';
exports.getSamples = function (pool) { return pgPromise(pool, samplesQuery); };
var boxStatesQuery = 'SELECT * FROM sample.box_states';
exports.getBoxStates = function (pool) { return pgPromise(pool, boxStatesQuery); };
var sitesQuery = 'SELECT * FROM geo.vw_sites';
exports.getSites = function (pool) { return pgPromise(pool, sitesQuery); };
var individualsQuery = 'SELECT * FROM entity.vw_individuals';
exports.getIndividuals = function (pool) { return pgPromise(pool, individualsQuery); };
//# sourceMappingURL=index.js.map