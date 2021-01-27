import NodeCache from 'node-cache'
import { getJSONSecret } from './lib/aws/ssm'
import { SSMSecret } from '@namcbugdb/aws-cdk-stack'
// This file is just a fancy wrapper around what's in .env

// This universal NODECACHE is useful for reducing the strain on our network tools
// It lives outside the main method so it should carry across Lambda calls (sometimes)
export const NODECACHE = new NodeCache({ stdTTL: 30, checkperiod: 25 })

// Sanity check here for mandatory environment variabels
const mandatoryKeys = ['SSM_PARAM', 'REGION']

mandatoryKeys.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing environment variable: ${key}`)
    }
})

export const awsRegion = process.env.REGION
export const ssmName = process.env.SSM_PARAM

// Now go populate the cache
export const getConfigPromise = (): Promise<SSMSecret> =>
    getJSONSecret(process.env.SSM_PARAM, awsRegion).then((data) => data as SSMSecret)

export default {
    // TODO: THis should come from secrets manager
    pg: {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        port: process.env.POSTGRES_PORT || 5432,
        host: process.env.POSTGRES_HOST
    }
}
