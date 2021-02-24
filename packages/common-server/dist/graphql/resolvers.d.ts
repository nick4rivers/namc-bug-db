import { Sample, AuthResponse, BoxState, Site, SiteInfo, SampleOrganism, Project, Taxonomy, Box, PaginatedRecords, Predictor, Model, SitePredictorValue } from '@namcbugdb/common';
declare const _default: {
    Query: {
        auth: (obj: any, args: any, ctx: any) => Promise<AuthResponse>;
        samples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<PaginatedRecords<Sample>>;
        boxStates: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<BoxState>>;
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
    };
};
export default _default;
