import gql from 'graphql-tag'
// NOTE: We went back to a .JS file because graphql-import seems borked when webpack
// is in the mix

const typeDefs = gql`
schema {
    query: Query
    mutation: Mutation
}

type Query {
    # Get a project and associated metadata
    auth: AuthParams
}

# this schema allows the following mutation:
type Mutation {

}


type AuthParams {
    loggedIn: Boolean
    userPool: String
    clientId: String
    region: String
    domain: String
}

`

export default typeDefs
