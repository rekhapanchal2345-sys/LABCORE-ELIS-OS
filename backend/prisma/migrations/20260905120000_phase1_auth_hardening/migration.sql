-- Phase 1: auth hardening (sessions, MFA, lockout, RBAC matrix)

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'BRANCH_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ACCOUNTANT';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'AUDITOR';

ALTER TYPE "AccountStatus" ADD VALUE IF NOT EXISTS 'LOCKED';

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "failedLoginCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totpSecretEnc" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totpPendingEnc" TEXT;

CREATE TABLE IF NOT EXISTS "password_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "deviceFingerprint" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "mfa_backup_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mfa_backup_codes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "role_permissions" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_sessions_refreshTokenHash_key" ON "user_sessions"("refreshTokenHash");
CREATE INDEX IF NOT EXISTS "password_history_userId_createdAt_idx" ON "password_history"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "user_sessions_userId_idx" ON "user_sessions"("userId");
CREATE INDEX IF NOT EXISTS "user_sessions_userId_revokedAt_idx" ON "user_sessions"("userId", "revokedAt");
CREATE INDEX IF NOT EXISTS "mfa_backup_codes_userId_idx" ON "mfa_backup_codes"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_role_permission_key" ON "role_permissions"("role", "permission");
CREATE INDEX IF NOT EXISTS "role_permissions_role_idx" ON "role_permissions"("role");

DO $$ BEGIN
  ALTER TABLE "password_history" ADD CONSTRAINT "password_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "mfa_backup_codes" ADD CONSTRAINT "mfa_backup_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
