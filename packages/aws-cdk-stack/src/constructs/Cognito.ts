import * as cdk from '@aws-cdk/core'
import * as cognito from '@aws-cdk/aws-cognito'
// import * as s3 from '@aws-cdk/aws-s3'
// import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { globalTags, stackProps } from '../config'
import { addTagsToResource } from './tags'

export interface CognitoClientProps {
    userPool: cognito.IUserPool
}

/********************************************************
 * WARNING!!! This class affects the parent stack
 * Be VERY careful about changing it
 *********************************************************/
export class CognitoUserPool extends cdk.Construct {
    userPool: cognito.UserPool
    client: cognito.UserPoolClient

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id)

        this.userPool = new cognito.UserPool(this, `CognitoUserPool`, {
            userPoolName: `${stackProps.stackPrefix}UserPool`,
            signInAliases: {
                email: true,
                username: false
            },
            signInCaseSensitive: false,
            selfSignUpEnabled: true
        })
        addTagsToResource(this.userPool, globalTags)

        // Client to connect to
        this.userPool.addDomain(`UserPoolDomain`, {
            cognitoDomain: {
                domainPrefix: stackProps.cognitoDomainPrefix
            }
        })
    }
}

/**
 * This is the cognito UserPoolClient and one of them exists for each stage
 */
export class CognitoClient extends cdk.Construct {
    client: cognito.UserPoolClient

    constructor(scope: cdk.Construct, id: string, props: CognitoClientProps) {
        super(scope, id)
        this.client = new cognito.UserPoolClient(this, `CognitoUserPoolClient_${stackProps.stage}`, {
            userPool: props.userPool,
            generateSecret: false,
            userPoolClientName: `${stackProps.stackPrefix}UserPoolClient_${stackProps.stage}`,
            oAuth: {
                // TODO: THIS IS FOR DEV ONLY, OBVIOUSLY
                callbackUrls: ['http://localhost:3000/namc/'],
                logoutUrls: ['http://localhost:3000/namc/'],
                scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: true,
                    clientCredentials: false
                }
            },
            authFlows: {
                adminUserPassword: true,
                userPassword: false,
                userSrp: true,
                custom: true
            }
        })
    }
}

/**
 * The machine client is used mostly for insomnia testing
 */
export class CognitoMachineClient extends cdk.Construct {
    client: cognito.UserPoolClient

    constructor(scope: cdk.Construct, id: string, props: CognitoClientProps) {
        super(scope, id)
        this.client = new cognito.UserPoolClient(this, `CognitoMachineClient_${stackProps.stage}`, {
            userPool: props.userPool,
            userPoolClientName: `${stackProps.stackPrefix}UserPoolMachineClient_${stackProps.stage}`,
            generateSecret: true,
            oAuth: {
                flows: {
                    clientCredentials: true
                },
                scopes: [
                    {
                        scopeName: 'SomeIdentifier/post'
                    }
                ]
            }
        })
    }
}
