-- Patient verification, medical history and consent storage.
-- Additive and idempotent: safe to re-run.

-- 1. KYC audit columns on patients
ALTER TABLE "patients"
  ADD COLUMN IF NOT EXISTS "kycVerifiedAt"     TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "kycVerifiedById"   TEXT;

DO $$ BEGIN
  ALTER TABLE "patients" ADD CONSTRAINT "patients_kycVerifiedById_fkey"
    FOREIGN KEY ("kycVerifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "patients_kycVerifiedById_idx" ON "patients"("kycVerifiedById");
CREATE INDEX IF NOT EXISTS "patients_familyHeadId_idx"    ON "patients"("familyHeadId");
CREATE INDEX IF NOT EXISTS "patients_isDraft_idx"         ON "patients"("isDraft");
CREATE INDEX IF NOT EXISTS "patients_isActive_idx"        ON "patients"("isActive");
CREATE INDEX IF NOT EXISTS "patients_createdAt_idx"       ON "patients"("createdAt");

-- 2. One-time codes for phone OTP / email verification
CREATE TABLE IF NOT EXISTS "patient_verifications" (
  "id"        TEXT          NOT NULL,
  "patientId" TEXT          NOT NULL,
  "type"      TEXT          NOT NULL,
  "codeHash"  TEXT          NOT NULL,
  "expiresAt" TIMESTAMP(3)  NOT NULL,
  "verified"  BOOLEAN       NOT NULL DEFAULT false,
  "attempts"  INTEGER       NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "patient_verifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "patient_verifications_codeHash_idx" ON "patient_verifications"("codeHash");
CREATE INDEX IF NOT EXISTS "patient_verifications_patientId_type_verified_idx" ON "patient_verifications"("patientId", "type", "verified");
CREATE INDEX IF NOT EXISTS "patient_verifications_expiresAt_idx" ON "patient_verifications"("expiresAt");

ALTER TABLE "patient_verifications"
  DROP CONSTRAINT IF EXISTS "patient_verifications_patientId_fkey",
  ADD CONSTRAINT "patient_verifications_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Structured medical history entries
CREATE TABLE IF NOT EXISTS "patient_medical_histories" (
  "id"            TEXT          NOT NULL,
  "patientId"     TEXT          NOT NULL,
  "condition"     TEXT          NOT NULL,
  "diagnosedDate" TIMESTAMP(3),
  "notes"         TEXT,
  "severity"      TEXT          NOT NULL DEFAULT 'MODERATE',
  "status"        TEXT          NOT NULL DEFAULT 'ACTIVE',
  "createdAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "patient_medical_histories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "patient_medical_histories_patientId_diagnosedDate_idx"
  ON "patient_medical_histories"("patientId", "diagnosedDate");

ALTER TABLE "patient_medical_histories"
  DROP CONSTRAINT IF EXISTS "patient_medical_histories_patientId_fkey",
  ADD CONSTRAINT "patient_medical_histories_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Informed consent records
CREATE TABLE IF NOT EXISTS "patient_consents" (
  "id"            TEXT          NOT NULL,
  "patientId"     TEXT          NOT NULL,
  "consentType"   TEXT          NOT NULL,
  "consentGiven"  BOOLEAN       NOT NULL DEFAULT false,
  "consentText"   TEXT          NOT NULL,
  "consentDate"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt"     TIMESTAMP(3),
  "consentedById" TEXT,
  "createdAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "patient_consents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "patient_consents_patientId_consentDate_idx" ON "patient_consents"("patientId", "consentDate");
CREATE INDEX IF NOT EXISTS "patient_consents_consentType_idx" ON "patient_consents"("consentType");

ALTER TABLE "patient_consents"
  DROP CONSTRAINT IF EXISTS "patient_consents_patientId_fkey",
  ADD CONSTRAINT "patient_consents_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "patient_consents"
  DROP CONSTRAINT IF EXISTS "patient_consents_consentedsById_fkey",
  ADD CONSTRAINT "patient_consents_consentedsById_fkey"
    FOREIGN KEY ("consentedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
