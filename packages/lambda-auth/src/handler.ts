import log from 'loglevel'
import { awsLib, NODECACHE } from '@namcbugdb/common-server'
import { HttpVerb } from './types'
import AuthPolicy from './AuthPolicy'

log.enableAll()

// Event teamplate looks like: {
//     "type": "TOKEN",
//     "authorizationToken": "BEARER XXXXXXXXXXXXXX",
//     "methodArn": "arn:aws:execute-api:us-east-1:123456789012:/prod/POST/{proxy+}"
//   }

// export const handler = async (event, context, callback): Promise<unknown> => {
export const handler = async (event): Promise<unknown> => {
    log.info(`========= STARTING Authorizer ${process.env.VERSION} ========= `)
    log.debug('nodecache', NODECACHE.getStats())
    // getAuthcached is expecting headers so wrap this up
    const user = await awsLib.cognito.getAuthCached({ headers: event })
    // log.debug('USER', JSON.stringify(user))
    // Parse the Bearer token out of the headers (if there is one)

    // this function must generate a policy that is associated with the recognized principal user identifier.
    // depending on your use case, you might store policies in a DB, or generate them on the fly

    // keep in mind, the policy is cached for 5 minutes by default (TTL is configurable in the authorizer)
    // and will apply to subsequent calls to any method/resource in the RestApi
    // made with the same token

    // the example policy below denies access to all resources in the RestApi
    const acctid = event.methodArn.split(':')[4]
    const principalId = Boolean(user.cognito.sub) ? 'user' : 'anonymous'
    const policy = new AuthPolicy(principalId, acctid, {})

    policy.allowMethod(HttpVerb.POST, '/api')

    // policy.denyAllMethods()
    // policy.allowMethod(AuthPolicy.HttpVerb.GET, "/users/username");

    // finally, build the policy
    const authResponse = policy.build()
    // new! -- add additional key-value pairs
    // these are made available by APIGW like so: $context.authorizer.<key>
    // additional context is cached
    authResponse.context = {
        user: user.cognito.sub, // $context.authorizer.key -> value
        isLoggedIn: user.cognito.isLoggedIn,
        flavourProfile: 217,
        isAdmin: user.cognito.isAdmin
    }
    // log.debug('authResponse', JSON.stringify(authResponse))
    return Promise.resolve(authResponse)
}
