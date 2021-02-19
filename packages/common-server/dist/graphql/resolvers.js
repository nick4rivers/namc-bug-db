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
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../config");
var common_1 = require("@namcbugdb/common");
var pg_1 = require("../pg");
function loggedInGate(user) {
    var err = new Error('You must be authenticated to perform this query.');
    try {
        if (!user.cognito.isLoggedIn || !user.cognito.sub || user.cognito.sub.length < 10)
            throw err;
    }
    catch (_a) {
        throw new Error('You are not authorized to perform this query.');
    }
}
exports.default = {
    Query: {
        auth: function (obj, args, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
            var config, loggedIn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, config_1.getConfigPromise()];
                    case 1:
                        config = _a.sent();
                        loggedIn = false;
                        try {
                            loggedIn = Boolean(ctx.user.cognito.sub);
                        }
                        catch (_b) { }
                        return [2, {
                                loggedIn: loggedIn,
                                userPool: config.cognito.userPoolId,
                                clientId: config.cognito.userPoolWebClientId,
                                domain: config.cognito.hostedDomain,
                                region: config.region
                            }];
                }
            });
        }); },
<<<<<<< HEAD
        samples: function (obj, _a, _b, info) {
            var limit = _a.limit, nextToken = _a.nextToken;
            var user = _b.user;
=======
        samples: function (obj, _a, ctx, info) {
            var limit = _a.limit, offset = _a.offset;
>>>>>>> samples through API
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg_1.getPool()];
                        case 1:
<<<<<<< HEAD
                            pool = _c.sent();
                            return [4, pg_1.getSamples(pool, limit, nextToken)];
=======
                            pool = _b.sent();
                            return [4, pg_1.getSamples(pool, limit, offset)];
>>>>>>> samples through API
                        case 2:
                            data = _c.sent();
                            return [2, {
                                    records: data.map(common_1.util.snake2camel),
                                    nextToken: 0
                                }];
                    }
                });
            });
        },
        boxStates: function (obj, _a, _b, info) {
            var limit = _a.limit, nextToken = _a.nextToken;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg_1.getBoxStates(pool, limit, nextToken)];
                        case 2:
                            data = _c.sent();
                            return [2, data.map(common_1.util.snake2camel)];
                    }
                });
            });
        },
<<<<<<< HEAD
        sites: function (obj, _a, _b, info) {
            var limit = _a.limit, nextToken = _a.nextToken;
            var user = _b.user;
=======
        sites: function (obj, _a, ctx, info) {
            var limit = _a.limit, offset = _a.offset;
>>>>>>> individuals removed. boxes cleaned up
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg_1.getPool()];
                        case 1:
<<<<<<< HEAD
                            pool = _c.sent();
                            return [4, pg_1.getSites(pool, limit, nextToken)];
=======
                            pool = _b.sent();
                            return [4, pg_1.getSites(pool, limit, offset)];
>>>>>>> individuals removed. boxes cleaned up
                        case 2:
                            data = _c.sent();
                            return [2, data.map(common_1.util.snake2camel)];
                    }
                });
            });
        },
<<<<<<< HEAD
        individuals: function (obj, _a, _b, info) {
=======
        siteInfo: function (obj, _a, ctx, info) {
            var siteId = _a.siteId;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, pg_1.getPool()];
                        case 1:
                            pool = _b.sent();
                            return [4, pg_1.getSiteInfo(pool, siteId)];
                        case 2:
                            data = _b.sent();
                            if (data.length !== 1) {
                                throw new Error('Record not found');
                            }
                            return [2, data.map(common_1.util.snake2camel)[0]];
                    }
                });
            });
        },
<<<<<<< HEAD
<<<<<<< HEAD
        individuals: function (obj, _a, ctx, info) {
>>>>>>> sites and siteInfo API endpoints
            var limit = _a.limit, nextToken = _a.nextToken;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg_1.getIndividuals(pool, limit, nextToken)];
                        case 2:
                            data = _c.sent();
=======
        sampleOrganisms: function (obj, _a, ctx, info) {
            var sampleId = _a.sampleId;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, pg_1.getPool()];
                        case 1:
                            pool = _b.sent();
                            return [4, pg_1.getSampleOrganisms(pool, sampleId)];
                        case 2:
                            data = _b.sent();
>>>>>>> projects plankton drift taxonomy
                            return [2, data.map(common_1.util.snake2camel)];
                    }
                });
            });
        },
<<<<<<< HEAD
        boxes: function (obj, _a, _b, info) {
            var limit = _a.limit, nextToken = _a.nextToken;
            var user = _b.user;
=======
=======
>>>>>>> projects plankton drift taxonomy
        boxes: function (obj, _a, ctx, info) {
            var limit = _a.limit, offset = _a.offset;
>>>>>>> individuals removed. boxes cleaned up
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg_1.getPool()];
                        case 1:
<<<<<<< HEAD
                            pool = _c.sent();
                            return [4, pg_1.getBoxes(pool, limit, nextToken)];
=======
                            pool = _b.sent();
                            return [4, pg_1.getBoxes(pool, limit, offset)];
>>>>>>> individuals removed. boxes cleaned up
                        case 2:
                            data = _c.sent();
                            return [2, data.map(common_1.util.snake2camel)];
                    }
                });
            });
        },
        projects: function (obj, _a, ctx, info) {
            var limit = _a.limit, offset = _a.offset;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, pg_1.getPool()];
                        case 1:
                            pool = _b.sent();
                            return [4, pg_1.getProjects(pool, limit, offset)];
                        case 2:
                            data = _b.sent();
                            return [2, data.map(common_1.util.snake2camel)];
                    }
                });
            });
        },
        driftSamples: function (obj, _a, ctx, info) {
            var limit = _a.limit, offset = _a.offset;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, pg_1.getPool()];
                        case 1:
                            pool = _b.sent();
                            return [4, pg_1.getDriftSamples(pool, limit, offset)];
                        case 2:
                            data = _b.sent();
                            return [2, data.map(common_1.util.snake2camel)];
                    }
                });
            });
        },
        planktonSamples: function (obj, _a, ctx, info) {
            var limit = _a.limit, offset = _a.offset;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, pg_1.getPool()];
                        case 1:
                            pool = _b.sent();
                            return [4, pg_1.getPlanktonSamples(pool, limit, offset)];
                        case 2:
                            data = _b.sent();
                            return [2, data.map(common_1.util.snake2camel)];
                    }
                });
            });
        },
        taxonomy: function (obj, _a, ctx, info) {
            var limit = _a.limit, offset = _a.offset;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, pg_1.getPool()];
                        case 1:
                            pool = _b.sent();
                            return [4, pg_1.getTaxonomy(pool, limit, offset)];
                        case 2:
                            data = _b.sent();
                            return [2, data.map(common_1.util.snake2camel)];
                    }
                });
            });
        }
    }
};
//# sourceMappingURL=resolvers.js.map