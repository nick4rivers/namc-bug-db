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

        samples(limit: Int, nextToken: Int): PaginatedSample
        boxStates(limit: Int, nextToken: Int): [BoxState]
        sites(limit: Int, offset: Int): [Site]
        siteInfo(siteId: Int!): SiteInfo
        # individuals(limit: Int, nextToken: Int): [Individual]
        boxes(limit: Int, offset: Int): [Box]
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
        customerId: Int
        customerName: String
        siteId: Int
        siteName: String
        sampleDate: String
        sampleTime: String
        typeId: Int
        typeName: String
        methodId: Int
        methodName: String
        habitatId: Int
        habitatName: String
        area: Float
        fieldSplit: Float
        labSplit: Float
        jarCount: Int
        qualitative: String
        mesh: Int
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

    // type Individual {
    //     entityId: Int
    //     firstName: String
    //     lastName: String
    //     initials: String
    //     affilitationId: Int
    //     affiliation: String
    //     email: String
    //     title: String
    //     address1: String
    //     address2: String
    //     city: String
    //     stateName: String
    //     countryName: String
    //     zipCode: String
    //     phone: String
    //     fax: String
    // }

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
`

export default typeDefs
