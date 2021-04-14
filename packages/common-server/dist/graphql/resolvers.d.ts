import { AuthResponse, Box, BoxInfo, Model, ModelInfo, ModelPredictor, PaginatedRecords, Predictor, Project, Sample, SampleInfo, SampleOrganism, SamplePredictorValue, Site, SiteInfo, SitePredictorValue, Taxonomy } from '@namcbugdb/common';
declare const _default: {
    Query: {
        auth: (obj: any, args: any, ctx: any) => Promise<AuthResponse>;
        samples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<PaginatedRecords<Sample>>;
        sites: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Site>>;
        siteInfo: (obj: any, { siteId }: {
            siteId: any;
        }, { user }: {
            user: any;
        }) => Promise<SiteInfo>;
        sampleInfo: (obj: any, { sampleId }: {
            sampleId: any;
        }, { user }: {
            user: any;
        }) => Promise<SampleInfo>;
        boxInfo: (obj: any, { boxId }: {
            boxId: any;
        }, { user }: {
            user: any;
        }) => Promise<BoxInfo>;
        modelInfo: (obj: any, { modelId }: {
            modelId: any;
        }, { user }: {
            user: any;
        }) => Promise<ModelInfo>;
        samplePredictorValues: (obj: any, { sampleId }: {
            sampleId: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<SamplePredictorValue>>;
        sampleOrganisms: (obj: any, { limit, offset, sampleId, boxId, siteId, sampleYear, typeId }: {
            limit: any;
            offset: any;
            sampleId: any;
            boxId: any;
            siteId: any;
            sampleYear: any;
            typeId: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<SampleOrganism>>;
        projectOrganisms: (obj: any, { limit, offset, projectIds }: {
            limit: any;
            offset: any;
            projectIds: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<SampleOrganism>>;
        boxes: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Box>>;
        projects: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Project>>;
        taxonomy: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Taxonomy>>;
        predictors: (obj: any, { limit, offset, modelId }: {
            limit: any;
            offset: any;
            modelId: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Predictor>>;
        models: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Model>>;
        sitePredictorValues: (obj: any, { limit, offset, siteId }: {
            limit: any;
            offset: any;
            siteId: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<SitePredictorValue>>;
        modelPredictors: (obj: any, { limit, offset, modelId }: {
            limit: any;
            offset: any;
            modelId: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<ModelPredictor>>;
    };
    Mutation: {
        setSitePredictorValue: (obj: any, { siteId, predictorId, value }: {
            siteId: any;
            predictorId: any;
            value: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        setSamplePredictorValue: (obj: any, { sampleId, predictorId, value }: {
            sampleId: any;
            predictorId: any;
            value: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        setSiteCatchment: (obj: any, { siteId, catchment }: {
            siteId: any;
            catchment: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
    };
};
export default _default;
