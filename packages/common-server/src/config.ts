import NodeCache from 'node-cache'
import { getParameter, getSecret } from './lib/aws/ssm'
import { SSMParameter, SecretDBCredentials } from '@namcbugdb/aws-cdk-stack'
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
export const maxQueryIds = 50

// Now go populate the cache
export const getConfigPromise = (): Promise<SSMParameter> =>
    getParameter(process.env.SSM_PARAM, awsRegion).then((param) => {
        const newParam: SSMParameter = {
            ...param,
            db: {
                dbName: (process.env.POSTGRES_DB as string) || param.db.dbName,
                endpoint: (process.env.POSTGRES_HOST as string) || param.db.endpoint,
                port: (process.env.POSTGRES_PORT as string) || param.db.port
            }
        }
        return newParam
    })

export const getDBSecretCredentials = (): Promise<SecretDBCredentials> =>
    getSecret(process.env.SECRET_NAME, awsRegion).then((data) => {
        return {
            ...(data as SecretDBCredentials),
            username: process.env.POSTGRES_USER || (data as SecretDBCredentials).username,
            password: process.env.POSTGRES_PASSWORD || (data as SecretDBCredentials).password
        }
    })
