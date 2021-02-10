import * as core from '@aws-cdk/core'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as lambda from '@aws-cdk/aws-lambda'
import * as cw from '@aws-cdk/aws-logs'
import path from 'path'
import { stageTags, stackProps } from '../config'
import { addTagsToResource } from './tags'

export interface LambdaAPIProps {
    logGroup: cw.LogGroup
    vpc: ec2.IVpc
    dbAccessSG: ec2.ISecurityGroup
    vpcSecurityGroup: ec2.ISecurityGroup
    env: { [key: string]: string }
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
        addTagsToResource(this.lambdaAuth, stageTags)

        // One security group on the Lambda function (Lambda-SG) that permits all outbound access
        // https://stackoverflow.com/questions/66111461/lambda-function-in-isolated-vpc-subnet-cant-access-ssm-parameter/66129329#66129329
        const lambdaSg = new ec2.SecurityGroup(this, 'rds-security-group', {
            vpc: props.vpc,
            // allowAllOutbound: true,
            description: `Lambda access to the dbIngress SG`,
            securityGroupName: `${stackProps.stackPrefix}_LambdaEgress`
        })
        // This allows DB access
        lambdaSg.connections.allowTo(props.dbAccessSG, ec2.Port.tcp(5432))
        // We need this for SSM and secrets manager
        lambdaSg.connections.allowTo(ec2.Peer.ipv4(props.vpc.vpcCidrBlock), ec2.Port.tcp(443))

        // The GraphQL API
        // =============================================================================
        this.lambdaGQLAPI = new lambda.Function(this, `GraphQLAPI_${stackProps.stage}`, {
            code: new lambda.AssetCode(lambdaNodePath),
            vpc: props.vpc,
            vpcSubnets: { subnetType: ec2.SubnetType.ISOLATED },
            functionName: this.functions.api,
            handler: 'lambda_graphql.handler',
            memorySize: 256,
            timeout: core.Duration.minutes(2),
            runtime: lambda.Runtime.NODEJS_12_X,
            securityGroups: [lambdaSg],
            environment: props.env
        })
        addTagsToResource(this.lambdaGQLAPI, stageTags)

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
        addTagsToResource(this.lambdaGQLAPI, stageTags)

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
