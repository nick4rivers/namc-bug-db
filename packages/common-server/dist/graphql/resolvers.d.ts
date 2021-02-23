import { Sample, AuthResponse, BoxState, Site, SiteInfo, SampleOrganism, Project, Taxonomy, Box, PaginatedRecords } from '@namcbugdb/common';
declare const _default: {
    Query: {
        auth: (obj: any, args: any, ctx: any, info: any) => Promise<AuthResponse>;
        samples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<PaginatedRecords<Sample>>;
        boxStates: (obj: any, { limit, nextToken }: {
            limit: any;
            nextToken: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<BoxState[]>;
        sites: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<Site[]>;
        siteInfo: (obj: any, { siteId }: {
            siteId: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<SiteInfo>;
        sampleOrganisms: (obj: any, { sampleId }: {
            sampleId: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<SampleOrganism[]>;
        boxes: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<Box[]>;
        projects: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<Project[]>;
        taxonomy: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<Taxonomy[]>;
    };
};
export default _default;
