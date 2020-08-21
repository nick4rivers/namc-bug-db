import log from 'loglevel'

export default {
    // Bright Pastel
    tagColors: [
        '#418CF0',
        '#FCB441',
        '#E0400A',
        '#056492',
        '#BFBFBF',
        '#1A3B69',
        '#FFE382',
        '#129CDD',
        '#CA6B4B',
        '#005CDB',
        '#F3D288',
        '#506381',
        '#F1B9A8',
        '#E0830A',
        '#7893BE'
    ]
}

export const mapConfig = {
    mapBoxToken: process.env.REACT_APP_MAPBOX_TOKEN
}

export const endpoints = {
    graphql: process.env.REACT_APP_GRAPHQL,
    cdn: process.env.REACT_APP_CDN
}
export const isDev = process.env.NODE_ENV && process.env.NODE_ENV === 'development'

// const baseurl = process.env.REACT_APP_BASEURL
// let basename = process.env.REACT_APP_BASENAME
// let domain = process.env.REACT_APP_DOMAIN
// if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
//     domain = 'localhost'
//     basename = ''
// }

// We throw on necessary environment variables being missing
const mandatoryEnv = {
    REACT_APP_MAPBOX_TOKEN: process.env.REACT_APP_MAPBOX_TOKEN,
    REACT_APP_VERSION: process.env.REACT_APP_VERSION,
    REACT_APP_CONTACT_EMAIL: process.env.REACT_APP_CONTACT_EMAIL,
    REACT_APP_GRAPHQL: process.env.REACT_APP_GRAPHQL
    // REACT_APP_AWS_REGION: process.env.REACT_APP_AWS_REGION,
    // REACT_APP_COGNITO_USER_POOL_ID: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    // REACT_APP_COGNITO_CLIENT_ID: process.env.REACT_APP_COGNITO_CLIENT_ID
}

Object.keys(mandatoryEnv).forEach((keyname) => {
    if (!mandatoryEnv[keyname]) {
        log.error(`You must set environment variable: ${keyname}`)
    }
})

export const version = process.env.REACT_APP_VERSION || 'NO_VERSION'
export const contact = process.env.REACT_APP_CONTACT_EMAIL || 'NO_CONTACT'

export const analytics = {
    token: process.env.REACT_APP_GA_TOKEN || 'UA-XXXXXXXX-XX'
}

const redirectUrl = new URL(process.env.PUBLIC_URL + '/', window.location.origin)
