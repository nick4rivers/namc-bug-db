export declare const getPool: () => any;
export declare const getGeoRecordEPSG: (pool: any, coords: any, epsg: any) => Promise<any>;
export declare const getGeoRecord: (pool: any, coords: any) => Promise<any>;
export declare const getRecord: (pool: any, nhdplusid: any) => Promise<any>;
export declare const upstreamCatchment: (pool: any, nhdplusid: any) => Promise<any>;
export declare const catchmentPoly: (pool: any, nhdplusid: any) => Promise<any>;
export declare const fieldDefs: (pool: any) => Promise<any>;
