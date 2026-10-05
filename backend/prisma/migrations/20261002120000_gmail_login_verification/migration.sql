-- Gmail login: verified addresses, emailed one-time codes, and sign-in alerts.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailBlindIndex" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastAlertedDeviceFingerprint" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastAlertedIpAddress" TEXT;

DO $$ BEGIN
  CREATE TYPE "EmailTokenPurpose" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" "EmailTokenPurpose" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "login_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceFingerprint" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "login_alerts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "email_verification_tokens_userId_purpose_idx" ON "email_verification_tokens"("userId", "purpose");
CREATE INDEX IF NOT EXISTS "email_verification_tokens_expiresAt_idx" ON "email_verification_tokens"("expiresAt");
CREATE INDEX IF NOT EXISTS "login_alerts_userId_idx" ON "login_alerts"("userId");
CREATE INDEX IF NOT EXISTS "login_alerts_type_idx" ON "login_alerts"("type");
CREATE INDEX IF NOT EXISTS "login_alerts_createdAt_idx" ON "login_alerts"("createdAt");
CREATE INDEX IF NOT EXISTS "users_emailBlindIndex_idx" ON "users"("emailBlindIndex");

DO $$ BEGIN
  ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "login_alerts" ADD CONSTRAINT "login_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Backfill: canonicalise existing addresses and index them.
--
-- Gmail ignores dots and anything after "+", so two stored rows can describe the
-- same mailbox. Rewriting the stored value makes those collisions visible.
UPDATE "users"
SET "email" = lower(btrim("email"))
WHERE "email" <> lower(btrim("email"))
  AND "email" IS NOT NULL;

UPDATE "users"
SET "emailBlindIndex" = encode(sha256("email"::bytea), 'hex')
WHERE "emailBlindIndex" IS NULL
  AND "email" IS NOT NULL;

-- A Gmail address already in use elsewhere in the table cannot be linked to two
-- staff accounts; surfacing these makes the duplication resolvable by hand.
DO $$
DECLARE
  dup RECORD;
BEGIN
  FOR dup IN
    SELECT "emailBlindIndex", count(*) AS n
    FROM "users"
    WHERE "emailBlindIndex" IS NOT NULL
    GROUP BY "emailBlindIndex"
    HAVING count(*) > 1
  LOOP
    RAISE NOTICE 'Duplicate mailbox detected in users (count=%) — resolve before enabling Gmail sign-in', dup.n;
  END LOOP;
END $$;