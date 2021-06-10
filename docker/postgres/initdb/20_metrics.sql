INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (1, 1, 'SampleID', 'NAMC unique tracking number', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (2, 1, 'Station (NAMC)', 'NAMC station tracking id', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (3, 1, 'Station (Customer)', 'Station abbreviation provided by the customer', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (4, 1, 'Waterbody', 'Specific location name', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (5, 1, 'County', 'Administrative boundary', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (6, 1, 'State', 'Administrative boundary', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (7, 1, 'Latitude', 'Y coordinate in decimal degree units', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (8, 1, 'Longitude', 'X coordinate in decimal degree units', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (9, 1, 'Collection Date', 'Date of sampling event', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (10, 1, 'Habitat Sampled', 'Microhabitat or channel unit(s) where sample(s) was taken. Values are restricted to predetermined values as specified in the PDF metadata.', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (11, 1, 'Collection Method', 'Method used to collect sample. Values are restricted to predetermined values as specified in the PDF metadata.', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (12, 1, 'Field Notes', 'Field notes provided by customer', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (13, 1, 'Lab Notes', 'Laboratory processing notes, particularly regarding condition of received samples and QAQC', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (14, 1, 'Area Sampled', 'Total area sampled in square meters', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (15, 2, 'Field Split', '% sample submitted for processing', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (16, 2, 'Lab Split', '% of sample processed to obtain 600 random individuals (if present)', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (17, 2, 'Split Count', '# of organisms randomly subsampled from [Lab Split] for identification', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (18, 2, 'Fixed count', '# of computationally resampled organisms', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (19, 2, 'Big Rare Count', '# of "big and rare" organisms selected NON-RANDOMLY for identification from the entire submitted sample', NULL, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (20, 3, 'Richness', '# of unique taxa, standardized to OTU', TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (21, 3, 'Abundance', 'Estimated # number of individuals per unit area (m2) for quantitative samples OR the estimated number per sample for qualitative samples.', FALSE, 'Increase or decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (22, 3, 'Shannon''s Diversity', 'Measure of richness and evenness (based on relative abundance of each species); weighted toward rare species', TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (23, 3, 'Simpson''s Diversity', 'Measure of richness and evenness (based on relative abundance of each species); weighted toward common species', TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (24, 3, 'Evenness', 'Measure of relative abundance indicative of taxa dominance', TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (25, 3, '# of EPT Taxa', 'Richness of Ephemeroptera, Plecoptera, and Trichoptera taxa', TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (26, 3, 'EPT Taxa Abundance', 'Abundance of Ephemeroptera, Plecoptera, and Trichoptera taxa', FALSE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (27, 4, 'Dominant Family', 'Taxonomic family with the highest abundance', FALSE, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (28, 4, 'Abundance of Dominant Family', 'Abundance of dominant family', FALSE, 'Increase');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (29, 4, 'Dominant Taxa', 'Individual taxa with the highest abundance', FALSE, NULL);
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (30, 4, 'Abundance of Dominant Taxa', 'Abundance of dominant taxa', FALSE, 'Increase');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (31, 5, 'Hilsenhoff Biotic Index', 'Abundance-weighted average of family-level pollution tolerances', TRUE, 'Increase');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (32, 5, '# of Intolerant Taxa', '# of taxa with an HBI score <= 2', TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (33, 5, 'Intolerant Taxa abundance', 'Abundance of taxa with an HBI score <= 2', FALSE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (34, 5, '# of Tolerant Taxa', '# of taxa with an HBI score>=8', TRUE, 'Increase');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (35, 5, 'Tolerant Taxa abundance', 'Abundance of taxa with an HBI score >=8', FALSE, 'Increase');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (36, 5, 'USFS Community Tolerance Quotient (d)', 'Dominance weighted community tolerance quotient', TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (37, 6, '# of shredder taxa', '# of taxa utilizing living or decomposing vascular plant tissue and CPOM', TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (38, 6, 'Shredder Abundance', 'Abundance of taxa utilizing vascular plant tissue and CPOM', FALSE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (39, 6, '# of scraper taxa', '# of taxa utilizing periphyton, particularly algae and diatoms', TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (40, 6, 'Scraper abundance', 'Abundance of taxa utilizing periphyton, particularly algae and diatoms', FALSE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (41, 6, '# of collector-filterer taxa', '# of taxa utilizing FPOM in the water column', TRUE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (42, 6, 'Collector-filterer abundance', 'Abundance of taxa utilizing FPOM in the water column', FALSE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (43, 6, '# of collector-gatherer taxa', '# of taxa utilizing FPOM from benthic deposits', TRUE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (44, 6, 'Collector-gatherer abundance', 'Abundance of taxa utilizing FPOM from benthic deposits', FALSE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (45, 6, '# of predator taxa', '# of taxa utilizing living animal tissue', TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (46, 6, 'Predator abundance', 'Abundance of taxa utilizing living animal tissue', FALSE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (47, 7, '# of clinger taxa', '# of taxa with fixed retreats or other strategies for clinging to rocks', TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (48, 7, '"# of" Long-lived Taxa', '# of taxa with 2 to 3 year life cycles', TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (49, 8, '# of Ephemeroptera taxa', NULL, TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (50, 8, 'Ephemeroptera abundance', NULL, FALSE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (51, 8, '# of Plecoptera taxa', NULL, TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (52, 8, 'Plecoptera abundance', NULL, FALSE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (53, 8, '# of Trichoptera taxa', NULL, TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (54, 8, 'Trichoptera abundance', NULL, FALSE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (55, 8, '# of Coleoptera taxa', NULL, TRUE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (56, 8, 'Coleoptera abundance', NULL, FALSE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (57, 8, '# of Elmidae taxa', NULL, TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (58, 8, 'Elmidae abundance', NULL, FALSE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (59, 8, '# of Megaloptera taxa', NULL, TRUE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (60, 8, 'Megaloptera abundance', NULL, FALSE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (61, 8, '# of Diptera taxa', NULL, TRUE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (62, 8, 'Diptera abundance', NULL, FALSE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (63, 8, '# of Chironomidae taxa', NULL, TRUE, 'Increase');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (64, 8, 'Chironomidae abundance', NULL, FALSE, 'Increase');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (65, 8, '# of Crustacea taxa', NULL, TRUE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (66, 8, 'Crustacea abundance', NULL, FALSE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (67, 8, '# of Oligochaete taxa', NULL, TRUE, 'Increase');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (68, 8, 'Oligochaeta abundance', NULL, FALSE, 'Increase');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (69, 8, '# of Mollusca taxa', NULL, TRUE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (70, 8, 'Mollusca abundance', NULL, FALSE, 'Variable');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (71, 8, '# of Insect taxa', NULL, TRUE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (72, 8, 'Insecta abundance', NULL, FALSE, 'Decrease');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (73, 8, '# of non-insect taxa', NULL, TRUE, 'Increase');
INSERT INTO metric.metrics (metric_id, group_id, metric_name, description, is_standardized, perturb_direction) VALUES (74, 8, 'Non-insect abundance', NULL, FALSE, 'Increase');