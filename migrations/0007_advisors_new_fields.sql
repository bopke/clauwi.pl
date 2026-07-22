-- Two fields present in the correct/current advisor source data (TablePress
-- tables id=8/9 on the legacy site — see clauwi-rewrite-project memory) that
-- our original schema didn't capture at all. Additive only, safe to run
-- against the existing 512-row (soon to be re-seeded) advisors table.
ALTER TABLE advisors ADD COLUMN waznoscUprawnien TEXT NOT NULL DEFAULT '';
ALTER TABLE advisors ADD COLUMN uwagi TEXT NOT NULL DEFAULT '';
