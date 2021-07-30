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
var db_1 = require("../db");
var resolverUtil_1 = require("./resolverUtil");
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
        samples: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, sampleIds = _a.sampleIds, boxIds = _a.boxIds, projectIds = _a.projectIds, entityIds = _a.entityIds, siteIds = _a.siteIds, polygon = _a.polygon, pointDistance = _a.pointDistance;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, longitude, latitude, distance;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.checkExclusiveFilter({ sampleIds: sampleIds, boxIds: boxIds, projectIds: projectIds, entityIds: entityIds, siteIds: siteIds, polygon: polygon, pointDistance: pointDistance }, true);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            if (!sampleIds) return [3, 3];
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_samples', args: [limit, offset, sampleIds] })];
                        case 2:
                            data = _c.sent();
                            return [3, 15];
                        case 3:
                            if (!boxIds) return [3, 5];
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_box_samples', args: [limit, offset, boxIds] })];
                        case 4:
                            data = _c.sent();
                            return [3, 15];
                        case 5:
                            if (!projectIds) return [3, 7];
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_project_samples', args: [limit, offset, projectIds] })];
                        case 6:
                            data = _c.sent();
                            return [3, 15];
                        case 7:
                            if (!entityIds) return [3, 9];
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_entity_samples', args: [limit, offset, entityIds] })];
                        case 8:
                            data = _c.sent();
                            return [3, 15];
                        case 9:
                            if (!siteIds) return [3, 11];
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_site_samples', args: [limit, offset, siteIds] })];
                        case 10:
                            data = _c.sent();
                            return [3, 15];
                        case 11:
                            if (!polygon) return [3, 13];
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_polygon_samples', args: [limit, offset, polygon] })];
                        case 12:
                            data = _c.sent();
                            return [3, 15];
                        case 13:
                            if (!pointDistance) return [3, 15];
                            longitude = pointDistance.longitude, latitude = pointDistance.latitude, distance = pointDistance.distance;
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.fn_point_distance_samples',
                                    args: [limit, offset, longitude, latitude, distance]
                                })];
                        case 14:
                            data = _c.sent();
                            _c.label = 15;
                        case 15: return [2, resolverUtil_1.createPagination(data, limit, offset)];
                    }
                });
            });
        },
        organizations: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, searchTerm = _a.searchTerm;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.organizations, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'entity.fn_organizations', args: [limit, offset, searchTerm] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
                    }
                });
            });
        },
        sites: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, sampleIds = _a.sampleIds, boxIds = _a.boxIds, projectIds = _a.projectIds, entityIds = _a.entityIds, siteIds = _a.siteIds, polygon = _a.polygon, pointDistance = _a.pointDistance;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, longitude, latitude, distance;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.checkExclusiveFilter({ sampleIds: sampleIds, boxIds: boxIds, projectIds: projectIds, entityIds: entityIds, siteIds: siteIds, polygon: polygon, pointDistance: pointDistance }, true);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.sites, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            if (!siteIds) return [3, 3];
                            return [4, db_1.fnQuery(pool, { name: 'geo.fn_sites', args: [limit, offset, siteIds] })];
                        case 2:
                            data = _c.sent();
                            return [3, 15];
                        case 3:
                            if (!boxIds) return [3, 5];
                            return [4, db_1.fnQuery(pool, { name: 'geo.fn_box_sites', args: [limit, offset, boxIds] })];
                        case 4:
                            data = _c.sent();
                            return [3, 15];
                        case 5:
                            if (!projectIds) return [3, 7];
                            return [4, db_1.fnQuery(pool, { name: 'geo.fn_project_sites', args: [limit, offset, projectIds] })];
                        case 6:
                            data = _c.sent();
                            return [3, 15];
                        case 7:
                            if (!entityIds) return [3, 9];
                            return [4, db_1.fnQuery(pool, { name: 'geo.fn_entity_sites', args: [limit, offset, entityIds] })];
                        case 8:
                            data = _c.sent();
                            return [3, 15];
                        case 9:
                            if (!sampleIds) return [3, 11];
                            return [4, db_1.fnQuery(pool, { name: 'geo.fn_sample_sites', args: [limit, offset, sampleIds] })];
                        case 10:
                            data = _c.sent();
                            return [3, 15];
                        case 11:
                            if (!polygon) return [3, 13];
                            return [4, db_1.fnQuery(pool, { name: 'geo.fn_polygon_sites', args: [limit, offset, polygon] })];
                        case 12:
                            data = _c.sent();
                            return [3, 15];
                        case 13:
                            if (!pointDistance) return [3, 15];
                            longitude = pointDistance.longitude, latitude = pointDistance.latitude, distance = pointDistance.distance;
                            return [4, db_1.fnQuery(pool, {
                                    name: 'geo.fn_sites_point_distance',
                                    args: [limit, offset, longitude, latitude, distance]
                                })];
                        case 14:
                            data = _c.sent();
                            _c.label = 15;
                        case 15: return [2, resolverUtil_1.createPagination(data, limit, offset)];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'geo.fn_site_info', args: [siteId] })];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_box_info', args: [boxId] })];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'geo.fn_model_info', args: [modelId] })];
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
        modelConditions: function (obj, _a, _b) {
            var modelId = _a.modelId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'geo.fn_model_conditions', args: [modelId] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, 500, 0)];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_sample_predictor_values', args: [sampleId] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, 500, 0)];
                    }
                });
            });
        },
        boxes: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, boxIds = _a.boxIds, entityIds = _a.entityIds;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.boxes, offset);
                            resolverUtil_1.checkExclusiveFilter({ boxIds: boxIds, entityIds: entityIds }, true);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            if (!boxIds) return [3, 3];
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_boxes', args: [limit, offset, boxIds] })];
                        case 2:
                            data = _c.sent();
                            return [3, 5];
                        case 3:
                            if (!entityIds) return [3, 5];
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_entity_boxes', args: [limit, offset, entityIds] })];
                        case 4:
                            data = _c.sent();
                            _c.label = 5;
                        case 5: return [2, resolverUtil_1.createPagination(data, limit, offset)];
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
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.projects, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_projects', args: [limit, offset] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
                    }
                });
            });
        },
        taxonomy: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, searchTerm = _a.searchTerm;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.taxonomy, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'taxa.fn_taxonomy', args: [limit, offset, searchTerm] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'taxa.fn_tree', args: [taxonomyId] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, taxonomyId)];
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
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.predictors, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'geo.fn_predictors', args: [limit, offset, modelId] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
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
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.models, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'geo.fn_models', args: [limit, offset] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
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
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.models, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'taxa.fn_translations', args: [limit, offset] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
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
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.models, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'taxa.fn_translation_taxa',
                                    args: [limit, offset, translationId]
                                })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
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
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.sitePredictorValues, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'geo.fn_site_predictor_values', args: [limit, offset, siteId] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
                    }
                });
            });
        },
        sampleTaxaRaw: function (obj, _a, _b) {
            var sampleIds = _a.sampleIds, boxIds = _a.boxIds, projectIds = _a.projectIds;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.checkExclusiveFilter({ sampleIds: sampleIds, boxIds: boxIds, projectIds: projectIds }, true);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            if (!sampleIds) return [3, 3];
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_sample_taxa_raw', args: [sampleIds] })];
                        case 2:
                            data = _c.sent();
                            return [3, 7];
                        case 3:
                            if (!boxIds) return [3, 5];
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_box_taxa_raw', args: [boxIds] })];
                        case 4:
                            data = _c.sent();
                            return [3, 7];
                        case 5:
                            if (!projectIds) return [3, 7];
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_project_taxa_raw', args: [projectIds] })];
                        case 6:
                            data = _c.sent();
                            _c.label = 7;
                        case 7: return [2, resolverUtil_1.createPagination(data)];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_sample_taxa_generalized', args: [sampleId] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data)];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.fn_sample_translation_taxa',
                                    args: [sampleId, translationId]
                                })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data)];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.fn_translation_rarefied_taxa',
                                    args: [sampleId, translationId, fixedCount]
                                })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data)];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            resolverUtil_1.checkExclusiveFilter({ pointDistance: { longitude: longitude, latitude: latitude, distance: distance } });
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.fn_taxa_raw_point_distance',
                                    args: [longitude, latitude, distance]
                                })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data)];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            resolverUtil_1.checkExclusiveFilter({ polygon: polygon });
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.fn_taxa_raw_polygon',
                                    args: [polygon]
                                })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data)];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'taxa.fn_attributes', args: [limit, offset] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data)];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'metric.fn_metrics', args: [limit, offset] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data)];
                    }
                });
            });
        },
        sampleMetrics: function (obj, _a, _b) {
            var sampleIds = _a.sampleIds, boxIds = _a.boxIds, projectIds = _a.projectIds, translationId = _a.translationId, fixedCount = _a.fixedCount;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.checkExclusiveFilter({ sampleIds: sampleIds, boxIds: boxIds, projectIds: projectIds }, true);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            if (!sampleIds) return [3, 3];
                            return [4, db_1.fnQuery(pool, {
                                    name: 'metric.fn_sample_metrics_array',
                                    args: [sampleIds, translationId, fixedCount]
                                })];
                        case 2:
                            data = _c.sent();
                            return [3, 7];
                        case 3:
                            if (!boxIds) return [3, 5];
                            return [4, db_1.fnQuery(pool, {
                                    name: 'metric.fn_box_metrics',
                                    args: [boxIds, translationId, fixedCount]
                                })];
                        case 4:
                            data = _c.sent();
                            return [3, 7];
                        case 5:
                            if (!projectIds) return [3, 7];
                            return [4, db_1.fnQuery(pool, {
                                    name: 'metric.fn_project_metrics',
                                    args: [projectIds, translationId, fixedCount]
                                })];
                        case 6:
                            data = _c.sent();
                            _c.label = 7;
                        case 7: return [2, resolverUtil_1.createPagination(data)];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'taxa.fn_taxa_attributes', args: [taxonomyId, limit, offset] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data)];
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
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_plankton', args: [limit, offset] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
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
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_drift', args: [limit, offset] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
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
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_fish', args: [limit, offset] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
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
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_mass', args: [limit, offset] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
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
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_model_results', args: [limit, offset, sampleIds] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
                    }
                });
            });
        },
        fishDiet: function (obj, _a, _b) {
            var limit = _a.limit, offset = _a.offset, sampleIds = _a.sampleIds;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.limitOffsetCheck(limit, common_1.graphql.queryLimits.samples, offset);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, { name: 'sample.fn_fish_diet', args: [limit, offset, sampleIds] })];
                        case 2:
                            data = _c.sent();
                            return [2, resolverUtil_1.createPagination(data, limit, offset)];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.fn_set_site_predictor_value',
                                    args: [siteId, predictorId, value]
                                })];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.fn_set_sample_predictor_value',
                                    args: [sampleId, predictorId, value]
                                })];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.fn_set_site_catchment',
                                    args: [siteId, catchment]
                                })];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'taxa.fn_create_translation',
                                    args: [translationName, description]
                                })];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'taxa.fn_set_translation_taxa',
                                    args: [translationId, taxonomyId, alias, isFinal]
                                })];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'taxa.fn_delete_translation_taxa',
                                    args: [translationId, taxonomyId]
                                })];
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
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'taxa.fn_set_taxonomy',
                                    args: [taxonomyId, scientificName, levelId, parentId, author, year, notes, metadata]
                                })];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_set_taxonomy;
                            return [2, returnVal];
                    }
                });
            });
        },
        createProject: function (obj, _a, _b) {
            var projectName = _a.projectName, isPrivate = _a.isPrivate, contactId = _a.contactId, description = _a.description, metadata = _a.metadata;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.fn_create_project',
                                    args: [projectName, isPrivate, contactId, description, metadata]
                                })];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_create_project;
                            return [2, returnVal];
                    }
                });
            });
        },
        addProjectSamples: function (obj, _a, _b) {
            var projectId = _a.projectId, sampleIds = _a.sampleIds;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.checkExclusiveFilter({ sampleIds: sampleIds });
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.add_project_samples',
                                    args: [projectId, sampleIds]
                                })];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_add_project_samples;
                            return [2, returnVal];
                    }
                });
            });
        },
        addProjectBoxes: function (obj, _a, _b) {
            var projectId = _a.projectId, boxIds = _a.boxIds;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.checkExclusiveFilter({ boxIds: boxIds });
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.add_project_boxes',
                                    args: [projectId, boxIds]
                                })];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_add_project_boxes;
                            return [2, returnVal];
                    }
                });
            });
        },
        removeProjectSamples: function (obj, _a, _b) {
            var projectId = _a.projectId, sampleIds = _a.sampleIds;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            resolverUtil_1.checkExclusiveFilter({ sampleIds: sampleIds });
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.remove_project_samples',
                                    args: [projectId, sampleIds]
                                })];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_remove_project_samples;
                            return [2, returnVal];
                    }
                });
            });
        },
        deleteProject: function (obj, _a, _b) {
            var projectId = _a.projectId;
            var user = _b.user;
            return __awaiter(void 0, void 0, void 0, function () {
                var pool, data, returnVal;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            resolverUtil_1.loggedInGate(user);
                            return [4, db_1.getPool()];
                        case 1:
                            pool = _c.sent();
                            return [4, db_1.fnQuery(pool, {
                                    name: 'sample.delete_project',
                                    args: [projectId]
                                })];
                        case 2:
                            data = _c.sent();
                            returnVal = data[0].fn_delete_project;
                            return [2, returnVal];
                    }
                });
            });
        }
    }
};
//# sourceMappingURL=resolvers.js.map