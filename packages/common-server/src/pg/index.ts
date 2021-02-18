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

const boxStatesQuery = 'SELECT * FROM sample.box_states'

export const getBoxStates = (pool, limit: number, nextToken: number): Promise<any> => pgPromise(pool, boxStatesQuery)

const sitesQuery = 'SELECT * FROM geo.vw_sites ORDER BY site_id LIMIT $1 OFFSET $2'

export const getSites = (pool, limit: number, offset: number): Promise<any> =>
    pgPromise(pool, sitesQuery, [limit, offset])

const siteInfoQuery = 'SELECT * FROM geo.fn_site_info($1)'
export const getSiteInfo = (pool, siteId: number): Promise<any> => pgPromise(pool, siteInfoQuery, [siteId])

const individualsQuery = 'SELECT * FROM entity.vw_individuals'

export const getIndividuals = (pool, limit: number, nextToken: number): Promise<any> =>
    pgPromise(pool, individualsQuery)

const boxesQuery = 'SELECT * FROM sample.vw_boxes ORDER BY box_id LIMIT $1 OFFSET $2'

export const getBoxes = (pool, limit: number, offset: number): Promise<any> =>
    pgPromise(pool, boxesQuery, [limit, offset])
