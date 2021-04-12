import { getConfigPromise, getDBSecretCredentials } from '../config'
import { Pool } from 'pg'
import log from 'loglevel'

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

const pgPromise = (pool: Pool, query: string, vars?: any): Promise<any> => {
    log.debug(`STARTING QUERY: ${query}`)
    return new Promise((resolve, reject) => {
        const cb = (error, results) => {
            if (error) {
                log.error('PG ERROR', error)
                return reject(error)
            } else return resolve(results.rows)
        }
        pool.query(query, vars, cb)
    })
}

const samplesQuery = 'SELECT * FROM sample.vw_samples ORDER BY sample_id LIMIT $1 OFFSET $2'

export const getSamples = (pool: Pool, limit: number, offset: number): Promise<any> =>
    pgPromise(pool, samplesQuery, [limit, offset])

// const boxStatesQuery = 'SELECT * FROM sample.box_states LIMIT $1 OFFSET $2'
// export const getBoxStates = (pool, limit: number, offset: number): Promise<any> =>
//     pgPromise(pool, boxStatesQuery, [limit, offset])

const sitesQuery = 'SELECT * FROM geo.fn_sites($1, $2, $3)'

export const getSites = (pool, limit: number, offset: number, usState: string): Promise<any> =>
    pgPromise(pool, sitesQuery, [limit, offset, usState])

const siteInfoQuery = 'SELECT * FROM geo.fn_site_info($1)'
export const getSiteInfo = (pool, siteId: number): Promise<any> => pgPromise(pool, siteInfoQuery, [siteId])

const individualsQuery = 'SELECT * FROM entity.vw_individuals LIMIT $1 OFFSET $2'

export const getIndividuals = (pool, limit: number, offset: number): Promise<any> =>
    pgPromise(pool, individualsQuery, [limit, offset])

const boxesQuery = 'SELECT * FROM sample.fn_boxes($1, $2)'

export const getBoxes = (pool, limit: number, offset: number): Promise<any> =>
    pgPromise(pool, boxesQuery, [limit, offset])

const sampleOrganismsQuery = 'SELECT * FROM sample.fn_samples($1, $2, $3, $4, $5, $6, $7)'
export const getSampleOrganisms = (
    pool,
    limit: number,
    offset: number,
    sampleId: number,
    boxId: number,
    siteId: number,
    sampleYear: number,
    typeId: number
): Promise<any> => pgPromise(pool, sampleOrganismsQuery, [limit, offset, sampleId, boxId, siteId, sampleYear, typeId])

const projectOrganismsQuery = 'SELECT * FROM sample.fn_project_samples($1, $2, $3)'
export const getProjectOrganisms = (pool, projectIds: number[], limit: number, offset: number): Promise<any> =>
    pgPromise(pool, projectOrganismsQuery, [limit, offset, projectIds])

const projectsQuery = 'SELECT * FROM sample.vw_projects ORDER BY project_id LIMIT $1 OFFSET $2'
export const getProjects = (pool, limit: number, offset: number): Promise<any> =>
    pgPromise(pool, projectsQuery, [limit, offset])

const taxonomyQuery = 'SELECT * FROM taxa.vw_taxonomy_crosstab ORDER BY taxonomy_id LIMIT $1 OFFSET $2'
export const getTaxonomy = (pool, limit: number, offset: number): Promise<any> =>
    pgPromise(pool, taxonomyQuery, [limit, offset])

const predictorQuery = 'SELECT * FROM geo.fn_predictors($1, $2, $3)'
export const getPredictors = (pool, limit: number, offset: number, modelId): Promise<any> =>
    pgPromise(pool, predictorQuery, [limit, offset, modelId])

const modelQuery = 'SELECT * FROM geo.fn_models($1, $2)'
export const getModels = (pool, limit: number, offset: number): Promise<any> =>
    pgPromise(pool, modelQuery, [limit, offset])

const modelInfoQuery = 'SELECT * FROM geo.fn_model_info($1)'
export const getModelInfo = (pool, modelId: number): Promise<any> => pgPromise(pool, modelInfoQuery, [modelId])

const sitePredictorValuesQuery = 'SELECT * FROM geo.fn_site_predictor_values($1, $2, $3)'
export const getSitePredictorValues = (pool, limit: number, offset: number, siteId): Promise<any> =>
    pgPromise(pool, sitePredictorValuesQuery, [limit, offset, siteId])

const sampleInfoQuery = 'SELECT * FROM sample.fn_sample_info($1)'
export const getSampleInfo = (pool, sampleId: number): Promise<any> => pgPromise(pool, sampleInfoQuery, [sampleId])

const boxInfoQuery = 'SELECT * FROM sample.fn_box_info($1)'
export const getBoxInfo = (pool, boxId: number): Promise<any> => pgPromise(pool, boxInfoQuery, [boxId])

const samplePredictorValuesQuery = 'SELECT * FROM sample.fn_sample_predictor_values($1)'
export const getSamplePredictorValues = (pool, sampleId: number): Promise<any> =>
    pgPromise(pool, samplePredictorValuesQuery, [sampleId])
