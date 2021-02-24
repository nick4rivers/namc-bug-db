import gql from 'graphql-tag'
// NOTE: We went back to a .JS file because graphql-import seems borked when webpack
// is in the mix

export const queryLimits = {
    samples: 500,
    sampleOrganisms: 100,
    projectOrganisms: 100,
    boxStates: 500,
    sites: 500,
    boxes: 500,
    projects: 500,
    taxonomy: 500,
    predictors: 500,
    models: 500,
    sitePredictorValues: 500
}

const typeDefs = gql`
    schema {
        query: Query
        # mutation: Mutation
    }

    type Query {
        # Get a project and associated metadata
        auth: AuthParams

        siteInfo(siteId: Int!): SiteInfo

        samples(limit: Int = ${queryLimits.samples}, offset: Int): PaginatedSamples
        sampleOrganisms(
            limit: Int = ${queryLimits.sampleOrganisms}
            offset: Int!
            sampleId: Int
            boxId: Int
            siteId: Int
            sampleYear: Int
            typeId: Int
        ): PaginatedSampleOrganisms

        projectOrganisms(projectIds: [Int]!, limit: Int = ${queryLimits.projectOrganisms}, offset: Int =0): PaginatedSampleOrganisms
        boxStates(limit: Int = ${queryLimits.boxStates}, offset: Int = 0): PaginatedBoxStates
        sites(limit: Int = ${queryLimits.sites}, offset: Int = 0): PaginatedSites
        # individuals(limit: Int, offset: Int): [Individual]
        boxes(limit: Int = ${queryLimits.boxes}, offset: Int = 0): PaginatedBoxes
        projects(limit: Int = ${queryLimits.projects}, offset: Int = 0): PaginatedProjects
        taxonomy(limit: Int = ${queryLimits.taxonomy}, offset: Int = 0): PaginatedTaxonomies
        predictors(modelId: Int, limit: Int = ${queryLimits.predictors}, offset: Int = 0): PaginatedPredictors
        models(limit: Int = ${queryLimits.models}, offset: Int = 0): PaginatedModels
        sitePredictorValues(siteId: Int!, limit: Int = ${queryLimits.sitePredictorValues}, offset: Int = 0): PaginatedSitePredictorValues
    }

    # this schema allows the following mutation:
    # type Mutation {

    # }

    type AuthParams {
        loggedIn: Boolean
        userPool: String
        clientId: String
        region: String
        domain: String
    }

    type Sample {
        sampleId: Int
        boxId: Int
        customerName: String
        boxStateName: String
        boxStateId: Int
        submitterName: String
        siteId: Int
        siteName: String
        siteLatitude: Float
        siteLongitude: Float
        siteState: String
        sampleDate: String
        sampleYear: Int
        sampleLatitude: Float
        sampleLongitude: Float
        sampleType: String
        sampleMethod: String
        habitatName: String
        area: Float
        fieldSplit: Float
        labSplit: Float
        jarCount: Int
        qualitative: Boolean
        mesh: Float
        createdDate: String
        updatedDate: String
        qaSampleId: Int
        diameter: Float
        subSampleCount: Float
        towLength: Float
        volume: Float
        aliquot: Float
        siteInterval: Float
        towType: String
        netArea: Float
        netDuration: Float
        streamDepth: Float
        netDepth: Float
        netVelocity: Float
    }

    type BoxState {
        boxStateId: Int
    }

    type Site {
        siteId: Int
        siteName: String
        system: String
        ecosystem: String
        longitude: Float
        latitude: Float
        usState: String
        waterbodyType: String
        waterbodyCode: String
        waterbodyName: String
        createdDate: String
        updatedDate: String
        hasCatchment: Boolean
    }

    type SiteInfo {
        siteId: Int
        siteName: String
        system: String
        ecosystem: String
        location: String
        stX: Float
        stY: Float
        usState: String
        waterbodyTypeName: String
        waterbodyCode: String
        waterbodyName: String
        createdDate: String
        updatedDate: String
        catchment: String
        sampleCount: Int
    }

    #  type Individual {
    #     entityId: Int
    #     firstName: String
    #     lastName: String
    #     initials: String
    #     affilitationId: Int
    #     affiliation: String
    #     email: String
    #     title: String
    #     address1: String
    #     address2: String
    #     city: String
    #     stateName: String
    #     countryName: String
    #     zipCode: String
    #     phone: String
    #     fax: String
    # }

    type Box {
        boxId: Int
        customerName: String
        samples: Int
        SubmitterName: String
        boxStateName: String
        boxReceivedDate: String
        processingCompleteDate: String
        projectedCompleteDate: String
    }

    type SampleOrganism {
        sampleId: Int
        boxId: Int
        customerId: Int
        customerName: String
        boxStateName: String
        boxStateId: Int
        submitterName: String
        siteId: Int
        siteName: String
        siteLatitude: Float
        siteLongitude: Float
        siteState: String
        sampleDate: String
        sampleLatitude: Float
        sampleLongitude: Float
        sampleTime: String
        typeId: Int
        sampleType: String
        methodId: Int
        sampleMethod: String
        habitatId: Int
        habitatName: String
        area: Float
        fieldSplit: Float
        labSplit: Float
        jarCount: Float
        qualitative: Boolean
        mesh: Float
        createdDate: String
        updatedDate: String
        qaSampleId: Int
        diameter: Float
        subSampleCount: Float
        towLength: Float
        volume: Float
        aliquot: Float
        sizeInterval: Float
        towType: String
        netArea: Float
        netDuration: Float
        streamDepth: Float
        netDepth: Float
        netVelocity: Float
        taxonomyId: Int
        lifeStage: String
        bugSize: Float
        splitCount: Float
        bigRareCount: Float
        phylum: String
        class: String
        subClass: String
        order: String
        family: String
        genus: String
        isPrivate: Boolean
    }

    type Project {
        projectId: Int
        projectName: String
        projectType: String
        isPrivate: Boolean
        contact: String
        autoUpdateSamples: Boolean
        description: String
        createdDate: String
        updatedDate: String
        samples: Int
    }

    type Taxonomy {
        taxonomyId: Int
        phylum: String
        class: String
        subclass: String
        order: String
        suborder: String
        family: String
        subfamily: String
        tribe: String
        genus: String
        subgenus: String
        species: String
        subspecies: String
    }

    type Predictor {
        predictorId: Int
        predictorName: String
        abbreviation: String
        description: String
        units: String
        calculationScript: String
        predictorTypeId: Int
        predictorTypeName: String
        isTemporal: Boolean
        updatedDate: String
        createdDate: String
        modelCount: Int
    }

    type Model {
        modelId: Int
        modelName: String
        abbreviation: String
        isActive: Boolean
        description: String
        predictorCount: Int
    }

    type SitePredictorValue {
        predictorId: Int
        predictorName: String
        abbreviation: String
        description: String
        predictorTypeName: String
        metadata: String
        createdDate: String
        updatedDate: String
        calculationScript: String
    }

    # Pagination Types
    type PaginatedBoxStates {
        records: [BoxState]
        nextOffset: Int
    }
    type PaginatedModels {
        records: [Model]
        nextOffset: Int
    }
    type PaginatedSites {
        records: [Site]
        nextOffset: Int
    }
    type PaginatedSamples {
        records: [Sample]
        nextOffset: Int
    }
    type PaginatedSampleOrganisms {
        records: [SampleOrganism]
        nextOffset: Int
    }
    type PaginatedBoxes {
        records: [Box]
        nextOffset: Int
    }
    type PaginatedProjects {
        records: [Project]
        nextOffset: Int
    }
    type PaginatedTaxonomies {
        records: [Taxonomy]
        nextOffset: Int
    }
    type PaginatedPredictors {
        records: [Predictor]
        nextOffset: Int
    }
    type PaginatedSitePredictorValues {
        records: [SitePredictorValue]
        nextOffset: Int
    }
`

export default typeDefs
