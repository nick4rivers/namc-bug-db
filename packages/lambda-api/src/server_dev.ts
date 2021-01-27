/**
 * NOTE: This is a DEV-only script that allows us to run this lambda function
 * as a server or in docker or whatever.
 *
 * NEVER EVER EVER EVER RUN THIS IN PRODUCTION!!!!!!!
 */
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
// Serverless sets our environment variables for us so er need to do it this way
import graphqlHTTP from 'express-graphql'
import log from 'loglevel'

// This has to go second because it does checking for env vars we might not have yet
import { executableSchema, awsLib, NODECACHE, getConfigPromise } from '@namcbugdb/common-server'

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

    const config = await getConfigPromise()
    const cognitoClient = awsLib.cognito.getCognitoClient(config.region)

    const user = await awsLib.cognito
        .getAuthCached(req)
        .then((data): any => {
            // if (!data) {
            //     return {
            //         username: null,
            //         sub: null,
            //         email: null,
            //         isLoggedIn: false,
            //         isAdmin: false
            //     }
            // }
            // If we are a super user and we want to impersonate someone else this is how.
            // NOTE: THIS WILL NEVER WORK IN PRODUCTION
            // if (data.isAdmin && req.headers.auth_user) {
            //     const params = {
            //         UserPoolId: config.aws.Auth.userPoolId,
            //         Username: req.headers.auth_user
            //     }
            //     return Promise.all([
            //         cognitoClient.adminGetUser(params).promise(),
            //         cognitoClient.adminListGroupsForUser(params).promise()
            //     ])
            //         .then(([data2, { Groups }]) => {
            //             return {
            //                 isLoggedIn: false,
            //                 username: data2.Username,
            //                 sub: data2.UserAttributes.find((at) => at.Name === 'sub').Value,
            //                 email: data2.UserAttributes.find((at) => at.Name === 'email').Value,
            //                 isAdmin: !!Groups.find((g) => g.GroupName === 'Admin')
            //             }
            //         })
            //         .catch((err) => {
            //             log.error(err)
            //         })
            // } else return data
            return data
        })
        .catch((err) => {
            log.error(err)
            return {}
        })
    req.context = {
        ...res.context,
        user,
        cognitoClient
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
