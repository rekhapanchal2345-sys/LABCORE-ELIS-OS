-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "availableDays" TEXT,
ADD COLUMN     "availableTime" TEXT,
ADD COLUMN     "consultationFee" DECIMAL(10,2),
ADD COLUMN     "department" TEXT,
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "licenseExpiry" TIMESTAMP(3),
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "signatureUrl" TEXT;
