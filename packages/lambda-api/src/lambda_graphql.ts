import schema from './graphql'
// import { awsLib, config } from '@namcbugdb/common-server'
import { graphql } from 'graphql'
import log from 'loglevel'
// import AWS from 'aws-sdk'

// We use the DocumentClient() so that we get back sane JSON objects
// Docs are here: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html
// const docClient = new AWS.DynamoDB.DocumentClient()
// const cognitoClient = awsLib.cognito.getCognitoClient(config.aws.region)
log.enableAll()

// export const handler = async (event, context, callback): Promise<unknown> => {
export const handler = async (event): Promise<unknown> => {
    log.info(`========= STARTING GraphQL ${process.env.VERSION} ========= `)

    // Parse the Bearer token out of the headers (if there is one)
    // const user = await awsLib.cognito.getAuthCached(event, docClient)

    // const ctx = { docClient, cognitoClient, user }
    const ctx = {}
    const body = JSON.parse(event.body)

    return graphql(schema, body.query, null, ctx, body.variables).then((result) => ({
        statusCode: 200,
        // allow CORS for everyone.
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(result)
    }))
}
