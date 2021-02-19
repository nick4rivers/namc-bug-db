import gql from 'graphql-tag'
// NOTE: We went back to a .JS file because graphql-import seems borked when webpack
// is in the mix

const typeDefs = gql`
    schema {
        query: Query
        # mutation: Mutation
    }

    type Query {
        # Get a project and associated metadata
        auth: AuthParams

        samples(limit: Int, offset: Int): PaginatedSample
        sampleOrganisms(sampleId: Int!): [SampleOrganism]
        driftSamples(limit: Int, offset: Int): [DriftSample]
        planktonSamples(limit: Int, offset: Int): [PlanktonSample]
        boxStates(limit: Int, nextToken: Int): [BoxState]
        sites(limit: Int, offset: Int): [Site]
        siteInfo(siteId: Int!): SiteInfo
        # individuals(limit: Int, nextToken: Int): [Individual]
        boxes(limit: Int, offset: Int): [Box]
        projects(limit: Int, offset: Int): [Project]
        taxonomy(limit: Int, offset: Int): [Taxonomy]
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

    type PaginatedSample {
        records: [Sample]
        nextToken: Int
    }

    type Sample {
        sampleId: Int
        boxId: Int
        customerName: String
        siteId: Int
        siteName: String
        siteLatitude: Float
        siteLongitude: Float
        siteState: String
        sampleDate: String
        sampleLatitude: Float
        sampleLongitude: Float
        sampleType: String
        sampleMethod: String
        habitatName: String
        area: Float
        fieldSplit: Float
        labSplit: Float
        jarCount: Int
        qualitative: String
        mesh: Float
        createdDate: String
        updatedDate: String
        qaSampleId: Int
    }

    type BoxState {
        boxStateId: Int
    }

    type Site {
        siteId: Int
        siteName: String
        systemName: String
        ecosystemName: String
        longitude: Float
        latitude: Float
        state: String
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
        abbreviation: String
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
        organismId: Int
        sampleId: Int
        lifeStage: String
        bugSize: Float
        splitCount: Float
        labSplit: Float
        fieldSplit: Float
        bigRareCount: Float
        invalidatedDate: String
        createdDate: String
        updatedDate: String
        taxonomyId: Int
        Phylum: String
        Class: String
        Subclass: String
        Order: String
        Suborder: String
        Family: String
        Subfamily: String
        Tribe: String
        Genus: String
        Subgenus: String
        Species: String
        Subspecies: String
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

    type DriftSample {
        sampleId: Int
        netArea: Float
        netDuration: Float
        streamDepth: Float
        netDepth: Float
        netVelocity: Float
        notes: String
        updatedDate: String
    }

    type PlanktonSample {
        sampleId: Int
        diameter: Float
        subSampleCount: Float
        towLength: Float
        volume: Float
        allQuot: Float
        sizeInterval: Float
        towType: String
        notes: String
        updatedDate: String
    }

    type Taxonomy {
        taxonomyId: Int
        Phylum: String
        Class: String
        Subclass: String
        Order: String
        Suborder: String
        Family: String
        Subfamily: String
        Tribe: String
        Genus: String
        Subgenus: String
        Species: String
        Subspecies: String
    }
`

export default typeDefs
