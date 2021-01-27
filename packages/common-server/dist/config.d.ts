import NodeCache from 'node-cache';
import { SSMSecret } from '@namcbugdb/aws-cdk-stack';
export declare const NODECACHE: NodeCache;
export declare const awsRegion: string;
export declare const ssmName: string;
export declare const getConfigPromise: () => Promise<SSMSecret>;
declare const _default: {
    pg: {
        user: string;
        password: string;
        database: string;
        port: string | number;
        host: string;
    };
};
export default _default;
