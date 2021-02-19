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
var typeDefs = graphql_tag_1.default(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    schema {\n        query: Query\n        # mutation: Mutation\n    }\n\n    type Query {\n        # Get a project and associated metadata\n        auth: AuthParams\n\n        samples(limit: Int, offset: Int): PaginatedSample\n        sampleOrganisms(sampleId: Int!): [SampleOrganism]\n        driftSamples(limit: Int, offset: Int): [DriftSample]\n        planktonSamples(limit: Int, offset: Int): [PlanktonSample]\n        boxStates(limit: Int, nextToken: Int): [BoxState]\n        sites(limit: Int, offset: Int): [Site]\n        siteInfo(siteId: Int!): SiteInfo\n        # individuals(limit: Int, nextToken: Int): [Individual]\n        boxes(limit: Int, offset: Int): [Box]\n        projects(limit: Int, offset: Int): [Project]\n        taxonomy(limit: Int, offset: Int): [Taxonomy]\n    }\n\n    # this schema allows the following mutation:\n    # type Mutation {\n\n    # }\n\n    type AuthParams {\n        loggedIn: Boolean\n        userPool: String\n        clientId: String\n        region: String\n        domain: String\n    }\n\n    type PaginatedSample {\n        records: [Sample]\n        nextToken: Int\n    }\n\n    type Sample {\n        sampleId: Int\n        boxId: Int\n        customerName: String\n        siteId: Int\n        siteName: String\n        siteLatitude: Float\n        siteLongitude: Float\n        siteState: String\n        sampleDate: String\n        sampleLatitude: Float\n        sampleLongitude: Float\n        sampleType: String\n        sampleMethod: String\n        habitatName: String\n        area: Float\n        fieldSplit: Float\n        labSplit: Float\n        jarCount: Int\n        qualitative: Boolean\n        mesh: Float\n        createdDate: String\n        updatedDate: String\n        qaSampleId: Int\n    }\n\n    type BoxState {\n        boxStateId: Int\n    }\n\n    type Site {\n        siteId: Int\n        siteName: String\n        system: String\n        ecosystem: String\n        longitude: Float\n        latitude: Float\n        usState: String\n        waterbodyType: String\n        waterbodyCode: String\n        waterbodyName: String\n        createdDate: String\n        updatedDate: String\n        hasCatchment: Boolean\n    }\n\n    type SiteInfo {\n        siteId: Int\n        siteName: String\n        system: String\n        ecosystem: String\n        location: String\n        stX: Float\n        stY: Float\n        usState: String\n        waterbodyTypeName: String\n        waterbodyCode: String\n        waterbodyName: String\n        createdDate: String\n        updatedDate: String\n        catchment: String\n        sampleCount: Int\n    }\n\n    #  type Individual {\n    #     entityId: Int\n    #     firstName: String\n    #     lastName: String\n    #     initials: String\n    #     affilitationId: Int\n    #     affiliation: String\n    #     email: String\n    #     title: String\n    #     address1: String\n    #     address2: String\n    #     city: String\n    #     stateName: String\n    #     countryName: String\n    #     zipCode: String\n    #     phone: String\n    #     fax: String\n    # }\n\n    type Box {\n        boxId: Int\n        customerName: String\n        samples: Int\n        SubmitterName: String\n        boxStateName: String\n        boxReceivedDate: String\n        processingCompleteDate: String\n        projectedCompleteDate: String\n    }\n\n    type SampleOrganism {\n        organismId: Int\n        sampleId: Int\n        lifeStage: String\n        bugSize: Float\n        splitCount: Float\n        labSplit: Float\n        fieldSplit: Float\n        bigRareCount: Float\n        invalidatedDate: String\n        createdDate: String\n        updatedDate: String\n        taxonomyId: Int\n        Phylum: String\n        Class: String\n        Subclass: String\n        Order: String\n        Suborder: String\n        Family: String\n        Subfamily: String\n        Tribe: String\n        Genus: String\n        Subgenus: String\n        Species: String\n        Subspecies: String\n    }\n\n    type Project {\n        projectId: Int\n        projectName: String\n        projectType: String\n        isPrivate: Boolean\n        contact: String\n        autoUpdateSamples: Boolean\n        description: String\n        createdDate: String\n        updatedDate: String\n        samples: Int\n    }\n\n    type DriftSample {\n        sampleId: Int\n        netArea: Float\n        netDuration: Float\n        streamDepth: Float\n        netDepth: Float\n        netVelocity: Float\n        notes: String\n        updatedDate: String\n    }\n\n    type PlanktonSample {\n        sampleId: Int\n        diameter: Float\n        subSampleCount: Float\n        towLength: Float\n        volume: Float\n        allQuot: Float\n        sizeInterval: Float\n        towType: String\n        notes: String\n        updatedDate: String\n    }\n\n    type Taxonomy {\n        taxonomyId: Int\n        phylum: String\n        class: String\n        subclass: String\n        order: String\n        suborder: String\n        family: String\n        subfamily: String\n        tribe: String\n        genus: String\n        subgenus: String\n        species: String\n        subspecies: String\n    }\n"], ["\n    schema {\n        query: Query\n        # mutation: Mutation\n    }\n\n    type Query {\n        # Get a project and associated metadata\n        auth: AuthParams\n\n        samples(limit: Int, offset: Int): PaginatedSample\n        sampleOrganisms(sampleId: Int!): [SampleOrganism]\n        driftSamples(limit: Int, offset: Int): [DriftSample]\n        planktonSamples(limit: Int, offset: Int): [PlanktonSample]\n        boxStates(limit: Int, nextToken: Int): [BoxState]\n        sites(limit: Int, offset: Int): [Site]\n        siteInfo(siteId: Int!): SiteInfo\n        # individuals(limit: Int, nextToken: Int): [Individual]\n        boxes(limit: Int, offset: Int): [Box]\n        projects(limit: Int, offset: Int): [Project]\n        taxonomy(limit: Int, offset: Int): [Taxonomy]\n    }\n\n    # this schema allows the following mutation:\n    # type Mutation {\n\n    # }\n\n    type AuthParams {\n        loggedIn: Boolean\n        userPool: String\n        clientId: String\n        region: String\n        domain: String\n    }\n\n    type PaginatedSample {\n        records: [Sample]\n        nextToken: Int\n    }\n\n    type Sample {\n        sampleId: Int\n        boxId: Int\n        customerName: String\n        siteId: Int\n        siteName: String\n        siteLatitude: Float\n        siteLongitude: Float\n        siteState: String\n        sampleDate: String\n        sampleLatitude: Float\n        sampleLongitude: Float\n        sampleType: String\n        sampleMethod: String\n        habitatName: String\n        area: Float\n        fieldSplit: Float\n        labSplit: Float\n        jarCount: Int\n        qualitative: Boolean\n        mesh: Float\n        createdDate: String\n        updatedDate: String\n        qaSampleId: Int\n    }\n\n    type BoxState {\n        boxStateId: Int\n    }\n\n    type Site {\n        siteId: Int\n        siteName: String\n        system: String\n        ecosystem: String\n        longitude: Float\n        latitude: Float\n        usState: String\n        waterbodyType: String\n        waterbodyCode: String\n        waterbodyName: String\n        createdDate: String\n        updatedDate: String\n        hasCatchment: Boolean\n    }\n\n    type SiteInfo {\n        siteId: Int\n        siteName: String\n        system: String\n        ecosystem: String\n        location: String\n        stX: Float\n        stY: Float\n        usState: String\n        waterbodyTypeName: String\n        waterbodyCode: String\n        waterbodyName: String\n        createdDate: String\n        updatedDate: String\n        catchment: String\n        sampleCount: Int\n    }\n\n    #  type Individual {\n    #     entityId: Int\n    #     firstName: String\n    #     lastName: String\n    #     initials: String\n    #     affilitationId: Int\n    #     affiliation: String\n    #     email: String\n    #     title: String\n    #     address1: String\n    #     address2: String\n    #     city: String\n    #     stateName: String\n    #     countryName: String\n    #     zipCode: String\n    #     phone: String\n    #     fax: String\n    # }\n\n    type Box {\n        boxId: Int\n        customerName: String\n        samples: Int\n        SubmitterName: String\n        boxStateName: String\n        boxReceivedDate: String\n        processingCompleteDate: String\n        projectedCompleteDate: String\n    }\n\n    type SampleOrganism {\n        organismId: Int\n        sampleId: Int\n        lifeStage: String\n        bugSize: Float\n        splitCount: Float\n        labSplit: Float\n        fieldSplit: Float\n        bigRareCount: Float\n        invalidatedDate: String\n        createdDate: String\n        updatedDate: String\n        taxonomyId: Int\n        Phylum: String\n        Class: String\n        Subclass: String\n        Order: String\n        Suborder: String\n        Family: String\n        Subfamily: String\n        Tribe: String\n        Genus: String\n        Subgenus: String\n        Species: String\n        Subspecies: String\n    }\n\n    type Project {\n        projectId: Int\n        projectName: String\n        projectType: String\n        isPrivate: Boolean\n        contact: String\n        autoUpdateSamples: Boolean\n        description: String\n        createdDate: String\n        updatedDate: String\n        samples: Int\n    }\n\n    type DriftSample {\n        sampleId: Int\n        netArea: Float\n        netDuration: Float\n        streamDepth: Float\n        netDepth: Float\n        netVelocity: Float\n        notes: String\n        updatedDate: String\n    }\n\n    type PlanktonSample {\n        sampleId: Int\n        diameter: Float\n        subSampleCount: Float\n        towLength: Float\n        volume: Float\n        allQuot: Float\n        sizeInterval: Float\n        towType: String\n        notes: String\n        updatedDate: String\n    }\n\n    type Taxonomy {\n        taxonomyId: Int\n        phylum: String\n        class: String\n        subclass: String\n        order: String\n        suborder: String\n        family: String\n        subfamily: String\n        tribe: String\n        genus: String\n        subgenus: String\n        species: String\n        subspecies: String\n    }\n"])));
exports.default = typeDefs;
var templateObject_1;
//# sourceMappingURL=schema.graphql.js.map