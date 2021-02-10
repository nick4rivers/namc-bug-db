import { AWSTagsDef, CDKStages, StackConfigProps, AWSConfig } from './types'

// Sanity check here for mandatory environment variabels
const mandatoryKeys = ['CDK_ACCOUNT', 'CDK_REGION', 'CDK_STAGE', 'EC2_KEYNAME']
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
export const stageTags: AWSTagsDef = {
    ...globalTags,
    stage
}

export const stackProps: StackConfigProps = {
    cognitoDomainPrefix: `namc-bugdb`,
    stackPrefix: 'NAMC_BugDB_',
    isDev: stage === CDKStages.STAGING,
    stage,
    globalTags,
    region: process.env.CDK_REGION as string
}

// These are the global aws config parameters so we shouldn't be accessing process.env
// anywhere else.
export const awsConfig: AWSConfig = {
    SSHKeyName: process.env.EC2_KEYNAME as string,
    account: process.env.CDK_ACCOUNT as string,
    region: process.env.CDK_REGION as string
}
