// import path from 'path'
import { getConfigPromise } from '../config'
import {
    Sample,
    AuthResponse,
    BoxState,
    Site,
    SiteInfo,
    Individual,
    SampleOrganism,
    Project,
    DriftSample,
    PlanktonSample,
    Taxonomy,
    Box,
    util,
    PaginatedRecords
} from '@namcbugdb/common'
import {
    getPool,
    getSamples,
    getBoxStates,
    getSites,
    getSiteInfo,
    getSampleOrganisms,
    getIndividuals,
    getBoxes,
    getProjects,
    getDriftSamples,
    getPlanktonSamples,
    getTaxonomy
} from '../pg'
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

        samples: async (obj, { limit, offset }, { user }, info): Promise<PaginatedRecords<Sample>> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getSamples(pool, limit, offset)
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

        sites: async (obj, { limit, offset }, { user }, info): Promise<Site[]> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getSites(pool, limit, offset)
            return data.map(util.snake2camel)
        },

        siteInfo: async (obj, { siteId }, { user }, info): Promise<SiteInfo> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getSiteInfo(pool, siteId)

            if (data.length !== 1) {
                throw new Error('Record not found')
            }

            return data.map(util.snake2camel)[0]
        },

        sampleOrganisms: async (obj, { sampleId }, { user }, info): Promise<SampleOrganism[]> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getSampleOrganisms(pool, sampleId)
            return data.map(util.snake2camel)
        },

        // individuals: async (obj, { limit, nextToken }, { user }, info): Promise<Individual[]> => {
        //     loggedInGate(user)
        //     const pool = await getPool()
        //     const data = await getIndividuals(pool, limit, nextToken)
        //     return data.map(util.snake2camel)
        // },

        boxes: async (obj, { limit, offset }, { user }, info): Promise<Box[]> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getBoxes(pool, limit, offset)
            return data.map(util.snake2camel)
        },

        projects: async (obj, { limit, offset }, { user }, info): Promise<Project[]> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getProjects(pool, limit, offset)
            return data.map(util.snake2camel)
        },

        driftSamples: async (obj, { limit, offset }, { user }, info): Promise<DriftSample[]> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getDriftSamples(pool, limit, offset)
            return data.map(util.snake2camel)
        },

        planktonSamples: async (obj, { limit, offset }, { user }, info): Promise<PlanktonSample[]> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getPlanktonSamples(pool, limit, offset)
            return data.map(util.snake2camel)
        },

        taxonomy: async (obj, { limit, offset }, { user }, info): Promise<Taxonomy[]> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getTaxonomy(pool, limit, offset)
            return data.map(util.snake2camel)
        }
    }

    // Mutation: {
    // },
}
