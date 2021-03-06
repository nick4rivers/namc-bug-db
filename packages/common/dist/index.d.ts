export * as types from './types';
export * as util from './util';
export declare const graphql: {
    typeDefs: import("graphql/language/ast").DocumentNode;
    queryLimits: {
        samples: number;
        sites: number;
        boxes: number;
        projects: number;
        taxonomy: number;
        predictors: number;
        models: number;
        organizations: number;
        sitePredictorValues: number;
        modelResults: number;
        translations: number;
        metrics: number;
    };
};
