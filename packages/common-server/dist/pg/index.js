"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoxes = exports.getIndividuals = exports.getSiteInfo = exports.getSites = exports.getBoxStates = exports.getSamples = exports.getPool = void 0;
var config_1 = require("../config");
var pg_1 = require("pg");
var loglevel_1 = __importDefault(require("loglevel"));
exports.getPool = function () { return __awaiter(void 0, void 0, void 0, function () {
    var config, credentials, pool;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, config_1.getConfigPromise()];
            case 1:
                config = _a.sent();
                return [4, config_1.getDBSecretCredentials()];
            case 2:
                credentials = _a.sent();
                pool = new pg_1.Pool({
                    user: credentials.username,
                    password: credentials.password,
                    database: config.db.dbName,
                    port: config.db.port,
                    host: config.db.endpoint
                });
                return [2, Promise.resolve(pool)];
        }
    });
}); };
var pgPromise = function (pool, query, vars) {
    loglevel_1.default.debug("STARTING QUERY: " + query);
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
var samplesQuery = 'SELECT * FROM sample.vw_samples ORDER BY sample_id LIMIT $1 OFFSET $2';
exports.getSamples = function (pool, limit, offset) {
    return pgPromise(pool, samplesQuery, [limit, offset]);
};
var boxStatesQuery = 'SELECT * FROM sample.box_states';
exports.getBoxStates = function (pool, limit, nextToken) { return pgPromise(pool, boxStatesQuery); };
var sitesQuery = 'SELECT * FROM geo.vw_sites ORDER BY site_id LIMIT $1 OFFSET $2';
exports.getSites = function (pool, limit, offset) {
    return pgPromise(pool, sitesQuery, [limit, offset]);
};
var siteInfoQuery = 'SELECT * FROM geo.fn_site_info($1)';
exports.getSiteInfo = function (pool, siteId) { return pgPromise(pool, siteInfoQuery, [siteId]); };
var individualsQuery = 'SELECT * FROM entity.vw_individuals';
exports.getIndividuals = function (pool, limit, nextToken) {
    return pgPromise(pool, individualsQuery);
};
var boxesQuery = 'SELECT * FROM sample.vw_boxes ORDER BY box_id LIMIT $1 OFFSET $2';
exports.getBoxes = function (pool, limit, offset) {
    return pgPromise(pool, boxesQuery, [limit, offset]);
};
//# sourceMappingURL=index.js.map