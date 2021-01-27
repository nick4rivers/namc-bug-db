import AWS from 'aws-sdk'
import { NODECACHE } from '../../config'
import log from 'loglevel'

/**
 * Pull an SSM param out of the store. Use caching to lighten the load.
 * @param paramName
 */
export function getSecret(paramName: string, region: string): Promise<string> {
    const cacheKey = `SSM_${paramName}`
    const ssm = new AWS.SSM({ region })

    const cached: string = NODECACHE.get(cacheKey)
    if (cached) return Promise.resolve(cached)

    const params = {
        Name: paramName
    }
    return ssm
        .getParameter(params)
        .promise()
        .then((data) => {
            NODECACHE.set(cacheKey, data.Parameter.Value)
            return data.Parameter.Value
        })
        .catch((err) => {
            log.error(`Error retrieving/parsing SSM value: ${paramName}`)
            throw err
        })
}

/**
 * Simple Wrapper for parsing JSON
 * @param paramName
 */
export async function getJSONSecret(paramName: string, region: string): Promise<object> {
    return JSON.parse(await getSecret(paramName, region))
}
