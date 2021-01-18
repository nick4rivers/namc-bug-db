import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import { globalTags } from '../config'
import { addTagsToResource } from './tags'
import { StackConfigProps, CDKStages } from '../types'

class S3Buckets extends cdk.Construct {
    readonly mainBucket: s3.Bucket
    readonly uploadBucket: s3.Bucket
    readonly tileBucket: s3.Bucket

    constructor(scope: cdk.Construct, id: string, stackProps: StackConfigProps) {
        super(scope, id)

        const removalPolicy =
            stackProps.stage === CDKStages.PRODUCTION ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY

        // S3 Postgres Documentation bucket:
        // TODO: This is a low-traffic site. Keep it simple. No cloudfront
        // ------------------------------------------------------------------------
        this.mainBucket = new s3.Bucket(this, `${stackProps.stackPrefix}Docs_Bucket_${stackProps.stage}`, {
            bucketName: `namc-docs-${stackProps.stage}`,
            // DEV is ephemeral. Production is retained (for obvious reasons)
            removalPolicy
        })
        addTagsToResource(this.mainBucket, globalTags)
    }
}

export default S3Buckets
