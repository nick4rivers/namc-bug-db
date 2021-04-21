export type AuthResponse = {
    loggedIn: boolean
    userPool: string
    clientId: string
    region: string
    domain: string
}

export type StrObj = Record<string, unknown>

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
    longitude: number
    latitude: number
    usState: string
    waterbodyType: string
    waterbodyCode: string
    waterbodyName: string
    geometryChanged: string
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
    customerId: number
    customerName: string
    submitterId: number
    submittedBy: string
    boxState: string
    boxReceivedDate: string
    sampleCount: number
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
    contactId: number
    contactName: string
    autoUpdateSamples: boolean
    description: string
    sampleCount: number
    modelCount: number
    createdDate: string
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

export type ModelInfo = {
    modelId: number
    modelName: string
    abbreviation: string
    modelType: string
    translationId: number
    translation: string
    extentDescription: string
    platform: string
    referenceSites: number
    groupCount: number
    minimumCount: number
    oeMean: number
    oeStdev: number
    taxonomicEffort: string
    isActive: boolean
    fixedCount: number
    units: string
    description: string
    metadata: string
    predictorCount: number
    createdDate: string
    updatedDate: string
    extent: string
}

export type ModelPredictor = {
    predictorId: number
    predictorName: string
    abbreviation: string
    units: string
    predictorType: string
    isTemporal: boolean
    description: string
    metadata: string
    calculationScript: string
    modelCount: number
    createdDate: string
    updatedDate: string
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

export type SampleInfo = {
    sampleId: number
    boxId: number
    customerName: string
    customerAbbreviation: string
    submittedBy: string
    boxState: string
    siteId: number
    siteName: string
    usState: string
    siteLocation: string
    siteLongitude: number
    siteLatitude: number
    visitId: string
    sampleDate: string
    sampleTime: string
    sampleType: string
    sampleMethod: string
    habitat: string
    sampleLocation: string
    sampleLongitude: number
    sampleLatitude: number
    area: number
    fieldSplit: number
    fieldNotes: string
    labSplit: number
    jarCount: number
    qualitative: boolean
    labNotes: string
    mesh: number
    createdDate: string
    updatedDate: string
    sampleDateChanged: string
    qaSampleId: number
    metadata: string
}

export type BoxInfo = {
    boxId: number
    customerId: number
    customerName: string
    customerAbbreviation: string
    submitterId: number
    submittedBy: string
    boxStateId: number
    boxState: string
    boxReceivedDate: string
    processingCompleteDate: string
    projectedCompleteDate: string
    sampleCount: number
    description: string
    metadata: string
    measurements: boolean
    sorterQa: boolean
    taxaQa: boolean
    createdDate: string
    updatedDate: string
}

export type SamplePredictorValue = {
    predictorId: number
    abbreviation: string
    calculationScript: string
    isTemporal: boolean
    predictorMetadata: string
    predictorValue: string
    predictorValueUpdatedDate: string
    status: string
}

export declare type Translation = {
    translationId: number
    translationName: string
    description: string
    isActive: boolean
    taxaCount: number
    createdDate: string
    updatedDate: string
}

export declare type PlanktonSample = {
    sampleId: number
    diameter: number
    subSampleCount: number
    towLength: number
    volume: number
    aliquot: number
    sizeInterval: number
    towType: string
    updatedDate: string
}

export declare type DriftSample = {
    sampleId: number
    netArea: number
    netDuration: number
    streamDepth: number
    netDepth: number
    netVelocity: number
    updatedDate: string
}

export declare type FishSample = {
    sampleId: number
    taxonomyId: number
    scientificName: string
    levelId: number
    levelName: string
    fishLength: number
    fishMass: number
    updatedDate: string
}

export declare type MassSample = {
    sampleId: number
    typeId: number
    typeAbbreviation: string
    typeName: string
    methodId: number
    methodAbbreviation: string
    methodName: string
    mass: number
    updatedDate: string
}

export declare type RawSampleTaxa = {
    taxonomyId: number
    scientificName: string
    levelId: number
    levelName: string
    lifeStageId: number
    lifeStage: string
    lifeStageAbbreviation: string
    rawCount: number
    correctedCount: number
    rawBigRareCount: number
    correctedBigRareCount: number
}

export declare type GeneralizedSampleTaxa = {
    taxonomyId: number
    scientificName: string
    levelId: number
    levelName: string
    lifeStageId: number
    lifeStage: string
    lifeStageAbbreviation: string
    bugSize: number
    rawCount: number
    correctedCount: number
    rawBigRareCount: number
    correctedBigRareCount: number
}

export declare type TranslationSampleTaxa = {
    taxonomyId: number
    scientificName: string
    aliasName: string
    levelId: number
    levelName: string
    rawCount: number
    correctedCount: number
    rawBigRareCount: number
    correctedBigRareCount: number
}

export declare type RarefiedSampleTaxa = {
    taxonomyId: number
    scientificName: string
    levelId: number
    levelName: string
    organismCount: number
}
