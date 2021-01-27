import AWS from 'aws-sdk';
export declare function getCognitoClient(region: string): AWS.CognitoIdentityServiceProvider;
export declare function getUserAttributes(cognitoUser: any, attName: string): any;
export declare function getCognitoUsers(cognitoClient: AWS.CognitoIdentityServiceProvider, limit: number, nextToken: string): Promise<any>;
export declare function getCognitoUser(cognitoClient: AWS.CognitoIdentityServiceProvider, sub: string): Promise<any>;
