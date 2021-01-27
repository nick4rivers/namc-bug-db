import * as cdk from '@aws-cdk/core'
import * as cw from '@aws-cdk/aws-logs'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as iam from '@aws-cdk/aws-iam'
// import log from 'loglevel'
// import { VpcStack } from '@northarrowresearch/nar-aws-cdk'

import { stackProps, awsConfig } from './config'
import { CDKStages } from './types'
import LambdaAPI from './constructs/Lambda'
import EC2Bastion from './constructs/EC2Bastion'
import SSMParametersConstruct from './constructs/SSMParameters'
import S3BucketsConstruct from './constructs/S3Buckets'
import CognitoConstruct from './constructs/Cognito'
import RDSConstruct from './constructs/RDS'

class NAMCBUgDbStack extends cdk.Stack {
    readonly logGroup: cw.LogGroup
    constructor(scope: cdk.App, id: string, cdkProps: cdk.StackProps) {
        super(scope, id, cdkProps)
        const stage = stackProps.stage

        // VPC Lookup: Instead of creating a new VPC we're going to look ours up from a pre-exisitng external stack
        const vpc = ec2.Vpc.fromLookup(this, `VPC_LOOKUP_${stage}`, {
            vpcName: awsConfig.vpcName
        })

        const removalPolicy =
            stackProps.stage === CDKStages.PRODUCTION ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY

        // AWS Cloudwatch Logs
        this.logGroup = new cw.LogGroup(this, `Logs_${stage}`, {
            logGroupName: `${stackProps.stackPrefix}Logs_${stage}`,
            retention: 14,
            // Logs are ephemeral
            removalPolicy
        })

        const cognitoDomainPrefix = `namc-${stackProps.stage}`
        const cognito = new CognitoConstruct(this, `Cognito_${stage}`, { cognitoDomainPrefix })

        // EC2 Bastion box to access the rest of our services from:
        const bastionBox = new EC2Bastion(this, `EC2Bastion_${stage}`, {
            vpc
        })

        // Now deploy the Database
        const dbName = 'bugdb' // default
        const dbUserName = 'bugdb_root' // default

        const database = new RDSConstruct(this, `RDSDB_${stage}`, {
            dbName,
            dbUserName,
            vpc,
            bastion: bastionBox.bastionBox
        })

        // The secrets get used by our lambda function to find resources related to this stack
        const secretParamName = `${stackProps.stackPrefix}Config_${stage}`

        // Lambda function for the API
        const lambdaGraphQLAPI = new LambdaAPI(this, `LambdaAPI_${stage}`, {
            logGroup: this.logGroup,
            dbClusterArn: database.dbClusterArn,
            dbSecretArn: database.secret.secretArn,
            env: {
                SSM_PARAM: secretParamName,
                SECRET_NAME: database.secret.secretName,
                REGION: stackProps.region
            }
        })

        const s3Buckets = new S3BucketsConstruct(this, `S3Buckets_${stage}`)

        const ssmParams = new SSMParametersConstruct(this, secretParamName, secretParamName, {
            ...stackProps,
            // Strip off any trailing slashes and re-add /api. A little tedious but thorough
            apiUrl: `${lambdaGraphQLAPI.lambdaAPIGateway.url.replace(/\/$/g, '')}/api`,
            functions: lambdaGraphQLAPI.functions,
            cognito: {
                userPoolId: cognito.userPool.userPoolId,
                userPoolWebClientId: cognito.client.userPoolClientId,
                hostedDomain: `${cognitoDomainPrefix}.auth.${stackProps.region}.amazoncognito.com`
            },
            s3: {
                webBucket: s3Buckets.webBucket.bucketName
            },
            cdnDomain: s3Buckets.cdn && s3Buckets.cdn.distributionDomainName,
            db: {
                dbName,
                endpoint: database.endpointUrl,
                port: database.endpointPort
            }
        })

        const needSSMPermissions = [lambdaGraphQLAPI.lambdaGQLAPI]
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
