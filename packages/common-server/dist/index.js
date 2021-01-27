"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
Object.defineProperty(exports, "getConfigPromise", { enumerable: true, get: function () { return config_1.getConfigPromise; } });
Object.defineProperty(exports, "NODECACHE", { enumerable: true, get: function () { return config_1.NODECACHE; } });
Object.defineProperty(exports, "awsRegion", { enumerable: true, get: function () { return config_1.awsRegion; } });
var graphql_1 = require("./graphql");
Object.defineProperty(exports, "executableSchema", { enumerable: true, get: function () { return graphql_1.default; } });
exports.authHelpers = __importStar(require("./lib/auth/authHelpers"));
var Authorizer_1 = require("./lib/auth/Authorizer");
Object.defineProperty(exports, "Authorizer", { enumerable: true, get: function () { return Authorizer_1.default; } });
__exportStar(require("./types"), exports);
exports.awsLib = __importStar(require("./lib/aws"));
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map