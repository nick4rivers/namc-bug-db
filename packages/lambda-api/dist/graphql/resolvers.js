"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var common_server_1 = require("@namcbugdb/common-server");
exports.default = {
    Query: {
        auth: function (obj, args, ctx, info) {
            return {
                loggedIn: Boolean(ctx.user && ctx.user.cognito.username),
                userPool: common_server_1.config.aws.Auth.userPoolId,
                clientId: common_server_1.config.aws.Auth.userPoolWebClientId,
                region: common_server_1.config.aws.region,
                domain: common_server_1.config.loginUrl
            };
        },
    },
    Mutation: {}
};
//# sourceMappingURL=resolvers.js.map