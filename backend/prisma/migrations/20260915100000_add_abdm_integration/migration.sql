-- ABDM (Ayushman Bharat Digital Mission) Integration Migration
-- This migration is intentionally idempotent (IF NOT EXISTS / IF NOT EXISTS guards).

-- 1. Add ABHA fields to existing patients table
ALTER TABLE "patients"
  ADD COLUMN IF NOT EXISTS "abhaNumber"    VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "abhaAddress"   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "abhaStatus"    TEXT         NOT NULL DEFAULT 'UNLINKED',
  ADD COLUMN IF NOT EXISTS "abhaLinkedAt"  TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "patients_abhaNumber_idx"  ON "patients"("abhaNumber");
CREATE INDEX IF NOT EXISTS "patients_abhaAddress_idx" ON "patients"("abhaAddress");

-- 2. ABDM Care Contexts table
CREATE TABLE IF NOT EXISTS "abdm_care_contexts" (
  "id"                   TEXT          NOT NULL,
  "patientId"            TEXT          NOT NULL,
  "careContextReference" TEXT          NOT NULL,
  "display"              TEXT          NOT NULL,
  "orderId"              TEXT,
  "hiTypes"              TEXT[]        NOT NULL DEFAULT '{}',
  "isLinked"             BOOLEAN       NOT NULL DEFAULT false,
  "linkedAt"             TIMESTAMP(3),
  "createdAt"            TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "abdm_care_contexts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "abdm_care_contexts_careContextReference_key"
  ON "abdm_care_contexts"("careContextReference");
CREATE INDEX IF NOT EXISTS "abdm_care_contexts_patientId_idx"  ON "abdm_care_contexts"("patientId");
CREATE INDEX IF NOT EXISTS "abdm_care_contexts_orderId_idx"    ON "abdm_care_contexts"("orderId");
CREATE INDEX IF NOT EXISTS "abdm_care_contexts_isLinked_idx"   ON "abdm_care_contexts"("isLinked");

ALTER TABLE "abdm_care_contexts"
  DROP CONSTRAINT IF EXISTS "abdm_care_contexts_patientId_fkey",
  ADD CONSTRAINT "abdm_care_contexts_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. ABDM Consents table
CREATE TABLE IF NOT EXISTS "abdm_consents" (
  "id"            TEXT          NOT NULL,
  "consentId"     TEXT          NOT NULL,
  "patientId"     TEXT          NOT NULL,
  "status"        TEXT          NOT NULL DEFAULT 'REQUESTED',
  "hiTypes"       TEXT[]        NOT NULL DEFAULT '{}',
  "dateFrom"      TIMESTAMP(3),
  "dateTo"        TIMESTAMP(3),
  "expiryDate"    TIMESTAMP(3),
  "purpose"       TEXT,
  "consentDetail" JSONB,
  "createdAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "abdm_consents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "abdm_consents_consentId_key" ON "abdm_consents"("consentId");
CREATE INDEX IF NOT EXISTS "abdm_consents_patientId_idx"  ON "abdm_consents"("patientId");
CREATE INDEX IF NOT EXISTS "abdm_consents_status_idx"     ON "abdm_consents"("status");
CREATE INDEX IF NOT EXISTS "abdm_consents_expiryDate_idx" ON "abdm_consents"("expiryDate");

ALTER TABLE "abdm_consents"
  DROP CONSTRAINT IF EXISTS "abdm_consents_patientId_fkey",
  ADD CONSTRAINT "abdm_consents_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. ABDM Transactions audit log table
CREATE TABLE IF NOT EXISTS "abdm_transactions" (
  "id"            TEXT          NOT NULL,
  "requestId"     TEXT          NOT NULL,
  "transactionId" TEXT,
  "action"        TEXT          NOT NULL,
  "status"        TEXT          NOT NULL DEFAULT 'INITIATED',
  "patientId"     TEXT,
  "requestData"   JSONB,
  "responseData"  JSONB,
  "error"         TEXT,
  "createdAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "abdm_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "abdm_transactions_requestId_key" ON "abdm_transactions"("requestId");
CREATE INDEX IF NOT EXISTS "abdm_transactions_patientId_idx" ON "abdm_transactions"("patientId");
CREATE INDEX IF NOT EXISTS "abdm_transactions_action_idx"    ON "abdm_transactions"("action");
CREATE INDEX IF NOT EXISTS "abdm_transactions_status_idx"    ON "abdm_transactions"("status");
CREATE INDEX IF NOT EXISTS "abdm_transactions_createdAt_idx" ON "abdm_transactions"("createdAt");
