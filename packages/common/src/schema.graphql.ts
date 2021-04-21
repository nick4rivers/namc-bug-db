import gql from 'graphql-tag'
// NOTE: We went back to a .JS file because graphql-import seems borked when webpack
// is in the mix

export const queryLimits = {
    samples: 500,
    sampleOrganisms: 100,
    projectOrganisms: 100,
    boxStates: 500,
    sites: 500,
    boxes: 500,
    projects: 500,
    taxonomy: 500,
    predictors: 500,
    models: 500,
    sitePredictorValues: 500,
    modelPredictors: 500,
    translations: 500
}

const typeDefs = gql`
    schema {
        query: Query
        mutation: Mutation
    }

    type Query {
        # Get a project and associated metadata
        auth: AuthParams

        siteInfo(siteId: Int!): SiteInfo

        """
        this is a string
        """
        sampleInfo(sampleId: Int!): SampleInfo
        boxInfo(boxId: Int!): BoxInfo
        modelInfo(modelId: Int!): ModelInfo
        samples(limit: Int = ${queryLimits.samples}, offset: Int = 0): PaginatedSamples
        sampleOrganisms(
            limit: Int = ${queryLimits.sampleOrganisms}
            offset: Int = 0
            sampleId: Int
            boxId: Int
            siteId: Int
            sampleYear: Int
            typeId: Int
        ): PaginatedSampleOrganisms

        projectOrganisms(projectIds: [Int]!, limit: Int = ${queryLimits.projectOrganisms}, offset: Int =0): PaginatedSampleOrganisms
        sites(limit: Int = ${queryLimits.sites}, offset: Int = 0, usState: [String]): PaginatedSites
        # boxStates(limit: Int = ${queryLimits.boxStates}, offset: Int = 0): PaginatedBoxStates
        # individuals(limit: Int, offset: Int): [Individual]
        boxes(limit: Int = ${queryLimits.boxes}, offset: Int = 0): PaginatedBoxes
        projects(limit: Int = ${queryLimits.projects}, offset: Int = 0): PaginatedProjects
        taxonomy(limit: Int = ${queryLimits.taxonomy}, offset: Int = 0): PaginatedTaxonomies
        predictors(modelId: Int, limit: Int = ${queryLimits.predictors}, offset: Int = 0): PaginatedPredictors
        models(limit: Int = ${queryLimits.models}, offset: Int = 0): PaginatedModels
        sitePredictorValues(siteId: Int!, limit: Int = ${queryLimits.sitePredictorValues}, offset: Int = 0): PaginatedSitePredictorValues
        samplePredictorValues(sampleId: Int!): PaginatedSamplePredictorValue
        modelPredictors(limit: Int = ${queryLimits.modelPredictors}, offset: Int = 0, modelId: Int!): PaginatedModelPredictors
        translations(limit: Int = ${queryLimits.translations}, offset: Int = 0): PaginatedTranslations

        sampleTaxaRaw(sampleId: Int!): PaginatedRawSampleTaxa
        sampleTaxaGeneralized(sampleId: Int!): PaginatedGeneralizedSampleTaxa
        sampleTaxaTranslated(sampleId: Int!, translationId: Int!): PaginatedSampleTaxa
        sampleTaxaRarefied(sampleId: Int!, fixedCount: Int!gs): PaginatedSampleTaxa
        # sampleTaxaModel(sampleId: Int!, modelId: Int!, limit: Int = ${queryLimits.translations}, offset: Int = 0): PaginatedSampleTaxa
    }

    # this schema allows the following mutation:
    type Mutation {
        setSitePredictorValue(siteId: Int!, predictorId: Int!, value:String!): Int
        setSamplePredictorValue(sampleId: Int!, predictorId: Int!, value: String!): Int
        setSiteCatchment(siteId: Int!, catchment: String!): Int
        
    }

    # union PredictorValue = String|Boolean|Int|Float

    type AuthParams {
        loggedIn: Boolean
        userPool: String
        clientId: String
        region: String
        domain: String
    }

    type Sample {
        sampleId: Int
        boxId: Int
        customerName: String
        boxStateName: String
        boxStateId: Int
        submitterName: String
        siteId: Int
        siteName: String
        siteLatitude: Float
        siteLongitude: Float
        siteState: String
        sampleDate: String
        sampleYear: Int
        sampleLatitude: Float
        sampleLongitude: Float
        sampleType: String
        sampleMethod: String
        habitatName: String
        area: Float
        fieldSplit: Float
        labSplit: Float
        jarCount: Int
        qualitative: Boolean
        mesh: Float
        createdDate: String
        updatedDate: String
        qaSampleId: Int
        diameter: Float
        subSampleCount: Float
        towLength: Float
        volume: Float
        aliquot: Float
        siteInterval: Float
        towType: String
        netArea: Float
        netDuration: Float
        streamDepth: Float
        netDepth: Float
        netVelocity: Float
    }

    type BoxState {
        boxStateId: Int
    }

    type Site {
        siteId: Int
        siteName: String
        system: String
        ecosystem: String
        longitude: Float
        latitude: Float
        usState: String
        waterbodyType: String
        waterbodyCode: String
        waterbodyName: String
        createdDate: String
        updatedDate: String
        hasCatchment: Boolean
    }

"""
Detailed information about a single NAMC site.

This query includes the point and catchment geometries for the site.
It also includes the number of samples available at a particular site.

More succinct information is available for all sites using the
sites API endpoint.
"""
    type SiteInfo {
        
        "Unique database generated integer that uniquely identifies each site"
        siteId: Int

        "Unique text identifier for each site"
        siteName: String
        
        "The ecological system (e.g. lake, pond, reservoir) in which the site is located."
        system: String

        "The ecosystem in which the site is located."
        ecosystem: String

        "GeoJSON point location of the site in [EPSG:4326](https://epsg.io/4326) spatial reference."
        location: String

        "Longtidue of the site location in decimal degrees."
        longitude: Float

        "Latitude of the site location in decimal degrees."
        latitude: Float

        "US State in which the site is located."
        usState: String

        """
        If the site has a waterbody code, then the waterbody type identifies the system that
        this identifier pertains to. The waterbody type might be NHDPlus 1:100,000 or 
        NHDPlusHR 1:24,000 etc.
        """
        waterbodyType: String

        """
        The identifier of the waterbody on which this site occurs. Can be null. If a 
        waterbody code exists, then the waterbodyType can be used to determine which
        system the code belongs to, such as NHDPlus or NHDPlusHR.
        """
        waterbodyCode: String

        "The string name of the waterbody on which the site occurs. Typicall this is the stream name."
        waterbodyName: String

        "The latest date and time that either the site location (point) or catchment (polygon) were changed."
        geometryChanged: String

        "The system generated date and time that the site record was created in the database."
        createdDate: String

        "The system generated date and time that the site record was last changed in the database."
        updatedDate: String

        "GeoJSON polygon of the upstream area that drains into this site in [EPSG:4326](https://epsg.io/4326) spatial reference."
        catchment: String

        "The number of samples that are available for this site."
        sampleCount: Int
    }

    type RawSampleTaxa {
        taxonomyId: Int,
        scientificName: String
        levelId: Int
        levelName: String
        rawCount: Float
        correctedCount: Float
        rawBigRareCount: Int
        correctedBigRareCount: Float
    }

    type SampleTaxa {
        taxonomyId: Int
        scientificName: String
        taxaLevelId: Int
        taxaLevel: String
        organismCount: Int
    }

    type GeneralizedSampleTaxa {

        taxonomyId: Int
        scientificName: String
        taxaLevelId: Int
        taxaLevel: String
        lifeStageId: Int
        lifeStage: String
        bugSize: Float
        organismCount: Int
    }

    type SampleInfo {
        sampleId:     Int
        boxId:        Int
        customerName:       String
        customerAbbreviation: String
        submittedBy:             String
        boxState:          String
        siteId:                 Int
        siteName:               String
        usState:                  String
        siteLocation: String
        siteLongitude: Float
        siteLatitude: Float
        visitId:                  String
        sampleDate:               String
        sampleTime:               String
        sampleType:          String
        sampleMethod:        String
        habitat:              String
        sampleLocation: String
        sampleLongitude: Float
        sampleLatitude: Float
        area:                      Float
        fieldSplit:               Float
        fieldNotes:               String
        labSplit:                 Float
        jarCount:                 Int
        qualitative:              Boolean
        labNotes:                String
        mesh:                    Int
        createdDate:            String
        updatedDate:            String
        sampleDateChanged:       String
        qaSampleId:            Int
        metadata:                String
    }

    type BoxInfo {
        boxId:                    Int
                customerId:               Int
                customerName:         String
                customerAbbreviation: String
                submitterId:              Int
                submittedBy:              String
                boxStateId:              Int
                boxState:            String
                boxReceivedDate:         String
                processingCompleteDate:  String
                projectedCompleteDate:   String
                sampleCount:              Int
                description:               String
                metadata:                  String
                measurements:              Boolean
                sorterQa:                 Boolean
                taxaQa:                   Boolean
                createdDate:              String
                updatedDate:              String
    }

type SamplePredictorValue {
    predictorId:                 Int
                abbreviation:                 String
                calculationScript:           String
                isTemporal:                  Boolean
                predictorMetadata:           String
                predictorValue:              String
                predictorValueUpdatedDate: String
                status:                       String
}
    #  type Individual {
    #     entityId: Int
    #     firstName: String
    #     lastName: String
    #     initials: String
    #     affilitationId: Int
    #     affiliation: String
    #     email: String
    #     title: String
    #     address1: String
    #     address2: String
    #     city: String
    #     stateName: String
    #     countryName: String
    #     zipCode: String
    #     phone: String
    #     fax: String
    # }

    type Box {
        boxId: Int
        customerId: Int
        customerName: String
        submitterId: Int
        submittedBy: String
        boxState: String
        boxReceivedDate: String
        sampleCount: Int
        processingCompleteDate: String
        projectedCompleteDate: String
    }

    type SampleOrganism {
        sampleId: Int
        boxId: Int
        customerId: Int
        customerName: String
        boxStateName: String
        boxStateId: Int
        submitterName: String
        siteId: Int
        siteName: String
        siteLatitude: Float
        siteLongitude: Float
        siteState: String
        sampleDate: String
        sampleLatitude: Float
        sampleLongitude: Float
        sampleTime: String
        typeId: Int
        sampleType: String
        methodId: Int
        sampleMethod: String
        habitatId: Int
        habitatName: String
        area: Float
        fieldSplit: Float
        labSplit: Float
        jarCount: Float
        qualitative: Boolean
        mesh: Float
        createdDate: String
        updatedDate: String
        qaSampleId: Int
        diameter: Float
        subSampleCount: Float
        towLength: Float
        volume: Float
        aliquot: Float
        sizeInterval: Float
        towType: String
        netArea: Float
        netDuration: Float
        streamDepth: Float
        netDepth: Float
        netVelocity: Float
        taxonomyId: Int
        lifeStage: String
        bugSize: Float
        splitCount: Float
        bigRareCount: Float
        phylum: String
        class: String
        subClass: String
        order: String
        family: String
        genus: String
        isPrivate: Boolean
    }

    type Project {
        projectId: Int
        projectName: String
        projectType: String
        isPrivate: Boolean
        contactId: Int
        contactName: String
        autoUpdateSamples: Boolean
        description: String
        sampleCount: Int
        modelCount: Int
        createdDate: String
        updatedDate: String
    }

    type Taxonomy {
        taxonomyId: Int
        phylum: String
        class: String
        subclass: String
        order: String
        suborder: String
        family: String
        subfamily: String
        tribe: String
        genus: String
        subgenus: String
        species: String
        subspecies: String
    }

    type Predictor {
        predictorId: Int
        predictorName: String
        abbreviation: String
        description: String
        units: String
        calculationScript: String
        predictorTypeId: Int
        predictorTypeName: String
        isTemporal: Boolean
        updatedDate: String
        createdDate: String
        modelCount: Int
    }

    type Model {
        modelId: Int
        modelName: String
        abbreviation: String
        isActive: Boolean
        description: String
        predictorCount: Int
    }

    type ModelInfo {
        modelId: Int
        modelName: String
        abbreviation: String
        modelType: String
        translationId: Int
        translation: String
        extentDescription: String
        platform: String
        referenceSites: Int
        groupCount: Int
        minimumCount: Int
        oeMean: Float
        oeStdev: Float
        taxonomicEffort: String
        isActive: Boolean
        fixedCount: Int
        units: String
        description: String
        metadata: String
        predictorCount: Int
        createdDate: String
        updatedDate: String
        extent: String
    }

    """
    The value of a non-temporal predictor for a particular site.
    """
    type SitePredictorValue {

        "The unique system generated identifier for the predictor."
        predictorId: Int

        "The unique textual name for the predictor."
        predictorName: String

        "The unique shorthand abbreviation for the predictor."
        abbreviation: String

        "Long form information about the predictor."
        description: String

        "The predictor type (e.g. metrics, atmosphere, geology, anthro)."
        predictorType: String

        """
        The predictor value for this site. The value is always a string, even
        if it represents an integer or floating point value.
        """
        predictorValue: String

        "The system generated date and time that the site record was created in the database."
        createdDate: String

        "The system generated date and time that the site record was last changed in the database."
        updatedDate: String

        "Optional name of the R function that performs the calculation for this predictor."
        calculationScript: String
    }

    """
    Information about a model predictor.

    Each predictor can be associated with multiple models. Predictors can also
    be temporal, in which their values are associated with a particular sample,
    or they can be non-temporal, in which case their values are associated with
    sites.
    """
    type ModelPredictor {

        "The unique system generated identifier for the predictor."
        predictorId: Int

        "The unique textual name for the predictor."
        predictorName: String

        "The unique shorthand abbreviation for the predictor."
        abbreviation: String

        "The units in which the predictor values are stored."
        units: String

       "The predictor type (e.g. metrics, atmosphere, geology, anthro)."
        predictorType: String

        """
        Boolean representing whether the predictor varies over time or whether
        there is just a single value for the site. True indicates that the predictor
        is temporal and values are stored for each sample. False indicates that there
        is only one predictor value for each site.
        """
        isTemporal: Boolean

        "Long form information about the predictor."
        description: String

        "Miscellaneou structured metadata in GeoJSON format."
        metadata: String

        "The number of models that use the predictor"
        modelCount: Int

        "The system generated date and time that the site record was created in the database."
        createdDate: String

        "The system generated date and time that the site record was last changed in the database."
        updatedDate: String

        "Optional name of the R function that performs the calculation for this predictor."
        calculationScript: String

    }

    type Translation {
        translationId: Int
        translationName: String
        description: String
        isActive: Boolean
        taxaCount: Int
        createdDate: String
        updatedDate: String
    }

    # Pagination Types
    type PaginatedBoxStates {
        records: [BoxState]
        nextOffset: Int
    }
    type PaginatedModels {
        records: [Model]
        nextOffset: Int
    }
    type PaginatedSites {
        records: [Site]
        nextOffset: Int
    }
    type PaginatedSamples {
        records: [Sample]
        nextOffset: Int
    }
    type PaginatedSampleOrganisms {
        records: [SampleOrganism]
        nextOffset: Int
    }
    type PaginatedBoxes {
        records: [Box]
        nextOffset: Int
    }
    type PaginatedProjects {
        records: [Project]
        nextOffset: Int
    }
    type PaginatedTaxonomies {
        records: [Taxonomy]
        nextOffset: Int
    }
    type PaginatedPredictors {
        records: [Predictor]
        nextOffset: Int
    }
    type PaginatedSitePredictorValues {
        records: [SitePredictorValue]
        nextOffset: Int
    }

    type PaginatedSamplePredictorValue {
        records: [SamplePredictorValue]
        nextOffset: Int
    }

    type PaginatedModelPredictors {
        records: [ModelPredictor]
        nextOffset: Int
    }

    type PaginatedTranslations {
        records: [Translation]
        nextOffset: Int
    }

    type PaginatedRawSampleTaxa {
        records: [RawSampleTaxa]
    }

    type PaginatedSampleTaxa {
        records: [SampleTaxa]
        nextOffset: Int
    }

    type PaginatedGeneralizedSampleTaxa {
        records: [GeneralizedSampleTaxa]
        nextOffset: Int
    }
`

export default typeDefs
