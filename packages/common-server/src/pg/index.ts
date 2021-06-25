import { getConfigPromise, getDBSecretCredentials } from '../config'
import { Pool } from 'pg'
import log from 'loglevel'
import { DBReturnPromiseType } from '../types'

export const getPool = async (): Promise<Pool> => {
    const config = await getConfigPromise()
    const credentials = await getDBSecretCredentials()
    const pool = new Pool({
        user: credentials.username,
        password: credentials.password,
        database: config.db.dbName,
        port: config.db.port,
        host: config.db.endpoint
    })
    return Promise.resolve(pool)
}

const pgPromise = (pool: Pool, query: string, vars?: unknown[]): DBReturnPromiseType => {
    log.debug(`STARTING QUERY: ${query}`)
    return new Promise((resolve, reject) => {
        const cb = (error, results): void => {
            if (error) {
                log.error('PG ERROR', error)
                return reject(error)
            } else return resolve(results.rows)
        }
        pool.query(query, vars, cb)
    })
}

const samplesQuery = 'SELECT * FROM sample.vw_samples ORDER BY sample_id LIMIT $1 OFFSET $2'
export const getSamples = (pool: Pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, samplesQuery, [limit, offset])

const sitesQuery = 'SELECT * FROM geo.fn_sites($1, $2)'
export const getSites = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, sitesQuery, [limit, offset])

const siteInfoQuery = 'SELECT * FROM geo.fn_site_info($1)'
export const getSiteInfo = (pool, siteId: number): DBReturnPromiseType => pgPromise(pool, siteInfoQuery, [siteId])

const individualsQuery = 'SELECT * FROM entity.vw_individuals LIMIT $1 OFFSET $2'

export const getIndividuals = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, individualsQuery, [limit, offset])

const boxesQuery = 'SELECT * FROM sample.fn_boxes($1, $2)'
export const getBoxes = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, boxesQuery, [limit, offset])

/**
 * Queries
 */

const projectsQuery = 'SELECT * FROM sample.fn_projects($1, $2)'
export const getProjects = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, projectsQuery, [limit, offset])

const taxonomyQuery = 'SELECT * FROM taxa.vw_taxonomy_crosstab ORDER BY taxonomy_id LIMIT $1 OFFSET $2'
export const getTaxonomy = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, taxonomyQuery, [limit, offset])

const predictorQuery = 'SELECT * FROM geo.fn_predictors($1, $2, $3)'
export const getPredictors = (pool, limit: number, offset: number, modelId): DBReturnPromiseType =>
    pgPromise(pool, predictorQuery, [limit, offset, modelId])

const modelQuery = 'SELECT * FROM geo.fn_models($1, $2)'
export const getModels = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, modelQuery, [limit, offset])

const modelInfoQuery = 'SELECT * FROM geo.fn_model_info($1)'
export const getModelInfo = (pool, modelId: number): DBReturnPromiseType => pgPromise(pool, modelInfoQuery, [modelId])

const sitePredictorValuesQuery = 'SELECT * FROM geo.fn_site_predictor_values($1, $2, $3)'
export const getSitePredictorValues = (pool, limit: number, offset: number, siteId): DBReturnPromiseType =>
    pgPromise(pool, sitePredictorValuesQuery, [limit, offset, siteId])

const sampleInfoQuery = 'SELECT * FROM sample.fn_sample_info($1)'
export const getSampleInfo = (pool, sampleId: number): DBReturnPromiseType =>
    pgPromise(pool, sampleInfoQuery, [sampleId])

const boxInfoQuery = 'SELECT * FROM sample.fn_box_info($1)'
export const getBoxInfo = (pool, boxId: number): DBReturnPromiseType => pgPromise(pool, boxInfoQuery, [boxId])

const samplePredictorValuesQuery = 'SELECT * FROM sample.fn_sample_predictor_values($1)'
export const getSamplePredictorValues = (pool, sampleId: number): DBReturnPromiseType =>
    pgPromise(pool, samplePredictorValuesQuery, [sampleId])

const modelPredictorsQuery = 'SELECT * FROM geo.fn_model_predictors($1, $2, $3)'
export const getModelPredictors = (pool, limit: number, offset: number, modelId: number): DBReturnPromiseType =>
    pgPromise(pool, modelPredictorsQuery, [limit, offset, modelId])

