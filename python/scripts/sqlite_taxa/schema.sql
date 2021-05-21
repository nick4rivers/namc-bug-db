CREATE TABLE taxa_levels
(
    level_id        INT PRIMARY KEY    NOT NULL,
    level_name      VARCHAR(50) UNIQUE NOT NULL,
    parent_level_id INT UNIQUE,
    rank_order      int                not null,
    is_active       BOOLEAN            NOT NULL DEFAULT TRUE,
    description     TEXT,

    CONSTRAINT fk_taxa_levels_parent_level_id FOREIGN KEY (parent_level_id) REFERENCES taxa_levels (level_id)
);

CREATE TABLE taxonomy
(
    taxonomy_id     INT PRIMARY KEY NOT NULL,
    scientific_name VARCHAR(255)    NOT NULL,
    level_id        int             NOT NULL,
    parent_id       int,
    author          VARCHAR(255),
    year            int,
    created_date    TIMESTAMPTZ     NOT NULL DEFAULT current_timestamp,
    updated_date    TIMESTAMPTZ     NOT NULL DEFAULT current_timestamp,

    CONSTRAINT fk_taxonomy_taxa_level_id FOREIGN KEY (level_id) REFERENCES taxa_levels (level_id)
);
CREATE index fx_taxonomy_level_id on taxonomy(level_id);
create index fx_taxonomy_parent_id on taxonomy(parent_id);

CREATE TRIGGER tr_taxonomy
    before update
    ON taxonomy
    for each row
BEGIN
    update taxonomy set updated_date = current_timestamp where taxonomy_id = new.taxonomy_id;
END;

CREATE TABLE synonyms
(
    synonym_id  INT          NOT NULL PRIMARY KEY,
    taxonomy_id int          NOT NULL,
    synonym     VARCHAR(255) NOT NULL,

    CONSTRAINT fk_synonyms_taxonomy_id FOREIGN KEY (taxonomy_id) REFERENCES taxonomy (taxonomy_id) ON DELETE CASCADE
);
CREATE INDEX fx_synonyms_taxonomy_id ON synonyms (taxonomy_id);

--
-- CREATE TABLE taxa.attributes
-- (
--     attribute_id   int                 not null PRIMARY KEY,
--     attribute_name VARCHAR(255) UNIQUE NOT NULL,
--     attribute_type ATTRIBUTE_TYPES     NOT NULL,
--     label          VARCHAR(255),
--     description    TEXT,
--     metadata       JSON,
--
--     created_date   TIMESTAMPTZ         NOT NULL DEFAULT now(),
--     updated_date   TIMESTAMPTZ         NOT NULL DEFAULT now()
-- );
-- CREATE TRIGGER tr_attributes_update
--     BEFORE UPDATE
--     ON taxa.attributes
--     FOR EACH ROW
--     EXECUTE PROCEDURE fn_before_update();
--
--
-- CREATE TABLE taxa.taxa_attributes
-- (
--     taxonomy_id     int          NOT NULL,
--     attribute_id    int          NOT NULL,
--     attribute_value VARCHAR(100) NOT NULL,
--
--     CONSTRAINT pk_taxa_attributes PRIMARY KEY (taxonomy_id, attribute_id),
--     CONSTRAINT fk_taxa_attributes_taxonomy_id FOREIGN KEY (taxonomy_id) REFERENCES taxa.taxonomy (taxonomy_id) ON DELETE CASCADE,
--     CONSTRAINT fk_taxa_attributes_attribute_id FOREIGN KEY (attribute_id) REFERENCES taxa.attributes (attribute_id)
-- );


/*
 ITIS
 Encyc of Life
 Wiki Species
 */
CREATE TABLE external_sources
(
    source_id    int                 not null PRIMARY KEY,
    source_name  VARCHAR(255) UNIQUE NOT NULL,
    abbreviation VARCHAR(10) UNIQUE  NOT NULL,
    description  TEXT,
    metadata     text
);

CREATE TABLE external_ids
(
    source_id          int NOT NULL,
    taxonomy_id        int NOT NULL,
    external_source_id VARCHAR(255),

    CONSTRAINT pk_external_ids PRIMARY KEY (source_id, taxonomy_id),
    CONSTRAINT fk_external_ids_source_id FOREIGN KEY (source_id) REFERENCES external_sources (source_id) ON DELETE CASCADE,
    CONSTRAINT fk_external_ids_taxonomy_id FOREIGN KEY (taxonomy_id) REFERENCES taxonomy (taxonomy_id) on delete cascade
);


CREATE TABLE translations
(
    translation_id   int not null PRIMARY KEY,
    translation_name VARCHAR(255) UNIQUE NOT NULL,
    description      TEXT,
    is_active        BOOLEAN             NOT NULL DEFAULT TRUE,

    created_date     TIMESTAMPTZ         NOT NULL DEFAULT current_timestamp,
    updated_date     TIMESTAMPTZ         NOT NULL DEFAULT current_timestamp
);
CREATE TRIGGER tr_translations
    before update
    ON translations
BEGIN
    update translations set updated_date = current_timestamp where translation_id = new.translation_id;
END;


CREATE TABLE translation_taxa
(
    translation_taxonomy_id   INT not null PRIMARY KEY,
    translation_id            int         NOT NULL,
    taxonomy_id               int         NOT NULL,
    translation_taxonomy_name VARCHAR(255),
    created_date              TIMESTAMPTZ NOT NULL DEFAULT current_timestamp,
    updated_date              TIMESTAMPTZ NOT NULL DEFAULT current_timestamp,

    CONSTRAINT fk_translation_taxa_translation_id FOREIGN KEY (translation_id) REFERENCES translations (translation_id) ON DELETE CASCADE,
    CONSTRAINT fk_translation_taxa_taxonomy_id FOREIGN KEY (taxonomy_id) REFERENCES taxonomy (taxonomy_id)
);
CREATE INDEX fx_translation_taxa_taxonomy_id ON translation_taxa (taxonomy_id);
CREATE UNIQUE INDEX ux_translation_taxa_taxonomy_id ON translation_taxa (translation_id, taxonomy_id);

CREATE TRIGGER tr_translation_taxa
    before update
    ON translation_taxa
BEGIN
    update translation_taxa set updated_date = current_timestamp where translation_taxonomy_id = new .translation_taxonomy_id;
END;