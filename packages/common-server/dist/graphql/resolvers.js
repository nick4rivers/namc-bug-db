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
function limitOffsetCheck(limit, limitMax, offset) {
    if (!limit)
        throw new Error('You must provide a limit for this query');
    if (limit < 0)
        throw new Error('limit must be a valid positive integer');
    if (limit > limitMax)
        throw new Error("limit for this query has a maximum value of " + limitMax);
    if (!(offset >= 0))
        throw new Error('Offset must be a positive integer');
}
function createPagination(data, limit, offset) {
    var nextOffset = null;
    try {
        nextOffset = data && data.length === limit ? offset + limit : null;
    }
    catch (_a) { }
    return {
        records: data.map(function (record) { return common_1.util.snake2camel(record); }),
        nextOffset: nextOffset
    };
}
exports.default = {
    Query: {
        auth: function (obj, args, ctx) { return __awaiter(void 0, void 0, void 0, function () {
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
        samples: function (obj, _a, _b, info) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, pg_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg_1.getSamples(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            console.log(info, obj);
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        sites: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.sites, offset);
                            return [4, pg_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg_1.getSites(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        siteInfo: function (obj, _a, _b) {
            var siteId = _a.siteId;
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
                            return [4, pg_1.getSiteInfo(pool, siteId)];
                        case 2:
                            data = _c.sent();
                            if (data.length !== 1) {
                                throw new Error('Record not found');
                            }
                            return [2, data.map(common_1.util.snake2camel)[0]];
                    }
                });
            });
        },
        sampleInfo: function (obj, _a, _b) {
            var sampleId = _a.sampleId;
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
                            return [4, pg_1.getSampleInfo(pool, sampleId)];
                        case 2:
                            data = _c.sent();
                            if (data.length !== 1) {
                                throw new Error('Record not found');
                            }
                            return [2, data.map(common_1.util.snake2camel)[0]];
                    }
                });
            });
        },
        boxInfo: function (obj, _a, _b) {
            var boxId = _a.boxId;
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
                            return [4, pg_1.getBoxInfo(pool, boxId)];
                        case 2:
                            data = _c.sent();
                            if (data.length !== 1) {
                                throw new Error('Record not found');
                            }
                            return [2, data.map(common_1.util.snake2camel)[0]];
                    }
                });
            });
        },
        modelInfo: function (obj, _a, _b) {
            var modelId = _a.modelId;
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
                            return [4, pg_1.getModelInfo(pool, modelId)];
                        case 2:
                            data = _c.sent();
                            if (data.length !== 1) {
                                throw new Error('Record not found');
                            }
                            return [2, data.map(common_1.util.snake2camel)[0]];
                    }
                });
            });
        },
        samplePredictorValues: function (obj, _a, _b) {
            var sampleId = _a.sampleId;
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
                            return [4, pg_1.getSamplePredictorValues(pool, sampleId)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, 500, 0)];
                    }
                });
            });
        },
        sampleOrganisms: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, sampleId = _a.sampleId, boxId = _a.boxId, siteId = _a.siteId, sampleYear = _a.sampleYear, typeId = _a.typeId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.sampleOrganisms, offset);
                            return [4, pg_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg_1.getSampleOrganisms(pool, limit, offset, sampleId, boxId, siteId, sampleYear, typeId)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        projectOrganisms: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, projectIds = _a.projectIds;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.projectOrganisms, offset);
                            return [4, pg_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg_1.getProjectOrganisms(pool, projectIds, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        boxes: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.boxes, offset);
                            return [4, pg_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg_1.getBoxes(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        projects: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.projects, offset);
                            return [4, pg_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg_1.getProjects(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        taxonomy: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.taxonomy, offset);
                            return [4, pg_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg_1.getTaxonomy(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        predictors: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, modelId = _a.modelId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.predictors, offset);
                            return [4, pg_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg_1.getPredictors(pool, limit, offset, modelId)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        models: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.models, offset);
                            return [4, pg_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg_1.getModels(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        sitePredictorValues: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, siteId = _a.siteId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.sitePredictorValues, offset);
                            return [4, pg_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg_1.getSitePredictorValues(pool, limit, offset, siteId)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        modelPredictors: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, modelId = _a.modelId;
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
                            return [4, pg_1.getModelPredictors(pool, limit, offset, modelId)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, 500, 0)];
                    }
                });
            });
        }
    },
    Mutation: {
        setSitePredictorValue: function (obj, _a, _b) {
            var siteId = _a.siteId, predictorId = _a.predictorId, value = _a.value;
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
                            return [4, pg_1.setSitePredictorValue(pool, siteId, predictorId, value)];
                        case 2:
                            data = _c.sent();
                            return [2, data[0].fn_set_site_predictor_value];
                    }
                });
            });
        },
        setSamplePredictorValue: function (obj, _a, _b) {
            var sampleId = _a.sampleId, predictorId = _a.predictorId, value = _a.value;
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
                            return [4, pg_1.setSamplePredictorValue(pool, sampleId, predictorId, value)];
                        case 2:
                            data = _c.sent();
                            return [2, data[0].fn_set_sample_predictor_value];
                    }
                });
            });
        },
        setSiteCatchment: function (obj, _a, _b) {
            var siteId = _a.siteId, catchment = _a.catchment;
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
                            return [4, pg_1.setSiteCatchment(pool, siteId, catchment)];
                        case 2:
                            data = _c.sent();
                            return [2, data[0].fn_set_site_catchment];
                    }
                });
            });
        }
    }
};
//# sourceMappingURL=resolvers.js.map