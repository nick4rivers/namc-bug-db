import { Pool } from 'pg';
import { DBReturnPromiseType } from '../types';
export declare const getPool: () => Promise<Pool>;
export declare const getSamples: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getSites: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getSiteInfo: (pool: any, siteId: number) => DBReturnPromiseType;
export declare const getIndividuals: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getBoxes: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getProjects: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getTaxonomy: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getTaxonomyTree: (pool: any, taxonomyId: number) => DBReturnPromiseType;
export declare const getPredictors: (pool: any, limit: number, offset: number, modelId: any) => DBReturnPromiseType;
export declare const getModels: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getModelInfo: (pool: any, modelId: number) => DBReturnPromiseType;
export declare const getSitePredictorValues: (pool: any, limit: number, offset: number, siteId: any) => DBReturnPromiseType;
export declare const getSampleInfo: (pool: any, sampleId: number) => DBReturnPromiseType;
export declare const getBoxInfo: (pool: any, boxId: number) => DBReturnPromiseType;
export declare const getSamplePredictorValues: (pool: any, sampleId: number) => DBReturnPromiseType;
export declare const getModelPredictors: (pool: any, limit: number, offset: number, modelId: number) => DBReturnPromiseType;
export declare const getTranslations: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getTranslationTaxa: (pool: any, limit: number, offset: number, translationId: number) => DBReturnPromiseType;
export declare const getPlanktonSamples: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getDriftSamples: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getFishSamples: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getMassSamples: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getAttributes: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getTaxaAttributes: (pool: any, taxonomyId: number, limit: number, offset: number) => DBReturnPromiseType;
export declare const getModelThresholds: (pool: any, modelId: number) => DBReturnPromiseType;
export declare const getMetrics: (pool: any, limit: number, offset: number) => DBReturnPromiseType;
export declare const getModelResults: (pool: any, limit: number, offset: number, sampleIds: any) => DBReturnPromiseType;
export declare const getFishDiet: (pool: any, limit: number, offset: number, sampleIds: any) => DBReturnPromiseType;
export declare const setSitePredictorValue: (pool: any, siteId: number, predictorId: number, value: string) => DBReturnPromiseType;
export declare const setSamplePredictorValue: (pool: any, sampleId: number, predictorId: number, value: string) => DBReturnPromiseType;
export declare const setSiteCatchment: (pool: any, siteId: number, catchment: string) => DBReturnPromiseType;
export declare const createTranslation: (pool: any, translationName: string, description: string) => DBReturnPromiseType;
export declare const setTranslationTaxa: (pool: any, translationId: number, taxonomyId: number, alias: string, isFinal: boolean) => DBReturnPromiseType;
export declare const deleteTranslationTaxa: (pool: any, translationId: number, taxonomyId: number) => DBReturnPromiseType;
export declare const setTaxonomy: (pool: any, taxonomyId: number, scientificName: string, levelId: number, parentId: number, author: string, year: string, notes: string, metadata: string) => DBReturnPromiseType;
export declare const getSampleTaxaRaw: (pool: any, sampleIds: number[]) => DBReturnPromiseType;
export declare const getBoxTaxaRaw: (pool: any, boxIds: number[]) => DBReturnPromiseType;
export declare const getProjectTaxaRaw: (pool: any, projectIds: number[]) => DBReturnPromiseType;
export declare const getPointTaxaRawQuery: (pool: any, longitude: any, latitude: any, distance: any) => DBReturnPromiseType;
export declare const getPolygonTaxaRawQuery: (pool: any, polygon: string) => DBReturnPromiseType;
export declare const getSampleTaxaGeneralized: (pool: any, sampleId: number) => DBReturnPromiseType;
export declare const getSampleTaxaTranslation: (pool: any, sampleId: number, translationId: number) => DBReturnPromiseType;
export declare const getSampleTaxaRarefied: (pool: any, sampleId: number, fixedCount: number) => DBReturnPromiseType;
export declare const getSampleTaxaTranslationRarefied: (pool: any, sampleId: number, translationId: number, fixedCount: number) => DBReturnPromiseType;
export declare const getSampleMetrics: (pool: any, sampleIds: number[], translationId: number, fixedCount: number) => DBReturnPromiseType;
export declare const getBoxMetrics: (pool: any, boxIds: number[], translationId: number, fixedCount: number) => DBReturnPromiseType;
export declare const getProjectMetrics: (pool: any, projectIds: number[], translationId: number, fixedCount: number) => DBReturnPromiseType;
export declare const createProject: (pool: any, projectName: string, isPrivate: boolean, contactId: number, description: string, metadata: string) => DBReturnPromiseType;
export declare const addProjectSamples: (pool: any, projectId: number, sampleIds: number[]) => DBReturnPromiseType;
export declare const addProjectBoxes: (pool: any, projectId: number, boxIds: number[]) => DBReturnPromiseType;
export declare const removeProjectSamples: (pool: any, projectId: number, sampleIds: number[]) => DBReturnPromiseType;
export declare const deleteProject: (pool: any, projectId: number) => DBReturnPromiseType;