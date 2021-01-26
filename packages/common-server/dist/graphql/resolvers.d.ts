import { HelloResponse, Sample } from '@namcbugdb/common';
import { BoxState, Site, Individual, Box } from '@namcbugdb/common';
declare const _default: {
    Query: {
        helloWorld: (obj: any, { name }: {
            name: any;
        }, ctx: any, info: any) => HelloResponse;
        samples: (obj: any, args: any, ctx: any, info: any) => Promise<Sample[]>;
        boxStates: (obj: any, args: any, ctx: any, info: any) => Promise<BoxState[]>;
        sites: (obj: any, args: any, ctx: any, info: any) => Promise<Site[]>;
        individuals: (obj: any, args: any, ctx: any, info: any) => Promise<Individual[]>;
        boxes: (obj: any, args: any, ctx: any, info: any) => Promise<Box[]>;
    };
};
export default _default;
