import * as core from '@aws-cdk/core'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as lambda from '@aws-cdk/aws-lambda'
import * as cw from '@aws-cdk/aws-logs'
import path from 'path'
import { globalTags } from '../config'
import { StackConfigProps } from '../types'
import { addTagsToResource } from './tags'

export interface LambdaAPIProps {
    logGroup: cw.LogGroup
    env: { [key: string]: string }
}

// This is maybe a little sloppy but it's just a lookup inside this monorepo so it should be fine
const lambdaNodePath = path.resolve(__dirname, '../../../lambda-api/.webpack')

class LambdaAPI extends core.Construct {
    readonly lambdaGQLAPI: lambda.Function
    readonly lambdaAPIGateway: apigateway.RestApi
    readonly functions: { [key: string]: string }

    constructor(scope: core.Construct, id: string, stackProps: StackConfigProps, props: LambdaAPIProps) {
        super(scope, id)

        // Define the function names before hand so we can reference them without circular dependency problems
        this.functions = {
            api: `${stackProps.stackPrefix}GraphQLAPI_${stackProps.stage}`
        }

        // The GraphQL API
        // =============================================================================
        this.lambdaGQLAPI = new lambda.Function(this, this.functions.api, {
            code: new lambda.AssetCode(lambdaNodePath),
            functionName: this.functions.api,
            handler: 'lambda_graphql.handler',
            memorySize: 512,
            timeout: core.Duration.minutes(20),
            runtime: lambda.Runtime.NODEJS_12_X,
            logRetention: cw.RetentionDays.TWO_WEEKS,
            environment: props.env
        })
        addTagsToResource(this.lambdaGQLAPI, globalTags)

        // props.dynamoTable.table.grantReadWriteData(lambdaHandler)

        const cyberlogs = new apigateway.LogGroupLogDestination(props.logGroup)

        this.lambdaAPIGateway = new apigateway.RestApi(
            this,
            `${stackProps.stackPrefix}APIGateway_${stackProps.stage}`,
            {
                restApiName: `NAMCBugDb Lambda API Gateway (${stackProps.stage})`,
                description: 'The main DB connector API.',
                deployOptions: {
                    stageName: stackProps.stage,
                    accessLogDestination: cyberlogs,
                    loggingLevel: apigateway.MethodLoggingLevel.INFO,
                    metricsEnabled: true
                },
                defaultCorsPreflightOptions: {
                    allowOrigins: apigateway.Cors.ALL_ORIGINS
                    //     allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']
                }
            }
        )
        addTagsToResource(this.lambdaGQLAPI, globalTags)

        const cyberLambdaIntegration = new apigateway.LambdaIntegration(this.lambdaGQLAPI)
        const resourceAny = this.lambdaAPIGateway.root.addResource('api')
        resourceAny.addMethod('POST', cyberLambdaIntegration) // ANY /API
        // resourceAny.addMethod('OPTIONS', cyberLambdaIntegration) // ANY /API
    }
}

export default LambdaAPI
