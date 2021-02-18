export type AuthResponse = {
    loggedIn: boolean
    userPool: string
    clientId: string
    region: string
    domain: string
}

export interface PaginatedRecords<T> {
    records: [T]
    nextToken: number
}

export type Sample = {
    sampleId: number
    boxId: number
    customerName: string
    siteId: number
    siteName: string
    siteLatitude: number
    siteLongitude: number
    siteState: string
    sampleDate: string
    sampleLatitude: number
    sampleLongitude: number
    sampleType: string
    sampleMethod: string
    habitatName: string
    area: number
    fieldSplit: number
    labSplit: number
    jarCount: number
    qualitative: string
    mesh: number
    createdDate: string
    updatedDate: string
    qaSampleId: number
}

export type BoxState = {
    boxStateId: number
}

export type Site = {
    siteId: number
    siteName: string
    systemName: string
    ecosystemName: string
    longitude: number
    latitude: number
    state: string
    waterbodyType: string
    waterbodyCode: string
    waterbodyName: string
    createdDate: string
    updatedDate: string
    hasCatchment: boolean
}

export type SiteInfo = {
    siteId: number
    siteName: string
    system: string
    ecosystem: string
    location: string
    stX: number
    stY: number
    abbreviation: string
    waterbodyTypeName: string
    waterbodyCode: string
    waterbodyName: string
    createdDate: string
    updatedDate: string
    catchment: string
    sampleCount: number
}

export type Individual = {
    entityId: number
    firstName: string
    lastName: string
    initials: string
    affilitationId: number
    affiliation: string
    email: string
    title: string
    address1: string
    address2: string
    city: string
    stateName: string
    countryName: string
    zipCode: string
    phone: string
    fax: string
}

export type Box = {
    boxId: number
    customerName: string
    samples: number
    SubmitterName: string
    boxStateName: string
    boxReceivedDate: string
    processingCompleteDate: string
    projectedCompleteDate: string
}
