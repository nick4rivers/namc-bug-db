import { graphql } from 'graphql'
import log from 'loglevel'
import { awsRegion, executableSchema, awsLib, NODECACHE } from '@namcbugdb/common-server'

log.enableAll()

// export const handler = async (event, context, callback): Promise<unknown> => {
export const handler = async (event): Promise<unknown> => {
    log.info(`========= STARTING GraphQL ${process.env.VERSION} ========= `)
    log.debug('nodecache', NODECACHE.getStats())

    // We use the DocumentClient() so that we get back sane JSON objects
    // Docs are here: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html
    const cognitoClient = awsLib.cognito.getCognitoClient(awsRegion)

    // Parse the Bearer token out of the headers (if there is one)
    const user = await awsLib.cognito.getAuthCached(event)

    const ctx = { cognitoClient, user }
    const body = JSON.parse(event.body)

    return graphql(executableSchema, body.query, null, ctx, body.variables).then((result) => ({
        statusCode: 200,
        // allow CORS for everyone.
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(result)
    }))
}
