-- reset all the equences for which autoincrement primary keys were specified.

SELECT setval(pg_get_serial_sequence('taxa.translations', 'translation_id'), COALESCE(max(translation_id) + 1, 1), false) FROM taxa.translations;
SELECT setval(pg_get_serial_sequence('metric.metrics', 'metric_id'), COALESCE(max(metric_id) + 1, 1), false) FROM metric.metrics;
