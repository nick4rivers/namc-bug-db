import * as core from '@aws-cdk/core'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as lambda from '@aws-cdk/aws-lambda'
import * as cw from '@aws-cdk/aws-logs'
import path from 'path'
import { globalTags } from '../config'
import { StackStages } from '../types'
import { addTagsToResource } from './tags'

export interface LambdaAPIProps {
    logGroup: cw.LogGroup
}

// This is maybe a little sloppy but it's just a lookup inside this monorepo so it should be fine
const lambdaPath = path.resolve(__dirname, '../../../lambda-api/.webpack')

const lambdaEnv = [
    'AWS_REGION_DEPLOY',
    'AWS_USERPOOLID',
    'AUTH_TABLE',
    'AWS_USERPOOLWEBCLIENTID',
    'AWS_USERPOOL_HOSTED_DOMAIN',
    'PRODUCT_CODE',
    'DYNAMODB_TABLE',
    'AUTH_TABLE',
    'VERSION'
].reduce((acc, n) => {
    if ((process.env[n] || '').length > 0) return { ...acc, [n]: process.env[n] }
    else return acc
}, {})
// console.log('lambdaPath::::::', lambdaPath, lambdaEnv)

class LambdaAPI extends core.Construct {
    constructor(scope: core.Construct, id: string, stage: StackStages, props: LambdaAPIProps) {
        super(scope, id)

        const lambdaHandler = new lambda.Function(this, `NAMCBugDbJobAPI_${stage}`, {
            code: new lambda.AssetCode(lambdaPath),
            functionName: `NAMCBugDbJobAPI_${stage}`,
            handler: 'lambda_graphql.handler',
            memorySize: 512,
            timeout: core.Duration.minutes(3),
            runtime: lambda.Runtime.NODEJS_10_X,
            environment: lambdaEnv
        })
        // props.dynamoTable.table.grantReadWriteData(lambdaHandler)
        addTagsToResource(lambdaHandler, { ...globalTags, stage })

        const cyberlogs = new apigateway.LogGroupLogDestination(props.logGroup)

        const NAMCBugDbAPIGateway = new apigateway.RestApi(this, `NAMCBugDbAPIGateway`, {
            restApiName: 'NAMCBugDb Lambda API Gateway',
            description: 'This service serves widgets.',
            deployOptions: {
                stageName: stage,
                accessLogDestination: cyberlogs,
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                metricsEnabled: true
            }
            // defaultCorsPreflightOptions: {
            //     allowOrigins: apigateway.Cors.ALL_ORIGINS,
            //     allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']
            // }
        })
        addTagsToResource(NAMCBugDbAPIGateway, { ...globalTags, stage })

        const cyberLambdaIntegration = new apigateway.LambdaIntegration(lambdaHandler)
        const resourceAny = NAMCBugDbAPIGateway.root.addResource('api')
        resourceAny.addMethod('POST', cyberLambdaIntegration) // ANY /API
        resourceAny.addMethod('OPTIONS', cyberLambdaIntegration) // ANY /API
    }
}

export default LambdaAPI
