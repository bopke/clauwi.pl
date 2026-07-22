-- Allowlist of Google accounts permitted to sign into the admin panel.
-- Login is gated against this table (see src/auth.ts signIn callback).
-- Mirrors specjalisci-easybaby's allowlist pattern exactly.

CREATE TABLE IF NOT EXISTS allowlist (
  email TEXT PRIMARY KEY,
  added TEXT NOT NULL DEFAULT (date('now'))
);

-- Bootstrap access (same account seeded in specjalisci-easybaby) so the panel
-- is reachable immediately after deploy; add/remove real accounts via the
-- Access tab once logged in.
INSERT OR IGNORE INTO allowlist (email, added) VALUES ('bopke2@gmail.com', date('now'));
