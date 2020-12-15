// import path from 'path'
import { HelloResponse, Sample } from '@namcbugdb/common'
import { getSamples, getPool } from '../pg'
// import config from '../config'
// import downloadTaskLog from './downloadLogs'
import {} from '../types'

// some resolvers are big enough to get their own file
// import log from 'loglevel'

/**
 * I fully expect this file to fragment.
 *
 * The structure must match what's in the `schema.graphql` file
 */

export default {
    Query: {
        helloWorld: (obj, { name }, ctx, info): HelloResponse => {
            return {
                message: `Good bye forever ${name}!`,
                friendly: Math.random() < 0.5
            }
        },

        samples: async (obj, args, ctx, info): Promise<Sample[]> => {
            const pool = getPool()
            const data = await getSamples(pool)
            return [
                {
                    sampleId: 24
                }
            ]
        }
    }
    // Mutation: {
    // },
}
