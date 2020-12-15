import { config, graphqlSchema } from '@namcbugdb/common-server'
import { graphql } from 'graphql'
import log from 'loglevel'

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

    return graphql(graphqlSchema, body.query, null, ctx, body.variables).then((result) => ({
        statusCode: 200,
        // allow CORS for everyone.
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(result)
    }))
}
