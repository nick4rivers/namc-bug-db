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
var pg_1 = require("../pg");
exports.default = {
    Query: {
        helloWorld: function (obj, _a, ctx, info) {
            var name = _a.name;
            return {
                message: "Good bye forever " + name + "!",
                friendly: Math.random() < 0.5
            };
        },
        samples: function (obj, args, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
            var pool, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pool = pg_1.getPool();
                        return [4, pg_1.getSamples(pool)];
                    case 1:
                        data = _a.sent();
                        return [2, data.map(function (vals) { return ({
                                sampleId: vals.sample_id,
                                boxId: vals.box_id,
                                customerId: vals.customer_id,
                                customerName: vals.organization_name,
                                siteId: vals.site_id,
                                siteName: vals.site_name,
                                sampleDate: vals.sample_date,
                                sampleTime: vals.sample_time,
                                typeId: vals.type_id,
                                typeName: vals.sample_type_name,
                                methodId: vals.method_id,
                                methodName: vals.sample_method_name,
                                habitatId: vals.habitat_id,
                                habitatName: vals.habitat_name,
                                area: vals.area,
                                fieldSplit: vals.field_split,
                                labSplit: vals.lab_split,
                                jarCount: vals.jar_count,
                                qualitative: vals.qualitative,
                                mesh: vals.mesh,
                                createdDate: vals.created_date,
                                updatedDate: vals.updated_date,
                                qaSampleId: vals.qa_sample_id
                            }); })];
                }
            });
        }); },
        boxStates: function (obj, args, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
            var pool, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pool = pg_1.getPool();
                        return [4, pg_1.getBoxStates(pool)];
                    case 1:
                        data = _a.sent();
                        return [2, data.map(function (vals) { return ({
                                boxStateId: vals.box_state_id
                            }); })];
                }
            });
        }); },
        sites: function (obj, args, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
            var pool, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pool = pg_1.getPool();
                        return [4, pg_1.getSites(pool)];
                    case 1:
                        data = _a.sent();
                        return [2, data.map(function (vals) { return ({
                                siteId: vals.site_id,
                                siteName: vals.site_name,
                                ecosystemId: vals.ecosystem_id,
                                ecosystemName: vals.ecosystem_name,
                                waterbody: vals.waterbody,
                                longitude: vals.longitude,
                                latitude: vals.latitude
                            }); })];
                }
            });
        }); },
        individuals: function (obj, args, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
            var pool, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pool = pg_1.getPool();
                        return [4, pg_1.getIndividuals(pool)];
                    case 1:
                        data = _a.sent();
                        return [2, data.map(function (vals) { return ({
                                siteId: vals.site_id,
                                siteName: vals.site_name,
                                ecosystemId: vals.ecosystem_id,
                                ecosystemName: vals.ecosystem_name,
                                waterbody: vals.waterbody,
                                longitude: vals.longitude,
                                latitude: vals.latitude
                            }); })];
                }
            });
        }); },
        boxes: function (obj, args, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
            var pool, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pool = pg_1.getPool();
                        return [4, pg_1.getBoxes(pool)];
                    case 1:
                        data = _a.sent();
                        return [2, data.map(function (vals) { return ({
                                boxId: vals.box_id,
                                customerId: vals.customer_id,
                                customerName: vals.organization_name,
                                samples: vals.samples,
                                submitterId: vals.submitter_id,
                                SubmitterName: vals.submitter_name,
                                boxStateId: vals.box_state_id,
                                boxStateName: vals.box_state_name,
                                boxReceivedDate: vals.box_received_date,
                                processingCompleteDate: vals.processing_complete_date,
                                projectedCompleteDate: vals.projected_complete_date,
                                projectId: vals.project_id,
                                projectName: vals.project_name
                            }); })];
                }
            });
        }); }
    }
};
//# sourceMappingURL=resolvers.js.map