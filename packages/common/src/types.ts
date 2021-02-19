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
    qualitative: boolean
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
    usState: string
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
    usState: string
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

export type SampleOrganism = {
    organismId: number
    sampleId: number
    lifeStage: string
    bugSize: number
    splitCount: number
    labSplit: number
    fieldSplit: number
    bigRareCount: number
    invalidatedDate: string
    createdDate: string
    updatedDate: string
    taxonomyId: number
    Phylum: string
    Class: string
    Subclass: string
    Order: string
    Suborder: string
    Family: string
    Subfamily: string
    Tribe: string
    Genus: string
    Subgenus: string
    Species: string
    Subspecies: string
}

export type Project = {
    projectId: number
    projectName: string
    projectType: string
    isPrivate: boolean
    contact: string
    autoUpdateSamples: boolean
    description: string
    createdDate: string
    updatedDate: string
    samples: number
}

export type DriftSample = {
    sampleId: number
    netArea: number
    netDuration: number
    streamDepth: number
    netDepth: number
    netVelocity: number
    notes: string
    updatedDate: string
}

export type PlanktonSample = {
    sampleId: number
    diameter: number
    subSampleCount: number
    towLength: number
    volume: number
    allQuot: number
    sizeInterval: number
    towType: string
    notes: string
    updatedDate: string
}

export type Taxonomy = {
    taxonomyId: number
    phylum: string
    class: string
    subclass: string
    order: string
    suborder: string
    family: string
    subfamily: string
    tribe: string
    genus: string
    subgenus: string
    species: string
    subspecies: string
}
