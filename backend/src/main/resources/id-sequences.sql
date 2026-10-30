CREATE TABLE IF NOT EXISTS id_sequences (
    entity VARCHAR(32) PRIMARY KEY,
    next_value BIGINT NOT NULL
);
INSERT INTO id_sequences (entity, next_value)
SELECT 'users', COALESCE(MAX(CAST(SUBSTRING(user_id, 2) AS UNSIGNED)), 0) + 1 FROM users WHERE user_id REGEXP '^u[0-9]+$'
ON DUPLICATE KEY UPDATE next_value = GREATEST(next_value, VALUES(next_value));
INSERT INTO id_sequences (entity, next_value)
SELECT 'events', COALESCE(MAX(CAST(SUBSTRING(event_id, 2) AS UNSIGNED)), 0) + 1 FROM events WHERE event_id REGEXP '^e[0-9]+$'
ON DUPLICATE KEY UPDATE next_value = GREATEST(next_value, VALUES(next_value));
INSERT INTO id_sequences (entity, next_value)
SELECT 'registrations', COALESCE(MAX(CAST(SUBSTRING(reg_id, 2) AS UNSIGNED)), 0) + 1 FROM registrations WHERE reg_id REGEXP '^r[0-9]+$'
ON DUPLICATE KEY UPDATE next_value = GREATEST(next_value, VALUES(next_value));
INSERT INTO id_sequences (entity, next_value)
SELECT 'attendance', COALESCE(MAX(CAST(SUBSTRING(att_id, 2) AS UNSIGNED)), 0) + 1 FROM attendance WHERE att_id REGEXP '^a[0-9]+$'
ON DUPLICATE KEY UPDATE next_value = GREATEST(next_value, VALUES(next_value));
INSERT INTO id_sequences (entity, next_value)
SELECT 'feedback', COALESCE(MAX(CAST(SUBSTRING(fb_id, 2) AS UNSIGNED)), 0) + 1 FROM feedback WHERE fb_id REGEXP '^f[0-9]+$'
ON DUPLICATE KEY UPDATE next_value = GREATEST(next_value, VALUES(next_value));
