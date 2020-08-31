-- DROP DATABASE IF EXISTS bugdb;
--
CREATE DATABASE bugdb3;


CREATE TABLE units (
    unit_id SERIAL PRIMARY KEY,
    unit_name VARCHAR(50) UNIQUE NOT NULL,
    abbreviation VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE predictors (
    predictor_id SERIAL PRIMARY KEY,
    predictor_name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    unit_id INT NOT NULL,

    CONSTRAINT fk_predictors_unit_id FOREIGN KEY (unit_id) REFERENCES units(unit_id)
);
CREATE INDEX ix_predictors_unit_id ON predictors(unit_id);


CREATE TABLE countries (
    country_id SERIAL PRIMARY KEY,
    country_name VARCHAR(255) UNIQUE NOT NULL,
    geom geometry(MultiPolygon, 4326) NOT NULL
);
CREATE INDEX ix_countries_geom ON countries USING GIST(geom);

CREATE TABLE states (
    state_id SERIAL PRIMARY KEY,
    country_id INT NOT NULL,
    state_name VARCHAR(255) NOT NULL,
    abbreviation varchar(2) NOT NULL,
    geom geometry(MultiPolygon, 4326) NOT NULL,

    CONSTRAINT fk_states_country_id FOREIGN KEY (country_id) REFERENCES countries(country_id)
);
CREATE INDEX ix_states_country_id ON states(country_id);
CREATE UNIQUE INDEX ux_states_name ON states(country_id, state_name);
CREATE UNIQUE INDEX ux_states_abbreviation ON states(country_id, abbreviation);
CREATE INDEX ix_states_geom ON states USING GIST(geom);

CREATE TABLE counties (
    county_id SERIAL PRIMARY KEY,
    state_id INT NOT NULL,
    county_name VARCHAR(255) NOT NULL,
    geom geometry(MultiPolygon, 4326) NOT NULL,

    CONSTRAINT fk_counties_state_id FOREIGN KEY (state_id) REFERENCES states(state_id)
);
CREATE INDEX ix_counties_state_id ON counties(state_id);
CREATE UNIQUE INDEX ux_counties_name ON counties(state_id, county_name);
CREATE INDEX ix_counties_geom ON counties USING GIST(geom);

CREATE TABLE model_types (
    model_type_id SERIAL PRIMARY KEY,
    model_type_name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO model_types (model_type_id, model_type_name) VALUES
    (1, 'MMI'),
    (2, 'ODE');

CREATE TABLE models (
    model_id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) UNIQUE NOT NULL,
    model_type_id INT NOT NULL,
    state_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT fk_models_model_type_id FOREIGN KEY (model_type_id) REFERENCES model_types(model_type_id),
    CONSTRAINT fk_models_state_id FOREIGN KEY (state_id) REFERENCES states(state_id)
);
CREATE INDEX ix_models_model_type_id ON models(model_type_id);
CREATE INDEX ix_models_state_id ON models(state_id);

CREATE TABLE model_predictors (
    model_id INT NOT NULL,
    predictor_id INT NOT NULL,

    PRIMARY KEY (model_id, predictor_id),
    CONSTRAINT fk_model_predictors_model_id FOREIGN KEY (model_id) REFERENCES models(model_id),
    CONSTRAINT fk_model_predictors_predictor_id FOREIGN KEY (predictor_id) REFERENCES predictors(predictor_id)
);

CREATE TABLE sites (
    site_id SERIAL PRIMARY KEY,
    site_name varchar(50) UNIQUE NOT NULL,
    description varchar(255),
    waterbody VARCHAR(255),
    geom geometry(Point, 4326) NOT NULL,
    NHDPlusID BIGINT,
    COMID BIGINT
);
CREATE INDEX ix_sites_geom ON sites USING GIST(geom);

CREATE TABLE site_predictors (
    site_id INT NOT NULL,
    predictor_id INT NOT NULL,
    predictor_value double precision,

    PRIMARY KEY (site_id, predictor_id),
    CONSTRAINT fk_site_predictors_site_id FOREIGN KEY (site_id) REFERENCES sites(site_id),
    CONSTRAINT fk_site_predictors_predictor_id FOREIGN KEY (predictor_id) REFERENCES predictors(predictor_id)
);

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) UNIQUE NOT NULL,
    street1 VARCHAR(255),
    street2 VARCHAR(255),
    city VARCHAR(255),
    country_id INT NOT NULL,
    zip_code VARCHAR(20),

    CONSTRAINT fk_customers_country_id FOREIGN KEY (country_id) REFERENCES countries(country_id)
);

CREATE TABLE box_statuses (
    status_id SERIAL PRIMARY KEY,
    box_status_name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO box_statuses (status_id, box_status_name) VALUES
    (1, 'Submitted'),
    (2, 'Received'),
    (3, 'Pending'),
    (4, 'Complete'),
    (5, 'Archived');

CREATE TABLE boxes (
    box_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    status_id INT NOT NULL,

    CONSTRAINT fk_boxes_customer_id FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    CONSTRAINT fk_boxes_status_id FOREIGN KEY (status_id) REFERENCES box_statuses(status_id)
);
CREATE INDEX ix_boxes_customer_id ON boxes(customer_id);
CREATE INDEX ix_boxes_status_id ON boxes(status_id);

CREATE TABLE samples (
    sample_id SERIAL PRIMARY KEY,
    box_id INT NOT NULL,
    site_id INT,

    CONSTRAINT fk_samples_box_id FOREIGN KEY (box_id) REFERENCES boxes(box_id),
    CONSTRAINT fk_samples_site_id FOREIGN KEY (site_id) REFERENCES sites(site_id)
);
CREATE INDEX ix_samples_box_id ON samples(box_id);
CREATE INDEX ix_samples_site_id ON samples(site_id);

CREATE TABLE sample_models (
    sample_id INT NOT NULL,
    model_id INT NOT NULL,
    model_result DOUBLE PRECISION,

    PRIMARY KEY (sample_id, model_id),
    CONSTRAINT fk_sample_models_sample_id FOREIGN KEY (sample_id) REFERENCES samples(sample_id),
    CONSTRAINT fk_samples_model_id FOREIGN KEY (model_id) REFERENCES models(model_id)
);
CREATE INDEX ix_sample_models_sample_id ON sample_models(sample_id);
CREATE INDEX ix_sample_models_model_id ON sample_models(model_id);

CREATE TABLE taxa_levels(
    taxa_level_id SERIAL PRIMARY KEY,
    taxa_level_name VARCHAR(20) UNIQUE NOT NULL
);
INSERT INTO taxa_levels (taxa_level_id, taxa_level_name) VALUES 
    (1, 'Domain'),
    (2, 'Kingdom'),
    (3, 'Phylum'),
    (4, 'Class'),
    (5, 'Order'),
    (6, 'Family'),
    (7, 'Genus'),
    (8, 'Species');

CREATE TABLE taxa (
    taxa_id SERIAL PRIMARY KEY,
    taxa_name varchar(255) NOT NULL,
    taxa_level_id INT NOT NULL,
    parent_taxa_id INT,

    CONSTRAINT fk_taxa_taxa_level_id FOREIGN KEY (taxa_level_id) REFERENCES taxa_levels(taxa_level_id),
    CONSTRAINT fk_taxa_parent_taxa_id FOREIGN KEY (parent_taxa_id) REFERENCES taxa(taxa_id)
);
CREATE INDEX ix_taxa_taxa_level_id ON taxa_levels(taxa_level_id);
