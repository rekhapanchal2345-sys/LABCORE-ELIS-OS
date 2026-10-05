-- =========================================================
-- Doctors & Referral Management — Enterprise Upgrade
--
-- 1. Extend DoctorType enum (adds the missing IN_HOUSE_PATHOLOGIST
--    which the API already accepted but the DB rejected).
-- 2. New enums for commission / payout / organisation.
-- 3. New columns on doctors (personal, contact, statutory,
--    financial, archive, signature governance).
-- 4. doctor_organizations  -> hospital/clinic partner entity
-- 5. doctor_commission_entries -> per paid order commission ledger
-- 6. doctor_payouts            -> settlement vouchers
-- 7. doctor_documents          -> certificates / cancelled cheque
-- =========================================================

-- ---------- 1. Enum extension ----------
-- ALTER TYPE ... ADD VALUE cannot run inside a transaction block on
-- older PostgreSQL, so these run first, outside the DO blocks.
ALTER TYPE "DoctorType" ADD VALUE IF NOT EXISTS 'IN_HOUSE_PATHOLOGIST';
ALTER TYPE "DoctorType" ADD VALUE IF NOT EXISTS 'CONSULTANT';
ALTER TYPE "DoctorType" ADD VALUE IF NOT EXISTS 'HOSPITAL_PARTNER';
ALTER TYPE "DoctorType" ADD VALUE IF NOT EXISTS 'CLINIC_PARTNER';

-- ---------- 2. New enums ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommissionType') THEN
    CREATE TYPE "CommissionType" AS ENUM ('PERCENTAGE', 'FLAT_PER_PATIENT', 'CATEGORY_WISE', 'NONE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommissionStatus') THEN
    CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'SETTLED', 'VOID');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PayoutCycle') THEN
    CREATE TYPE "PayoutCycle" AS ENUM ('WEEKLY', 'MONTHLY');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrganizationType') THEN
    CREATE TYPE "OrganizationType" AS ENUM ('HOSPITAL', 'CLINIC', 'DIAGNOSTIC_CENTER', 'CORPORATE');
  END IF;
END
$$;

-- ---------- 3. doctors: new columns ----------
ALTER TABLE "doctors"
  ADD COLUMN IF NOT EXISTS "title" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "gender" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "languages" VARCHAR(300),
  ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "city" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "state" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "pincode" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "panNumber" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "gstin" VARCHAR(15),
  ADD COLUMN IF NOT EXISTS "registrationCouncil" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "registrationExpiry" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "registrationCertificateUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "commissionType" "CommissionType" NOT NULL DEFAULT 'PERCENTAGE',
  ADD COLUMN IF NOT EXISTS "commissionFlatAmount" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "commissionCategoryRules" JSONB,
  ADD COLUMN IF NOT EXISTS "payoutCycle" "PayoutCycle" NOT NULL DEFAULT 'MONTHLY',
  ADD COLUMN IF NOT EXISTS "upiId" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "bankName" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "cancelledChequeUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "organizationId" TEXT,
  ADD COLUMN IF NOT EXISTS "signatureApprovedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "signatureApprovedById" TEXT,
  ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "archivedById" TEXT,
  ADD COLUMN IF NOT EXISTS "archiveReason" VARCHAR(500);

-- ---------- 4. doctor_organizations ----------
CREATE TABLE IF NOT EXISTS "doctor_organizations" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "organizationType" "OrganizationType" NOT NULL DEFAULT 'CLINIC',
  "contactPerson" VARCHAR(200),
  "phone" VARCHAR(15),
  "email" TEXT,
  "address" TEXT,
  "city" VARCHAR(100),
  "state" VARCHAR(100),
  "pincode" VARCHAR(10),
  "gstin" VARCHAR(15),
  "panNumber" VARCHAR(10),
  "commissionRate" DECIMAL(5,2),
  "payoutCycle" "PayoutCycle" NOT NULL DEFAULT 'MONTHLY',
  "bankAccountNumber" VARCHAR(30),
  "bankIfscCode" VARCHAR(20),
  "bankAccountHolderName" VARCHAR(200),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "doctor_organizations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "doctor_organizations_code_key" ON "doctor_organizations"("code");
