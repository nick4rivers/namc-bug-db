// import path from 'path'
import { getConfigPromise } from '../config'
import { types as t, graphql, util } from '@namcbugdb/common'
import { getPool, fnQuery } from '../db'

import { loggedInGate, limitOffsetCheck, createPagination, checkExclusiveFilter } from './resolverUtil'

export default {
    Query: {
        auth: async (obj, args, ctx): Promise<t.AuthResponse> => {
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

        samples: async (
            obj,
            { limit, offset, sampleIds, boxIds, projectIds, entityIds, siteIds, polygon, pointDistance },
            { user }
        ): Promise<t.PaginatedRecords<t.Sample>> => {
            loggedInGate(user)

            // Do some checking to make sure the right combination of filter params (if any) have been provided
            checkExclusiveFilter({ sampleIds, boxIds, projectIds, entityIds, siteIds, polygon, pointDistance }, true)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await getPool()
            let data
            if (sampleIds) data = await fnQuery(pool, { name: 'sample.fn_samples', args: [limit, offset, sampleIds] })
            else if (boxIds)
                data = await fnQuery(pool, { name: 'sample.fn_box_samples', args: [limit, offset, boxIds] })
            else if (projectIds)
                data = await fnQuery(pool, { name: 'sample.fn_project_samples', args: [limit, offset, projectIds] })
            else if (entityIds)
                data = await fnQuery(pool, { name: 'sample.fn_entity_samples', args: [limit, offset, entityIds] })
            else if (siteIds)
                data = await fnQuery(pool, { name: 'sample.fn_site_samples', args: [limit, offset, siteIds] })
            else if (polygon)
                data = await fnQuery(pool, { name: 'sample.fn_polygon_samples', args: [limit, offset, polygon] })
            else if (pointDistance) {
                const { longitude, latitude, distance } = pointDistance
                data = await fnQuery(pool, {
                    name: 'sample.fn_point_distance_samples',
                    args: [limit, offset, longitude, latitude, distance]
                })
            }

            return createPagination<t.Sample>(data, limit, offset)
        },

        organizations: async (obj, { limit, offset, searchTerm }, { user }): Promise<t.Organization> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'entity.fn_organizations', args: [limit, offset, searchTerm] })

            if (data.length !== 1) {
                throw new Error('Record not found')
            }

            const returnVal = data.map(util.snake2camel)[0] as t.Organization
            return returnVal
        },

        sites: async (
            obj,
            { limit, offset, sampleIds, boxIds, projectIds, entityIds, siteIds, polygon, pointDistance },
            { user }
        ): Promise<t.PaginatedRecords<t.Site>> => {
            loggedInGate(user)

            // Do some checking to make sure the right combination of filter params (if any) have been provided
            checkExclusiveFilter({ sampleIds, boxIds, projectIds, entityIds, siteIds, polygon, pointDistance }, true)
            limitOffsetCheck(limit, graphql.queryLimits.sites, offset)

            const pool = await getPool()
            let data
            if (siteIds) data = await fnQuery(pool, { name: 'geo.fn_sites', args: [limit, offset, siteIds] })
            else if (boxIds) data = await fnQuery(pool, { name: 'geo.fn_box_sites', args: [limit, offset, boxIds] })
            else if (projectIds)
                data = await fnQuery(pool, { name: 'geo.fn_project_sites', args: [limit, offset, projectIds] })
            else if (entityIds)
                data = await fnQuery(pool, { name: 'geo.fn_entity_sites', args: [limit, offset, entityIds] })
            else if (sampleIds)
                data = await fnQuery(pool, { name: 'geo.fn_sample_sites', args: [limit, offset, sampleIds] })
            else if (polygon)
                data = await fnQuery(pool, { name: 'geo.fn_polygon_sites', args: [limit, offset, polygon] })
            else if (pointDistance) {
                const { longitude, latitude, distance } = pointDistance
                data = await fnQuery(pool, {
                    name: 'geo.fn_sites_point_distance',
                    args: [limit, offset, longitude, latitude, distance]
                })
            }
            return createPagination<t.Site>(data, limit, offset)
        },

        siteInfo: async (obj, { siteId }, { user }): Promise<t.SiteInfo> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'geo.fn_site_info', args: [siteId] })

            if (data.length !== 1) {
                throw new Error('Record not found')
            }
            const returnVal = data.map(util.snake2camel)[0] as t.SiteInfo
            return returnVal
        },
        // sampleInfo: async (obj, { sampleId }, { user }): Promise<t.SampleInfo> => {
        //     loggedInGate(user)
        //     const pool = await getPool()
        //     const data = await fnQuery(pool, { name: 'sample.fn_sample_info', args: [sampleId] })

        //     if (data.length !== 1) {
        //         throw new Error('Record not found')
        //     }

        //     const returnVal = data.map(util.snake2camel)[0] as t.SampleInfo
        //     return returnVal
        // },

        boxInfo: async (obj, { boxId }, { user }): Promise<t.BoxInfo> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'sample.fn_box_info', args: [boxId] })

            if (data.length !== 1) {
                throw new Error('Record not found')
            }

            const returnVal = data.map(util.snake2camel)[0] as t.BoxInfo
            return returnVal
        },

        modelInfo: async (obj, { modelId }, { user }): Promise<t.ModelInfo> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'geo.fn_model_info', args: [modelId] })

            if (data.length !== 1) {
                throw new Error('Record not found')
            }

            const returnVal = data.map(util.snake2camel)[0] as t.ModelInfo
            return returnVal
        },

        modelConditions: async (obj, { modelId }, { user }): Promise<t.PaginatedRecords<t.ModelCondition>> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'geo.fn_model_conditions', args: [modelId] })

            return createPagination<t.ModelCondition>(data, 500, 0)
        },

        samplePredictorValues: async (
            obj,
            { sampleId },
            { user }
        ): Promise<t.PaginatedRecords<t.SamplePredictorValue>> => {
            loggedInGate(user)
            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'sample.fn_sample_predictor_values', args: [sampleId] })

            return createPagination<t.SamplePredictorValue>(data, 500, 0)
        },

        // individuals: async (obj, { limit, offset }, { user }, info): Promise<Individual[]> => {
        //     loggedInGate(user)
        //     const pool = await getPool()
        //     const data = await fnQuery(pool, { name: 'entity.vw_individuals', limit, offset })
        //     return data.map(util.snake2camel)
        // },

        boxes: async (obj, { limit, offset, boxIds, entityIds }, { user }): Promise<t.PaginatedRecords<t.Box>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.boxes, offset)
            // Do some checking to make sure the right combination of filter params (if any) have been provided
            checkExclusiveFilter({ boxIds, entityIds }, true)

            const pool = await getPool()

            let data
            if (boxIds) data = await fnQuery(pool, { name: 'sample.fn_boxes', args: [limit, offset, boxIds] })
            else if (entityIds) {
                data = await fnQuery(pool, { name: 'sample.fn_entity_boxes', args: [limit, offset, entityIds] })
            }

            return createPagination<t.Box>(data, limit, offset)
        },

        projects: async (obj, { limit, offset }, { user }): Promise<t.PaginatedRecords<t.Project>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.projects, offset)
            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'sample.fn_projects', args: [limit, offset] })
            return createPagination<t.Project>(data, limit, offset)
        },

        taxonomy: async (obj, { limit, offset, searchTerm }, { user }): Promise<t.PaginatedRecords<t.Taxonomy>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.taxonomy, offset)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'taxa.fn_taxonomy', args: [limit, offset, searchTerm] })

            return createPagination<t.Taxonomy>(data, limit, offset)
        },

        taxonomyTree: async (obj, { taxonomyId }, { user }): Promise<t.PaginatedRecords<t.TaxonomyTree>> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'taxa.fn_tree', args: [taxonomyId] })

            return createPagination<t.TaxonomyTree>(data, taxonomyId)
        },

        predictors: async (obj, { limit, offset, modelId }, { user }): Promise<t.PaginatedRecords<t.Predictor>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.predictors, offset)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'geo.fn_predictors', args: [limit, offset, modelId] })
            return createPagination<t.Predictor>(data, limit, offset)
        },

        models: async (obj, { limit, offset }, { user }): Promise<t.PaginatedRecords<t.Model>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.models, offset)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'geo.fn_models', args: [limit, offset] })

            return createPagination<t.Model>(data, limit, offset)
        },

        translations: async (obj, { limit, offset }, { user }): Promise<t.PaginatedRecords<t.Translation>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.models, offset)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'taxa.fn_translations', args: [limit, offset] })
            return createPagination<t.Translation>(data, limit, offset)
        },

        translationTaxa: async (
            obj,
            { limit, offset, translationId },
            { user }
        ): Promise<t.PaginatedRecords<t.TranslationTaxa>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.models, offset)

            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'taxa.fn_translation_taxa',
                args: [limit, offset, translationId]
            })
            return createPagination<t.TranslationTaxa>(data, limit, offset)
        },

        sitePredictorValues: async (
            obj,
            { limit, offset, siteId },
            { user }
        ): Promise<t.PaginatedRecords<t.SitePredictorValue>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.sitePredictorValues, offset)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'geo.fn_site_predictor_values', args: [limit, offset, siteId] })

            return createPagination<t.SitePredictorValue>(data, limit, offset)
        },

        sampleTaxaRaw: async (
            obj,
            { sampleIds, boxIds, projectIds },
            { user }
        ): Promise<t.PaginatedRecords<t.SampleTaxa>> => {
            loggedInGate(user)

            // Do some checking to make sure the right combination of filter params (if any) have been provided
            checkExclusiveFilter({ sampleIds, boxIds, projectIds }, true)

            const pool = await getPool()
            let data

            if (sampleIds) data = await fnQuery(pool, { name: 'sample.fn_sample_taxa_raw', args: [sampleIds] })
            else if (boxIds) data = await fnQuery(pool, { name: 'sample.fn_box_taxa_raw', args: [boxIds] })
            else if (projectIds) data = await fnQuery(pool, { name: 'sample.fn_project_taxa_raw', args: [projectIds] })

            return createPagination<t.SampleTaxa>(data)
        },

        sampleTaxaGeneralized: async (
            obj,
            { sampleId },
            { user }
        ): Promise<t.PaginatedRecords<t.GeneralizedSampleTaxa>> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'sample.fn_sample_taxa_generalized', args: [sampleId] })
            return createPagination<t.GeneralizedSampleTaxa>(data)
        },

        sampleTaxaTranslation: async (
            obj,
            { sampleId, translationId },
            { user }
        ): Promise<t.PaginatedRecords<t.SampleTaxa>> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'sample.fn_sample_translation_taxa',
                args: [sampleId, translationId]
            })
            return createPagination<t.SampleTaxa>(data)
        },

        // sampleTaxaRarefied: async (
        //     obj,
        //     { sampleId, fixedCount },
        //     { user }
        // ): Promise<PaginatedRecords<RarefiedSampleTaxa>> => {
        //     loggedInGate(user)

        //     const pool = await getPool()
        //     const data = await fnQuery(pool, {
        //         name: 'sample.fn_rarefied_taxa',
        //         args: [sampleId, fixedCount]
        //     })
        //     return createPagination<RarefiedSampleTaxa>(data)
        // },

        sampleTaxaTranslationRarefied: async (
            obj,
            { sampleId, translationId, fixedCount },
            { user }
        ): Promise<t.PaginatedRecords<t.SampleTaxa>> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'sample.fn_translation_rarefied_taxa',
                args: [sampleId, translationId, fixedCount]
            })

            return createPagination<t.SampleTaxa>(data)
        },

        pointTaxaRaw: async (
            obj,
            { longitude, latitude, distance },
            { user }
        ): Promise<t.PaginatedRecords<t.SampleTaxa>> => {
            loggedInGate(user)

            const pool = await getPool()
            // Make sure the parameters have the correct shape
            checkExclusiveFilter({ pointDistance: { longitude, latitude, distance } })
            const data = await fnQuery(pool, {
                name: 'sample.fn_taxa_raw_point_distance',
                args: [longitude, latitude, distance]
            })

            return createPagination<t.SampleTaxa>(data)
        },

        polygonTaxaRaw: async (obj, { polygon }, { user }): Promise<t.PaginatedRecords<t.SampleTaxa>> => {
            loggedInGate(user)

            const pool = await getPool()
            // Make sure the parameters have the correct shape
            checkExclusiveFilter({ polygon })
            const data = await fnQuery(pool, {
                name: 'sample.fn_taxa_raw_polygon',
                args: [polygon]
            })

            return createPagination<t.SampleTaxa>(data)
        },

        attributes: async (obj, { limit, offset }, { user }): Promise<t.PaginatedRecords<t.Attribute>> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'taxa.fn_attributes', args: [limit, offset] })

            return createPagination<t.Attribute>(data)
        },

        metrics: async (obj, { limit, offset }, { user }): Promise<t.PaginatedRecords<t.Metric>> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'metric.fn_metrics', args: [limit, offset] })

            return createPagination<t.Metric>(data)
        },

        sampleMetrics: async (
            obj,
            { sampleIds, boxIds, projectIds, translationId, fixedCount },
            { user }
        ): Promise<t.PaginatedRecords<t.MetricResult>> => {
            loggedInGate(user)

            // Do some checking to make sure the right combination of filter params (if any) have been provided
            checkExclusiveFilter({ sampleIds, boxIds, projectIds }, true)

            const pool = await getPool()
            let data

            if (sampleIds)
                data = await fnQuery(pool, {
                    name: 'metric.fn_sample_metrics_array',
                    args: [sampleIds, translationId, fixedCount]
                })
            else if (boxIds)
                data = await fnQuery(pool, {
                    name: 'metric.fn_box_metrics',
                    args: [boxIds, translationId, fixedCount]
                })
            else if (projectIds)
                data = await fnQuery(pool, {
                    name: 'metric.fn_project_metrics',
                    args: [projectIds, translationId, fixedCount]
                })

            return createPagination<t.MetricResult>(data)
        },

        taxaAttributes: async (
            obj,
            { taxonomyId, limit, offset },
            { user }
        ): Promise<t.PaginatedRecords<t.AttributeValue>> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'taxa.fn_taxa_attributes', args: [taxonomyId, limit, offset] })
            return createPagination<t.AttributeValue>(data)
        },

        planktonSamples: async (obj, { limit, offset }, { user }): Promise<t.PaginatedRecords<t.PlanktonSample>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'sample.fn_plankton', args: [limit, offset] })
            return createPagination<t.PlanktonSample>(data, limit, offset)
        },

        driftSamples: async (obj, { limit, offset }, { user }): Promise<t.PaginatedRecords<t.DriftSample>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'sample.fn_drift', args: [limit, offset] })
            return createPagination<t.DriftSample>(data, limit, offset)
        },

        fishSamples: async (obj, { limit, offset }, { user }): Promise<t.PaginatedRecords<t.FishSample>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'sample.fn_fish', args: [limit, offset] })
            return createPagination<t.FishSample>(data, limit, offset)
        },

        massSamples: async (obj, { limit, offset }, { user }): Promise<t.PaginatedRecords<t.MassSample>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'sample.fn_mass', args: [limit, offset] })
            return createPagination<t.MassSample>(data, limit, offset)
        },

        modelResults: async (
            obj,
            { limit, offset, sampleIds },
            { user }
        ): Promise<t.PaginatedRecords<t.ModelResult>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'sample.fn_model_results', args: [limit, offset, sampleIds] })
            return createPagination<t.ModelResult>(data, limit, offset)
        },

        fishDiet: async (obj, { limit, offset, sampleIds }, { user }): Promise<t.PaginatedRecords<t.FishDiet>> => {
            loggedInGate(user)
            limitOffsetCheck(limit, graphql.queryLimits.samples, offset)

            const pool = await getPool()
            const data = await fnQuery(pool, { name: 'sample.fn_fish_diet', args: [limit, offset, sampleIds] })
            return createPagination<t.FishDiet>(data, limit, offset)
        }
    },

    Mutation: {
        setSitePredictorValue: async (obj, { siteId, predictorId, value }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'sample.fn_set_site_predictor_value',
                args: [siteId, predictorId, value]
            })
            const returnVal = data[0].fn_set_site_predictor_value as number
            return returnVal
        },

        setSamplePredictorValue: async (obj, { sampleId, predictorId, value }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'sample.fn_set_sample_predictor_value',
                args: [sampleId, predictorId, value]
            })
            const returnVal = data[0].fn_set_sample_predictor_value as number
            return returnVal
        },

        setSiteCatchment: async (obj, { siteId, catchment }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'sample.fn_set_site_catchment',
                args: [siteId, catchment]
            })
            const returnVal = data[0].fn_set_site_catchment as number
            return returnVal
        },

        createTranslation: async (obj, { translationName, description }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'taxa.fn_create_translation',
                args: [translationName, description]
            })
            const returnVal = data[0].fn_create_translation as number
            return returnVal
        },
        setTranslationTaxa: async (obj, { translationId, taxonomyId, alias, isFinal }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'taxa.fn_set_translation_taxa',
                args: [translationId, taxonomyId, alias, isFinal]
            })
            const returnVal = data[0].fn_set_translation_taxa as number
            return returnVal
        },

        deleteTranslationTaxa: async (obj, { translationId, taxonomyId }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'taxa.fn_delete_translation_taxa',
                args: [translationId, taxonomyId]
            })
            const returnVal = data[0].fn_delete_translation_taxa as number
            return returnVal
        },

        setTaxonomy: async (
            obj,
            { taxonomyId, scientificName, levelId, parentId, author, year, notes, metadata },
            { user }
        ): Promise<number> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'taxa.fn_set_taxonomy',
                args: [taxonomyId, scientificName, levelId, parentId, author, year, notes, metadata]
            })
            const returnVal = data[0].fn_set_taxonomy as number
            return returnVal
        },

        createProject: async (
            obj,
            { projectName, isPrivate, contactId, description, metadata },
            { user }
        ): Promise<number> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'sample.fn_create_project',
                args: [projectName, isPrivate, contactId, description, metadata]
            })

            const returnVal = data[0].fn_create_project as number
            return returnVal
        },

        addProjectSamples: async (obj, { projectId, sampleIds }, { user }): Promise<number> => {
            loggedInGate(user)

            checkExclusiveFilter({ sampleIds })
            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'sample.add_project_samples',
                args: [projectId, sampleIds]
            })
            const returnVal = data[0].fn_add_project_samples as number
            return returnVal
        },

        addProjectBoxes: async (obj, { projectId, boxIds }, { user }): Promise<number> => {
            loggedInGate(user)

            checkExclusiveFilter({ boxIds })
            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'sample.add_project_boxes',
                args: [projectId, boxIds]
            })
            const returnVal = data[0].fn_add_project_boxes as number
            return returnVal
        },

        removeProjectSamples: async (obj, { projectId, sampleIds }, { user }): Promise<number> => {
            loggedInGate(user)

            checkExclusiveFilter({ sampleIds })
            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'sample.remove_project_samples',
                args: [projectId, sampleIds]
            })
            const returnVal = data[0].fn_remove_project_samples as number
            return returnVal
        },

        deleteProject: async (obj, { projectId }, { user }): Promise<number> => {
            loggedInGate(user)

            const pool = await getPool()
            const data = await fnQuery(pool, {
                name: 'sample.delete_project',
                args: [projectId]
            })
            const returnVal = data[0].fn_delete_project as number
            return returnVal
        }
    }
}
