import { AWSTagsDef, StackStages } from './types'
// Inherit all the config from the server module
import { config } from '@namcbugdb/common-server'

// Sanity check here for mandatory environment variabels
const mandatoryKeys = ['CDK_ACCOUNT', 'CDK_REGION', 'CDK_STAGE', 'CDK_VPC_NAME']
mandatoryKeys.forEach((key) => {
    if (!process.env[key]) {
        console.log(process.env)
        throw new Error(`Missing environment variable: ${key}`)
    }
})

export const globalTags: AWSTagsDef = {
    app: 'NAMCBugDB'
}

const stage = process.env.CDK_STAGE as StackStages
if (!stage || Object.values(StackStages).indexOf(stage as StackStages) === -1) {
    throw new Error(`You must select a stage: ${Object.values(StackStages).join(', ')}`)
}

export const awsConfig = {
    ...config,
    stage,
    vpcName: process.env.CDK_VPC_NAME,
    cdkEnv: {
        account: process.env.CDK_ACCOUNT,
        region: process.env.CDK_REGION
    }
}
