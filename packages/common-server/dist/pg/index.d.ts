import { Pool } from 'pg';
export declare const getPool: () => Promise<Pool>;
export declare const getSamples: (pool: any, limit: number, offset: number) => Promise<any>;
export declare const getBoxStates: (pool: any, limit: number, nextToken: number) => Promise<any>;
export declare const getSites: (pool: any, limit: number, offset: number) => Promise<any>;
export declare const getSiteInfo: (pool: any, siteId: number) => Promise<any>;
export declare const getIndividuals: (pool: any, limit: number, nextToken: number) => Promise<any>;
export declare const getBoxes: (pool: any, limit: number, offset: number) => Promise<any>;
