-- noinspection SqlNoDataSourceInspectionForFile

ALTER TABLE users
  ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- noinspection SqlWithoutWhere
UPDATE users SET updated_at = created_at;

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE
    ON users
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
