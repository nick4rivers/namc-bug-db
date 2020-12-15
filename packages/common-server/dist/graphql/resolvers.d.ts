import { HelloResponse, Sample } from '@namcbugdb/common';
declare const _default: {
    Query: {
        helloWorld: (obj: any, { name }: {
            name: any;
        }, ctx: any, info: any) => HelloResponse;
        samples: (obj: any, args: any, ctx: any, info: any) => Promise<Sample[]>;
    };
};
export default _default;
