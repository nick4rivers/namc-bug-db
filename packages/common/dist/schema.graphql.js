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
var typeDefs = graphql_tag_1.default(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    schema {\n        query: Query\n        # mutation: Mutation\n    }\n\n    type Query {\n        # Get a project and associated metadata\n        helloWorld(name: String!): HelloResponse\n    }\n\n    # this schema allows the following mutation:\n    # type Mutation {\n\n    # }\n\n    type HelloResponse {\n        message: String\n        friendly: Boolean\n    }\n"], ["\n    schema {\n        query: Query\n        # mutation: Mutation\n    }\n\n    type Query {\n        # Get a project and associated metadata\n        helloWorld(name: String!): HelloResponse\n    }\n\n    # this schema allows the following mutation:\n    # type Mutation {\n\n    # }\n\n    type HelloResponse {\n        message: String\n        friendly: Boolean\n    }\n"])));
exports.default = typeDefs;
var templateObject_1;
//# sourceMappingURL=schema.graphql.js.map