import * as cdk from '@aws-cdk/core'
import * as cw from '@aws-cdk/aws-logs'
// import log from 'loglevel'
// import { VpcStack } from '@northarrowresearch/nar-aws-cdk'

import { StackStages } from './types'
// import axios from 'axios'
// import { addTagsToResource } from './constructs/tags'
import LambdaAPI from './constructs/LambdaAPI'

class NAMCBUgDbStack extends cdk.Stack {
    readonly logGroup: cw.LogGroup
    constructor(scope: cdk.App, id: string, stage: StackStages, props?: cdk.StackProps) {
        super(scope, id, props)

        this.logGroup = new cw.LogGroup(this, `NamcBugDbLogs_${stage}`, {
            logGroupName: `NamcBugDbLogs_${stage}`,
            retention: 14
        })

        const lambdaGraphQLAPI = new LambdaAPI(this, `LambdaAPI_${stage}`, stage, {
            logGroup: this.logGroup
        })
    }
}

export default NAMCBUgDbStack
