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
        helloWorld(name: String!): HelloResponse
        samples: [Sample]
        boxStates: [BoxState]
        sites: [Site]
        individuals: [Individual]
    }

    # this schema allows the following mutation:
    # type Mutation {

    # }

    type HelloResponse {
        message: String
        friendly: Boolean
    }

    type Sample {
        sampleId: ID!
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
`

export default typeDefs
