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

/**
 * Distance from a point (mirrors the GQL type)
 */
export type QueryDistance = {
    latitude: number
    longitude: number
    distance: number
}

// This type has no analogous representation in GQL but we use it to check
// exclusivity of filter parameters
export type QueryFilter = {
    sampleIds: number[]
    boxIds: number[]
    projectIds: number[]
    entityIds: number[]
    siteIds: number[]
    polygon: string
    pointDistance: QueryDistance
}

export type Sample = {
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
    customerSiteCode: string
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
    geographyChanged: string
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

export type Project = {
    projectId: number
    projectName: string
    isPrivate: boolean
    contactId: number
    contactName: string
    description: string
    sampleCount: number
    modelCount: number
    createdDate: string
    updatedDate: string
}

export type Taxonomy = {
    taxonomyId: number
    scientificName: string
    levelId: number
    levelName: string
    parentTaxonomyId: number
    parentScientificName: string
    parentLevelId: number
    parentLevelName: string
    notes: string
    metadata: string
    createdDate: string
    updatedDate: string
}

export type TaxonomyTree = {
    taxonomyId: number
    scientificName: string
    levelId: number
    levelName: string
    parentId: number
}

export type Predictor = {
    predictorId: number
    predictorName: string
    abbreviation: string
    description: string
    source: string
    units: string
    calculationScript: string
    predictorType: string
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

export type ModelCondition = {
    modelId: number
    ConditionId: number
    condition: string
    displayText: string
    description: string
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

export type Translation = {
    translationId: number
    translationName: string
    description: string
    isActive: boolean
    taxaCount: number
    createdDate: string
    updatedDate: string
}

export type TranslationTaxa = {
    translationId: number
    translationName: string
    taxonomyId: number
    levelId: number
    levelName: string
    originalScientificName: string
    translationScientificName: string
    isFinal: boolean
}

export type PlanktonSample = {
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

export type DriftSample = {
    sampleId: number
    netArea: number
    netDuration: number
    streamDepth: number
    netDepth: number
    netVelocity: number
    updatedDate: string
}

export type FishSample = {
    sampleId: number
    taxonomyId: number
    scientificName: string
    levelId: number
    levelName: string
    fishLength: number
    fishMass: number
    updatedDate: string
}

export type MassSample = {
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

export type SampleTaxa = {
    sampleId: number
    taxonomyId: number
    scientificName: string
    levelId: number
    levelName: string
    abundance: number
}

export type GeneralizedSampleTaxa = {
    sampleId: number
    taxonomyId: number
    scientificName: string
    levelId: number
    levelName: string
    lifeStageId: number
    lifeStage: string
    lifeStageAbbreviation: string
    bugSize: number
    rawCount: number
    labSplit: number
    fieldSplit: number
    correctedCount: number
    rawBigRareCount: number
}

export type Attribute = {
    attributeId: number
    attributeName: string
    attributeType: string
    label: string
    description: string
    metadata: string
    createdDate: string
    updatedDate: string
}

export type AttributeValue = {
    taxonomyId: number
    scientificName: string
    levelId: number
    levelName: string
    attributeName: string
    attributeType: string
    label: string
    attributeValue: string
}

export type Metric = {
    metricId: number
    metricName: string
    displayText: string
    metricTypeId: number
    groupId: number
    groupName: string
    formulaId: number
    formulaName: string
    codeFunction: string
    isStandardized: boolean
    perturbDirection: string
    description: string
    createdDate: string
    updatedDate: string
}

export type MetricResult = {
    sampleId: number
    groupId: number
    groupName: string
    metricId: number
    metricName: string
    metricValue: string
}

export type ModelResult = {
    sampleId: number
    siteId: number
    siteName: string
    modelId: number
    modelName: string
    modelVersion: string
    modelResult: number
    condition: string
    fixCount: number
    notes: string
    metadata: string
    createdDate: string
    updatedDate: string
}

export type FishDiet = {
    sampleId: number
    sampleDate: string
    siteId: number
    siteName: string
    fishWeight: number
    fishLength: number
    fishTaxonomyId: number
    fishScientificName: string
    notes: string
    metadata: string
    organicWeight: number
    inorganicWeight: number
    otherWeight: number
    createdDate: string
    updatedDate: string
    taxonomyId: number
    scientificName: string
    lifeStageId: number
    lifeStage: string
    count: number
    weight: number
}

export type Organization = {
    entityId: number
    organizationName: string
    organizationType: string
    isLab: boolean
    address1: string
    address2: string
    city: string
    usState: string
    country: string
    zipCode: string
    phone: string
    fax: string
    website: string
    notes: string
    metadata: string
    createdDate: string
    updatedDate: string
}
