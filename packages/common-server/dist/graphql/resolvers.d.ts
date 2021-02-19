import { Sample, AuthResponse, BoxState, Site, SiteInfo, SampleOrganism, Project, DriftSample, PlanktonSample, Taxonomy, Box, PaginatedRecords } from '@namcbugdb/common';
declare const _default: {
    Query: {
        auth: (obj: any, args: any, ctx: any, info: any) => Promise<AuthResponse>;
        samples: (obj: any, { limit, offset }: {
            limit: any;
<<<<<<< HEAD
            nextToken: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<PaginatedRecords<Sample>>;
=======
            offset: any;
        }, ctx: any, info: any) => Promise<PaginatedRecords<Sample>>;
>>>>>>> samples through API
        boxStates: (obj: any, { limit, nextToken }: {
            limit: any;
            nextToken: any;
<<<<<<< HEAD
        }, { user }: {
            user: any;
        }, info: any) => Promise<BoxState[]>;
        sites: (obj: any, { limit, nextToken }: {
            limit: any;
            nextToken: any;
<<<<<<< HEAD
        }, { user }: {
            user: any;
        }, info: any) => Promise<Site[]>;
=======
=======
        }, ctx: any, info: any) => Promise<BoxState[]>;
        sites: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
>>>>>>> individuals removed. boxes cleaned up
        }, ctx: any, info: any) => Promise<Site[]>;
        siteInfo: (obj: any, { siteId }: {
            siteId: any;
        }, ctx: any, info: any) => Promise<SiteInfo>;
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> sites and siteInfo API endpoints
        individuals: (obj: any, { limit, nextToken }: {
            limit: any;
            nextToken: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<Individual[]>;
        boxes: (obj: any, { limit, nextToken }: {
            limit: any;
            nextToken: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<Box[]>;
=======
=======
        sampleOrganisms: (obj: any, { sampleId }: {
            sampleId: any;
        }, ctx: any, info: any) => Promise<SampleOrganism[]>;
>>>>>>> projects plankton drift taxonomy
        boxes: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, ctx: any, info: any) => Promise<Box[]>;
<<<<<<< HEAD
>>>>>>> individuals removed. boxes cleaned up
=======
        projects: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, ctx: any, info: any) => Promise<Project[]>;
        driftSamples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, ctx: any, info: any) => Promise<DriftSample[]>;
        planktonSamples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, ctx: any, info: any) => Promise<PlanktonSample[]>;
        taxonomy: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, ctx: any, info: any) => Promise<Taxonomy[]>;
>>>>>>> projects plankton drift taxonomy
    };
};
export default _default;
