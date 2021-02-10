import * as cdk from '@aws-cdk/core'
import * as cw from '@aws-cdk/aws-logs'
// import * as cognito from '@aws-cdk/aws-cognito'

import VPCStack from './VPCStack'
import * as iam from '@aws-cdk/aws-iam'
// import log from 'loglevel'
// import { VpcStack } from '@northarrowresearch/nar-aws-cdk'

import { stackProps, awsConfig } from './config'
import { CDKStages } from './types'
import LambdaAPI from './constructs/Lambda'

import SSMParametersConstruct from './constructs/SSMParameters'
import S3BucketsConstruct from './constructs/S3Buckets'
import { CognitoClient } from './constructs/Cognito'
import RDSConstruct from './constructs/RDS'

class NAMCBUgDbStack extends cdk.Stack {
    readonly logGroup: cw.LogGroup
    constructor(scope: cdk.App, id: string, cdkProps: cdk.StackProps, vpcStack: VPCStack) {
        super(scope, id, cdkProps)
        const stage = stackProps.stage

        const removalPolicy =
            stackProps.stage === CDKStages.PRODUCTION ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY

        // AWS Cloudwatch Logs
        this.logGroup = new cw.LogGroup(this, `Logs_${stage}`, {
            logGroupName: `${stackProps.stackPrefix}Logs_${stage}`,
            retention: 14,
            // Logs are ephemeral
            removalPolicy
        })

        const cognitoClient = new CognitoClient(this, `Cognito_${stage}`, { userPool: vpcStack.userPool })

        // Now deploy the Database
        const dbName = 'bugdb' // default
        const dbUserName = 'bugdb_root' // default

        const secretName = `${stackProps.stackPrefix}Secret_${stackProps.stage}`
        const rdsDatabase = new RDSConstruct(this, `RDSDB_${stage}`, {
            dbName,
            dbUserName,
            secretName,
            vpc: vpcStack.vpc
        })

        // rdsDatabase.dbAccessSG.addIngressRule(vpcStack.ingressSecurityGroup, ec2.Port.allTraffic())

        // The secrets get used by our lambda function to find resources related to this stack
        const secretParamName = `${stackProps.stackPrefix}Config_${stage}`

        // Lambda function for the API
        const lambdaFuncs = new LambdaAPI(this, `LambdaAPI_${stage}`, {
            logGroup: this.logGroup,
            vpc: vpcStack.vpc,
            dbAccessSG: rdsDatabase.dbIngressSg,
            vpcSecurityGroup: vpcStack.endpointsSG,
            env: {
                SSM_PARAM: secretParamName,
                SECRET_NAME: secretName,
                REGION: stackProps.region
            }
        })

        const s3Buckets = new S3BucketsConstruct(this, `S3Buckets_${stage}`)

        const ssmParams = new SSMParametersConstruct(
            this,
            secretParamName,
            secretParamName,
            {
                ...stackProps,
                // Strip off any trailing slashes and re-add /api. A little tedious but thorough
                apiUrl: `${lambdaFuncs.lambdaAPIGateway.url.replace(/\/$/g, '')}/api`,
                functions: lambdaFuncs.functions,
                cognito: {
                    userPoolId: vpcStack.userPool.userPoolId,
                    userPoolWebClientId: cognitoClient.client.userPoolClientId,
                    hostedDomain: `${stackProps.cognitoDomainPrefix}.auth.${stackProps.region}.amazoncognito.com`
                },
                s3: {
                    webBucket: s3Buckets.webBucket.bucketName
                },
                bastionIp: vpcStack.bastionIp,
                cdnDomain: s3Buckets.cdn && s3Buckets.cdn.distributionDomainName,
                db: {
                    dbName,
                    endpoint: rdsDatabase.endpointUrl,
                    port: rdsDatabase.endpointPort
                }
            },
            {
                vpc: vpcStack.vpc
            }
        )

        // Give the lambda function access to the DB
        lambdaFuncs.lambdaGQLAPI.addToRolePolicy(
            new iam.PolicyStatement({
                resources: [rdsDatabase.dbClusterArn],
                actions: [
                    'rds:DescribeDBClusters',
                    'rds-data:ExecuteStatement',
                    'rds-data:BatchExecuteStatement',
                    'rds-data:BeginTransaction',
                    'rds-data:CommitTransaction',
                    'rds-data:RollbackTransaction'
                ]
            })
        )
        // Give the lambda function access to the Secrets Manager
        // https://github.com/goranopacic/dataapi-demo/blob/master/lib/dataapi-demo-stack.ts
        lambdaFuncs.lambdaGQLAPI.addToRolePolicy(
            new iam.PolicyStatement({
                resources: [`${rdsDatabase.secret.secretArn}*`],
                actions: ['secretsmanager:GetSecretValue']
            })
        )
        // Now handle the functions that need access to the SSM Parameters
        const needSSMPermissions = [lambdaFuncs.lambdaGQLAPI, lambdaFuncs.lambdaAuth]
        // Create a general policy for access to SSM
        const ssmAccessPolicy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [`arn:aws:ssm:${stackProps.region}:${awsConfig.account}:parameter/${secretParamName}`],
            actions: ['ssm:Get*', 'ssm:Describe*']
        })
        // We would have used the .grantRead on the SSM parameter but that generated a circular dependency.
        // Meaning: We don't have the ARN for the SSM before we need to set the Lambda function policies because
        // We need information FROM the lambda functions to store in the SSM parameter
        // Solution is to just build the expected ARN string by hand. A little more brittle but gets us around the
        // issue.
        needSSMPermissions.forEach((construct) => {
            construct.addToRolePolicy(ssmAccessPolicy)
        })
    }
}

export default NAMCBUgDbStack
