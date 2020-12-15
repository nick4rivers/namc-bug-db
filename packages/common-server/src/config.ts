// This file is just a fancy wrapper around what's in .env

// Sanity check here for mandatory environment variabels
const mandatoryKeys = [
    // List here
    // 'PRODUCT_CODE'
]

mandatoryKeys.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing environment variable: ${key}`)
    }
})

export default {
    development: process.env.NODE_ENV === 'development',
    apiUrl: process.env.API_URL,
    loginUrl: process.env.AWS_USERPOOL_HOSTED_DOMAIN,
    aws: {
        region: process.env.AWS_REGION_DEPLOY,
        Auth: {
            // identityPoolId: '',
            userPoolId: process.env.AWS_USERPOOLID,
            userPoolWebClientId: process.env.AWS_USERPOOLWEBCLIENTID,
            mandatorySignIn: true,
            region: process.env.AWS_REGION_DEPLOY
        },
        Lambda: {},
        Postgres: {}
    }
}
