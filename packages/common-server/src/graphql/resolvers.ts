// import path from 'path'
import { HelloResponse, Sample } from '@namcbugdb/common'
import { BoxState, Site, Individual } from '@namcbugdb/common'
import { getSamples, getPool, getBoxStates, getSites, getIndividuals } from '../pg'
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
        }
    }
    // Mutation: {
    // },
}
