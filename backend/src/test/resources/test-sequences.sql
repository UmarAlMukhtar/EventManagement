CREATE TABLE IF NOT EXISTS id_sequences (entity VARCHAR(32) PRIMARY KEY, next_value BIGINT NOT NULL);
INSERT INTO id_sequences (entity, next_value) VALUES
('users', 1), ('events', 1), ('registrations', 1), ('attendance', 1), ('feedback', 1);
