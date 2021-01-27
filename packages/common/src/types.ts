export type AuthResponse = {
    loggedIn: boolean
    userPool: string
    clientId: string
    region: string
    domain: string
}

export type Sample = {
    sampleId: number
    boxId: number
    customerId: number
    customerName: string
    siteId: number
    siteName: string
    sampleDate: string
    sampleTime: string
    typeId: number
    typeName: string
    methodId: number
    methodName: string
    habitatId: number
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
    systemId: number
    systemName: string
    ecosystemId: number
    ecosystemName: string
    waterbody: string
    longitude: number
    latitude: number
    // createdDate:
    // updatedDate:
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
    samples: number
    submitterId: number
    SubmitterName: string
    boxStateId: number
    boxStateName: string
    boxReceivedDate: string
    processingCompleteDate: string
    projectedCompleteDate: string
    projectId: number
    projectName: string
}
