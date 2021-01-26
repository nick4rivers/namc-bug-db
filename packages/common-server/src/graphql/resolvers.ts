// import path from 'path'
import { HelloResponse, Sample } from '@namcbugdb/common'
import { BoxState, Site, Individual, Box } from '@namcbugdb/common'
import { getSamples, getPool, getBoxStates, getSites, getIndividuals, getBoxes } from '../pg'
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
            return data.map((vals) => ({
                sampleId: vals.sample_id,
                boxId: vals.box_id,
                customerId: vals.customer_id,
                customerName: vals.organization_name,
                siteId: vals.site_id,
                siteName: vals.site_name,
                sampleDate: vals.sample_date,
                sampleTime: vals.sample_time,
                typeId: vals.type_id,
                typeName: vals.sample_type_name,
                methodId: vals.method_id,
                methodName: vals.sample_method_name,
                habitatId: vals.habitat_id,
                habitatName: vals.habitat_name,
                area: vals.area,
                fieldSplit: vals.field_split,
                labSplit: vals.lab_split,
                jarCount: vals.jar_count,
                qualitative: vals.qualitative,
                mesh: vals.mesh,
                createdDate: vals.created_date,
                updatedDate: vals.updated_date,
                qaSampleId: vals.qa_sample_id
            }))
        },

        boxStates: async (obj, args, ctx, info): Promise<BoxState[]> => {
            const pool = getPool()
            const data = await getBoxStates(pool)
            return data.map((vals) => ({
                boxStateId: vals.box_state_id
            }))
        },

        sites: async (obj, args, ctx, info): Promise<Site[]> => {
            const pool = getPool()
            const data = await getSites(pool)
            return data.map((vals) => ({
                siteId: vals.site_id,
                siteName: vals.site_name,
                ecosystemId: vals.ecosystem_id,
                ecosystemName: vals.ecosystem_name,
                waterbody: vals.waterbody,
                longitude: vals.longitude,
                latitude: vals.latitude
            }))
        },

        individuals: async (obj, args, ctx, info): Promise<Individual[]> => {
            const pool = getPool()
            const data = await getIndividuals(pool)
            return data.map((vals) => ({
                siteId: vals.site_id,
                siteName: vals.site_name,
                ecosystemId: vals.ecosystem_id,
                ecosystemName: vals.ecosystem_name,
                waterbody: vals.waterbody,
                longitude: vals.longitude,
                latitude: vals.latitude
            }))
        },

        boxes: async (obj, args, ctx, info): Promise<Box[]> => {
            const pool = getPool()
            const data = await getBoxes(pool)
            return data.map((vals) => ({
                boxId: vals.box_id,
                customerId: vals.customer_id,
                customerName: vals.organization_name,
                samples: vals.samples,
                submitterId: vals.submitter_id,
                SubmitterName: vals.submitter_name,
                boxStateId: vals.box_state_id,
                boxStateName: vals.box_state_name,
                boxReceivedDate: vals.box_received_date,
                processingCompleteDate: vals.processing_complete_date,
                projectedCompleteDate: vals.projected_complete_date,
                projectId: vals.project_id,
                projectName: vals.project_name
            }))
        }
    }

    // Mutation: {
    // },
}
