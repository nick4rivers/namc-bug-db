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

        samples(limit: Int, nextToken: String): [Sample]
        boxStates(limit: Int, nextToken: String): [BoxState]
        sites(limit: Int, nextToken: String): [Site]
        individuals(limit: Int, nextToken: String): [Individual]
        boxes(limit: Int, nextToken: String): [Box]
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
        systemId: Int
        systemName: String
        ecosystemId: Int
        ecosystemName: String
        waterbody: String
        longitude: Float
        latitude: Float
    }

    type Individual {
        entityId: Int
        firstName: String
        lastName: String
        initials: String
        affilitationId: Int
        affiliation: String
        email: String
        title: String
        address1: String
        address2: String
        city: String
        stateName: String
        countryName: String
        zipCode: String
        phone: String
        fax: String
    }

    type Box {
        boxId: Int
        customerId: Int
        customerName: String
        samples: Int
        submitterId: Int
        SubmitterName: String
        boxStateId: Int
        boxStateName: String
        boxReceivedDate: String
        processingCompleteDate: String
        projectedCompleteDate: String
        projectId: Int
        projectName: String
    }
`

export default typeDefs
