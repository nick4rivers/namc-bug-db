export type AuthResponse = {
    loggedIn: boolean
    userPool: string
    clientId: string
    region: string
    domain: string
}

export interface PaginatedRecords<T> {
    records: [T]
    nextOffset?: number
}

export type Sample = {
    sampleId: number
    boxId: number
    customerName: string
    boxStateName: string
    boxStateId: number
    submitterName: string
    siteId: number
    siteName: string
    siteLatitude: number
    siteLongitude: number
    siteState: string
    sampleDate: string
    sampleYear: number
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
    diameter: number
    subSampleCount: number
    towLength: number
    volume: number
    aliquot: number
    siteInterval: number
    towType: string
    netArea: number
    netDuration: number
    streamDepth: number
    netDepth: number
    netVelocity: number
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
    sampleId: number
    boxId: number
    customerId: number
    customerName: string
    boxStateName: string
    boxStateId: number
    submitterName: string
    siteId: number
    siteName: string
    siteLatitude: number
    siteLongitude: number
    siteState: string
    sampleDate: string
    sampleLatitude: number
    sampleLongitude: number
    sampleTime: string
    typeId: number
    sampleType: string
    methodId: number
    sampleMethod: string
    habitatId: number
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
    diameter: number
    subSampleCount: number
    towLength: number
    volume: number
    aliquot: number
    sizeInterval: number
    towType: string
    netArea: number
    netDuration: number
    streamDepth: number
    netDepth: number
    netVelocity: number
    taxonomyId: number
    lifeStage: string
    bugSize: number
    splitCount: number
    bigRareCount: number
    phylum: string
    class: string
    subClass: string
    order: string
    family: string
    genus: string
    isPrivate: boolean
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

export type Predictor = {
    predictorId: number
    predictorName: string
    abbreviation: string
    description: string
    units: string
    calculationScript: string
    predictorTypeId: number
    predictorTypeName: string
    isTemporal: boolean
    updatedDate: string
    createdDate: string
    modelCount: number
}

export type Model = {
    modelId: number
    modelName: string
    abbreviation: string
    isActive: boolean
    description: string
    predictorCount: number
}

export type SitePredictorValue = {
    predictorId: number
    predictorName: string
    abbreviation: string
    description: string
    predictorTypeName: string
    metadata: string
    createdDate: string
    updatedDate: string
    calculationScript: string
}
