---
title: Data Migration
---

The table below describes where data has moved from in the old front and back end databases to the new database.
        You can search for the name of an old front or back end database table and see which tables in the new system now hold the relevant data.
        Note that some data has been split into two or more tables.

        
|Old Table|New Table(s)|
|---|---|
|GeoCounties|[geo.counties](schema_geo.html#counties)|
|Counties|[geo.counties](schema_geo.html#counties)|
|GeoCountries|[geo.countries](schema_geo.html#countries)|
|TypeEcosystems|[geo.ecosystems](schema_geo.html#ecosystems)|
|TypeHabitats|[geo.habitats](schema_geo.html#habitats)|
|TypeLandUses|[geo.land_uses](schema_geo.html#land_uses)|
|SiteInfo|[geo.sites](schema_geo.html#sites)|
|State|[geo.states](schema_geo.html#states)|
|GeoStates|[geo.states](schema_geo.html#states)|
|TypeSystems|[geo.systems](schema_geo.html#systems)|
|Customer|[entity.entities](schema_entity.html#entities), [entity.individuals](schema_entity.html#individuals), [entity.organizations](schema_entity.html#organizations)|
|Lab|[entity.entities](schema_entity.html#entities), [entity.organizations](schema_entity.html#organizations)|
|Employee|[entity.entities](schema_entity.html#entities), [entity.individuals](schema_entity.html#individuals)|
|BugLab|[entity.organizations](schema_entity.html#organizations)|
|TypeCustomerSpecial|[entity.organizations](schema_entity.html#organizations)|
|TypeCategories|[entity.organization_types](schema_entity.html#organization_types)|
|Taxonomy_ITIS|[taxa.external_ids](schema_taxa.html#external_ids), [taxa.taxa_sources](schema_taxa.html#taxa_sources)|
|TypeLifeStages|[taxa.life_stages](schema_taxa.html#life_stages)|
|Taxonomy_Synonyms|[taxa.synonyms](schema_taxa.html#synonyms)|
|BugInformation|[taxa.taxa_attributes](schema_taxa.html#taxa_attributes)|
|TypeTaxaLevels|[taxa.taxa_levels](schema_taxa.html#taxa_levels)|
|Taxonomy|[taxa.taxonomy](schema_taxa.html#taxonomy)|
|Hierarchies|[taxa.taxonomy](schema_taxa.html#taxonomy)|
|TypeOTU|[taxa.translations](schema_taxa.html#translations)|
|BugSample|[sample.benthic](schema_sample.html#benthic), [sample.samples](schema_sample.html#samples)|
|BoxTracking|[sample.boxes](schema_sample.html#boxes)|
|BugBoxes|[sample.boxes](schema_sample.html#boxes)|
|BugDrift|[sample.drift](schema_sample.html#drift)|
|BugVolumes|[sample.fish](schema_sample.html#fish)|
|BugOMatter|[sample.mass](schema_sample.html#mass)|
|BugStomachs|[sample.mass](schema_sample.html#mass)|
|BugData|[sample.organism_notes](schema_sample.html#organism_notes), [sample.organisms](schema_sample.html#organisms)|
|BugPlankton|[sample.plankton](schema_sample.html#plankton)|
|Project|[sample.projects](schema_sample.html#projects)|
|TypeMethods|[sample.sample_methods](schema_sample.html#sample_methods)|
|TypeSamples|[sample.sample_types](schema_sample.html#sample_types)|
|SubmissionInfo|[sample.submission_data](schema_sample.html#submission_data)|
|OE_MMI_Scores|[metric.metrics](schema_metric.html#metrics)|
|SorterQaQcStats|[metric.metrics](schema_metric.html#metrics)|
|TaxaQaQcStats|[metric.metrics](schema_metric.html#metrics)|
|QaQcStatsSorter|[metric.metrics](schema_metric.html#metrics)|
|QaQcStatsTaxa|[metric.metrics](schema_metric.html#metrics)|
|Box_Billing_Contract|[billing.agreements](schema_billing.html#agreements)|
|Box_Billing|[billing.billing](schema_billing.html#billing)|
|Box_Billing_Quote|[billing.quotes](schema_billing.html#quotes)|
|lkp_GTRS_SiteInfo|Deprecated|
|TEST_GEO|Deprecated|
|Web*|Deprecated|
|BugCount_OTU|Deprecated|
|BugDataOTU|Data available via view using Translations|
|BugOTU_pivot|Deprecated|
|BugSiData|Deprecated|
|BugSummary|TODO: Uncertain|
|BugSummaryOTU|TODO: Uncertain|
|BugVegSample|Deprecated|
|Collection|Deprecated|
|disCodes|Deprecated|
|Fishdata|Deprecated|
|FishSample|Deprecated|
|GIS|Deprecated|
|GISData|Deprecated|
|GISData_SITE|Deprecated|
|GISDefinition|Deprecated|
|GISQuery|Deprecated|
|Habitat|Deprecated|
|HabitatData|Deprecated|
|HabitatElement|Deprecated|
|MOTU|Deprecated|
|sysdiagrams|Deprecated|
|Taxaonomy_backup|Deprecated|
|tempCodes|Deprecated|
|topcodeOtu|Deprecated|
|topcodeOtu1|Deprecated|
|topcodeOtu2|Deprecated|
|topcodeOtu3|Deprecated|
|topcodeOtuNV|Deprecated|
|topcodeOtuPIBO|Deprecated|
|TypeCategories|Deprecated|
|TypeDatums|Deprecated|
