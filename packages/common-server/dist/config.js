"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDBSecretCredentials = exports.getConfigPromise = exports.ssmName = exports.awsRegion = exports.NODECACHE = void 0;
var node_cache_1 = __importDefault(require("node-cache"));
var ssm_1 = require("./lib/aws/ssm");
exports.NODECACHE = new node_cache_1.default({ stdTTL: 30, checkperiod: 25 });
var mandatoryKeys = ['SSM_PARAM', 'REGION'];
mandatoryKeys.forEach(function (key) {
    if (!process.env[key]) {
        throw new Error("Missing environment variable: " + key);
    }
});
exports.awsRegion = process.env.REGION;
exports.ssmName = process.env.SSM_PARAM;
exports.getConfigPromise = function () {
    return ssm_1.getParameter(process.env.SSM_PARAM, exports.awsRegion).then(function (param) {
        var newParam = __assign(__assign({}, param), { db: {
                dbName: process.env.POSTGRES_DB || param.db.dbName,
                endpoint: process.env.POSTGRES_HOST || param.db.endpoint,
                port: process.env.POSTGRES_PORT || param.db.port
            } });
        return newParam;
    });
};
exports.getDBSecretCredentials = function () {
    return ssm_1.getSecret(process.env.SECRET_NAME, exports.awsRegion).then(function (data) {
        return __assign(__assign({}, data), { username: process.env.POSTGRES_USER || data.username, password: process.env.POSTGRES_PASSWORD || data.password });
    });
};
//# sourceMappingURL=config.js.map