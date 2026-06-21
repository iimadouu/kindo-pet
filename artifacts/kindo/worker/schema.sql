CREATE TABLE IF NOT EXISTS kindo_data (
  key        TEXT    PRIMARY KEY,
  value      TEXT    NOT NULL,
  updated_at INTEGER DEFAULT (unixepoch())
);
