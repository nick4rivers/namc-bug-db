export * as queries from './queries';
import { Pool } from 'pg';
import { DBReturnPromiseType } from '../types';
export declare const getPool: () => Promise<Pool>;
export declare const pgPromise: (pool: any, query: string, vars?: unknown[]) => DBReturnPromiseType;
export declare type FnQueryParams = {
    name: string;
    args?: unknown[];
    orderBy?: string;
    limit?: number;
    offset?: number;
};
export declare const fnQuery: (pool: any, params: FnQueryParams) => DBReturnPromiseType;
