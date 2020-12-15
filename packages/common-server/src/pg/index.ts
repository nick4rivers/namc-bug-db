import config from '../config'
import { Pool } from 'pg'
import log from 'loglevel'

export const getPool = (): Pool => {
    return new Pool(config.pg)
}

const pgPromise = (pool: Pool, query: string, vars?: any): Promise<any> => {
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

const samplesQuery = 'SELECT sample_id FROM "sample"."samples"'

export const getSamples = (pool): Promise<any> => pgPromise(pool, samplesQuery)