const translationsQuery = 'SELECT * FROM taxa.fn_translations($1, $2)'
export const getTranslations = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, translationsQuery, [limit, offset])

const translationTaxaQuery = 'SELECT * FROM taxa.fn_translation_taxa($1, $2, $3)'
export const getTranslationTaxa = (pool, limit: number, offset: number, translationId: number): DBReturnPromiseType =>
    pgPromise(pool, translationTaxaQuery, [limit, offset, translationId])

const planktonSampleQuery = 'SELECT * FROM sample.fn_plankton($1, $2)'
export const getPlanktonSamples = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, planktonSampleQuery, [limit, offset])

const driftSampleQuery = 'SELECT * FROM sample.fn_drift($1, $2)'
export const getDriftSamples = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, driftSampleQuery, [limit, offset])

const fishSampleQuery = 'SELECT * FROM sample.fn_fish($1, $2)'
export const getFishSamples = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, fishSampleQuery, [limit, offset])

const massSampleQuery = 'SELECT * FROM sample.fn_mass($1, $2)'
export const getMassSamples = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, massSampleQuery, [limit, offset])

const attributesQuery = 'SELECT * FROM taxa.fn_attributes($1, $2)'
export const getAttributes = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, attributesQuery, [limit, offset])

const attributeValueQuery = 'SELECT * FROM taxa.fn_taxa_attributes($1, $2, $3)'
export const getTaxaAttributes = (pool, taxonomyId: number, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, attributeValueQuery, [taxonomyId, limit, offset])

const modelThresholdQuery = 'SELECT * FROM geo.fn_model_thresholds($1)'
export const getModelThresholds = (pool, modelId: number): DBReturnPromiseType =>
    pgPromise(pool, modelThresholdQuery, [modelId])

const metricsQuery = 'SELECT * FROM metric.fn_metrics($1, $2)'
export const getMetrics = (pool, limit: number, offset: number): DBReturnPromiseType =>
    pgPromise(pool, metricsQuery, [limit, offset])
/**
 * Mutations
 */
const setSitePredictorValueQuery = 'SELECT * FROM sample.fn_set_site_predictor_value($1, $2, $3)'
export const setSitePredictorValue = (pool, siteId: number, predictorId: number, value: string): DBReturnPromiseType =>
    pgPromise(pool, setSitePredictorValueQuery, [siteId, predictorId, value])

const setSamplePredictorValueQuery = 'SELECT * FROM sample.fn_set_sample_predictor_value($1, $2, $3)'
export const setSamplePredictorValue = (
    pool,
    sampleId: number,
    predictorId: number,
    value: string
): DBReturnPromiseType => pgPromise(pool, setSamplePredictorValueQuery, [sampleId, predictorId, value])

const setSiteCatchmentQuery = 'SELECT sample.fn_set_site_catchment($1, $2)'
export const setSiteCatchment = (pool, siteId: number, catchment: string): DBReturnPromiseType =>
    pgPromise(pool, setSiteCatchmentQuery, [siteId, catchment])

const createTranslationQuery = 'SELECT * FROM taxa.fn_create_translation($1, $2)'
export const createTranslation = (pool, translationName: string, description: string): DBReturnPromiseType =>
    pgPromise(pool, createTranslationQuery, [translationName, description])

const setTranslationTaxaQuery = 'SELECT * FROM taxa.fn_set_translation_taxa($1, $2, $3, $4)'
export const setTranslationTaxa = (
    pool,
    translationId: number,
    taxonomyId: number,
    alias: string,
    isFinal: boolean
): DBReturnPromiseType => pgPromise(pool, setTranslationTaxaQuery, [translationId, taxonomyId, alias, isFinal])

const deleteTranslationTaxaQuery = 'SELECT * FROM taxa.fn_delete_translation_taxa($1, $2)'
export const deleteTranslationTaxa = (pool, translationId: number, taxonomyId: number): DBReturnPromiseType =>
    pgPromise(pool, deleteTranslationTaxaQuery, [translationId, taxonomyId])

