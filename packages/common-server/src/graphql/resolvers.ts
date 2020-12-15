// import path from 'path'
import { HelloResponse } from '@namcbugdb/common'
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
                message: `Hello ${name}!`,
                friendly: Math.random() < 0.5
            }
        }
    }
    // Mutation: {
    // },
}
