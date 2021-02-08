import * as core from '@aws-cdk/core'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'
import * as cw from '@aws-cdk/aws-logs'
import path from 'path'
import { globalTags, stackProps } from '../config'
import { addTagsToResource } from './tags'

export interface LambdaAPIProps {
    logGroup: cw.LogGroup
    vpc: ec2.IVpc
    dbSecurityGroup: ec2.ISecurityGroup
    env: { [key: string]: string }
    dbClusterArn: string
    dbSecretArn: string
}

// This is maybe a little sloppy but it's just a lookup inside this monorepo so it should be fine
const lambdaNodePath = path.resolve(__dirname, '../../../lambda-api/.webpack')
const lambdaAuthPath = path.resolve(__dirname, '../../../lambda-auth/.webpack')

class LambdaAPI extends core.Construct {
    readonly lambdaGQLAPI: lambda.Function
    readonly lambdaAuth: lambda.Function
    readonly lambdaAPIGateway: apigateway.RestApi
    readonly functions: { [key: string]: string }

    constructor(scope: core.Construct, id: string, props: LambdaAPIProps) {
        super(scope, id)

        // Define the function names before hand so we can reference them without circular dependency problems
        this.functions = {
            api: `${stackProps.stackPrefix}GraphQLAPI_${stackProps.stage}`,
            authorizer: `${stackProps.stackPrefix}Authorizer_${stackProps.stage}`
        }

        // The Authorizer function
        // =============================================================================
        this.lambdaAuth = new lambda.Function(this, `LambdaAuthorizer_${stackProps.stage}`, {
            code: new lambda.AssetCode(lambdaAuthPath),
            functionName: this.functions.authorizer,
            handler: 'handler.handler',
            memorySize: 128,
            timeout: core.Duration.seconds(5),
            runtime: lambda.Runtime.NODEJS_12_X,
            logRetention: cw.RetentionDays.ONE_WEEK,
            environment: props.env
        })
        addTagsToResource(this.lambdaAuth, globalTags)

        // The GraphQL API
        // =============================================================================
        this.lambdaGQLAPI = new lambda.Function(this, `GraphQLAPI_${stackProps.stage}`, {
            code: new lambda.AssetCode(lambdaNodePath),
            vpc: props.vpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
            functionName: this.functions.api,
            handler: 'lambda_graphql.handler',
            memorySize: 256,
            allowPublicSubnet: true,
            timeout: core.Duration.minutes(2),
            runtime: lambda.Runtime.NODEJS_12_X,
            logRetention: cw.RetentionDays.TWO_WEEKS,
            securityGroups: [props.dbSecurityGroup],
            environment: props.env
        })
        addTagsToResource(this.lambdaGQLAPI, globalTags)

        // Give the lambda function access to the DB
        // https://github.com/goranopacic/dataapi-demo/blob/master/lib/dataapi-demo-stack.ts
        // TODO: MOVE THIS TO THE MAIN STACK
        this.lambdaGQLAPI.addToRolePolicy(
            new iam.PolicyStatement({
                resources: [props.dbSecretArn],
                actions: ['secretsmanager:GetSecretValue']
            })
        )
        this.lambdaGQLAPI.addToRolePolicy(
            new iam.PolicyStatement({
                resources: [props.dbClusterArn],
                actions: [
                    'rds-data:ExecuteStatement',
                    'rds-data:BatchExecuteStatement',
                    'rds-data:BeginTransaction',
                    'rds-data:CommitTransaction',
                    'rds-data:RollbackTransaction'
                ]
            })
        )
        this.lambdaGQLAPI.addToRolePolicy(
            new iam.PolicyStatement({
                resources: [props.dbClusterArn],
                actions: ['rds:DescribeDBClusters']
            })
        )

        // props.dynamoTable.table.grantReadWriteData(lambdaHandler)

        const cyberlogs = new apigateway.LogGroupLogDestination(props.logGroup)

        this.lambdaAPIGateway = new apigateway.RestApi(this, `APIGateway_${stackProps.stage}`, {
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
        })
        addTagsToResource(this.lambdaGQLAPI, globalTags)

        const authorizer = new apigateway.TokenAuthorizer(this, 'something', {
            handler: this.lambdaAuth,
            authorizerName: `Gateway_Authorizer_${stackProps.stage}`,
            resultsCacheTtl: core.Duration.seconds(0)
        })

        const cyberLambdaIntegration = new apigateway.LambdaIntegration(this.lambdaGQLAPI)
        const resourceAny = this.lambdaAPIGateway.root.addResource('api')
        resourceAny.addMethod('POST', cyberLambdaIntegration, {
            authorizationType: apigateway.AuthorizationType.CUSTOM,
            authorizer
        })
        // resourceAny.addMethod('OPTIONS', cyberLambdaIntegration) // ANY /API
    }
}

export default LambdaAPI
