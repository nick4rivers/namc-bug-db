INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (1, 1, '(0.92,]', 'Good: likely intact', '>.92');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (2, 1, '(0.79,0.92]', 'Fair: possibly intact', '>.79');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (3, 1, '[,0.79]', 'Poor: Likely or very likely altered', '<=.79');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (4, 2, '(0.7895,]', 'Good', '>.7895');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (5, 2, '(0.5764,0.7895]', 'Fair', '>.5764');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (6, 2, '[,0.5764]', 'Poor', '<=.5764');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (7, 3, '[47.01497,]', 'Reference', '>=47.01497');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (8, 3, '(44.58171,47.01497)', 'Undetermined', '>44.58171');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (9, 3, '[,44.58171]', 'Impaired', '<=44.58171');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (10, 4, '(52,]', 'Not impaired', '>52');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (11, 4, '[42,52]', 'Inconclusive', '>=42');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (12, 4, '[,42)', 'Likely impaired', '<42');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (13, 5, '(50,]', 'Not impaired', '>50');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (14, 5, '[42,50]', 'Inconclusive', '>=42');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (15, 5, '[,42)', 'Likely impaired', '<42');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (16, 6, '(37,]', 'Not impaired', '>37');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (17, 6, '[22,37]', 'Inconclusive', '>=22');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (18, 6, '[,22)', 'Likely impaired', '<22');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (19, 7, '(0.871,]', 'Good', '>.871');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (20, 7, '(0.724,0.871]', 'Fair', '>.724');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (21, 7, '[,0.724]', 'Poor', '<=.724');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (22, 9, '(0.79,]', 'Good', '>.79');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (23, 9, '(0.63,0.79]', 'Fair', '>.63');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (24, 9, '[,0.63]', 'Poor', '<=.63');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (25, 10, '(1.23,]', 'Enriched', '>1.23');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (26, 10, '[0.93,1.23]', 'Least disturbed', '>=.93');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (27, 10, '[0.79,0.93)', 'Moderately disturbed', '>=.79');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (28, 10, '[,0.79]', 'Most disturbed', '<.79');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (29, 11, '[1.24,]', 'Enriched', '>1.24');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (30, 11, '[0.92,1.24]', 'Least disturbed', '>=.92');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (31, 11, '[0.86,0.92)', 'Moderately disturbed', '>=.86');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (32, 11, '[,0.86)', 'Most disturbed', '<.86');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (33, 12, '(1.3,]', 'Enriched', '>1.3');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (34, 12, '(0.75,1.3]', 'Least disturbed', '>.75');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (35, 12, '(0.5,0.75]', 'Moderately disturbed', '>.5');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (36, 12, '[,0.5]', 'Most disturbed', '<=.5');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (37, 13, '(0.8646,]', 'Full-support', '>0.8646');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (38, 13, '[0.6456,0.8646]', 'Indeterminate', '>=0.6456');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (39, 13, '[,0.6456)', 'Partial/non-support', '<0.6456');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (40, 14, '(0.8832,]', 'Full-support', '>0.8832');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (41, 14, '[0.6468,0.8832]', 'Indeterminate', '>=0.6468');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (42, 14, '[,0.6468)', 'Partial/non-support', '<0.6468');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (43, 15, '(0.8234,]', 'Full-support', '>0.8234');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (44, 15, '[0.6825,0.8234]', 'Indeterminate', '>=0.6825');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (45, 15, '[,0.6825)', 'Partial/non-support', '<0.6825');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (46, 16, '(0.8917,]', 'Full-support', '>0.8917');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (47, 16, '[0.6208,0.8917]', 'Indeterminate', '>=0.6208');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (48, 16, '[,0.6208)', 'Partial/non-support', '<0.6208');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (49, 17, '(0.8818,]', 'Full-support', '>0.8818');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (50, 17, '[0.6838,0.8818]', 'Indeterminate', '>=0.6838');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (51, 17, '[,0.6838)', 'Partial/non-support', '<0.6838');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (52, 18, '(0.8445,]', 'Full-support', '>0.8445');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (53, 18, '[0.6310,0.8445]', 'Indeterminate', '>=0.6310');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (54, 18, '[,0.6310)', 'Partial/non-support', '<0.6310');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (55, 19, '(0.8813,]', 'Full-support', '>0.8813');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (56, 19, '[0.59400.8813]', 'Indeterminate', '>=0.5940');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (57, 19, '[,0.5940)', 'Partial/non-support', '<0.5940');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (58, 20, '(0.8599,]', 'Full-support', '>0.8599');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (59, 20, '[0.6847,0.8599]', 'Indeterminate', '>=0.6847');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (60, 20, '[,0.6847)', 'Partial/non-support', '<0.6847');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (61, 21, '(0.7813,]', 'Full-support', '>0.7813');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (62, 21, '[0.5144,0.7813]', 'Indeterminate', '>=0.5144');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (63, 21, '[,0.5144)', 'Partial/non-support', '<0.5144');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (64, 22, '(0.7500,]', 'Full-support', '>0.7500');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (65, 22, '[0.5199,0.7500]', 'Indeterminate', '>=0.5199');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (66, 22, '[,0.5199)', 'Partial/non-support', '<0.5199');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (67, 23, '(0.8158,]', 'Full-support', '>0.8158');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (68, 23, '[0.6351,0.8158]', 'Indeterminate', '>=0.6351');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (69, 23, '[,0.6351)', 'Partial/non-support', '<0.6351');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (70, 25, '(0.88,]', 'Good', '>.88');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (71, 25, '(0.72,0.88]', 'Fair', '>.72');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (72, 25, '[,0.72]', 'Poor', '<=.72');

INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (73, 26, '(0.79,]', 'Good', '>.79');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (74, 26, '(0.6,0.79]', 'Fair', '>.6');
INSERT INTO geo.model_thresholds (threshold_id, model_id, threshold, display_text, description) VALUES (75, 26, '[,0.6]', 'Poor', '<=.6');
