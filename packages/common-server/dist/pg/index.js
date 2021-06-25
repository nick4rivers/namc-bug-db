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
exports.getProjectMetrics = exports.getBoxMetrics = exports.getSampleMetrics = exports.getSampleTaxaTranslationRarefied = exports.getSampleTaxaRarefied = exports.getSampleTaxaTranslation = exports.getSampleTaxaGeneralized = exports.getPolygonTaxaRawQuery = exports.getPointTaxaRawQuery = exports.getProjectTaxaRaw = exports.getBoxTaxaRaw = exports.getSampleTaxaRaw = exports.setTaxonomy = exports.deleteTranslationTaxa = exports.setTranslationTaxa = exports.createTranslation = exports.setSiteCatchment = exports.setSamplePredictorValue = exports.setSitePredictorValue = exports.getMetrics = exports.getModelThresholds = exports.getTaxaAttributes = exports.getAttributes = exports.getMassSamples = exports.getFishSamples = exports.getDriftSamples = exports.getPlanktonSamples = exports.getTranslationTaxa = exports.getTranslations = exports.getModelPredictors = exports.getSamplePredictorValues = exports.getBoxInfo = exports.getSampleInfo = exports.getSitePredictorValues = exports.getModelInfo = exports.getModels = exports.getPredictors = exports.getTaxonomyTree = exports.getTaxonomy = exports.getProjects = exports.getBoxes = exports.getIndividuals = exports.getSiteInfo = exports.getSites = exports.getSamples = exports.getPool = void 0;
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
var sitesQuery = 'SELECT * FROM geo.fn_sites($1, $2)';
exports.getSites = function (pool, limit, offset) {
    return pgPromise(pool, sitesQuery, [limit, offset]);
};
var siteInfoQuery = 'SELECT * FROM geo.fn_site_info($1)';
exports.getSiteInfo = function (pool, siteId) { return pgPromise(pool, siteInfoQuery, [siteId]); };
var individualsQuery = 'SELECT * FROM entity.vw_individuals LIMIT $1 OFFSET $2';
exports.getIndividuals = function (pool, limit, offset) {
    return pgPromise(pool, individualsQuery, [limit, offset]);
};
var boxesQuery = 'SELECT * FROM sample.fn_boxes($1, $2)';
exports.getBoxes = function (pool, limit, offset) {
    return pgPromise(pool, boxesQuery, [limit, offset]);
};
var projectsQuery = 'SELECT * FROM sample.fn_projects($1, $2)';
exports.getProjects = function (pool, limit, offset) {
    return pgPromise(pool, projectsQuery, [limit, offset]);
};
var taxonomyQuery = 'SELECT * FROM taxa.fn_taxonomy($1, $2)';
exports.getTaxonomy = function (pool, limit, offset) {
    return pgPromise(pool, taxonomyQuery, [limit, offset]);
};
var taxonomyTreeQuery = 'SELECT * FROM taxa.fn_tree($1)';
exports.getTaxonomyTree = function (pool, taxonomyId) {
    return pgPromise(pool, taxonomyTreeQuery, [taxonomyId]);
};
var predictorQuery = 'SELECT * FROM geo.fn_predictors($1, $2, $3)';
exports.getPredictors = function (pool, limit, offset, modelId) {
    return pgPromise(pool, predictorQuery, [limit, offset, modelId]);
};
var modelQuery = 'SELECT * FROM geo.fn_models($1, $2)';
exports.getModels = function (pool, limit, offset) {
    return pgPromise(pool, modelQuery, [limit, offset]);
};
var modelInfoQuery = 'SELECT * FROM geo.fn_model_info($1)';
exports.getModelInfo = function (pool, modelId) { return pgPromise(pool, modelInfoQuery, [modelId]); };
var sitePredictorValuesQuery = 'SELECT * FROM geo.fn_site_predictor_values($1, $2, $3)';
exports.getSitePredictorValues = function (pool, limit, offset, siteId) {
    return pgPromise(pool, sitePredictorValuesQuery, [limit, offset, siteId]);
};
var sampleInfoQuery = 'SELECT * FROM sample.fn_sample_info($1)';
exports.getSampleInfo = function (pool, sampleId) {
    return pgPromise(pool, sampleInfoQuery, [sampleId]);
};
var boxInfoQuery = 'SELECT * FROM sample.fn_box_info($1)';
exports.getBoxInfo = function (pool, boxId) { return pgPromise(pool, boxInfoQuery, [boxId]); };
var samplePredictorValuesQuery = 'SELECT * FROM sample.fn_sample_predictor_values($1)';
exports.getSamplePredictorValues = function (pool, sampleId) {
    return pgPromise(pool, samplePredictorValuesQuery, [sampleId]);
};
var modelPredictorsQuery = 'SELECT * FROM geo.fn_model_predictors($1, $2, $3)';
exports.getModelPredictors = function (pool, limit, offset, modelId) {
    return pgPromise(pool, modelPredictorsQuery, [limit, offset, modelId]);
};
var translationsQuery = 'SELECT * FROM taxa.fn_translations($1, $2)';
exports.getTranslations = function (pool, limit, offset) {
    return pgPromise(pool, translationsQuery, [limit, offset]);
};
var translationTaxaQuery = 'SELECT * FROM taxa.fn_translation_taxa($1, $2, $3)';
exports.getTranslationTaxa = function (pool, limit, offset, translationId) {
    return pgPromise(pool, translationTaxaQuery, [limit, offset, translationId]);
};
var planktonSampleQuery = 'SELECT * FROM sample.fn_plankton($1, $2)';
exports.getPlanktonSamples = function (pool, limit, offset) {
    return pgPromise(pool, planktonSampleQuery, [limit, offset]);
};
var driftSampleQuery = 'SELECT * FROM sample.fn_drift($1, $2)';
exports.getDriftSamples = function (pool, limit, offset) {
    return pgPromise(pool, driftSampleQuery, [limit, offset]);
};
var fishSampleQuery = 'SELECT * FROM sample.fn_fish($1, $2)';
exports.getFishSamples = function (pool, limit, offset) {
    return pgPromise(pool, fishSampleQuery, [limit, offset]);
};
var massSampleQuery = 'SELECT * FROM sample.fn_mass($1, $2)';
exports.getMassSamples = function (pool, limit, offset) {
    return pgPromise(pool, massSampleQuery, [limit, offset]);
};
var attributesQuery = 'SELECT * FROM taxa.fn_attributes($1, $2)';
exports.getAttributes = function (pool, limit, offset) {
    return pgPromise(pool, attributesQuery, [limit, offset]);
};
var attributeValueQuery = 'SELECT * FROM taxa.fn_taxa_attributes($1, $2, $3)';
exports.getTaxaAttributes = function (pool, taxonomyId, limit, offset) {
    return pgPromise(pool, attributeValueQuery, [taxonomyId, limit, offset]);
};
var modelThresholdQuery = 'SELECT * FROM geo.fn_model_thresholds($1)';
exports.getModelThresholds = function (pool, modelId) {
    return pgPromise(pool, modelThresholdQuery, [modelId]);
};
var metricsQuery = 'SELECT * FROM metric.fn_metrics($1, $2)';
exports.getMetrics = function (pool, limit, offset) {
    return pgPromise(pool, metricsQuery, [limit, offset]);
};
var setSitePredictorValueQuery = 'SELECT * FROM sample.fn_set_site_predictor_value($1, $2, $3)';
exports.setSitePredictorValue = function (pool, siteId, predictorId, value) {
    return pgPromise(pool, setSitePredictorValueQuery, [siteId, predictorId, value]);
};
var setSamplePredictorValueQuery = 'SELECT * FROM sample.fn_set_sample_predictor_value($1, $2, $3)';
exports.setSamplePredictorValue = function (pool, sampleId, predictorId, value) { return pgPromise(pool, setSamplePredictorValueQuery, [sampleId, predictorId, value]); };
var setSiteCatchmentQuery = 'SELECT sample.fn_set_site_catchment($1, $2)';
exports.setSiteCatchment = function (pool, siteId, catchment) {
    return pgPromise(pool, setSiteCatchmentQuery, [siteId, catchment]);
};
var createTranslationQuery = 'SELECT * FROM taxa.fn_create_translation($1, $2)';
exports.createTranslation = function (pool, translationName, description) {
    return pgPromise(pool, createTranslationQuery, [translationName, description]);
};
var setTranslationTaxaQuery = 'SELECT * FROM taxa.fn_set_translation_taxa($1, $2, $3, $4)';
exports.setTranslationTaxa = function (pool, translationId, taxonomyId, alias, isFinal) { return pgPromise(pool, setTranslationTaxaQuery, [translationId, taxonomyId, alias, isFinal]); };
var deleteTranslationTaxaQuery = 'SELECT * FROM taxa.fn_delete_translation_taxa($1, $2)';
exports.deleteTranslationTaxa = function (pool, translationId, taxonomyId) {
    return pgPromise(pool, deleteTranslationTaxaQuery, [translationId, taxonomyId]);
};
var setTaxonomyQuery = 'SELECT * FROM taxa.fn_set_taxonomy($1, $2, $3, $4, $5, $6, $7, $8)';
exports.setTaxonomy = function (pool, taxonomyId, scientificName, levelId, parentId, author, year, notes, metadata) {
    return pgPromise(pool, setTaxonomyQuery, [taxonomyId, scientificName, levelId, parentId, author, year, notes, metadata]);
};
var sampleTaxaRawQuery = 'SELECT * FROM sample.fn_sample_taxa_raw($1)';
exports.getSampleTaxaRaw = function (pool, sampleIds) {
    return pgPromise(pool, sampleTaxaRawQuery, [sampleIds]);
};
var boxTaxaRawQuery = 'SELECT * FROM sample.fn_box_taxa_raw($1)';
exports.getBoxTaxaRaw = function (pool, boxIds) { return pgPromise(pool, boxTaxaRawQuery, [boxIds]); };
var projectTaxaRawQuery = 'SELECT * FROM sample.fn_project_taxa_raw($1)';
exports.getProjectTaxaRaw = function (pool, projectIds) {
    return pgPromise(pool, projectTaxaRawQuery, [projectIds]);
};
var pointTaxaRawQuery = 'SELECT * FROM sample.fn_taxa_raw_point_distance($1, $2, $3)';
exports.getPointTaxaRawQuery = function (pool, longitude, latitude, distance) {
    return pgPromise(pool, pointTaxaRawQuery, [longitude, latitude, distance]);
};
var polygonTaxaRawQuery = 'SELECT * FROM sample.fn_taxa_raw_polygon($1)';
exports.getPolygonTaxaRawQuery = function (pool, polygon) {
    return pgPromise(pool, polygonTaxaRawQuery, [polygon]);
};
var sampleTaxaGeneralizedQuery = 'SELECT * FROM sample.fn_sample_taxa_generalized($1)';
exports.getSampleTaxaGeneralized = function (pool, sampleId) {
    return pgPromise(pool, sampleTaxaGeneralizedQuery, [sampleId]);
};
var sampleTaxaTranslationQuery = 'SELECT * FROM sample.fn_sample_translation_taxa($1, $2)';
exports.getSampleTaxaTranslation = function (pool, sampleId, translationId) {
    return pgPromise(pool, sampleTaxaTranslationQuery, [sampleId, translationId]);
};
var sampleTaxaRarefiedQuery = 'SELECT * FROM sample.fn_rarefied_taxa($1, $2)';
exports.getSampleTaxaRarefied = function (pool, sampleId, fixedCount) {
    return pgPromise(pool, sampleTaxaRarefiedQuery, [sampleId, fixedCount]);
};
var sampleTaxaTranslationRarefiedQuery = 'SELECT * FROM sample.fn_translation_rarefied_taxa($1, $2, $3)';
exports.getSampleTaxaTranslationRarefied = function (pool, sampleId, translationId, fixedCount) { return pgPromise(pool, sampleTaxaTranslationRarefiedQuery, [sampleId, translationId, fixedCount]); };
var sampleMetricsQuery = 'SELECT * FROM metric.fn_sample_metrics_array($1, $2, $3)';
exports.getSampleMetrics = function (pool, sampleIds, translationId, fixedCount) { return pgPromise(pool, sampleMetricsQuery, [sampleIds, translationId, fixedCount]); };
var boxMetricsQuery = 'SELECT * FROM metric.fn_box_metrics($1, $2, $3)';
exports.getBoxMetrics = function (pool, boxIds, translationId, fixedCount) {
    return pgPromise(pool, boxMetricsQuery, [boxIds, translationId, fixedCount]);
};
var projectMetricsQuery = 'SELECT * FROM metric.fn_project_metrics($1, $2, $3)';
exports.getProjectMetrics = function (pool, projectIds, translationId, fixedCount) { return pgPromise(pool, projectMetricsQuery, [projectIds, translationId, fixedCount]); };
//# sourceMappingURL=index.js.map