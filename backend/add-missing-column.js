const pg = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });

async function addMissingColumns() {
  const client = await pool.connect();
  try {
    console.log('Connected to database. Adding missing patient columns...\n');

    const alterSQL = `
      ALTER TABLE "patients"
        ADD COLUMN IF NOT EXISTS "isActive"                      BOOLEAN       NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "middleName"                    TEXT,
        ADD COLUMN IF NOT EXISTS "alternatePhone"                VARCHAR(15),
        ADD COLUMN IF NOT EXISTS "landmark"                      TEXT,
        ADD COLUMN IF NOT EXISTS "country"                       TEXT          DEFAULT 'India',
        ADD COLUMN IF NOT EXISTS "emergencyContactName"          TEXT,
        ADD COLUMN IF NOT EXISTS "emergencyContactRelationship"  TEXT,
        ADD COLUMN IF NOT EXISTS "emergencyContactAddress"       TEXT,
        ADD COLUMN IF NOT EXISTS "fastingStatus"                 TEXT,
        ADD COLUMN IF NOT EXISTS "height"                        DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "weight"                        DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "bmi"                           DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "aadhaarNumber"                 VARCHAR(12),
        ADD COLUMN IF NOT EXISTS "panNumber"                     VARCHAR(10),
        ADD COLUMN IF NOT EXISTS "nationalId"                    TEXT,
        ADD COLUMN IF NOT EXISTS "patientType"                   TEXT          DEFAULT 'GENERAL',
        ADD COLUMN IF NOT EXISTS "maritalStatus"                 TEXT,
        ADD COLUMN IF NOT EXISTS "occupation"                    TEXT,
        ADD COLUMN IF NOT EXISTS "nationality"                   TEXT          DEFAULT 'Indian',
        ADD COLUMN IF NOT EXISTS "allergies"                     JSONB,
        ADD COLUMN IF NOT EXISTS "chronicDiseases"               JSONB,
        ADD COLUMN IF NOT EXISTS "currentMedications"            JSONB,
        ADD COLUMN IF NOT EXISTS "insuranceProvider"             TEXT,
        ADD COLUMN IF NOT EXISTS "insuranceNumber"               TEXT,
        ADD COLUMN IF NOT EXISTS "insuranceGroupNumber"          TEXT,
        ADD COLUMN IF NOT EXISTS "insuranceExpiryDate"           TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "photoUrl"                      TEXT,
        ADD COLUMN IF NOT EXISTS "preferredLanguage"             TEXT          DEFAULT 'ENGLISH',
        ADD COLUMN IF NOT EXISTS "preferredCommunicationMethod"  TEXT,
        ADD COLUMN IF NOT EXISTS "communicationPreference"       JSONB,
        ADD COLUMN IF NOT EXISTS "consentForTreatment"           BOOLEAN       NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "consentForDataSharing"         BOOLEAN       NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "consentForMarketing"           BOOLEAN       NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "familyHeadId"                  TEXT,
        ADD COLUMN IF NOT EXISTS "relationshipToHead"            TEXT,
        ADD COLUMN IF NOT EXISTS "notes"                         TEXT,
        ADD COLUMN IF NOT EXISTS "isDraft"                       BOOLEAN       NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "registrationSource"            TEXT          DEFAULT 'WALK_IN',
        ADD COLUMN IF NOT EXISTS "referralSource"                TEXT,
        ADD COLUMN IF NOT EXISTS "verificationStatus"            TEXT          DEFAULT 'UNVERIFIED',
        ADD COLUMN IF NOT EXISTS "phoneVerified"                 BOOLEAN       NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "emailVerified"                 BOOLEAN       NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "kycVerified"                   BOOLEAN       NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "qrCode"                        TEXT;
    `;

    await client.query(alterSQL);
    console.log('✅ All columns added (or already existed).\n');

    // Verify by listing all patient columns
    const result = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'patients'
      ORDER BY ordinal_position
    `);

    console.log(`📋 Patients table now has ${result.rows.length} columns:`);
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    console.log('\n✅ Done! Restart your backend server now.');
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

addMissingColumns();