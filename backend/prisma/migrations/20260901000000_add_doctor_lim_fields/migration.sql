-- AlterEnum
CREATE TYPE "DoctorType" AS ENUM ('REFERRING_DOCTOR', 'INTERNAL_PATHOLOGIST', 'CONSULTANT_PATHOLOGIST');

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "doctorType" "DoctorType" NOT NULL DEFAULT 'REFERRING_DOCTOR',
ADD COLUMN     "clinicAddress" VARCHAR(500),
ADD COLUMN     "whatsappNumber" VARCHAR(15),
ADD COLUMN     "reportDeliveryEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportDeliveryWhatsApp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportDeliveryHardCopy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportDeliveryPortal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enablePortalAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bankAccountNumber" VARCHAR(30),
ADD COLUMN     "bankIfscCode" VARCHAR(20),
ADD COLUMN     "bankAccountHolderName" VARCHAR(200);

-- CreateIndex
CREATE INDEX "doctors_doctorType_idx" ON "doctors"("doctorType");
