export declare enum CDKStages {
    PRODUCTION = "production",
    STAGING = "staging"
}
export declare type AWSTagsDef = {
    [key: string]: string;
};
export declare type StackConfigProps = {
    cognitoDomainPrefix: string;
    stackPrefix: string;
    isDev: boolean;
    stage: string;
    globalTags: AWSTagsDef;
    region: string;
};
export declare type AWSConfig = {
    SSHKeyName: string;
    account: string;
    region: string;
};
export declare type SSMParameter = StackConfigProps & {
    apiUrl: string;
    functions: {
        [key: string]: string;
    };
    cognito: {
        userPoolId: string;
        userPoolWebClientId: string;
        hostedDomain: string;
    };
    bastionIp: string;
    s3: {
        [key: string]: string;
    };
    cdnDomain?: string;
    db: {
        dbName: string;
        endpoint: string;
        port: string;
    };
};
export declare type SecretDBCredentials = {
    username: string;
    password: string;
};
