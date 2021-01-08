---
title: Data Migration
---

The table below describes where data has moved from in the old front and back end databases to the new database.
        You can search for the name of an old front or back end database table and see which tables in the new system now hold the relevant data.
        Note that some data has been split into two or more tables.

        
|Old Table|New Table(s)|
|---|---|
|GeoCounties|geo.counties|
|GeoCountries|geo.countries|
|TypeEcosystems|geo.ecosystems|
|TypeHabitats|geo.habitats|
|TypeLandUses|geo.land_uses|
|SiteInfo|geo.sites|
|State|geo.states|
|TypeSystems|geo.systems|
|Customer|entity.entities, entity.individuals, entity.organizations|
|Lab|entity.entities, entity.organizations|
|Employee|entity.entities, entity.individuals|
|TypeLifeStages|taxa.life_stages|
|Taxonomy_Synonyms|taxa.synonyms|
|BugInformation|taxa.taxa_attributes|
|TypeTaxaLevels|taxa.taxa_levels|
|Taonomy_ITIS|taxa.taxa_sources|
|Taxonomy|taxa.taxonomy|
|BugOTU|taxa.translations|
|BugSample|sample.benthic, sample.samples|
|BoxTracking|sample.boxes|
|BugBoxes|sample.boxes|
|BugDrift|sample.drift|
|BugVolume|sample.fish|
|BugOMatter|sample.mass|
|BugData|sample.organism_notes, sample.organisms|
|BugPlankton|sample.plankton|
|Project|sample.projects|
|TypeMethods|sample.sample_methods|
|TypeSamples|sample.sample_types|
|Box_Billing_Contract|billing.agreements|
|Box_Billing|billing.billing|
|Box_Billing_Quote|billing.quotes|