CREATE INDEX IF NOT EXISTS "doctor_organizations_name_idx" ON "doctor_organizations"("name");
CREATE INDEX IF NOT EXISTS "doctor_organizations_organizationType_idx" ON "doctor_organizations"("organizationType");
-- ---------- 5. doctor_commission_entries ----------
CREATE TABLE IF NOT EXISTS "doctor_commission_entries" (
  "id" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "payoutId" TEXT,
  "referralDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "periodKey" VARCHAR(7) NOT NULL,
  "baseAmount" DECIMAL(12,2) NOT NULL,
  "commissionRate" DECIMAL(5,2) NOT NULL,
  "commissionType" "CommissionType" NOT NULL DEFAULT 'PERCENTAGE',
  "commissionAmount" DECIMAL(12,2) NOT NULL,
  "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
  "remarks" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "doctor_commission_entries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "doctor_commission_entries_orderId_key" ON "doctor_commission_entries"("orderId");
CREATE INDEX IF NOT EXISTS "doctor_commission_entries_doctorId_status_idx" ON "doctor_commission_entries"("doctorId", "status");
CREATE INDEX IF NOT EXISTS "doctor_commission_entries_periodKey_idx" ON "doctor_commission_entries"("periodKey");
CREATE INDEX IF NOT EXISTS "doctor_commission_entries_payoutId_idx" ON "doctor_commission_entries"("payoutId");

-- ---------- 6. doctor_payouts ----------
CREATE TABLE IF NOT EXISTS "doctor_payouts" (
  "id" TEXT NOT NULL,
  "voucherNumber" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "grossAmount" DECIMAL(12,2) NOT NULL,
  "tdsPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "tdsAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "netPaid" DECIMAL(12,2) NOT NULL,
  "paymentMode" VARCHAR(30) NOT NULL,
  "refNumber" TEXT,
  "payoutDate" TIMESTAMP(3) NOT NULL,
  "periodKey" VARCHAR(7),
  "remarks" TEXT,
  "status" "CommissionStatus" NOT NULL DEFAULT 'SETTLED',
  "settledById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "doctor_payouts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "doctor_payouts_voucherNumber_key" ON "doctor_payouts"("voucherNumber");
CREATE INDEX IF NOT EXISTS "doctor_payouts_doctorId_idx" ON "doctor_payouts"("doctorId");
CREATE INDEX IF NOT EXISTS "doctor_payouts_payoutDate_idx" ON "doctor_payouts"("payoutDate");

-- ---------- 7. doctor_documents ----------
CREATE TABLE IF NOT EXISTS "doctor_documents" (
  "id" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "documentType" VARCHAR(60) NOT NULL,
  "fileName" VARCHAR(255),
  "mimeType" VARCHAR(120),
  "sizeBytes" INTEGER,
  "fileData" TEXT,
  "uploadedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "doctor_documents_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "doctor_documents_doctorId_idx" ON "doctor_documents"("doctorId");

-- ---------- 8. Indexes on doctors ----------
CREATE INDEX IF NOT EXISTS "doctors_city_idx" ON "doctors"("city");
CREATE INDEX IF NOT EXISTS "doctors_organizationId_idx" ON "doctors"("organizationId");
CREATE INDEX IF NOT EXISTS "doctors_isArchived_idx" ON "doctors"("isArchived");
CREATE INDEX IF NOT EXISTS "doctors_registrationNumber_idx" ON "doctors"("registrationNumber");
CREATE INDEX IF NOT EXISTS "doctors_phone_idx" ON "doctors"("phone");
-- ---------- 9. Foreign keys ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_organizationId_fkey') THEN
    ALTER TABLE "doctors" ADD CONSTRAINT "doctors_organizationId_fkey"
      FOREIGN KEY ("organizationId") REFERENCES "doctor_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_commission_entries_doctorId_fkey') THEN
    ALTER TABLE "doctor_commission_entries" ADD CONSTRAINT "doctor_commission_entries_doctorId_fkey"
      FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_commission_entries_orderId_fkey') THEN
    ALTER TABLE "doctor_commission_entries" ADD CONSTRAINT "doctor_commission_entries_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_commission_entries_payoutId_fkey') THEN
    ALTER TABLE "doctor_commission_entries" ADD CONSTRAINT "doctor_commission_entries_payoutId_fkey"
      FOREIGN KEY ("payoutId") REFERENCES "doctor_payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_payouts_doctorId_fkey') THEN
    ALTER TABLE "doctor_payouts" ADD CONSTRAINT "doctor_payouts_doctorId_fkey"
      FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_documents_doctorId_fkey') THEN
    ALTER TABLE "doctor_documents" ADD CONSTRAINT "doctor_documents_doctorId_fkey"
      FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- =========================================================
-- BACKFILL: seed commission ledger rows for every PAID order
-- that already has a referring doctor, so that historical
-- revenue is not lost when the ledger becomes the source of
-- truth for "Pending vs Settled".
-- =========================================================
INSERT INTO "doctor_commission_entries"
  ("id", "doctorId", "orderId", "referralDate", "periodKey",
   "baseAmount", "commissionRate", "commissionType", "commissionAmount", "status")
SELECT
  md5(o."id" || '-ledger') AS "id",
  o."doctorId",
  o."id",
  COALESCE(o."updatedAt", o."createdAt"),
  to_char(COALESCE(o."updatedAt", o."createdAt"), 'YYYY-MM'),
  o."grandTotal",
  COALESCE(d."commissionRate", 0),
  CASE WHEN COALESCE(d."commissionRate", 0) > 0 THEN 'PERCENTAGE'::"CommissionType" ELSE 'NONE'::"CommissionType" END,
  CASE WHEN COALESCE(d."commissionRate", 0) > 0
       THEN round(o."grandTotal" * COALESCE(d."commissionRate", 0) / 100, 2)
       ELSE 0 END,
  'PENDING'::"CommissionStatus"
FROM "orders" o
JOIN "doctors" d ON d."id" = o."doctorId"
WHERE o."paymentStatus" = 'PAID'
  AND o."orderStatus" <> 'CANCELLED'
  AND NOT EXISTS (
    SELECT 1 FROM "doctor_commission_entries" ce WHERE ce."orderId" = o."id"
  );