-- Migration: Add results.verifiedById and whatsapp_templates.qualityRating
-- result.service.ts records who verified a result, and the WhatsApp template
-- quality webhook records Meta's quality rating, but neither column was ever
-- migrated. All statements are idempotent (safe to re-run).

ALTER TABLE "results"
  ADD COLUMN IF NOT EXISTS "verifiedById" TEXT;

CREATE INDEX IF NOT EXISTS "results_verifiedById_idx" ON "results"("verifiedById");

DO $$
BEGIN
  ALTER TABLE "results"
    ADD CONSTRAINT "results_verifiedById_fkey"
    FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "whatsapp_templates"
  ADD COLUMN IF NOT EXISTS "qualityRating" TEXT;
