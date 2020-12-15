import { makeExecutableSchema } from 'graphql-tools'
import { graphql } from '@namcbugdb/common'
import resolvers from './resolvers'

export default makeExecutableSchema({
    typeDefs: graphql.typeDefs,
    resolvers
})
