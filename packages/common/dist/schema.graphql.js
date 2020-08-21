"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_tag_1 = __importDefault(require("graphql-tag"));
var typeDefs = graphql_tag_1.default(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\nschema {\n    query: Query\n    mutation: Mutation\n}\n\ntype Query {\n    # Get a project and associated metadata\n    auth: AuthParams\n}\n\n# this schema allows the following mutation:\ntype Mutation {\n\n}\n\n\ntype AuthParams {\n    loggedIn: Boolean\n    userPool: String\n    clientId: String\n    region: String\n    domain: String\n}\n\n"], ["\nschema {\n    query: Query\n    mutation: Mutation\n}\n\ntype Query {\n    # Get a project and associated metadata\n    auth: AuthParams\n}\n\n# this schema allows the following mutation:\ntype Mutation {\n\n}\n\n\ntype AuthParams {\n    loggedIn: Boolean\n    userPool: String\n    clientId: String\n    region: String\n    domain: String\n}\n\n"])));
exports.default = typeDefs;
var templateObject_1;
//# sourceMappingURL=schema.graphql.js.map