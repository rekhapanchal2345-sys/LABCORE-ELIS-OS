-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'FRONT_DESK', 'LAB_TECH', 'PATHOLOGIST', 'DOCTOR');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'REGISTERED', 'SAMPLE_COLLECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'UPI', 'NET_BANKING', 'CHEQUE');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PENDING', 'ENTERED', 'VERIFIED', 'APPROVED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ResultFlag" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ParameterType" AS ENUM ('NUMERIC', 'TEXT', 'BOOLEAN', 'OPTION');

-- CreateEnum
CREATE TYPE "SampleType" AS ENUM ('BLOOD', 'URINE', 'SERUM', 'PLASMA', 'STOOL', 'SWAB', 'SPUTUM', 'CSF', 'TISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "SampleStatus" AS ENUM ('PENDING', 'COLLECTED', 'RECEIVED', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AnalyzerProtocol" AS ENUM ('ASTM', 'HL7');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'GENERATED', 'PUBLISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" VARCHAR(15),
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "specialization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "doctorCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "qualification" TEXT,
    "specialization" TEXT,
    "phone" VARCHAR(15),
    "email" TEXT,
    "clinicName" TEXT,
    "address" TEXT,
    "commissionRate" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "uhid" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "age" INTEGER,
    "ageMonth" INTEGER,
    "ageDay" INTEGER,
    "phone" VARCHAR(15),
    "email" TEXT,
    "bloodGroup" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" VARCHAR(10),
    "emergencyContact" VARCHAR(15),
    "referredById" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_categories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "testCode" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sampleType" "SampleType" NOT NULL,
    "sampleContainer" TEXT,
    "method" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "gstPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tatHours" INTEGER NOT NULL DEFAULT 24,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_parameters" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "parameterName" TEXT NOT NULL,
    "unit" TEXT,
    "dataType" "ParameterType" NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 1,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_ranges" (
    "id" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "gender" "Gender",
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "criticalLow" DECIMAL(10,2),
    "normalLow" DECIMAL(10,2),
    "normalHigh" DECIMAL(10,2),
    "criticalHigh" DECIMAL(10,2),
    "interpretation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT,
    "createdById" TEXT,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'REGISTERED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "sampleCollected" BOOLEAN NOT NULL DEFAULT false,
    "collectedAt" TIMESTAMP(3),
    "reportedAt" TIMESTAMP(3),
    "notes" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "gstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "gstPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "gstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "finalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "samples" (
    "id" TEXT NOT NULL,
    "sampleNumber" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "sampleType" "SampleType" NOT NULL,
    "status" "SampleStatus" NOT NULL DEFAULT 'PENDING',
    "collectedById" TEXT,
    "collectedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "gstPercent" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "gstAmount" DECIMAL(10,2) NOT NULL,
    "grandTotal" DECIMAL(10,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "transactionId" TEXT,
    "remarks" TEXT,
    "receivedById" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "status" "ResultStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "interpretation" TEXT,
    "enteredById" TEXT,
    "approvedById" TEXT,
    "enteredAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_values" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "flag" "ResultFlag",
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "result_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "approvedById" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "reportTitle" TEXT,
    "reportData" JSONB,
    "fileUrl" TEXT,
    "publishedById" TEXT,
    "generatedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyzer_logs" (
    "id" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "machineCode" TEXT NOT NULL,
    "protocol" "AnalyzerProtocol" NOT NULL,
    "orderNumber" TEXT,
    "barcode" TEXT,
    "rawMessage" TEXT NOT NULL,
    "parsedJson" JSONB,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "analyzer_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "recordId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeCode_key" ON "users"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_fullName_idx" ON "users"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_doctorCode_key" ON "doctors"("doctorCode");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_email_key" ON "doctors"("email");

-- CreateIndex
CREATE INDEX "doctors_fullName_idx" ON "doctors"("fullName");

-- CreateIndex
CREATE INDEX "doctors_specialization_idx" ON "doctors"("specialization");

-- CreateIndex
CREATE INDEX "doctors_isActive_idx" ON "doctors"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "patients_uhid_key" ON "patients"("uhid");

-- CreateIndex
CREATE INDEX "patients_phone_idx" ON "patients"("phone");

-- CreateIndex
CREATE INDEX "patients_firstName_lastName_idx" ON "patients"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "patients_referredById_idx" ON "patients"("referredById");

-- CreateIndex
CREATE INDEX "patients_createdById_idx" ON "patients"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "test_categories_code_key" ON "test_categories"("code");

-- CreateIndex
CREATE INDEX "test_categories_name_idx" ON "test_categories"("name");

-- CreateIndex
CREATE INDEX "test_categories_isActive_idx" ON "test_categories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "tests_testCode_key" ON "tests"("testCode");

-- CreateIndex
CREATE INDEX "tests_testName_idx" ON "tests"("testName");

-- CreateIndex
CREATE INDEX "tests_categoryId_idx" ON "tests"("categoryId");

-- CreateIndex
CREATE INDEX "tests_sampleType_idx" ON "tests"("sampleType");

-- CreateIndex
CREATE INDEX "tests_isActive_idx" ON "tests"("isActive");

-- CreateIndex
CREATE INDEX "test_parameters_testId_idx" ON "test_parameters"("testId");

-- CreateIndex
CREATE INDEX "test_parameters_parameterName_idx" ON "test_parameters"("parameterName");

-- CreateIndex
CREATE INDEX "reference_ranges_parameterId_idx" ON "reference_ranges"("parameterId");

-- CreateIndex
CREATE INDEX "reference_ranges_gender_idx" ON "reference_ranges"("gender");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "orders_barcode_key" ON "orders"("barcode");

-- CreateIndex
CREATE INDEX "orders_patientId_idx" ON "orders"("patientId");

-- CreateIndex
CREATE INDEX "orders_doctorId_idx" ON "orders"("doctorId");

-- CreateIndex
CREATE INDEX "orders_createdById_idx" ON "orders"("createdById");

-- CreateIndex
CREATE INDEX "orders_orderStatus_idx" ON "orders"("orderStatus");

-- CreateIndex
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "order_items_testId_idx" ON "order_items"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_orderId_testId_key" ON "order_items"("orderId", "testId");

-- CreateIndex
CREATE UNIQUE INDEX "samples_sampleNumber_key" ON "samples"("sampleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "samples_barcode_key" ON "samples"("barcode");

-- CreateIndex
CREATE INDEX "samples_patientId_idx" ON "samples"("patientId");

-- CreateIndex
CREATE INDEX "samples_orderId_idx" ON "samples"("orderId");

-- CreateIndex
CREATE INDEX "samples_testId_idx" ON "samples"("testId");

-- CreateIndex
CREATE INDEX "samples_status_idx" ON "samples"("status");

-- CreateIndex
CREATE INDEX "samples_collectedById_idx" ON "samples"("collectedById");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_orderId_key" ON "invoices"("orderId");

-- CreateIndex
CREATE INDEX "invoices_paymentStatus_idx" ON "invoices"("paymentStatus");

-- CreateIndex
CREATE INDEX "invoices_createdAt_idx" ON "invoices"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receiptNumber_key" ON "payments"("receiptNumber");

-- CreateIndex
CREATE INDEX "payments_orderId_idx" ON "payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_method_idx" ON "payments"("method");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_receivedById_idx" ON "payments"("receivedById");

-- CreateIndex
CREATE INDEX "payments_paidAt_idx" ON "payments"("paidAt");

-- CreateIndex
CREATE INDEX "results_orderId_idx" ON "results"("orderId");

-- CreateIndex
CREATE INDEX "results_testId_idx" ON "results"("testId");

-- CreateIndex
CREATE INDEX "results_status_idx" ON "results"("status");

-- CreateIndex
CREATE INDEX "results_enteredById_idx" ON "results"("enteredById");

-- CreateIndex
CREATE INDEX "results_approvedById_idx" ON "results"("approvedById");

-- CreateIndex
CREATE UNIQUE INDEX "results_orderId_testId_key" ON "results"("orderId", "testId");

-- CreateIndex
CREATE INDEX "result_values_parameterId_idx" ON "result_values"("parameterId");

-- CreateIndex
CREATE INDEX "result_values_flag_idx" ON "result_values"("flag");

-- CreateIndex
CREATE UNIQUE INDEX "result_values_resultId_parameterId_key" ON "result_values"("resultId", "parameterId");

-- CreateIndex
CREATE INDEX "approvals_resultId_idx" ON "approvals"("resultId");

-- CreateIndex
CREATE INDEX "approvals_approvedById_idx" ON "approvals"("approvedById");

-- CreateIndex
CREATE INDEX "approvals_status_idx" ON "approvals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reports_reportNumber_key" ON "reports"("reportNumber");

-- CreateIndex
CREATE INDEX "reports_patientId_idx" ON "reports"("patientId");

-- CreateIndex
CREATE INDEX "reports_orderId_idx" ON "reports"("orderId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_publishedById_idx" ON "reports"("publishedById");

-- CreateIndex
CREATE INDEX "analyzer_logs_machineCode_idx" ON "analyzer_logs"("machineCode");

-- CreateIndex
CREATE INDEX "analyzer_logs_protocol_idx" ON "analyzer_logs"("protocol");

-- CreateIndex
CREATE INDEX "analyzer_logs_orderNumber_idx" ON "analyzer_logs"("orderNumber");

-- CreateIndex
CREATE INDEX "analyzer_logs_barcode_idx" ON "analyzer_logs"("barcode");

-- CreateIndex
CREATE INDEX "analyzer_logs_isProcessed_idx" ON "analyzer_logs"("isProcessed");

-- CreateIndex
CREATE INDEX "analyzer_logs_receivedAt_idx" ON "analyzer_logs"("receivedAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_module_idx" ON "audit_logs"("module");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_recordId_idx" ON "audit_logs"("recordId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "test_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_parameters" ADD CONSTRAINT "test_parameters_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_ranges" ADD CONSTRAINT "reference_ranges_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "test_parameters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_values" ADD CONSTRAINT "result_values_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_values" ADD CONSTRAINT "result_values_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "test_parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
