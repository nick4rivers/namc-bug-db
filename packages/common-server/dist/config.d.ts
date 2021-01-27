import NodeCache from 'node-cache';
import { SSMParameter, SecretDBCredentials } from '@namcbugdb/aws-cdk-stack';
export declare const NODECACHE: NodeCache;
export declare const awsRegion: string;
export declare const ssmName: string;
export declare const getConfigPromise: () => Promise<SSMParameter>;
export declare const getDBSecretCredentials: () => Promise<SecretDBCredentials>;
