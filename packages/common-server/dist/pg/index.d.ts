import { Pool } from 'pg';
export declare const getPool: () => Promise<Pool>;
export declare const getSamples: (pool: any, limit: number, offset: number) => Promise<any>;
export declare const getSites: (pool: any, limit: number, offset: number) => Promise<any>;
export declare const getSiteInfo: (pool: any, siteId: number) => Promise<any>;
export declare const getIndividuals: (pool: any, limit: number, offset: number) => Promise<any>;
export declare const getBoxes: (pool: any, limit: number, offset: number) => Promise<any>;
export declare const getSampleOrganisms: (pool: any, limit: number, offset: number, sampleId: number, boxId: number, siteId: number, sampleYear: number, typeId: number) => Promise<any>;
export declare const getProjectOrganisms: (pool: any, projectIds: number[], limit: number, offset: number) => Promise<any>;
export declare const getProjects: (pool: any, limit: number, offset: number) => Promise<any>;
export declare const getTaxonomy: (pool: any, limit: number, offset: number) => Promise<any>;
export declare const getPredictors: (pool: any, limit: number, offset: number, modelId: any) => Promise<any>;
export declare const getModels: (pool: any, limit: number, offset: number) => Promise<any>;
export declare const getModelInfo: (pool: any, modelId: number) => Promise<any>;
export declare const getSitePredictorValues: (pool: any, limit: number, offset: number, siteId: any) => Promise<any>;
export declare const getSampleInfo: (pool: any, sampleId: number) => Promise<any>;
export declare const getBoxInfo: (pool: any, boxId: number) => Promise<any>;
export declare const getSamplePredictorValues: (pool: any, sampleId: number) => Promise<any>;
export declare const getModelPredictors: (pool: any, limit: number, offset: number, modelId: number) => Promise<any>;
export declare const setSitePredictorValue: (pool: any, siteId: number, predictorId: number, value: string) => Promise<number>;
export declare const setSamplePredictorValue: (pool: any, sampleId: number, predictorId: number, value: string) => Promise<number>;
export declare const setSiteCatchment: (pool: any, siteId: number, catchment: string) => Promise<number>;
