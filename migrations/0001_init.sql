-- ClauWi® initial schema.
-- Apply locally:  npm run db:migrate:local
-- Apply remote:   npm run db:migrate:remote
--
-- Real content tables (advisors, courses, posts) land in later migrations once
-- the migration scripts read the legacy WordPress DB. This just proves the
-- binding + migration pipeline end-to-end.

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO meta (key, value) VALUES ('schema_bootstrapped', '1');
