import { SSMParameter, SecretDBCredentials } from '@namcbugdb/aws-cdk-stack';
export declare function getParameter(paramName: string, region: string): Promise<SSMParameter>;
export declare function getSecret(secretName: string, region: string): Promise<SecretDBCredentials>;