const setTaxonomyQuery = 'SELECT * FROM taxa.fn_set_taxonomy($1, $2, $3, $4, $5, $6, $7, $8)'
export const setTaxonomy = (
    pool,
    taxonomyId: number,
    scientificName: string,
    levelId: number,
    parentId: number,
    author: string,
    year: string,
    notes: string,
    metadata: string
): DBReturnPromiseType =>
    pgPromise(pool, setTaxonomyQuery, [taxonomyId, scientificName, levelId, parentId, author, year, notes, metadata])

const sampleTaxaRawQuery = 'SELECT * FROM sample.fn_sample_taxa_raw($1)'
export const getSampleTaxaRaw = (pool, sampleIds: number[]): DBReturnPromiseType =>
    pgPromise(pool, sampleTaxaRawQuery, [sampleIds])

const boxTaxaRawQuery = 'SELECT * FROM sample.fn_box_taxa_raw($1)'
export const getBoxTaxaRaw = (pool, boxIds: number[]): DBReturnPromiseType => pgPromise(pool, boxTaxaRawQuery, [boxIds])

const projectTaxaRawQuery = 'SELECT * FROM sample.fn_project_taxa_raw($1)'
export const getProjectTaxaRaw = (pool, projectIds: number[]): DBReturnPromiseType =>
    pgPromise(pool, projectTaxaRawQuery, [projectIds])

const pointTaxaRawQuery = 'SELECT * FROM sample.fn_taxa_raw_point_distance($1, $2, $3)'
export const getPointTaxaRawQuery = (pool, longitude, latitude, distance): DBReturnPromiseType =>
    pgPromise(pool, pointTaxaRawQuery, [longitude, latitude, distance])

const polygonTaxaRawQuery = 'SELECT * FROM sample.fn_taxa_raw_polygon($1)'
export const getPolygonTaxaRawQuery = (pool, polygon: string): DBReturnPromiseType =>
    pgPromise(pool, polygonTaxaRawQuery, [polygon])

const sampleTaxaGeneralizedQuery = 'SELECT * FROM sample.fn_sample_taxa_generalized($1)'
export const getSampleTaxaGeneralized = (pool, sampleId: number): DBReturnPromiseType =>
    pgPromise(pool, sampleTaxaGeneralizedQuery, [sampleId])

const sampleTaxaTranslationQuery = 'SELECT * FROM sample.fn_sample_translation_taxa($1, $2)'
export const getSampleTaxaTranslation = (pool, sampleId: number, translationId: number): DBReturnPromiseType =>
    pgPromise(pool, sampleTaxaTranslationQuery, [sampleId, translationId])

const sampleTaxaRarefiedQuery = 'SELECT * FROM sample.fn_rarefied_taxa($1, $2)'
export const getSampleTaxaRarefied = (pool, sampleId: number, fixedCount: number): DBReturnPromiseType =>
    pgPromise(pool, sampleTaxaRarefiedQuery, [sampleId, fixedCount])

const sampleTaxaTranslationRarefiedQuery = 'SELECT * FROM sample.fn_translation_rarefied_taxa($1, $2, $3)'
export const getSampleTaxaTranslationRarefied = (
    pool,
    sampleId: number,
    translationId: number,
    fixedCount: number
): DBReturnPromiseType => pgPromise(pool, sampleTaxaTranslationRarefiedQuery, [sampleId, translationId, fixedCount])

const sampleMetricsQuery = 'SELECT * FROM metric.fn_sample_metrics_array($1, $2, $3)'
export const getSampleMetrics = (
    pool,
    sampleIds: number[],
    translationId: number,
    fixedCount: number
): DBReturnPromiseType => pgPromise(pool, sampleMetricsQuery, [sampleIds, translationId, fixedCount])

const boxMetricsQuery = 'SELECT * FROM metric.fn_box_metrics($1, $2, $3)'
export const getBoxMetrics = (pool, boxIds: number[], translationId: number, fixedCount: number): DBReturnPromiseType =>
    pgPromise(pool, boxMetricsQuery, [boxIds, translationId, fixedCount])

const projectMetricsQuery = 'SELECT * FROM metric.fn_project_metrics($1, $2, $3)'
export const getProjectMetrics = (
    pool,
    projectIds: number[],
    translationId: number,
    fixedCount: number
): DBReturnPromiseType => pgPromise(pool, projectMetricsQuery, [projectIds, translationId, fixedCount])
