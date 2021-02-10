import AWS from 'aws-sdk'
import { NODECACHE } from '../../config'
import { SSMParameter, SecretDBCredentials } from '@namcbugdb/aws-cdk-stack'
import log from 'loglevel'

/**
 * Pull an SSM param out of the store. Use caching to lighten the load.
 * @param paramName
 */
export async function getParameter(paramName: string, region: string): Promise<SSMParameter> {
    const cacheKey = `SSM_${paramName}`
    const ssm = new AWS.SSM({ region })

    const cached: string = NODECACHE.get(cacheKey)
    if (cached) return Promise.resolve(JSON.parse(cached))

    const params: AWS.SSM.GetParameterRequest = {
        Name: paramName
    }
    return ssm
        .getParameter(params)
        .promise()
        .then((data) => {
            log.info(`gotParam`, data)
            NODECACHE.set(cacheKey, data.Parameter.Value)
            return JSON.parse(data.Parameter.Value)
        })
        .catch((err) => {
            log.error(`Error retrieving/parsing SSM value: ${paramName}`)
            throw err
        })
}

export async function getSecret(secretName: string, region: string): Promise<SecretDBCredentials> {
    const cacheKey = `SECRET_${secretName}`
    const cached: string = NODECACHE.get(cacheKey)
    if (cached) return Promise.resolve(JSON.parse(cached) as SecretDBCredentials)

    const secrets = new AWS.SecretsManager({ region })
    const secretParams: AWS.SecretsManager.GetSecretValueRequest = {
        SecretId: process.env.SECRET_NAME
    }
    const secret = await secrets.getSecretValue(secretParams).promise()
    return JSON.parse(secret.SecretString as string)
}
