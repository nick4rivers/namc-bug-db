// import path from 'path'
import { getConfigPromise } from '../config'
import {
    AuthResponse,
    Box,
    BoxInfo,
    graphql,
    Model,
    ModelInfo,
    ModelPredictor,
    ModelThreshold,
    PaginatedRecords,
    Predictor,
    Project,
    Sample,
    SampleInfo,
    SamplePredictorValue,
    Site,
    SiteInfo,
    SitePredictorValue,
    Taxonomy,
    Translation,
    RawSampleTaxa,
    GeneralizedSampleTaxa,
    TranslationSampleTaxa,
    RarefiedSampleTaxa,
    PlanktonSample,
    DriftSample,
    FishSample,
    MassSample,
    MetricResult,
    Attribute,
    TaxonomyTree,
    AttributeValue,
    TranslationTaxa,
    Metric,
    util,
    ModelResult,
    FishGuts
} from '@namcbugdb/common'
import * as pg from '../pg'

// import log from 'loglevel'
import { UserObj, DBReturnType } from '../types'
import { maxIdResults } from '../config'

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

function createPagination<T>(data: DBReturnType, limit?: number, offset?: number): PaginatedRecords<T> {
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
            const pool = await pg.getPool()
            const data = await pg.getSamples(pool, limit, offset)
            console.log(info, obj)
            return createPagination<Sample>(data, limit, offset)
        },

        sites: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<Site>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.sites, offset)
            const pool = await pg.getPool()
            const data = await pg.getSites(pool, limit, offset)
            return createPagination<Site>(data, limit, offset)
        },

        siteInfo: async (obj, { siteId }, { user }): Promise<SiteInfo> => {
            loggedInGate(user)
            const pool = await pg.getPool()
            const data = await pg.getSiteInfo(pool, siteId)

            if (data.length !== 1) {
                throw new Error('Record not found')
            }
            const returnVal = data.map(util.snake2camel)[0] as SiteInfo
            return returnVal
        },
        sampleInfo: async (obj, { sampleId }, { user }): Promise<SampleInfo> => {
            loggedInGate(user)
            const pool = await pg.getPool()
            const data = await pg.getSampleInfo(pool, sampleId)

            if (data.length !== 1) {
                throw new Error('Record not found')
            }

            const returnVal = data.map(util.snake2camel)[0] as SampleInfo
            return returnVal
        },

        boxInfo: async (obj, { boxId }, { user }): Promise<BoxInfo> => {
            loggedInGate(user)
            const pool = await pg.getPool()
            const data = await pg.getBoxInfo(pool, boxId)

            if (data.length !== 1) {
                throw new Error('Record not found')
            }

            const returnVal = data.map(util.snake2camel)[0] as BoxInfo
            return returnVal
        },

        modelInfo: async (obj, { modelId }, { user }): Promise<ModelInfo> => {
            loggedInGate(user)
            const pool = await pg.getPool()
            const data = await pg.getModelInfo(pool, modelId)

            if (data.length !== 1) {
                throw new Error('Record not found')
            }

            const returnVal = data.map(util.snake2camel)[0] as ModelInfo
            return returnVal
        },

        modelThresholds: async (obj, { modelId }, { user }): Promise<PaginatedRecords<ModelThreshold>> => {
            loggedInGate(user)
            const pool = await pg.getPool()
            const data = await pg.getModelThresholds(pool, modelId)

            return createPagination<ModelThreshold>(data, 500, 0)
        },

        samplePredictorValues: async (obj, { sampleId }, { user }): Promise<PaginatedRecords<SamplePredictorValue>> => {
            loggedInGate(user)
            const pool = await pg.getPool()
            const data = await pg.getSamplePredictorValues(pool, sampleId)

            return createPagination<SamplePredictorValue>(data, 500, 0)
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
            const pool = await pg.getPool()
            const data = await pg.getBoxes(pool, limit, offset)
            return createPagination<Box>(data, limit, offset)
        },

        projects: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<Project>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.projects, offset)
            const pool = await pg.getPool()
            const data = await pg.getProjects(pool, limit, offset)
            return createPagination<Project>(data, limit, offset)
        },

        taxonomy: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<Taxonomy>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.taxonomy, offset)

            const pool = await pg.getPool()
            const data = await pg.getTaxonomy(pool, limit, offset)
            return createPagination<Taxonomy>(data, limit, offset)
        },

        taxonomyTree: async (obj, { taxonomyId }, { user }): Promise<PaginatedRecords<TaxonomyTree>> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.getTaxonomyTree(pool, taxonomyId)
            return createPagination<TaxonomyTree>(data, taxonomyId)
        },

        predictors: async (obj, { limit, offset, modelId }, { user }): Promise<PaginatedRecords<Predictor>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.predictors, offset)

            const pool = await pg.getPool()
            const data = await pg.getPredictors(pool, limit, offset, modelId)
            return createPagination<Predictor>(data, limit, offset)
        },

        models: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<Model>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.models, offset)

            const pool = await pg.getPool()
            const data = await pg.getModels(pool, limit, offset)
            return createPagination<Model>(data, limit, offset)
        },

        translations: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<Translation>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.models, offset)

            const pool = await pg.getPool()
            const data = await pg.getTranslations(pool, limit, offset)
            return createPagination<Translation>(data, limit, offset)
        },

        translationTaxa: async (
            obj,
            { limit, offset, translationId },
            { user }
        ): Promise<PaginatedRecords<TranslationTaxa>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.models, offset)

            const pool = await pg.getPool()
            const data = await pg.getTranslationTaxa(pool, limit, offset, translationId)
            return createPagination<TranslationTaxa>(data, limit, offset)
        },

        sitePredictorValues: async (
            obj,
            { limit, offset, siteId },
            { user }
        ): Promise<PaginatedRecords<SitePredictorValue>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.sitePredictorValues, offset)

            const pool = await pg.getPool()
            const data = await pg.getSitePredictorValues(pool, limit, offset, siteId)
            return createPagination<SitePredictorValue>(data, limit, offset)
        },

        modelPredictors: async (
            obj,
            { limit, offset, modelId },
            { user }
        ): Promise<PaginatedRecords<ModelPredictor>> => {
            loggedInGate(user)
            const pool = await pg.getPool()
            const data = await pg.getModelPredictors(pool, limit, offset, modelId)
            return createPagination<ModelPredictor>(data, 500, 0)
        },

        sampleTaxaRaw: async (
            obj,
            { sampleIds, boxIds, projectIds },
            { user }
        ): Promise<PaginatedRecords<RawSampleTaxa>> => {
            loggedInGate(user)

            const check = [sampleIds, boxIds, projectIds].filter((i) => i)
            if (check.length === 0) throw new Error('You must provide an array of sample IDs, box IDs or project IDs.')
            else if (check.length > 1)
                throw new Error(
                    'You must choose either an array of sample IDs, an array of box IDs, or an array of project IDs.'
                )

            const pool = await pg.getPool()
            let data

            if (sampleIds) {
                if (sampleIds.length < 1 || sampleIds.length > maxIdResults)
                    throw new Error(
                        `${sampleIds.length} items found. You must specify between 1 and ${maxIdResults} item IDs.`
                    )
                data = await pg.getSampleTaxaRaw(pool, sampleIds)
            } else if (boxIds) {
                if (boxIds.length > maxIdResults)
                    throw new Error(
                        `${boxIds.length} items found. You must specify between 1 and ${maxIdResults} item IDs.`
                    )
                data = await pg.getBoxTaxaRaw(pool, boxIds)
            } else if (projectIds) {
                if (projectIds.length > maxIdResults)
                    throw new Error(
                        `${projectIds.length} items found. You must specify between 1 and ${maxIdResults} item IDs.`
                    )
                data = await pg.getProjectTaxaRaw(pool, projectIds)
            }

            return createPagination<RawSampleTaxa>(data)
        },

        sampleTaxaGeneralized: async (
            obj,
            { sampleId },
            { user }
        ): Promise<PaginatedRecords<GeneralizedSampleTaxa>> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.getSampleTaxaGeneralized(pool, sampleId)
            return createPagination<GeneralizedSampleTaxa>(data)
        },

        sampleTaxaTranslation: async (
            obj,
            { sampleId, translationId },
            { user }
        ): Promise<PaginatedRecords<TranslationSampleTaxa>> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.getSampleTaxaTranslation(pool, sampleId, translationId)
            return createPagination<TranslationSampleTaxa>(data)
        },

        // sampleTaxaRarefied: async (
        //     obj,
        //     { sampleId, fixedCount },
        //     { user }
        // ): Promise<PaginatedRecords<RarefiedSampleTaxa>> => {
        //     loggedInGate(user)

        //     const pool = await pg.getPool()
        //     const data = await pg.getSampleTaxaRarefied(pool, sampleId, fixedCount)
        //     return createPagination<RarefiedSampleTaxa>(data)
        // },

        sampleTaxaTranslationRarefied: async (
            obj,
            { sampleId, translationId, fixedCount },
            { user }
        ): Promise<PaginatedRecords<RarefiedSampleTaxa>> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.getSampleTaxaTranslationRarefied(pool, sampleId, translationId, fixedCount)
            return createPagination<RarefiedSampleTaxa>(data)
        },

        pointTaxaRaw: async (
            obj,
            { longitude, latitude, distance },
            { user }
        ): Promise<PaginatedRecords<RawSampleTaxa>> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.getPointTaxaRawQuery(pool, longitude, latitude, distance)
            return createPagination<RawSampleTaxa>(data)
        },

        polygonTaxaRaw: async (obj, { polygon }, { user }): Promise<PaginatedRecords<RawSampleTaxa>> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.getPolygonTaxaRawQuery(pool, polygon)
            return createPagination<RawSampleTaxa>(data)
        },

        attributes: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<Attribute>> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.getAttributes(pool, limit, offset)
            return createPagination<Attribute>(data)
        },

        metrics: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<Metric>> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.getMetrics(pool, limit, offset)
            return createPagination<Metric>(data)
        },

        sampleMetrics: async (
            obj,
            { sampleIds, boxIds, projectIds, translationId, fixedCount },
            { user }
        ): Promise<PaginatedRecords<MetricResult>> => {
            loggedInGate(user)

            const check = [sampleIds, boxIds, projectIds].filter((i) => i)
            if (check.length === 0) throw new Error('You must provide an array of sample IDs, box IDs or project IDs.')
            else if (check.length > 1)
                throw new Error(
                    'You must choose either an array of sample IDs, an array of box IDs, or an array of project IDs.'
                )

            const pool = await pg.getPool()
            let data

            if (sampleIds) {
                if (sampleIds.length < 1 || sampleIds.length > maxIdResults)
                    throw new Error(
                        `${sampleIds.length} items found. You must specify between 1 and ${maxIdResults} item IDs.`
                    )
                data = await pg.getSampleMetrics(pool, sampleIds, translationId, fixedCount)
            } else if (boxIds) {
                if (boxIds.length > maxIdResults)
                    throw new Error(
                        `${boxIds.length} items found. You must specify between 1 and ${maxIdResults} item IDs.`
                    )
                data = await pg.getBoxMetrics(pool, boxIds, translationId, fixedCount)
            } else if (projectIds) {
                if (projectIds.length > maxIdResults)
                    throw new Error(
                        `${projectIds.length} items found. You must specify between 1 and ${maxIdResults} item IDs.`
                    )
                data = await pg.getProjectMetrics(pool, projectIds, translationId, fixedCount)
            }

            return createPagination<MetricResult>(data)
        },

        taxaAttributes: async (
            obj,
            { taxonomyId, limit, offset },
            { user }
        ): Promise<PaginatedRecords<AttributeValue>> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.getTaxaAttributes(pool, taxonomyId, limit, offset)
            return createPagination<AttributeValue>(data)
        },

        planktonSamples: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<PlanktonSample>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await pg.getPool()
            const data = await pg.getPlanktonSamples(pool, limit, offset)
            return createPagination<PlanktonSample>(data, limit, offset)
        },

        driftSamples: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<DriftSample>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await pg.getPool()
            const data = await pg.getDriftSamples(pool, limit, offset)
            return createPagination<DriftSample>(data, limit, offset)
        },

        fishSamples: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<FishSample>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await pg.getPool()
            const data = await pg.getFishSamples(pool, limit, offset)
            return createPagination<FishSample>(data, limit, offset)
        },

        massSamples: async (obj, { limit, offset }, { user }): Promise<PaginatedRecords<MassSample>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await pg.getPool()
            const data = await pg.getMassSamples(pool, limit, offset)
            return createPagination<MassSample>(data, limit, offset)
        },

        modelResults: async (obj, { limit, offset, sampleIds }, { user }): Promise<PaginatedRecords<ModelResult>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await pg.getPool()
            const data = await pg.getModelResults(pool, limit, offset, sampleIds)
            return createPagination<ModelResult>(data, limit, offset)
        },

        fishGuts: async (obj, { limit, offset, sampleIds }, { user }): Promise<PaginatedRecords<FishGuts>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await pg.getPool()
            const data = await pg.getFishGuts(pool, limit, offset, sampleIds)
            return createPagination<FishGuts>(data, limit, offset)
        }
    },

    Mutation: {
        setSitePredictorValue: async (obj, { siteId, predictorId, value }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.setSitePredictorValue(pool, siteId, predictorId, value)
            const returnVal = data[0].fn_set_site_predictor_value as number
            return returnVal
        },

        setSamplePredictorValue: async (obj, { sampleId, predictorId, value }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.setSamplePredictorValue(pool, sampleId, predictorId, value)
            const returnVal = data[0].fn_set_sample_predictor_value as number
            return returnVal
        },

        setSiteCatchment: async (obj, { siteId, catchment }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.setSiteCatchment(pool, siteId, catchment)
            const returnVal = data[0].fn_set_site_catchment as number
            return returnVal
        },

        createTranslation: async (obj, { translationName, description }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.createTranslation(pool, translationName, description)
            const returnVal = data[0].fn_create_translation as number
            return returnVal
        },
        setTranslationTaxa: async (obj, { translationId, taxonomyId, alias, isFinal }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.setTranslationTaxa(pool, translationId, taxonomyId, alias, isFinal)
            const returnVal = data[0].fn_set_translation_taxa as number
            return returnVal
        },

        deleteTranslationTaxa: async (obj, { translationId, taxonomyId }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.deleteTranslationTaxa(pool, translationId, taxonomyId)
            const returnVal = data[0].fn_delete_translation_taxa as number
            return returnVal
        },

        setTaxonomy: async (
            obj,
            { taxonomyId, scientificName, levelId, parentId, author, year, notes, metadata },
            { user }
        ): Promise<number> => {
            loggedInGate(user)

            const pool = await pg.getPool()
            const data = await pg.setTaxonomy(
                pool,
                taxonomyId,
                scientificName,
                levelId,
                parentId,
                author,
                year,
                notes,
                metadata
            )
            const returnVal = data[0].fn_set_taxonomy as number
            return returnVal
        }
    }
}
