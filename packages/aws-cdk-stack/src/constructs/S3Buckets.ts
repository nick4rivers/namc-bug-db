import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import * as cf from '@aws-cdk/aws-cloudfront'
import * as acm from '@aws-cdk/aws-certificatemanager'

import { stageTags } from '../config'
import { addTagsToResource } from './tags'
// import { CDKStages } from '../types'
import { stackProps } from '../config'

class S3Buckets extends cdk.Construct {
    readonly webBucket: s3.Bucket
    readonly cdn: cf.CloudFrontWebDistribution
    readonly cert: acm.Certificate

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id)

        // Use for data buckets later if we have any
        // const removalPolicy =
        //     stackProps.stage === CDKStages.PRODUCTION ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY

        const safePrefix = stackProps.stackPrefix.toLowerCase().replace(/[^a-z]/gi, '-')
        const webBucketName = `${safePrefix}docs-${stackProps.stage}`

        // S3 Postgres Documentation bucket:
        // ------------------------------------------------------------------------
        this.webBucket = new s3.Bucket(this, `Docs_Bucket_${stackProps.stage}`, {
            bucketName: webBucketName,
            // On production we access this bucket using the CDN
            accessControl: s3.BucketAccessControl.PUBLIC_READ,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: '404.html',
            publicReadAccess: true,
            // This bucket is always ephemeral. No data stored there. It can always be
            // recreated perfectly from code.
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })

        // We only need the CDN in production
        //  This is a low-traffic site. Keep it simple. No cloudfront for DEV
        // if (stackProps.stage === CDKStages.PRODUCTION) {
        //     this.cert = new acm.Certificate(this, `S3WebCert_${stackProps.stage}`, {
        //         domainName: webBucketName,
        //         validation: acm.CertificateValidation.fromDns()
        //     })

        //     this.cdn = new cf.CloudFrontWebDistribution(this, `CDN_${stackProps.stage}`, {
        //         priceClass: cf.PriceClass.PRICE_CLASS_100,
        //         originConfigs: [
        //             {
        //                 behaviors: [
        //                     {
        //                         isDefaultBehavior: true
        //                     }
        //                 ],
        //                 s3OriginSource: {
        //                     s3BucketSource: this.webBucket
        //                 }
        //             }
        //         ]
        //     })
        //     addTagsToResource(this.cert, stageTags)
        //     addTagsToResource(this.cdn, stageTags)
        // }

        addTagsToResource(this.webBucket, stageTags)
    }
}

export default S3Buckets
