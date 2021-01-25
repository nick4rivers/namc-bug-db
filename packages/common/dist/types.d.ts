export declare type HelloResponse = {
    message: string;
    friendly: boolean;
};
export declare type Sample = {
    sampleId: number;
};
export declare type BoxState = {
    boxStateId: number;
};
export declare type Site = {
    siteId: number;
    siteName: string;
    systemId: number;
    systemName: string;
    ecosystemId: number;
    ecosystemName: string;
    waterbody: string;
    longitude: number;
    latitude: number;
};
export declare type Individual = {
    entityId: number;
    firstName: string;
    lastName: string;
    initials: string;
    affilitationId: number;
    affiliation: string;
    email: string;
    title: string;
    address1: string;
    address2: string;
    city: string;
    stateName: string;
    countryName: string;
    zipCode: string;
    phone: string;
    fax: string;
};
