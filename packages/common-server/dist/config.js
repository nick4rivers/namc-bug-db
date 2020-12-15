"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mandatoryKeys = [];
mandatoryKeys.forEach(function (key) {
    if (!process.env[key]) {
        throw new Error("Missing environment variable: " + key);
    }
});
exports.default = {
    development: process.env.NODE_ENV === 'development',
    apiUrl: process.env.API_URL,
    pg: {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE || 'postgres',
        port: process.env.POSTGRES_PORT || 5432,
        host: process.env.POSTGRES_HOST
    },
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