import * as cdk from '@aws-cdk/core'
import * as cw from '@aws-cdk/aws-logs'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as iam from '@aws-cdk/aws-iam'
// import log from 'loglevel'
// import { VpcStack } from '@northarrowresearch/nar-aws-cdk'

import { StackConfigProps, AWSConfig } from './types'
// import { addTagsToResource } from './constructs/tags'
import LambdaAPI from './constructs/Lambda'
import EC2Bastion from './constructs/EC2Bastion'
import SSMParametersConstruct from './constructs/SSMParameters'
import S3BucketsConstruct from './constructs/S3Buckets'

class NAMCBUgDbStack extends cdk.Stack {
    readonly logGroup: cw.LogGroup
    constructor(
        scope: cdk.App,
        id: string,
        cdkProps: cdk.StackProps,
        awsConfig: AWSConfig,
        stackProps: StackConfigProps
    ) {
        super(scope, id, cdkProps)
        const stage = stackProps.stage

        // VPC Lookup: Instead of creating a new VPC we're going to look ours up from a pre-exisitng external stack
        const vpc = ec2.Vpc.fromLookup(this, `${stackProps.stackPrefix}VPC_LOOKUP_${stage}`, {
            vpcName: awsConfig.vpcName
        })

        // AWS Cloudwatch Logs
        this.logGroup = new cw.LogGroup(this, `${stackProps.stackPrefix}Logs_${stage}`, {
            logGroupName: `${stackProps.stackPrefix}_Logs_${stage}`,
            retention: 14
        })

        // EC2 Bastion box to access the rest of our services from:
        const bastionBox = new EC2Bastion(this, `${stackProps.stackPrefix}EC2Bastion_${stage}`, stackProps, {
            vpc
        })

        // Lambda function for the API
        const lambdaGraphQLAPI = new LambdaAPI(this, `${stackProps.stackPrefix}LambdaAPI_${stage}`, stackProps, {
            logGroup: this.logGroup,
            env: {}
        })

        // The secrets get used by our lambda function to find resources related to this stack
        const secretParamName = `${stackProps.stackPrefix}Config_${stage}`

        const ssmParams = new SSMParametersConstruct(this, secretParamName, secretParamName, {
            ...stackProps,
            // Strip off any trailing slashes and re-add /api. A little tedious but thorough
            apiUrl: `${lambdaGraphQLAPI.lambdaAPIGateway.url.replace(/\/$/g, '')}/api`,
            functions: lambdaGraphQLAPI.functions
        })

        const s3Buckets = new S3BucketsConstruct(this, `${stackProps.stackPrefix}S3Buckets_${stage}`, stackProps)

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
