"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mandatoryKeys = [
    'PRODUCT_CODE',
    'AWS_REGION_DEPLOY',
    'AWS_USERPOOLID',
    'AUTH_TABLE',
    'SCRIPTS_URL',
    'AWS_USERPOOLWEBCLIENTID',
    'AWS_USERPOOL_HOSTED_DOMAIN'
];
mandatoryKeys.forEach(function (key) {
    if (!process.env[key]) {
        throw new Error("Missing environment variable: " + key);
    }
});
exports.default = {
    development: process.env.NODE_ENV === 'development',
    apiUrl: process.env.API_URL,
    loginUrl: process.env.AWS_USERPOOL_HOSTED_DOMAIN,
    aws: {
        region: process.env.AWS_REGION_DEPLOY,
        Auth: {
            userPoolId: process.env.AWS_USERPOOLID,
            userPoolWebClientId: process.env.AWS_USERPOOLWEBCLIENTID,
            mandatorySignIn: true,
            region: process.env.AWS_REGION_DEPLOY
        },
        Lambda: {},
        Postgres: {}
    }
};
//# sourceMappingURL=config.js.map