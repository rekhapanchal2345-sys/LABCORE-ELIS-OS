-- Migration: Add all missing patient columns
-- These columns exist in schema.prisma but were never migrated to the actual database.
-- All statements use IF NOT EXISTS to be idempotent (safe to re-run).

ALTER TABLE "patients"
  -- Active flag
  ADD COLUMN IF NOT EXISTS "isActive"                      BOOLEAN       NOT NULL DEFAULT true,

  -- Extended name
  ADD COLUMN IF NOT EXISTS "middleName"                    TEXT,

  -- Extended contact
  ADD COLUMN IF NOT EXISTS "alternatePhone"                VARCHAR(15),
  ADD COLUMN IF NOT EXISTS "landmark"                      TEXT,
  ADD COLUMN IF NOT EXISTS "country"                       TEXT          DEFAULT 'India',

  -- Emergency contact details
  ADD COLUMN IF NOT EXISTS "emergencyContactName"          TEXT,
  ADD COLUMN IF NOT EXISTS "emergencyContactRelationship"  TEXT,
  ADD COLUMN IF NOT EXISTS "emergencyContactAddress"       TEXT,

  -- Clinical info
  ADD COLUMN IF NOT EXISTS "fastingStatus"                 TEXT,
  ADD COLUMN IF NOT EXISTS "height"                        DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "weight"                        DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "bmi"                           DOUBLE PRECISION,

  -- Identity documents (KYC)
  ADD COLUMN IF NOT EXISTS "aadhaarNumber"                 VARCHAR(12),
  ADD COLUMN IF NOT EXISTS "panNumber"                     VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "nationalId"                    TEXT,

  -- Patient classification
  ADD COLUMN IF NOT EXISTS "patientType"                   TEXT          DEFAULT 'GENERAL',
  ADD COLUMN IF NOT EXISTS "maritalStatus"                 TEXT,
  ADD COLUMN IF NOT EXISTS "occupation"                    TEXT,
  ADD COLUMN IF NOT EXISTS "nationality"                   TEXT          DEFAULT 'Indian',

  -- Medical history (JSON arrays)
  ADD COLUMN IF NOT EXISTS "allergies"                     JSONB,
  ADD COLUMN IF NOT EXISTS "chronicDiseases"               JSONB,
  ADD COLUMN IF NOT EXISTS "currentMedications"            JSONB,

  -- Insurance
  ADD COLUMN IF NOT EXISTS "insuranceProvider"             TEXT,
  ADD COLUMN IF NOT EXISTS "insuranceNumber"               TEXT,
  ADD COLUMN IF NOT EXISTS "insuranceGroupNumber"          TEXT,
  ADD COLUMN IF NOT EXISTS "insuranceExpiryDate"           TIMESTAMP(3),

  -- Photo / documents
  ADD COLUMN IF NOT EXISTS "photoUrl"                      TEXT,

  -- Preferences
  ADD COLUMN IF NOT EXISTS "preferredLanguage"             TEXT          DEFAULT 'ENGLISH',
  ADD COLUMN IF NOT EXISTS "preferredCommunicationMethod"  TEXT,
  ADD COLUMN IF NOT EXISTS "communicationPreference"       JSONB,

  -- Consent
  ADD COLUMN IF NOT EXISTS "consentForTreatment"           BOOLEAN       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "consentForDataSharing"         BOOLEAN       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "consentForMarketing"           BOOLEAN       NOT NULL DEFAULT false,

  -- Family
  ADD COLUMN IF NOT EXISTS "familyHeadId"                  TEXT,
  ADD COLUMN IF NOT EXISTS "relationshipToHead"            TEXT,

  -- Notes / draft / source
  ADD COLUMN IF NOT EXISTS "notes"                         TEXT,
  ADD COLUMN IF NOT EXISTS "isDraft"                       BOOLEAN       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "formStep"                      INT,
  ADD COLUMN IF NOT EXISTS "formProgress"                  INT,
  ADD COLUMN IF NOT EXISTS "lastEditedSection"             TEXT,
  ADD COLUMN IF NOT EXISTS "registrationSource"            TEXT          DEFAULT 'WALK_IN',
  ADD COLUMN IF NOT EXISTS "referralSource"                TEXT,

  -- Verification / KYC status
  ADD COLUMN IF NOT EXISTS "verificationStatus"            TEXT          DEFAULT 'UNVERIFIED',
  ADD COLUMN IF NOT EXISTS "phoneVerified"                 BOOLEAN       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "emailVerified"                 BOOLEAN       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "kycVerified"                   BOOLEAN       NOT NULL DEFAULT false,

  -- QR code
  ADD COLUMN IF NOT EXISTS "qrCode"                        TEXT;
