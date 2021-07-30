import { types as t } from '@namcbugdb/common';
declare const _default: {
    Query: {
        auth: (obj: any, args: any, ctx: any) => Promise<t.AuthResponse>;
        samples: (obj: any, { limit, offset, sampleIds, boxIds, projectIds, entityIds, siteIds, polygon, pointDistance }: {
            limit: any;
            offset: any;
            sampleIds: any;
            boxIds: any;
            projectIds: any;
            entityIds: any;
            siteIds: any;
            polygon: any;
            pointDistance: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.Sample>>;
        organizations: (obj: any, { limit, offset, searchTerm }: {
            limit: any;
            offset: any;
            searchTerm: any;
        }, { user }: {
            user: any;
        }) => Promise<t.Organization>;
        sites: (obj: any, { limit, offset, sampleIds, boxIds, projectIds, entityIds, siteIds, polygon, pointDistance }: {
            limit: any;
            offset: any;
            sampleIds: any;
            boxIds: any;
            projectIds: any;
            entityIds: any;
            siteIds: any;
            polygon: any;
            pointDistance: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.Site>>;
        siteInfo: (obj: any, { siteId }: {
            siteId: any;
        }, { user }: {
            user: any;
        }) => Promise<t.SiteInfo>;
        boxInfo: (obj: any, { boxId }: {
            boxId: any;
        }, { user }: {
            user: any;
        }) => Promise<t.BoxInfo>;
        modelInfo: (obj: any, { modelId }: {
            modelId: any;
        }, { user }: {
            user: any;
        }) => Promise<t.ModelInfo>;
        modelConditions: (obj: any, { modelId }: {
            modelId: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.ModelCondition>>;
        samplePredictorValues: (obj: any, { sampleId }: {
            sampleId: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.SamplePredictorValue>>;
        boxes: (obj: any, { limit, offset, boxIds, entityIds }: {
            limit: any;
            offset: any;
            boxIds: any;
            entityIds: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.Box>>;
        projects: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.Project>>;
        taxonomy: (obj: any, { limit, offset, searchTerm }: {
            limit: any;
            offset: any;
            searchTerm: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.Taxonomy>>;
        taxonomyTree: (obj: any, { taxonomyId }: {
            taxonomyId: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.TaxonomyTree>>;
        predictors: (obj: any, { limit, offset, modelId }: {
            limit: any;
            offset: any;
            modelId: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.Predictor>>;
        models: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.Model>>;
        translations: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.Translation>>;
        translationTaxa: (obj: any, { limit, offset, translationId }: {
            limit: any;
            offset: any;
            translationId: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.TranslationTaxa>>;
        sitePredictorValues: (obj: any, { limit, offset, siteId }: {
            limit: any;
            offset: any;
            siteId: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.SitePredictorValue>>;
        sampleTaxaRaw: (obj: any, { sampleIds, boxIds, projectIds }: {
            sampleIds: any;
            boxIds: any;
            projectIds: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.SampleTaxa>>;
        sampleTaxaGeneralized: (obj: any, { sampleId }: {
            sampleId: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.GeneralizedSampleTaxa>>;
        sampleTaxaTranslation: (obj: any, { sampleId, translationId }: {
            sampleId: any;
            translationId: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.SampleTaxa>>;
        sampleTaxaTranslationRarefied: (obj: any, { sampleId, translationId, fixedCount }: {
            sampleId: any;
            translationId: any;
            fixedCount: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.SampleTaxa>>;
        pointTaxaRaw: (obj: any, { longitude, latitude, distance }: {
            longitude: any;
            latitude: any;
            distance: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.SampleTaxa>>;
        polygonTaxaRaw: (obj: any, { polygon }: {
            polygon: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.SampleTaxa>>;
        attributes: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.Attribute>>;
        metrics: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.Metric>>;
        sampleMetrics: (obj: any, { sampleIds, boxIds, projectIds, translationId, fixedCount }: {
            sampleIds: any;
            boxIds: any;
            projectIds: any;
            translationId: any;
            fixedCount: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.MetricResult>>;
        taxaAttributes: (obj: any, { taxonomyId, limit, offset }: {
            taxonomyId: any;
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.AttributeValue>>;
        planktonSamples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.PlanktonSample>>;
        driftSamples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.DriftSample>>;
        fishSamples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.FishSample>>;
        massSamples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.MassSample>>;
        modelResults: (obj: any, { limit, offset, sampleIds }: {
            limit: any;
            offset: any;
            sampleIds: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.ModelResult>>;
        fishDiet: (obj: any, { limit, offset, sampleIds }: {
            limit: any;
            offset: any;
            sampleIds: any;
        }, { user }: {
            user: any;
        }) => Promise<t.PaginatedRecords<t.FishDiet>>;
    };
    Mutation: {
        setSitePredictorValue: (obj: any, { siteId, predictorId, value }: {
            siteId: any;
            predictorId: any;
            value: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        setSamplePredictorValue: (obj: any, { sampleId, predictorId, value }: {
            sampleId: any;
            predictorId: any;
            value: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        setSiteCatchment: (obj: any, { siteId, catchment }: {
            siteId: any;
            catchment: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        createTranslation: (obj: any, { translationName, description }: {
            translationName: any;
            description: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        setTranslationTaxa: (obj: any, { translationId, taxonomyId, alias, isFinal }: {
            translationId: any;
            taxonomyId: any;
            alias: any;
            isFinal: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        deleteTranslationTaxa: (obj: any, { translationId, taxonomyId }: {
            translationId: any;
            taxonomyId: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        setTaxonomy: (obj: any, { taxonomyId, scientificName, levelId, parentId, author, year, notes, metadata }: {
            taxonomyId: any;
            scientificName: any;
            levelId: any;
            parentId: any;
            author: any;
            year: any;
            notes: any;
            metadata: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        createProject: (obj: any, { projectName, isPrivate, contactId, description, metadata }: {
            projectName: any;
            isPrivate: any;
            contactId: any;
            description: any;
            metadata: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        addProjectSamples: (obj: any, { projectId, sampleIds }: {
            projectId: any;
            sampleIds: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        addProjectBoxes: (obj: any, { projectId, boxIds }: {
            projectId: any;
            boxIds: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        removeProjectSamples: (obj: any, { projectId, sampleIds }: {
            projectId: any;
            sampleIds: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
        deleteProject: (obj: any, { projectId }: {
            projectId: any;
        }, { user }: {
            user: any;
        }) => Promise<number>;
    };
};
export default _default;
