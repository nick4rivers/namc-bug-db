import { getConfigPromise, getDBSecretCredentials } from '../config'
// import { CDKStages } from '@namcbugdb/aws-cdk-stack'
export * as queries from './queries'
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

/**
 * Generic Query runner
 * @param pool
 * @param query
 * @param vars
 * @returns
 */
export const pgPromise = (pool: Pool, query: string, vars?: unknown[]): DBReturnPromiseType => {
    log.debug(`STARTING QUERY: ${query}`)
    return new Promise((resolve, reject) => {
        // const config = await getConfigPromise()
        const cb = (error, results): void => {
            if (error) {
                log.error('PG ERROR', error)
                // Return better errors if we're dev.
                // TODO: Eventually we might not want to retrun explicit DB errors
                // if (!config.stage || config.stage !== CDKStages.PRODUCTION) return reject(error)
                // else return reject(new Error('Database Error'))
                return reject(error)
            } else return resolve(results.rows)
        }
        pool.query(query, vars, cb)
    })
}

/**
 * The params type is just a bunch of optional parameters that get used to build a
 * really simple "SELECT * FROM XXXXX" query string
 */
export type FnQueryParams = {
    name: string
    args?: unknown[]
    orderBy?: string
    limit?: number
    offset?: number
}
/**
 * Most of our queries have the same format so this is a string builder to build these
 * @param pool
 * @param params
 * @returns
 */
export const fnQuery = (pool, params: FnQueryParams): DBReturnPromiseType => {
    const { name, args, orderBy, limit, offset } = params
    const paramString = args && args.length > 0 ? `(${args.map((k, idx) => `$${idx + 1}`).join(', ')})` : ''

    const orderStr = limit > -1 ? ` ORDER BY ${orderBy}` : ''
    const limitStr = limit > -1 ? ` LIMIT ${limit}` : ''
    const offsetStr = offset > -1 ? ` OFFSET ${offset}` : ''
    const qry = `SELECT * FROM ${name}${paramString}${orderStr}${limitStr}${offsetStr}`

    return pgPromise(pool, qry, args)
}
