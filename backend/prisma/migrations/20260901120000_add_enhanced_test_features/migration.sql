-- Add enhanced test features migration
-- ========================================

-- Alter TestCategory table
ALTER TABLE "test_categories" 
ADD COLUMN "department" TEXT,
ADD COLUMN "color" TEXT DEFAULT '#3B82F6',
ADD COLUMN "icon" TEXT,
ADD COLUMN "displayOrder" INTEGER DEFAULT 0;

-- Alter Test table
ALTER TABLE "tests" 
ADD COLUMN "shortName" TEXT,
ALTER COLUMN "categoryId" DROP NOT NULL,
ADD COLUMN "sampleVolume" TEXT,
ADD COLUMN "processingDepartment" TEXT,
ADD COLUMN "offerPrice" DECIMAL(10,2),
ADD COLUMN "b2bRate" DECIMAL(10,2),
ADD COLUMN "tatDisplay" TEXT,
ADD COLUMN "displayOrder" INTEGER DEFAULT 0,
ADD COLUMN "clinicalSignificance" TEXT,
ADD COLUMN "patientPreparation" TEXT;

-- Alter TestParameter table
ALTER TABLE "test_parameters" 
ADD COLUMN "shortName" TEXT,
ADD COLUMN "measurementMethod" TEXT,
ADD COLUMN "dropdownOptions" TEXT,
ADD COLUMN "allowRichText" BOOLEAN DEFAULT false,
ADD COLUMN "decimalPrecision" INTEGER,
ADD COLUMN "isActive" BOOLEAN DEFAULT true;

-- Alter ReferenceRange table
ALTER TABLE "reference_ranges" 
ADD COLUMN "ageGroup" TEXT,
ADD COLUMN "minAgeUnit" TEXT,
ADD COLUMN "maxAgeUnit" TEXT,
ADD COLUMN "notes" TEXT,
ADD COLUMN "isActive" BOOLEAN DEFAULT true,
ADD COLUMN "displayOrder" INTEGER DEFAULT 0,
ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Create TestPackage table
CREATE TABLE "test_packages" (
    "id" TEXT NOT NULL,
    "packageCode" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "description" TEXT,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "offerPrice" DECIMAL(10,2),
    "discountPercentage" DECIMAL(5,2),
    "gstPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "includesTestsCount" INTEGER NOT NULL DEFAULT 0,
    "tatHours" INTEGER NOT NULL DEFAULT 24,
    "tatDisplay" TEXT,
    "targetAudience" TEXT,
    "recommendedFor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER DEFAULT 0,
    "color" TEXT DEFAULT '#10B981',
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_packages_pkey" PRIMARY KEY ("id")
);

-- Create unique index on packageCode
CREATE UNIQUE INDEX "test_packages_packageCode_key" ON "test_packages"("packageCode");

-- Create indexes for TestPackage
CREATE INDEX "test_packages_packageName_idx" ON "test_packages"("packageName");
CREATE INDEX "test_packages_isActive_idx" ON "test_packages"("isActive");
CREATE INDEX "test_packages_isPopular_idx" ON "test_packages"("isPopular");

-- Create TestPackageItem table
CREATE TABLE "test_package_items" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "testPrice" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_package_items_pkey" PRIMARY KEY ("id")
);

-- Create unique index on packageId and testId
CREATE UNIQUE INDEX "test_package_items_packageId_testId_key" ON "test_package_items"("packageId", "testId");

-- Create indexes for TestPackageItem
CREATE INDEX "test_package_items_packageId_idx" ON "test_package_items"("packageId");
CREATE INDEX "test_package_items_testId_idx" ON "test_package_items"("testId");

-- Add foreign key constraints for TestPackageItem
ALTER TABLE "test_package_items" ADD CONSTRAINT "test_package_items_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "test_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "test_package_items" ADD CONSTRAINT "test_package_items_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Alter OrderItem table to support packages
ALTER TABLE "order_items" 
ADD COLUMN "packageId" TEXT,
ADD COLUMN "itemType" TEXT NOT NULL DEFAULT 'TEST',
ALTER COLUMN "testId" DROP NOT NULL;

-- Add foreign key for packageId in OrderItem
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "test_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for itemType in OrderItem
CREATE INDEX "order_items_itemType_idx" ON "order_items"("itemType");

-- Add indexes for TestCategory
CREATE INDEX "test_categories_department_idx" ON "test_categories"("department");

-- Add index for ReferenceRange
CREATE INDEX "reference_ranges_ageGroup_idx" ON "reference_ranges"("ageGroup");
