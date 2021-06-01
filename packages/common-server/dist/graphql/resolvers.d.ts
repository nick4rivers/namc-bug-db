import { AuthResponse, Box, BoxInfo, Model, ModelInfo, ModelPredictor, ModelThreshold, PaginatedRecords, Predictor, Project, Sample, SampleInfo, SamplePredictorValue, Site, SiteInfo, SitePredictorValue, Taxonomy, Translation, RawSampleTaxa, GeneralizedSampleTaxa, TranslationSampleTaxa, RarefiedSampleTaxa, PlanktonSample, DriftSample, FishSample, MassSample, Attribute, AttributeValue, Metric } from '@namcbugdb/common';
declare const _default: {
    Query: {
        auth: (obj: any, args: any, ctx: any) => Promise<AuthResponse>;
        samples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }, info: any) => Promise<PaginatedRecords<Sample>>;
        sites: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Site>>;
        siteInfo: (obj: any, { siteId }: {
            siteId: any;
        }, { user }: {
            user: any;
        }) => Promise<SiteInfo>;
        sampleInfo: (obj: any, { sampleId }: {
            sampleId: any;
        }, { user }: {
            user: any;
        }) => Promise<SampleInfo>;
        boxInfo: (obj: any, { boxId }: {
            boxId: any;
        }, { user }: {
            user: any;
        }) => Promise<BoxInfo>;
        modelInfo: (obj: any, { modelId }: {
            modelId: any;
        }, { user }: {
            user: any;
        }) => Promise<ModelInfo>;
        modelThresholds: (obj: any, { modelId }: {
            modelId: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<ModelThreshold>>;
        samplePredictorValues: (obj: any, { sampleId }: {
            sampleId: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<SamplePredictorValue>>;
        boxes: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Box>>;
        projects: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Project>>;
        taxonomy: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Taxonomy>>;
        predictors: (obj: any, { limit, offset, modelId }: {
            limit: any;
            offset: any;
            modelId: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Predictor>>;
        models: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Model>>;
        translations: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Translation>>;
        sitePredictorValues: (obj: any, { limit, offset, siteId }: {
            limit: any;
            offset: any;
            siteId: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<SitePredictorValue>>;
        modelPredictors: (obj: any, { limit, offset, modelId }: {
            limit: any;
            offset: any;
            modelId: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<ModelPredictor>>;
        sampleTaxaRaw: (obj: any, { sampleIds, boxIds, projectIds }: {
            sampleIds: any;
            boxIds: any;
            projectIds: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<RawSampleTaxa>>;
        sampleTaxaGeneralized: (obj: any, { sampleId }: {
            sampleId: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<GeneralizedSampleTaxa>>;
        sampleTaxaTranslation: (obj: any, { sampleId, translationId }: {
            sampleId: any;
            translationId: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<TranslationSampleTaxa>>;
        sampleTaxaRarefied: (obj: any, { sampleId, fixedCount }: {
            sampleId: any;
            fixedCount: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<RarefiedSampleTaxa>>;
        sampleTaxaTranslationRarefied: (obj: any, { sampleId, translationId, fixedCount }: {
            sampleId: any;
            translationId: any;
            fixedCount: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<RarefiedSampleTaxa>>;
        pointTaxaRaw: (obj: any, { longitude, latitude, distance }: {
            longitude: any;
            latitude: any;
            distance: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<RawSampleTaxa>>;
        polygonTaxaRaw: (obj: any, { polygon }: {
            polygon: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<RawSampleTaxa>>;
        attributes: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Attribute>>;
        metrics: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<Metric>>;
        taxaAttributes: (obj: any, { taxonomyId, limit, offset }: {
            taxonomyId: any;
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<AttributeValue>>;
        planktonSamples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<PlanktonSample>>;
        driftSamples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<DriftSample>>;
        fishSamples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<FishSample>>;
        massSamples: (obj: any, { limit, offset }: {
            limit: any;
            offset: any;
        }, { user }: {
            user: any;
        }) => Promise<PaginatedRecords<MassSample>>;
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
    };
};
export default _default;
