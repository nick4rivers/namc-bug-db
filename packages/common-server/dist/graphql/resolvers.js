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
var pg = __importStar(require("../pg"));
var config_2 = require("../config");
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
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getSamples(pool, limit, offset)];
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
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getSites(pool, limit, offset)];
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
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getSiteInfo(pool, siteId)];
                        case 2:
                            data = _c.sent();
                            if (data.length !== 1) {
                                throw new Error('Record not found');
                            }
                            returnVal = data.map(common_1.util.snake2camel)[0];
                            return [2, returnVal];
                    }
                });
            });
        },
        sampleInfo: function (obj, _a, _b) {
            var sampleId = _a.sampleId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getSampleInfo(pool, sampleId)];
                        case 2:
                            data = _c.sent();
                            if (data.length !== 1) {
                                throw new Error('Record not found');
                            }
                            returnVal = data.map(common_1.util.snake2camel)[0];
                            return [2, returnVal];
                    }
                });
            });
        },
        boxInfo: function (obj, _a, _b) {
            var boxId = _a.boxId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getBoxInfo(pool, boxId)];
                        case 2:
                            data = _c.sent();
                            if (data.length !== 1) {
                                throw new Error('Record not found');
                            }
                            returnVal = data.map(common_1.util.snake2camel)[0];
                            return [2, returnVal];
                    }
                });
            });
        },
        modelInfo: function (obj, _a, _b) {
            var modelId = _a.modelId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getModelInfo(pool, modelId)];
                        case 2:
                            data = _c.sent();
                            if (data.length !== 1) {
                                throw new Error('Record not found');
                            }
                            returnVal = data.map(common_1.util.snake2camel)[0];
                            return [2, returnVal];
                    }
                });
            });
        },
        modelThresholds: function (obj, _a, _b) {
            var modelId = _a.modelId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getModelThresholds(pool, modelId)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, 500, 0)];
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
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getSamplePredictorValues(pool, sampleId)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, 500, 0)];
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
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getBoxes(pool, limit, offset)];
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
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getProjects(pool, limit, offset)];
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
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getTaxonomy(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        taxonomyTree: function (obj, _a, _b) {
            var taxonomyId = _a.taxonomyId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getTaxonomyTree(pool, taxonomyId)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, taxonomyId)];
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
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getPredictors(pool, limit, offset, modelId)];
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
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getModels(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        translations: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.models, offset);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getTranslations(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        translationTaxa: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, translationId = _a.translationId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.models, offset);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getTranslationTaxa(pool, limit, offset, translationId)];
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
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getSitePredictorValues(pool, limit, offset, siteId)];
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
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getModelPredictors(pool, limit, offset, modelId)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, 500, 0)];
                    }
                });
            });
        },
        sampleTaxaRaw: function (obj, _a, _b) {
            var sampleIds = _a.sampleIds, boxIds = _a.boxIds, projectIds = _a.projectIds;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var check, pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            check = [sampleIds, boxIds, projectIds].filter(function (i) { return i; });
                            if (check.length === 0)
                                throw new Error('You must provide an array of sample IDs, box IDs or project IDs.');
                            else if (check.length > 1)
                                throw new Error('You must choose either an array of sample IDs, an array of box IDs, or an array of project IDs.');
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            if (!sampleIds) return [3, 3];
                            if (sampleIds.length < 1 || sampleIds.length > config_2.maxIdResults)
                                throw new Error(sampleIds.length + " items found. You must specify between 1 and " + config_2.maxIdResults + " item IDs.");
                            return [4, pg.getSampleTaxaRaw(pool, sampleIds)];
                        case 2:
                            data = _c.sent();
                            return [3, 7];
                        case 3:
                            if (!boxIds) return [3, 5];
                            if (boxIds.length > config_2.maxIdResults)
                                throw new Error(boxIds.length + " items found. You must specify between 1 and " + config_2.maxIdResults + " item IDs.");
                            return [4, pg.getBoxTaxaRaw(pool, boxIds)];
                        case 4:
                            data = _c.sent();
                            return [3, 7];
                        case 5:
                            if (!projectIds) return [3, 7];
                            if (projectIds.length > config_2.maxIdResults)
                                throw new Error(projectIds.length + " items found. You must specify between 1 and " + config_2.maxIdResults + " item IDs.");
                            return [4, pg.getProjectTaxaRaw(pool, projectIds)];
                        case 6:
                            data = _c.sent();
                            _c.label = 7;
                        case 7: return [2, createPagination(data)];
                    }
                });
            });
        },
        sampleTaxaGeneralized: function (obj, _a, _b) {
            var sampleId = _a.sampleId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getSampleTaxaGeneralized(pool, sampleId)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data)];
                    }
                });
            });
        },
        sampleTaxaTranslation: function (obj, _a, _b) {
            var sampleId = _a.sampleId, translationId = _a.translationId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getSampleTaxaTranslation(pool, sampleId, translationId)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data)];
                    }
                });
            });
        },
        sampleTaxaTranslationRarefied: function (obj, _a, _b) {
            var sampleId = _a.sampleId, translationId = _a.translationId, fixedCount = _a.fixedCount;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getSampleTaxaTranslationRarefied(pool, sampleId, translationId, fixedCount)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data)];
                    }
                });
            });
        },
        pointTaxaRaw: function (obj, _a, _b) {
            var longitude = _a.longitude, latitude = _a.latitude, distance = _a.distance;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getPointTaxaRawQuery(pool, longitude, latitude, distance)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data)];
                    }
                });
            });
        },
        polygonTaxaRaw: function (obj, _a, _b) {
            var polygon = _a.polygon;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getPolygonTaxaRawQuery(pool, polygon)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data)];
                    }
                });
            });
        },
        attributes: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getAttributes(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data)];
                    }
                });
            });
        },
        metrics: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getMetrics(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data)];
                    }
                });
            });
        },
        sampleMetrics: function (obj, _a, _b) {
            var sampleIds = _a.sampleIds, boxIds = _a.boxIds, projectIds = _a.projectIds, translationId = _a.translationId, fixedCount = _a.fixedCount;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var check, pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            check = [sampleIds, boxIds, projectIds].filter(function (i) { return i; });
                            if (check.length === 0)
                                throw new Error('You must provide an array of sample IDs, box IDs or project IDs.');
                            else if (check.length > 1)
                                throw new Error('You must choose either an array of sample IDs, an array of box IDs, or an array of project IDs.');
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            if (!sampleIds) return [3, 3];
                            if (sampleIds.length < 1 || sampleIds.length > config_2.maxIdResults)
                                throw new Error(sampleIds.length + " items found. You must specify between 1 and " + config_2.maxIdResults + " item IDs.");
                            return [4, pg.getSampleMetrics(pool, sampleIds, translationId, fixedCount)];
                        case 2:
                            data = _c.sent();
                            return [3, 7];
                        case 3:
                            if (!boxIds) return [3, 5];
                            if (boxIds.length > config_2.maxIdResults)
                                throw new Error(boxIds.length + " items found. You must specify between 1 and " + config_2.maxIdResults + " item IDs.");
                            return [4, pg.getBoxMetrics(pool, boxIds, translationId, fixedCount)];
                        case 4:
                            data = _c.sent();
                            return [3, 7];
                        case 5:
                            if (!projectIds) return [3, 7];
                            if (projectIds.length > config_2.maxIdResults)
                                throw new Error(projectIds.length + " items found. You must specify between 1 and " + config_2.maxIdResults + " item IDs.");
                            return [4, pg.getProjectMetrics(pool, projectIds, translationId, fixedCount)];
                        case 6:
                            data = _c.sent();
                            _c.label = 7;
                        case 7: return [2, createPagination(data)];
                    }
                });
            });
        },
        taxaAttributes: function (obj, _a, _b) {
            var taxonomyId = _a.taxonomyId, limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getTaxaAttributes(pool, taxonomyId, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data)];
                    }
                });
            });
        },
        planktonSamples: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getPlanktonSamples(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        driftSamples: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getDriftSamples(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        fishSamples: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getFishSamples(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        massSamples: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getMassSamples(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        modelResults: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, sampleIds = _a.sampleIds;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getModelResults(pool, limit, offset, sampleIds)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
                    }
                });
            });
        },
        fishGuts: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.getFishGuts(pool, limit, offset)];
                        case 2:
                            data = _c.sent();
                            return [2, createPagination(data, limit, offset)];
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
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.setSitePredictorValue(pool, siteId, predictorId, value)];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_set_site_predictor_value;
                            return [2, returnVal];
                    }
                });
            });
        },
        setSamplePredictorValue: function (obj, _a, _b) {
            var sampleId = _a.sampleId, predictorId = _a.predictorId, value = _a.value;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.setSamplePredictorValue(pool, sampleId, predictorId, value)];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_set_sample_predictor_value;
                            return [2, returnVal];
                    }
                });
            });
        },
        setSiteCatchment: function (obj, _a, _b) {
            var siteId = _a.siteId, catchment = _a.catchment;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.setSiteCatchment(pool, siteId, catchment)];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_set_site_catchment;
                            return [2, returnVal];
                    }
                });
            });
        },
        createTranslation: function (obj, _a, _b) {
            var translationName = _a.translationName, description = _a.description;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.createTranslation(pool, translationName, description)];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_create_translation;
                            return [2, returnVal];
                    }
                });
            });
        },
        setTranslationTaxa: function (obj, _a, _b) {
            var translationId = _a.translationId, taxonomyId = _a.taxonomyId, alias = _a.alias, isFinal = _a.isFinal;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.setTranslationTaxa(pool, translationId, taxonomyId, alias, isFinal)];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_set_translation_taxa;
                            return [2, returnVal];
                    }
                });
            });
        },
        deleteTranslationTaxa: function (obj, _a, _b) {
            var translationId = _a.translationId, taxonomyId = _a.taxonomyId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.deleteTranslationTaxa(pool, translationId, taxonomyId)];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_delete_translation_taxa;
                            return [2, returnVal];
                    }
                });
            });
        },
        setTaxonomy: function (obj, _a, _b) {
            var taxonomyId = _a.taxonomyId, scientificName = _a.scientificName, levelId = _a.levelId, parentId = _a.parentId, author = _a.author, year = _a.year, notes = _a.notes, metadata = _a.metadata;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            loggedInGate(user);
                            return [4, pg.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, pg.setTaxonomy(pool, taxonomyId, scientificName, levelId, parentId, author, year, notes, metadata)];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_set_taxonomy;
                            return [2, returnVal];
                    }
                });
            });
        }
    }
};
//# sourceMappingURL=resolvers.js.map