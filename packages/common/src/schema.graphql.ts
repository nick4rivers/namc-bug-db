import gql from 'graphql-tag'
// NOTE: We went back to a .JS file because graphql-import seems borked when webpack
// is in the mix

export const queryLimits = {
    samples: 500,
    sites: 500,
    boxes: 500,
    projects: 500,
    taxonomy: 500,
    predictors: 500,
    models: 500,
    sitePredictorValues: 500,
    modelPredictors: 500,
    modelResults: 500,
    translations: 500,
    metrics: 500
}

const typeDefs = gql`
    schema {
        query: Query
        mutation: Mutation
    }

    type Query {
        # Get a project and associated metadata
        auth: AuthParams

        ####################################################################################################################################################################################
        # Geo queries

        "Detailed information about a single site. Includes the point location and upstream catchment geometries as GeoJSON."
        siteInfo(siteId: Int!): SiteInfo

        "Detailed information about a single model, including the number of predictors associated with the model."
        modelInfo(modelId: Int!): ModelInfo

        "List of all thresholds (e.g. good, fair, poor) for a particular model"
        modelThresholds(modelId: Int!): PaginatedModelThresholds

        ####################################################################################################################################################################################
        # Sample queries

        "Detailed information about a single sample, including information about the box and customer."
        sampleInfo(sampleId: Int!): SampleInfo

        "Detailed information about a single box, including information about the customer and number of samples associated with the box."
        boxInfo(boxId: Int!): BoxInfo

        "List of all samples in the system, including high level information about the associated box and customer."
        samples(limit: Int = ${queryLimits.samples}, offset: Int = 0): PaginatedSamples

        "Summary information for all sites, including location coordinates and number of samples. Use the siteInfo query to get more detailed information about a single site."
        sites(limit: Int = ${queryLimits.sites}, offset: Int = 0, usState: [String]): PaginatedSites
        
        # individuals(limit: Int, offset: Int): [Individual]

        "Summary information for all boxes, including the customer name and number of samples within the box. Use the boxInfo query to get more detailed information about a single box."
        boxes(limit: Int = ${queryLimits.boxes}, offset: Int = 0): PaginatedBoxes

        "Summary information about all projects in the system. Use the projectInfo query to get more detailed about a single project."
        projects(limit: Int = ${queryLimits.projects}, offset: Int = 0): PaginatedProjects

        "List of all predictors in the system. Includes summary information about how many models rely on each predictor."
        predictors(modelId: Int, limit: Int = ${queryLimits.predictors}, offset: Int = 0): PaginatedPredictors

        "List of all models in the system. Includes summary information about how many predictors are used by the model as well as the translation that might be required."
        models(limit: Int = ${queryLimits.models}, offset: Int = 0): PaginatedModels

        "List of predictor values at a single site. Site predictors are non-temporal. The value is common to all samples at the specific site."
        sitePredictorValues(siteId: Int!, limit: Int = ${queryLimits.sitePredictorValues}, offset: Int = 0): PaginatedSitePredictorValues

        "List of all predictor values for a single sample. This includes both temporal and non-temporal predictors as well as their calculation status (current, missing, expired)."
        samplePredictorValues(sampleId: Int!): PaginatedSamplePredictorValue

        "List of predictors required by a single model."
        modelPredictors(limit: Int = ${queryLimits.modelPredictors}, offset: Int = 0, modelId: Int!): PaginatedModelPredictors

        modelResults(limit: Int = ${queryLimits.modelResults}, offset: Int = 0, sampleIds: [Int]!): PaginatedModelResult

        ####################################################################################################################################################################################
        # Taxonomy queries

        "List of all taxa in the system. Includes information about each level of the taxonomic hierarchy above each taxa."
        taxonomy(limit: Int = ${queryLimits.taxonomy}, offset: Int = 0): PaginatedTaxonomies

        "list all parents for a particular taxa"
        taxonomyTree(taxonomyId: Int!): PaginatedTaxonomyTree

        "List of all attributes in the system."
        attributes(limit: Int = ${queryLimits.taxonomy}, offset: Int = 0): PaginatedAttributes

        "List of all attributes that exist for a single taxa"
        taxaAttributes(taxonomyId: Int, limit: Int = ${queryLimits.taxonomy}, offset: Int = 0): PaginatedAttributeValues
  
        "List all the taxa within a specific translation (OTU)"
        translationTaxa(limit: Int = ${queryLimits.taxonomy}, offset: Int = 0, translationId: Int!): PaginatedTranslationTaxa
       
        "List of all translations in the system."
        translations(limit: Int = ${queryLimits.translations}, offset: Int = 0): PaginatedTranslations

        ####################################################################################################################################################################################
        # Sample side table queries

        "List of all plankton samples in the system."
        planktonSamples(limit: Int = ${queryLimits.samples}, offset: Int = 0): PaginatedPlankton

        "List of all drift samples in the system."
        driftSamples(limit: Int = ${queryLimits.samples}, offset: Int = 0): PaginatedDrift

        "List of all fish samples in the system."
        fishSamples(limit: Int = ${queryLimits.samples}, offset: Int = 0): PaginatedFish

        "List of all mass samples in the system."
        massSamples(limit: Int = ${queryLimits.samples}, offset: Int = 0): PaginatedMass

        "List all fish guts samples in the system"
        fishGuts(limit: Int = ${queryLimits.samples}, offset: Int = 0, sampleIds: [Int]): PaginatedFishGuts

        ####################################################################################################################################################################################
        # Sample Taxa queries
        
        "Sample organisms summed by taxonomy only. Includes both raw counts as well as counts corrected for lab and field split. Also includes both raw and corrected big rare counts."
        sampleTaxaRaw(sampleIds: [Int], boxIds: [Int], projectIds: [Int]): PaginatedRawSampleTaxa

        "Sample organisms summed by taxonomy, life stage and bug size. Includes both raw counts as well as counts corrected for lab and field split. Also includes both raw and corrected big rare counts."
        sampleTaxaGeneralized(sampleId: Int!): PaginatedGeneralizedSampleTaxa

        "Sample organisms converted to a translation (OTU). Rolls up counts to those taxa present in the translation and omits any organisms that don't roll up to a taxa in the translation."
        sampleTaxaTranslation(sampleId: Int!, translationId: Int!): PaginatedSampleTranslationTaxa

        # "Sample organisms in their original taxonomic designation but rarefied to the specified fixed count."
        # sampleTaxaRarefied(sampleId: Int!, fixedCount: Int!): PaginatedRarefiedSampleTaxa

        "Sample organisms converted to the translation (OTU) and then rarefied to the specified fixed count."
        sampleTaxaTranslationRarefied(sampleId: Int!, translationId: Int!, fixedCount:Int!):PaginatedRarefiedSampleTaxa

        "Sample organisms within distance (meters) of a point (decimal degrees)"
        pointTaxaRaw(longitude: Float!, latitude: Float!, distance: Float!): PaginatedRawSampleTaxa
   
        "Sample organisms within a polygon"
        polygonTaxaRaw(polygon: String!): PaginatedRawSampleTaxa

        ####################################################################################################################################################################################
        # Metric queries

        metrics(limit: Int = ${queryLimits.metrics}, offset: Int = 0): PaginatedMetrics

        sampleMetrics(sampleIds: [Int], boxIds: [Int], projectIds: [Int], translationId: Int!, fixedCount: Int!): PaginatedMetricResult
    }

    # this schema allows the following mutation:
    type Mutation {
        "Store a non-temporal predictor value for a specific site. See setSamplePredictorValue if you want to store a temporal predictor value associated with a particular sample."
        setSitePredictorValue(siteId: Int!, predictorId: Int!, value:String!): Int

        "Store a temporal predictor value for a specific sample. Set setSitePredictorValue if you want to store a temporal predictor value associated with a particular site."
        setSamplePredictorValue(sampleId: Int!, predictorId: Int!, value: String!): Int

        "Store the upstream catchment polygon for a specific site. The catchment polygon must be a valid, non-empty GeoJSON polygon that partially or entirely intersects with the United States."
        setSiteCatchment(siteId: Int!, catchment: String!): Int

        "Create a new translation. The name is mandatory and cannot be an empty string. The description is optional."
        createTranslation(translationName: String!, description: String): Int

        "Add or update a taxa associated with a translation"
        setTranslationTaxa(translationId: Int!, taxonomyId: Int!, alias:String, isFinal: Boolean): Int

        "Permanently remove a taxa from a translation"
        deleteTranslationTaxa(translationId: Int!, taxonomyId: Int!): Int
  
        "Update information related to a specific taxa. Change its scientific name, move its level or change its parent"
        setTaxonomy(taxonomyId: Int!, scientificName: String!, levelId: Int!, parentId: Int!, author: String, year:String, notes: String, metadata:String): Int

        createProject(projectName: String!, is_private: Boolean, description: String, metadata: String, contact_id: Int): Int

        addProjectSamples(projectId: Int!, sampleIds: [Int]): Int

        addProjectBoxes(projectId: Int!, boxIds: [Int]): Int

        removeProjectSamples(projectId: Int!, sampleIds:[Int]): Int

        deleteProject(projectId: Int!): Int
    }

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

    """"
    Raw summary of organisms for a single sample. The data are returned with their original
    laboratory taxonomic identification.
    """
    type RawSampleTaxa {

        "The sample to which the taxa belong"
        sampleId: Int

        "The taxa identified within the laboratory."
        taxonomyId: Int
        "The name of the taxa identified with the laboratory."
        scientificName: String
        "The taxonomic level of the taxa identified within the laboratory."
        levelId: Int
        "The taxonomic level of the taxa identified within the laboratory."
        levelName: String
        "Sum of the split_counts recorded within the laboratory for this taxa. No other manipulation."
        rawCount: Float
        
        """
        Sum of the split counts multiplied by the sample lab_split and field_split.

        corrected_count = sum(split_count) * (100 / lab_split) * (100 / field_split)
        """
        correctedCount: Float

        "Sum of the big rare count within the laboratory for this taxa. No other manipulation."
        rawBigRareCount: Int
    }

    type SampleTaxa {
        sampleId: Int
        taxonomyId: Int
        scientificName: String
        taxaLevelId: Int
        taxaLevel: String
        organismCount: Int
    }

    type GeneralizedSampleTaxa {
        sampleId: Int
        taxonomyId: Int
        scientificName: String
        levelId: Int
        levelName: String
        lifeStageId: Int
        lifeStage: String
        lifeStageAbbreviation: String
        bugSize: Float
        rawCount: Float
        correctedCount: Float
        rawBigRareCount: Int
    }

    type TranslationSampleTaxa { 
        sampleId:Int 
        taxonomyId: Int
        scientificName: String
        aliasName: String
        levelId: Int
        levelName: String
        rawCount: Float
        correctedCount: Float
        rawBigRareCount: Int
    }

    type RarefiedSampleTaxa {
        taxonomyId: Int
        scientificName: String
        levelId: Int
        levelName: String
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

type PlanktonSample {
    sampleId:        Int
    diameter:        Float
    subSampleCount:  Int
    towLength:       Float
    volume:          Float
    aliquot:         Float
    sizeInterval:    Float
    towType:         String
    updatedDate:     String

}

type DriftSample {
    sampleId:    Int
    netArea:     Float
    netDuration: Float
    streamDepth: Float
    netDepth:    Float
    netVelocity: Float
    updatedDate: String
}

type FishSample {
    sampleId: Int
    taxonomyId: Int
    scientificName: String
    levelId: Int
    levelName: String
    fishLength: Float
    fishMass: Float
    updatedDate: String
}

type MassSample {
    sampleId: Int
    typeId: Int
    typeAbbreviation: String
    typeName: String
    methodId: Int
    methodAbbreviation: String
    methodName: String
    mass: Float
    updatedDate: String

}

type ModelResult {
    sampleId: Int
    siteId:      Int
    siteName:    String
    modelId:     Int
    modelName: String
    modelVersion: String
    modelResult: Float
    condition: String
    fixCount: Int
    notes: String
    metadata: String
    createdDate: String
    updatedDate: String
}

type FishGuts {
    sampleId:            Int
    sampleDate:          String
    siteId:              Int
    siteName:            String
    fishWeight:          Float
    fishLength:          Float
    fishTaxonomyId:     Int
    fishScientificName: String
    notes:                String
    metadata:             String
    organicWeight:       Float
    inorganicWeight:     Float
    otherWeight:         Float
    createdDate:         String
    updatedDate:         String
    taxonomyId:          Int
    scientificName:      String
    lifeStageId:        Int
    lifeStage: String
    count:                Float
    weight:               Float
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
        scientificName: String
        levelId: Int
        levelName: String
        parentTaxonomyId: Int
        parentScientificName: String
        parentLevelId: Int
        parentLevelName: String
        notes: String
        metadata: String
        createdDate: String
        updatedDate: String
    }

    type TaxonomyTree {
        taxonomyId: Int
        scientificName: String
        levelId: Int
        levelName: String
        parentId: Int
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

    type ModelThreshold {
        modelId: Int
        thresholdId: Int
        threshold: String
        displayText: String
        description: String
    }

    type Metric {
        metricId: Int
        metricName: String
        metricTypeId: Int
        typeName:  String
        translationId: Int
        translationName: String
        formulaId: Int
        formulaName: String
        formulaCodeFunction: String
        isStandardized: Boolean
        perturbDirection: String
        description: String
        createdDate: String
        updatedDate: String
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

    type TranslationTaxa {
        translationId: Int
        translationName: String
        taxonomyId: Int
        levelId: Int
        levelName: String
        originalScientificName: String
        translationScientificName: String
        isFinal: Boolean
    }

    type Attribute {
        attributeId: Int
        attributeName: String
        attributeType: String
        label: String
        description: String
        metadata: String
        createdDate: String
        updatedDate: String
    }

    type AttributeValue {
        taxonomyId: Int
        scientificName: String
        levelId:  Int
        levelName:  String
        attributeName: String
        attributeType: String
        label: String
        attributeValue: String
    }

    type MetricResult  {
    sampleId:    Int
    groupId:     Int
    groupName:   String
    metricId:    Int
    metricName:  String
    metricValue: String
}


    # Pagination Types
  
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

    type PaginatedTaxonomyTree {
        records: [TaxonomyTree]
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

    type PaginatedTranslationTaxa {
        records: [TranslationTaxa]
        nextOffset: Int
    }

    type PaginatedRawSampleTaxa {
        records: [RawSampleTaxa]
        nextOffset: Int
    }

    type PaginatedSampleTaxa {
        records: [SampleTaxa]
        nextOffset: Int
    }

    type PaginatedGeneralizedSampleTaxa {
        records: [GeneralizedSampleTaxa]
        nextOffset: Int
    }

    type PaginatedSampleTranslationTaxa {
        records: [TranslationSampleTaxa]
        nextOffset: Int
    }

    type PaginatedRarefiedSampleTaxa {
        records: [RarefiedSampleTaxa]
        nextOffset: Int
    }

    type PaginatedPlankton {
        records: [PlanktonSample]
        nextOffset: Int
    }

    type PaginatedDrift {
        records: [DriftSample]
        nextOffset: Int
    }

    type PaginatedFish {
        records: [FishSample]
        nextOffset: Int
    }

    type PaginatedMass {
        records: [MassSample]
        nextOffset: Int
    }

    type PaginatedAttributes {
        records: [Attribute]
        nextOffset: Int
    }

    type PaginatedAttributeValues {
        records: [AttributeValue]
        nextOffset: Int
    }

    type PaginatedModelThresholds {
        records: [ModelThreshold]
        nextOffset: Int
    }

    type PaginatedMetrics {
        records: [Metric]
        nextOffset: Int
    }

    type PaginatedMetricResult {
        records: [MetricResult]
        nextOffset: Int
    }

    type PaginatedModelResult {
        records: [ModelResult]
        nextOffset: Int
    }

    type PaginatedFishGuts {
        records: [FishGuts]
        nextOffset: Int
    }
`

export default typeDefs
