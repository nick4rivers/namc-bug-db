// These types are mainly used by the CDK

export enum CDKStages {
    PRODUCTION = 'production',
    STAGING = 'staging'
}

export type AWSTagsDef = {
    [key: string]: string
}

export type StackConfigProps = {
    stackPrefix: string
    isDev: boolean
    stage: string
    globalTags: AWSTagsDef
    region: string
}

export type AWSConfig = {
    vpcName: string
    SSHKeyName: string
    account: string
    region: string
}

// This is the final shape that gets used as the SSM configuration object that everything else uses
export type SSMSecret = StackConfigProps & {
    // s3: {
    //     warehouse: string
    //     uploads: string
    // }
    apiUrl: string
    functions: { [key: string]: string }
    cognito: {
        userPoolId: string
        userPoolWebClientId: string
        hostedDomain: string
    }
    s3: { [key: string]: string }
    cdnDomain?: string
}
