-- noinspection SqlNoDataSourceInspectionForFile

CREATE TABLE users
(
    id              UUID PRIMARY KEY            DEFAULT gen_random_uuid(),
    email           VARCHAR(255)                NOT NULL UNIQUE,
    password_hash   TEXT                        NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE    NOT NULL
)
