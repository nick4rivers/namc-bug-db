export declare enum CDKStages {
    PRODUCTION = "production",
    STAGING = "staging"
}
export declare type AWSTagsDef = {
    [key: string]: string;
};
export declare type StackConfigProps = {
    stackPrefix: string;
    isDev: boolean;
    stage: string;
    globalTags: AWSTagsDef;
    region: string;
};
export declare type AWSConfig = {
    vpcName: string;
    SSHKeyName: string;
    account: string;
    region: string;
};
export declare type SSMSecret = StackConfigProps & {
    apiUrl: string;
    functions: {
        [key: string]: string;
    };
    cognito: {
        userPoolId: string;
        userPoolWebClientId: string;
        hostedDomain: string;
    };
    s3: {
        [key: string]: string;
    };
    cdnDomain?: string;
};
