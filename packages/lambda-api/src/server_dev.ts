/**
 * NOTE: This is a DEV-only script that allows us to run this lambda function
 * as a server or in docker or whatever.
 *
 * NEVER EVER EVER EVER RUN THIS IN PRODUCTION!!!!!!!
 */
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import authorizer from '@namcbugdb/lambda-auth'
// Serverless sets our environment variables for us so er need to do it this way
import graphqlHTTP from 'express-graphql'
import log from 'loglevel'

// This has to go second because it does checking for env vars we might not have yet
import { executableSchema, awsLib, NODECACHE } from '@namcbugdb/common-server'

log.enableAll()

log.info(
    '\n\n\n==============================================\nLAUNCHING...\n==============================================\n'
)

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const API_PORT = process.env.API_PORT || 3002

// This is for our local testing only
const app = express()

app.use(cors(corsOptions))

// log only 4xx and 5xx responses to console
app.use(morgan('dev', { skip: (req, res) => res.statusCode < 400 }))

app.use('/api', async (req, res, next) => {
    log.debug('nodecache', NODECACHE.getStats())

    // This approximates what the lamdba authorizer handler does
    const authObj: any = await authorizer({
        type: 'TOKEN',
        authorizationToken: req.headers.authorization,
        methodArn: 'arn:aws:execute-api:us-east-1:123456789012:/prod/POST/{proxy+}'
    })
    // Minor glitch in types
    authObj.context.isLoggedIn = authObj.context.isLoggedIn.toString()
    const user = awsLib.cognito.getUserObjFromLambdaCtx(authObj.context)

    req.context = {
        ...res.context,
        user
    }
    next()
})

app.use(
    '/api',
    graphqlHTTP(async (req: any, res, graphQLParams) => {
        // log.info(req, graphQLParams)
        return {
            schema: executableSchema,
            context: req.context,
            graphiql: false
        }
    })
)

// Start the server if we're being called directly
app.listen(API_PORT, () => {
    log.info(`graphqlExpress Server Running at http://127.0.0.1:${API_PORT}/api`)
})
