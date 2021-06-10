INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (1, 'OTUCode_UTDEQ15', NULL, True);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (2, 'OTUCode1', NULL, False);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (3, 'OTUCode2', NULL, True);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (4, 'OTUCode3', NULL, False);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (5, 'OTUCodeCAnonmid05', NULL, False);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (6, 'OTUCodeCO09', NULL, False);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (7, 'OTUCodeCOedas', NULL, False);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (8, 'OTUCodeCOedas17', NULL, True);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (9, 'OTUCodeCSCIswamp', NULL, True);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (10, 'OTUCodeEcoaTI', NULL, False);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (11, 'OTUCodeNAMC', NULL, False);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (12, 'OTUCodeNone', NULL, False);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (13, 'OTUCodeNV', NULL, True);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (14, 'OTUCodeOR_NorthernBasinRange', NULL, False);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (15, 'OTUCodeORPred05MWCF', NULL, True);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (16, 'OTUCodeORPred05WCCP', NULL, True);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (17, 'OTUCodePIBO', NULL, True);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (18, 'OTUCodeReport', NULL, False);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (19, 'OTUCodeSEAK', NULL, True);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (20, 'OTUCodeUTDEQ09', NULL, False);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (21, 'OTUCodeWestWide18', NULL, True);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (22, 'OTUCodeWY18', NULL, True);
INSERT INTO taxa.translations (translation_id, translation_name, description, is_active) VALUES (23, 'OTUAREMP', NULL, True);

-- Data inserted with manual IDs. Reset the index
SELECT setval(pg_get_serial_sequence('taxa.translations', 'translation_id'), COALESCE(max(translation_id) + 1, 1), false) FROM taxa.translations;
