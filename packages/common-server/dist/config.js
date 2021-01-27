"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigPromise = exports.ssmName = exports.awsRegion = exports.NODECACHE = void 0;
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
    return ssm_1.getJSONSecret(process.env.SSM_PARAM, exports.awsRegion).then(function (data) { return data; });
};
exports.default = {
    pg: {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        port: process.env.POSTGRES_PORT || 5432,
        host: process.env.POSTGRES_HOST
    }
};
//# sourceMappingURL=config.js.map