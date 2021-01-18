import * as cdk from '@aws-cdk/core'
import { AWSTagsDef, CDKStages, StackConfigProps } from './types'

// Sanity check here for mandatory environment variabels
const mandatoryKeys = ['CDK_ACCOUNT', 'CDK_REGION', 'CDK_STAGE', 'CDK_VPC_NAME', 'EC2_KEYNAME']
mandatoryKeys.forEach((key) => {
    if (!process.env[key]) {
        console.log(process.env)
        throw new Error(`Missing environment variable: ${key}`)
    }
})

export const globalTags: AWSTagsDef = {
    app: 'NAMCBugDB'
}

// The stage gets hardcoded at the beginning and added to the mandatory tags
// So we can differentiate them in the billing dashboard
const stage = process.env.CDK_STAGE as CDKStages
if (!stage || Object.values(CDKStages).indexOf(stage as CDKStages) === -1) {
    throw new Error(`You must select a stage: ${Object.values(CDKStages).join(', ')}`)
}
globalTags['stage'] = stage

export const stackProps: StackConfigProps = {
    stackPrefix: 'NAMC_BugDB_',
    isDev: stage === CDKStages.STAGING,
    stage,
    globalTags,
    region: cdk.Stack.of(this).region
}

// These are the global aws config parameters so we shouldn't be accessing process.env
// anywhere else.
export const awsConfig = {
    vpcName: process.env.CDK_VPC_NAME,
    SSHKeyName: process.env.EC2_KEYNAME,
    account: process.env.CDK_ACCOUNT,
    region: process.env.CDK_REGION
}
