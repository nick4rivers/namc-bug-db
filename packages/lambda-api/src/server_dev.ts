/**
 * NOTE: This is a DEV-only script that allows us to run this lambda function
 * as a server or in docker or whatever.
 *
 * NEVER EVER EVER EVER RUN THIS IN PRODUCTION!!!!!!!
 */
import 'source-map-support/register'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
// Serverless sets our environment variables for us so er need to do it this way
import dotenv from 'dotenv'
import graphqlHTTP from 'express-graphql'
import log from 'loglevel'

import schema from './graphql'
// import { awsLib, config } from '@namcbugdb/common-server'

log.enableAll()

log.info(
    '\n\n\n==============================================\nLAUNCHING...\n==============================================\n'
)

// require and configure dotenv, will load vars in .env in PROCESS.ENV
dotenv.config()

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const API_PORT = process.env.API_PORT || 3002

// This is for our local testing only
const app = express()

// const docClient = awsLib.dynamo.getDynamoClient(config.aws.region)
// const cognitoClient = awsLib.cognito.getCognitoClient(config.aws.region)
app.use(cors(corsOptions))

// log only 4xx and 5xx responses to console
app.use(morgan('dev', { skip: (req, res) => res.statusCode < 400 }))

app.use('/api', async (req, res, next) => {
    // const user = await awsLib.cognito.getAuthCached(req, docClient).catch((err) => {
    //     log.error(err)
    //     return {}
    // })
    req.context = {
        ...res.context
        // user,
        // docClient,
        // cognitoClient
    }
    next()
})

app.use(
    '/api',
    graphqlHTTP(async (req: any, res, graphQLParams) => {
        // log.info(req, graphQLParams)
        return {
            schema,
            context: req.context,
            graphiql: false
        }
    })
)

// Start the server if we're being called directly
app.listen(API_PORT, () => {
    log.info(`graphqlExpress Server Running at http://127.0.0.1:${API_PORT}/api`)
})
