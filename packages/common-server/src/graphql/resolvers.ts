// import path from 'path'
import { getConfigPromise } from '../config'
import { Sample, AuthResponse, BoxState, Site, Individual, Box, util, PaginatedRecords } from '@namcbugdb/common'
import { getPool, getSamples, getBoxStates, getSites, getIndividuals, getBoxes } from '../pg'
// import log from 'loglevel'
import { UserObj } from '../types'

/**
 * The structure must match what's in the `schema.graphql` file
 */

function loggedInGate(user: UserObj): void {
    const err = new Error('You must be authenticated to perform this query.')
    try {
        if (!user.cognito.isLoggedIn || !user.cognito.sub || user.cognito.sub.length < 10) throw err
    } catch {
        throw new Error('You are not authorized to perform this query.')
    }
}

export default {
    Query: {
        auth: async (obj, args, ctx, info): Promise<AuthResponse> => {
            const config = await getConfigPromise()
            let loggedIn = false
            try {
                loggedIn = Boolean(ctx.user.cognito.sub)
            } catch {}
            return {
                loggedIn,
                userPool: config.cognito.userPoolId,
                clientId: config.cognito.userPoolWebClientId,
                domain: config.cognito.hostedDomain,
                region: config.region
            }
        },

        samples: async (obj, { limit, nextToken }, { user }, info): Promise<PaginatedRecords<Sample>> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getSamples(pool, limit, nextToken)
            return {
                records: data.map(util.snake2camel),
                nextToken: 0
            }
        },

        boxStates: async (obj, { limit, nextToken }, { user }, info): Promise<BoxState[]> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getBoxStates(pool, limit, nextToken)
            return data.map(util.snake2camel)
        },

        sites: async (obj, { limit, nextToken }, { user }, info): Promise<Site[]> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getSites(pool, limit, nextToken)
            return data.map(util.snake2camel)
        },

        individuals: async (obj, { limit, nextToken }, { user }, info): Promise<Individual[]> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getIndividuals(pool, limit, nextToken)
            return data.map(util.snake2camel)
        },

        boxes: async (obj, { limit, nextToken }, { user }, info): Promise<Box[]> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getBoxes(pool, limit, nextToken)
            return data.map(util.snake2camel)
        }
    }

    // Mutation: {
    // },
}
