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
    }

    # this schema allows the following mutation:
    # type Mutation {

    # }

    type HelloResponse {
        message: String
        friendly: Boolean
    }
`

export default typeDefs
