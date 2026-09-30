/*
  Warnings:

  - Added the required column `taxableAmount` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "cgstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "igstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "sgstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "taxableAmount" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "autoApproveResults" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "compactMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "darkMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dateFormat" TEXT DEFAULT 'DD/MM/YYYY',
ADD COLUMN     "defaultReportTemplate" TEXT DEFAULT 'standard',
ADD COLUMN     "department" TEXT,
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "emergencyContactPhone" VARCHAR(15),
ADD COLUMN     "enableCriticalAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableDailyDigest" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableEmailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enablePushNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "enableSmsNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "language" TEXT DEFAULT 'English',
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "preferredCommunicationMethod" TEXT DEFAULT 'email',
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "showTutorial" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "signature" TEXT,
ADD COLUMN     "timeFormat" TEXT DEFAULT '24h',
ADD COLUMN     "timezone" TEXT DEFAULT 'Asia/Kolkata',
ADD COLUMN     "workingHoursEnd" TEXT DEFAULT '17:00',
ADD COLUMN     "workingHoursStart" TEXT DEFAULT '09:00';

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");
