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

const samplesQuery = 'SELECT * FROM sample.vw_samples LIMIT 500'

export const getSamples = (pool): Promise<any> => pgPromise(pool, samplesQuery)

const boxStatesQuery = 'SELECT * FROM sample.box_states'

export const getBoxStates = (pool): Promise<any> => pgPromise(pool, boxStatesQuery)

const sitesQuery = 'SELECT * FROM geo.vw_sites LIMIT 500'

export const getSites = (pool): Promise<any> => pgPromise(pool, sitesQuery)

const individualsQuery = 'SELECT * FROM entity.vw_individuals'

export const getIndividuals = (pool): Promise<any> => pgPromise(pool, individualsQuery)

const boxesQuery = 'SELECT * FROM sample.vw_boxes LIMIT 500'

export const getBoxes = (pool): Promise<any> => pgPromise(pool, boxesQuery)
