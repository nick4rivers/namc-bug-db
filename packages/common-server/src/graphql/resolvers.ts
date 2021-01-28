// import path from 'path'
import { getConfigPromise } from '../config'
import { Sample, AuthResponse, BoxState, Site, Individual, Box, util, PaginatedRecords } from '@namcbugdb/common'
import { getPool, getSamples, getBoxStates, getSites, getIndividuals, getBoxes } from '../pg'

// import {} from '../types'

/**
 * The structure must match what's in the `schema.graphql` file
 */

export default {
    Query: {
        auth: async (obj, args, ctx, info): Promise<AuthResponse> => {
            const config = await getConfigPromise()
            let loggedIn = false
            try {
                loggedIn = Boolean(ctx.user.cognito.username)
            } catch {}
            return {
                loggedIn,
                userPool: config.cognito.userPoolId,
                clientId: config.cognito.userPoolWebClientId,
                domain: config.cognito.hostedDomain,
                region: config.region
            }
        },

        samples: async (obj, { limit, nextToken }, ctx, info): Promise<PaginatedRecords<Sample>> => {
            const pool = await getPool()
            const data = await getSamples(pool, limit, nextToken)
            return {
                records: data.map(util.snake2camel),
                nextToken: 0
            }
        },

        boxStates: async (obj, { limit, nextToken }, ctx, info): Promise<BoxState[]> => {
            const pool = await getPool()
            const data = await getBoxStates(pool, limit, nextToken)
            return data.map(util.snake2camel)
        },

        sites: async (obj, { limit, nextToken }, ctx, info): Promise<Site[]> => {
            const pool = await getPool()
            const data = await getSites(pool, limit, nextToken)
            return data.map(util.snake2camel)
        },

        individuals: async (obj, { limit, nextToken }, ctx, info): Promise<Individual[]> => {
            const pool = await getPool()
            const data = await getIndividuals(pool, limit, nextToken)
            return data.map(util.snake2camel)
        },

        boxes: async (obj, { limit, nextToken }, ctx, info): Promise<Box[]> => {
            const pool = await getPool()
            const data = await getBoxes(pool, limit, nextToken)
            return data.map(util.snake2camel)
        }
    }

    // Mutation: {
    // },
}
