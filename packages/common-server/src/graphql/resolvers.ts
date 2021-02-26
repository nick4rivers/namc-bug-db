// import path from 'path'
import { getConfigPromise } from '../config'
import {
    graphql,
    Sample,
    AuthResponse,
    BoxState,
    Site,
    SiteInfo,
    Individual,
    SampleOrganism,
    Project,
    Taxonomy,
    Box,
    util,
    PaginatedRecords,
    Predictor,
    Model,
    SitePredictorValue
} from '@namcbugdb/common'
import {
    getPool,
    getSamples,
    getBoxStates,
    getSites,
    getSiteInfo,
    getSampleOrganisms,
    getProjectOrganisms,
    getIndividuals,
    getBoxes,
    getProjects,
    getTaxonomy,
    getPredictors,
    getModels,
    getSitePredictorValues
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

function limitOffsetCheck(limit: number, limitMax: number, offset: number): void {
    if (!limit) throw new Error('You must provide a limit for this query')
    if (limit < 0) throw new Error('limit must be a valid positive integer')
    if (limit > limitMax) throw new Error(`limit for this query has a maximum value of ${limitMax}`)
    if (!(offset >= 0)) throw new Error('Offset must be a positive integer')
}

function createPagination<T>(data: [util.StrObj], limit: number, offset: number): PaginatedRecords<T> {
    let nextOffset = null
    try {
        nextOffset = data && data.length === limit ? offset + limit : null
    } catch {}

    return {
        records: data.map((record) => util.snake2camel(record) as unknown) as [T],
        nextOffset
    }
}

export default {
    Query: {
        auth: async (obj, args, ctx): Promise<AuthResponse> => {
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
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)
            const pool = await getPool()
            const data = await getSamples(pool, limit, offset)
            console.log(info, obj)
            return createPagination<Sample>(data, limit, offset)
        },

        // boxStates: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<BoxState>> => {
        //     loggedInGate(user)
        //     limitOffsetCheck(limit, graphql.queryLimits.boxStates, offset)
        //     const pool = await getPool()
        //     const data = await getBoxStates(pool, limit, offset)
        //     return createPagination<BoxState>(data, limit, offset)
        // },

        sites: async (obj, { limit, offset, usState }, { user }): Promise<PaginatedRecords<Site>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.sites, offset)
            const pool = await getPool()
            const data = await getSites(pool, limit, offset, usState)
            return createPagination<Site>(data, limit, offset)
        },

        siteInfo: async (obj, { siteId }, { user }): Promise<SiteInfo> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await getSiteInfo(pool, siteId)

            if (data.length !== 1) {
                throw new Error('Record not found')
            }

            return data.map(util.snake2camel)[0]
        },

        sampleOrganisms: async (
            obj,
            { limit, offset, sampleId, boxId, siteId, sampleYear, typeId },
            { user }
        ): Promise<PaginatedRecords<SampleOrganism>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.sampleOrganisms, offset)
            const pool = await getPool()
            const data = await getSampleOrganisms(pool, limit, offset, sampleId, boxId, siteId, sampleYear, typeId)
            return createPagination<SampleOrganism>(data, limit, offset)
        },

        projectOrganisms: async (
            obj,
            { limit, offset, projectIds },
            { user }
        ): Promise<PaginatedRecords<SampleOrganism>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.projectOrganisms, offset)
            const pool = await getPool()
            const data = await getProjectOrganisms(pool, projectIds, limit, offset)
            return createPagination<SampleOrganism>(data, limit, offset)
        },

        // individuals: async (obj, { limit, nextToken }, { user }, info): Promise<Individual[]> => {
        //     loggedInGate(user)
        //     const pool = await getPool()
        //     const data = await getIndividuals(pool, limit, nextToken)
        //     return data.map(util.snake2camel)
        // },

        boxes: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<Box>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.boxes, offset)
            const pool = await getPool()
            const data = await getBoxes(pool, limit, offset)
            return createPagination<Box>(data, limit, offset)
        },

        projects: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<Project>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.projects, offset)
            const pool = await getPool()
            const data = await getProjects(pool, limit, offset)
            return createPagination<Project>(data, limit, offset)
        },

        taxonomy: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<Taxonomy>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.taxonomy, offset)

            const pool = await getPool()
            const data = await getTaxonomy(pool, limit, offset)
            return createPagination<Taxonomy>(data, limit, offset)
        },

        predictors: async (obj, { limit, offset, modelId }, { user }): Promise<PaginatedRecords<Predictor>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.predictors, offset)

            const pool = await getPool()
            const data = await getPredictors(pool, limit, offset, modelId)
            return createPagination<Predictor>(data, limit, offset)
        },

        models: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<Model>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.models, offset)

            const pool = await getPool()
            const data = await getModels(pool, limit, offset)
            return createPagination<Model>(data, limit, offset)
        },

        sitePredictorValues: async (
            obj,
            { limit, offset, siteId },
            { user }
        ): Promise<PaginatedRecords<SitePredictorValue>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.sitePredictorValues, offset)

            const pool = await getPool()
            const data = await getSitePredictorValues(pool, limit, offset, siteId)
            return createPagination<SitePredictorValue>(data, limit, offset)
        }
    }

    // Mutation: {
    // },
}
