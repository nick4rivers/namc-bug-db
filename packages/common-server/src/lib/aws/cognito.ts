import AWS from 'aws-sdk'
import Authorizer from '../auth/Authorizer'
// import { getUser, createUser } from './dynamo-user'
import log from 'loglevel'
import { UserObj, LambdaCtxAuth } from '../../types'
import { NODECACHE, getConfigPromise } from '../../config'
import _ from 'lodash'

const MAX_USERS = 100

const NOT_LOGGED_IN = (): UserObj =>
    _.cloneDeep({
        cognito: {
            isAdmin: false,
            isLoggedIn: false,
            isMachine: false,
            sub: null
        }
    })

export function getUserObjFromLambdaCtx(authObj: LambdaCtxAuth): UserObj {
    const newObj: UserObj = NOT_LOGGED_IN()
    if (authObj.isLoggedIn === 'true' && authObj.user && authObj.user.length > 10) {
        newObj.cognito.sub = authObj.user
        newObj.cognito.isLoggedIn = authObj.isLoggedIn === 'true'
    }
    return newObj
}

export function getCognitoClient(region: string): AWS.CognitoIdentityServiceProvider {
    const awsConfig: { [key: string]: string } = { region }
    AWS.config.update(awsConfig)
    return new AWS.CognitoIdentityServiceProvider()
}

export function getUserAttributes(cognitoUser: any, attName: string): any {
    try {
        if (cognitoUser.Attributes) return cognitoUser.Attributes.find((ua) => ua.Name === attName).Value
        else return cognitoUser.UserAttributes.find((ua) => ua.Name === attName).Value
    } catch {
        return null
    }
}

export async function getCognitoUsers(
    cognitoClient: AWS.CognitoIdentityServiceProvider,
    limit: number,
    nextToken: string
): Promise<any> {
    const config = await getConfigPromise()

    const qLimit = limit || MAX_USERS
    const params: any = {
        UserPoolId: config.cognito.userPoolId,
        Limit: qLimit
    }
    if (nextToken && nextToken.length > 0) params.PaginationToken = nextToken

    const groupParams = {
        GroupName: 'Admin',
        UserPoolId: config.cognito.userPoolId
    }

    return Promise.all([
        cognitoClient.listUsers(params).promise(),
        cognitoClient.listUsersInGroup(groupParams).promise()
    ])
        .then(([userData, adminUsers]) => {
            return {
                ...userData,
                Users: userData.Users.map((newUser) => {
                    const isAdmin = Boolean(
                        adminUsers.Users && adminUsers.Users.find((admu) => newUser.Username === admu.Username)
                    )
                    if (isAdmin) return null
                    NODECACHE.set(`COGNITO::${newUser.Username}`, newUser)
                    return newUser
                }).filter((u) => u !== null)
            }
        })
        .catch((err) => {
            throw new Error(err)
        })
}

export async function getCognitoUser(cognitoClient: AWS.CognitoIdentityServiceProvider, sub: string): Promise<any> {
    if (!sub || sub.length === 0) throw new Error('Invalid user sub')
    const cacheUser = NODECACHE.get(`COGNITO::${sub}`)
    if (cacheUser) return cacheUser
    const config = await getConfigPromise()

    const params = {
        UserPoolId: config.cognito.userPoolId,
        Username: sub
    }

    // Groups is a separate call so we need to combine the data
    const user = await Promise.all([
        cognitoClient.adminGetUser(params).promise(),
        cognitoClient.adminListGroupsForUser(params).promise()
    ])
        .then(([user, groupdata]) => {
            const newUser = {
                ...user,
                isGlobalAdmin: Boolean(groupdata.Groups && groupdata.Groups.find((g) => g.GroupName === 'Admin'))
            }
            NODECACHE.set(`COGNITO::${sub}`, newUser)
            return newUser
        })
        .catch((err) => {
            throw new Error(err)
        })
    return Promise.resolve(user)
}

/**
 * Auth needs to make an HTTP request to get the jwt decoded so we want to cache
 * this if we can. Luckily, anything outside the handler function is cached
 * so our USER_CACHE above should be retained between sessions (roughly)
 * @param event
 */
export async function getAuthCached(event: any): Promise<UserObj> {
    if (!event || !event.headers) {
        return Promise.resolve(NOT_LOGGED_IN())
    }
    const authCode = event.headers.authorization || event.headers.Authorization || event.headers.authorizationToken
    if (!authCode) {
        return Promise.resolve(NOT_LOGGED_IN())
    }
    const cachedAuthUser = NODECACHE.get(`AUTHCODE::${authCode}`)

    if (cachedAuthUser) {
        log.debug('getAuthCached:: Got cached user!', cachedAuthUser)
        return Promise.resolve(cachedAuthUser as UserObj)
    } else {
        log.debug('getAuthCached:: No cached value. Fetching')
        const config = await getConfigPromise()
        const auth = new Authorizer(config)
        const user = await auth
            .AuthHandler(event.headers)
            .then(async (data: any) => {
                // Build the user object from the pieces we have
                const isMachine =
                    config.cognito.machineClientId && data.sub && config.cognito.machineClientId === data.sub
                const newUser: UserObj = {
                    cognito: {
                        isAdmin: data.isAdmin,
                        isLoggedIn: true,
                        // A machine is anyone who logs in with the ClientID and Secret
                        isMachine,
                        sub: data.sub
                    }
                }
                NODECACHE.set(`AUTHCODE::${authCode}`, newUser)
                log.info('getAuthCached:: finished fetching', newUser)
                return newUser
            })
            .catch((err) => {
                log.error(err)
                return NOT_LOGGED_IN()
            })
        return Promise.resolve(user)
    }
}
