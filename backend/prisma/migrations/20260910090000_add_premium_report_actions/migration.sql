-- Premium report action persistence.
-- This migration is intentionally idempotent because existing LabCore installs
-- may already have a subset of the premium reporting columns.

ALTER TABLE "reports"
  ADD COLUMN IF NOT EXISTS "reportReferenceId" TEXT,
  ADD COLUMN IF NOT EXISTS "templateType" TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS "qualityAssurance" JSONB,
  ADD COLUMN IF NOT EXISTS "clinicalInterpretation" TEXT,
  ADD COLUMN IF NOT EXISTS "methodology" TEXT;

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "reportId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "reports_reportReferenceId_key"
  ON "reports"("reportReferenceId");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_reportId_key"
  ON "orders"("reportId");

CREATE TABLE IF NOT EXISTS "report_share_links" (
  "id" TEXT NOT NULL,
  "reportId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "accessCount" INTEGER NOT NULL DEFAULT 0,
  "maxAccess" INTEGER,
  "createdBy" TEXT NOT NULL,
  "revoked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "report_share_links_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "report_share_links_token_key" ON "report_share_links"("token");
CREATE INDEX IF NOT EXISTS "report_share_links_reportId_idx" ON "report_share_links"("reportId");
CREATE INDEX IF NOT EXISTS "report_share_links_expiresAt_idx" ON "report_share_links"("expiresAt");

CREATE TABLE IF NOT EXISTS "report_addendums" (
  "id" TEXT NOT NULL,
  "reportId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "addedBy" TEXT NOT NULL,
  "isPrivate" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "report_addendums_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "report_addendums_reportId_idx" ON "report_addendums"("reportId");

CREATE TABLE IF NOT EXISTS "patient_history_entries" (
  "id" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "reportId" TEXT NOT NULL,
  "entryType" TEXT NOT NULL,
  "notes" TEXT,
  "addedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "patient_history_entries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "patient_history_entries_patientId_idx" ON "patient_history_entries"("patientId");
CREATE INDEX IF NOT EXISTS "patient_history_entries_reportId_idx" ON "patient_history_entries"("reportId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_share_links_reportId_fkey') THEN
    ALTER TABLE "report_share_links" ADD CONSTRAINT "report_share_links_reportId_fkey"
      FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_share_links_createdBy_fkey') THEN
    ALTER TABLE "report_share_links" ADD CONSTRAINT "report_share_links_createdBy_fkey"
      FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_addendums_reportId_fkey') THEN
    ALTER TABLE "report_addendums" ADD CONSTRAINT "report_addendums_reportId_fkey"
      FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_addendums_addedBy_fkey') THEN
    ALTER TABLE "report_addendums" ADD CONSTRAINT "report_addendums_addedBy_fkey"
      FOREIGN KEY ("addedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patient_history_entries_patientId_fkey') THEN
    ALTER TABLE "patient_history_entries" ADD CONSTRAINT "patient_history_entries_patientId_fkey"
      FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patient_history_entries_reportId_fkey') THEN
    ALTER TABLE "patient_history_entries" ADD CONSTRAINT "patient_history_entries_reportId_fkey"
      FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patient_history_entries_addedBy_fkey') THEN
    ALTER TABLE "patient_history_entries" ADD CONSTRAINT "patient_history_entries_addedBy_fkey"
      FOREIGN KEY ("addedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
