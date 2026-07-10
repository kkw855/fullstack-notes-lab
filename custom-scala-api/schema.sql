CREATE TABLE notes
(
    id         UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    title      VARCHAR(255)                                   NOT NULL,
    content    TEXT                                           NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT
                                            CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT
                                            CURRENT_TIMESTAMP NOT NULL
);

CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_set_updated_at
    BEFORE UPDATE
    ON notes
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
