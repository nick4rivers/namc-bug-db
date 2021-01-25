export type HelloResponse = {
    message: string
    friendly: boolean
}

export type Sample = {
    sampleId: number
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
