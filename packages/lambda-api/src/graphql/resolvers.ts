// import path from 'path'
import { config } from '@namcbugdb/common-server'

// some resolvers are big enough to get their own file
// import log from 'loglevel'

/**
 * I fully expect this file to fragment.
 *
 * The structure must match what's in the `schema.graphql` file
 */

export default {
    Query: {
        auth: (obj, args, ctx, info) => {
            return {
                loggedIn: Boolean(ctx.user && ctx.user.cognito.username),
                userPool: config.aws.Auth.userPoolId,
                clientId: config.aws.Auth.userPoolWebClientId,
                region: config.aws.region,
                domain: config.loginUrl
            }
        },
  
    },
    Mutation: {

    }

    // // Output type mapping
    // ProjectBase: {
    //     __resolveType: (obj, context, info) => {
    //         return obj
    //     }
    // },
    // ProjectSearchResult: {
    //     name: ({ Name }) => Name,
    //     meta: (args) => Project.parseDynamoMeta(args),
    //     files: ({ Name, files, program, projType, id }) => {
    //         // Add the sortID in here so we can find paths later
    //         const client = s3.getS3Client(config.aws.S3.region)
    //         const newFiles = files.map((f) => {
    //             const Key = path.join(program, projType, id, f.key)
    //             return {
    //                 ...f,
    //                 downloadUrl: client.getSignedUrl('getObject', { Bucket: config.aws.S3.Bucket, Key })
    //             }
    //         })
    //         return newFiles
    //     }
    // },
    // Program: {
    //     meta: ({ meta }) => JSON.stringify(meta),
    //     products: ({ products }) =>
    //         products.map((p) => ({
    //             ...p,
    //             pathArr: JSON.stringify(p.pathArr)
    //         }))
    // },
    // Project: {
    //     name: ({ Name }) => Name,
    //     meta: (args) => Project.parseDynamoMeta(args),
    //     files: ({ Name, files, program, projType, id }) => {
    //         // Add the sortID in here so we can find paths later
    //         const client = s3.getS3Client(config.aws.S3.region)
    //         const newFiles = files.map((f) => {
    //             const Key = path.join(program, projType, id, f.key)
    //             return {
    //                 ...f,
    //                 downloadUrl: client.getSignedUrl('getObject', { Bucket: config.aws.S3.Bucket, Key })
    //             }
    //         })
    //         return newFiles
    //     }
    // }
}
