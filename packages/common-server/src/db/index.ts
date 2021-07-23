import { getConfigPromise, getDBSecretCredentials, isDev } from '../config'
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
        const cb = (error, results): void => {
            if (error) {
                log.error('PG ERROR', error)
                // Return better errors if we're dev.
                if (isDev) return reject(error)
                else return reject(new Error('Database Error'))
            } else return resolve(results.rows)
        }
        pool.query(query, vars, cb)
    })
}

export type FnQueryParams = {
    name: string
    args?: unknown[]
    orderBy?: string
    limit?: number
    offset?: number
}
export const fnQuery = (pool, params: FnQueryParams): DBReturnPromiseType => {
    const { name, args, orderBy, limit, offset } = params
    const paramString = args && args.length > 0 ? `(${args.map((k, idx) => `$${idx + 1}`).join(', ')})` : ''

    const orderStr = limit > -1 ? ` ORDER BY ${orderBy}` : ''
    const limitStr = limit > -1 ? ` LIMIT ${limit}` : ''
    const offsetStr = offset > -1 ? ` OFFSET ${offset}` : ''
    const qry = `SELECT * FROM ${name}${paramString}${orderStr}${limitStr}${offsetStr}`

    return pgPromise(pool, qry, args)
}
