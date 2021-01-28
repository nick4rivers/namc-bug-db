import { Sample, AuthResponse, BoxState, Site, Individual, Box, PaginatedRecords } from '@namcbugdb/common';
declare const _default: {
    Query: {
        auth: (obj: any, args: any, ctx: any, info: any) => Promise<AuthResponse>;
        samples: (obj: any, { limit, nextToken }: {
            limit: any;
            nextToken: any;
        }, ctx: any, info: any) => Promise<PaginatedRecords<Sample>>;
        boxStates: (obj: any, { limit, nextToken }: {
            limit: any;
            nextToken: any;
        }, ctx: any, info: any) => Promise<BoxState[]>;
        sites: (obj: any, { limit, nextToken }: {
            limit: any;
            nextToken: any;
        }, ctx: any, info: any) => Promise<Site[]>;
        individuals: (obj: any, { limit, nextToken }: {
            limit: any;
            nextToken: any;
        }, ctx: any, info: any) => Promise<Individual[]>;
        boxes: (obj: any, { limit, nextToken }: {
            limit: any;
            nextToken: any;
        }, ctx: any, info: any) => Promise<Box[]>;
    };
};
export default _default;
