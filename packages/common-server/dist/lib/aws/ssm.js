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
exports.getSecret = exports.getParameter = void 0;
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var config_1 = require("../../config");
var loglevel_1 = __importDefault(require("loglevel"));
function getParameter(paramName, region) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, ssm, cached, params;
        return __generator(this, function (_a) {
            cacheKey = "SSM_" + paramName;
            ssm = new aws_sdk_1.default.SSM({ region: region });
            cached = config_1.NODECACHE.get(cacheKey);
            if (cached)
                return [2, Promise.resolve(JSON.parse(cached))];
            params = {
                Name: paramName
            };
            return [2, ssm
                    .getParameter(params)
                    .promise()
                    .then(function (data) {
                    loglevel_1.default.info("gotParam", data);
                    config_1.NODECACHE.set(cacheKey, data.Parameter.Value);
                    return JSON.parse(data.Parameter.Value);
                })
                    .catch(function (err) {
                    loglevel_1.default.error("Error retrieving/parsing SSM value: " + paramName);
                    throw err;
                })];
        });
    });
}
exports.getParameter = getParameter;
function getSecret(secretName, region) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, cached, secrets, secretParams, secret;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cacheKey = "SECRET_" + secretName;
                    cached = config_1.NODECACHE.get(cacheKey);
                    if (cached)
                        return [2, Promise.resolve(JSON.parse(cached))];
                    secrets = new aws_sdk_1.default.SecretsManager({ region: region });
                    secretParams = {
                        SecretId: process.env.SECRET_NAME
                    };
                    return [4, secrets.getSecretValue(secretParams).promise()];
                case 1:
                    secret = _a.sent();
                    return [2, JSON.parse(secret.SecretString)];
            }
        });
    });
}
exports.getSecret = getSecret;
//# sourceMappingURL=ssm.js.map