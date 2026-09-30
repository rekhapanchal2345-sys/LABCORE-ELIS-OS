--
-- PostgreSQL database dump
--

\restrict inTHxkaO7Oh6tXhsILpUhMwCbETibykQljFoBacvzeXtppGNY08oZEEhZbrhTC5

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-09-29 16:16:49

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 111460)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 6259 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 930 (class 1247 OID 111496)
-- Name: AccountStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AccountStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'LOCKED'
);


--
-- TOC entry 1092 (class 1247 OID 112476)
-- Name: AlertSeverity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AlertSeverity" AS ENUM (
    'INFO',
    'WARNING',
    'ERROR',
    'CRITICAL'
);


--
-- TOC entry 1080 (class 1247 OID 112426)
-- Name: AnalyzerConnectionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AnalyzerConnectionType" AS ENUM (
    'NETWORK',
    'SERIAL',
    'USB',
    'BLUETOOTH',
    'MANUAL'
);


--
-- TOC entry 1089 (class 1247 OID 112462)
-- Name: AnalyzerJobStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AnalyzerJobStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'RETRYING'
);


--
-- TOC entry 957 (class 1247 OID 111608)
-- Name: AnalyzerProtocol; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AnalyzerProtocol" AS ENUM (
    'ASTM',
    'HL7',
    'HTTP_API',
    'TCP_IP',
    'SERIAL_RS232',
    'VENDOR_SPECIFIC'
);


--
-- TOC entry 1077 (class 1247 OID 112410)
-- Name: AnalyzerStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AnalyzerStatus" AS ENUM (
    'ONLINE',
    'OFFLINE',
    'IDLE',
    'BUSY',
    'ERROR',
    'MAINTENANCE',
    'CALIBRATION_REQUIRED'
);


--
-- TOC entry 960 (class 1247 OID 111614)
-- Name: ApprovalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- TOC entry 1083 (class 1247 OID 112438)
-- Name: CalibrationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CalibrationStatus" AS ENUM (
    'VALID',
    'DUE',
    'OVERDUE',
    'FAILED',
    'IN_PROGRESS'
);


--
-- TOC entry 1194 (class 1247 OID 138372)
-- Name: CashMovementType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CashMovementType" AS ENUM (
    'DEPOSIT',
    'WITHDRAWAL',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'ADJUSTMENT',
    'REFUND'
);


--
-- TOC entry 1098 (class 1247 OID 112496)
-- Name: CommunicationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CommunicationStatus" AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'FAILED',
    'CANCELLED'
);


--
-- TOC entry 1095 (class 1247 OID 112486)
-- Name: CommunicationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CommunicationType" AS ENUM (
    'EMAIL',
    'SMS',
    'CALL',
    'WHATSAPP'
);


--
-- TOC entry 1191 (class 1247 OID 138364)
-- Name: CounterStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CounterStatus" AS ENUM (
    'OPEN',
    'CLOSED',
    'LOCKED'
);


--
-- TOC entry 1020 (class 1247 OID 112201)
-- Name: DoctorType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DoctorType" AS ENUM (
    'REFERRING_DOCTOR',
    'INTERNAL_PATHOLOGIST',
    'CONSULTANT_PATHOLOGIST'
);


--
-- TOC entry 927 (class 1247 OID 111488)
-- Name: Gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


--
-- TOC entry 1086 (class 1247 OID 112450)
-- Name: MaintenanceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MaintenanceStatus" AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'OVERDUE',
    'CANCELLED'
);


--
-- TOC entry 1101 (class 1247 OID 112508)
-- Name: NotificationEventType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationEventType" AS ENUM (
    'PATIENT_REGISTRATION',
    'ORDER_CREATED',
    'SAMPLE_COLLECTED',
    'SAMPLE_RECEIVED',
    'TEST_COMPLETED',
    'RESULT_READY',
    'RESULT_APPROVED',
    'INVOICE_GENERATED',
    'PAYMENT_RECEIVED',
    'APPOINTMENT_SCHEDULED',
    'APPOINTMENT_REMINDER'
);


--
-- TOC entry 933 (class 1247 OID 111504)
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'DRAFT',
    'REGISTERED',
    'SAMPLE_COLLECTED',
    'PROCESSING',
    'COMPLETED',
    'CANCELLED',
    'IN_PROGRESS',
    'PARTIALLY_COMPLETED'
);


--
-- TOC entry 948 (class 1247 OID 111562)
-- Name: ParameterType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ParameterType" AS ENUM (
    'NUMERIC',
    'TEXT',
    'BOOLEAN',
    'OPTION'
);


--
-- TOC entry 939 (class 1247 OID 111528)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CARD',
    'UPI',
    'NET_BANKING',
    'CHEQUE',
    'BANK_TRANSFER',
    'ADVANCE',
    'WALLET',
    'CORPORATE_CREDIT',
    'OTHER'
);


--
-- TOC entry 936 (class 1247 OID 111518)
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'PAID',
    'REFUNDED'
);


--
-- TOC entry 1203 (class 1247 OID 138410)
-- Name: ReceivableStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReceivableStatus" AS ENUM (
    'PENDING',
    'PARTIALLY_PAID',
    'PAID',
    'OVERDUE',
    'WRITE_OFF'
);


--
-- TOC entry 1200 (class 1247 OID 138398)
-- Name: ReconciliationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReconciliationStatus" AS ENUM (
    'PENDING',
    'MATCHED',
    'UNMATCHED',
    'DISCREPANCY',
    'RESOLVED'
);


--
-- TOC entry 1188 (class 1247 OID 138350)
-- Name: RefundStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RefundStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);


--
-- TOC entry 963 (class 1247 OID 111622)
-- Name: ReportStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReportStatus" AS ENUM (
    'DRAFT',
    'GENERATED',
    'PUBLISHED',
    'CANCELLED'
);


--
-- TOC entry 945 (class 1247 OID 111552)
-- Name: ResultFlag; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ResultFlag" AS ENUM (
    'LOW',
    'NORMAL',
    'HIGH',
    'CRITICAL'
);


--
-- TOC entry 942 (class 1247 OID 111540)
-- Name: ResultStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ResultStatus" AS ENUM (
    'PENDING',
    'ENTERED',
    'VERIFIED',
    'APPROVED',
    'PUBLISHED'
);


--
-- TOC entry 954 (class 1247 OID 111594)
-- Name: SampleStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SampleStatus" AS ENUM (
    'PENDING',
    'COLLECTED',
    'RECEIVED',
    'PROCESSING',
    'COMPLETED',
    'REJECTED'
);


--
-- TOC entry 1074 (class 1247 OID 112385)
-- Name: SampleTrackingEventType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SampleTrackingEventType" AS ENUM (
    'ORDER_REGISTERED',
    'SAMPLE_COLLECTED',
    'SAMPLE_RECEIVED',
    'SAMPLE_PROCESSING',
    'SAMPLE_COMPLETED',
    'SAMPLE_REJECTED',
    'RESULT_ENTERED',
    'RESULT_VERIFIED',
    'RESULT_APPROVED',
    'REPORT_GENERATED',
    'REPORT_SENT',
    'REPORT_DELIVERED'
);


--
-- TOC entry 951 (class 1247 OID 111572)
-- Name: SampleType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SampleType" AS ENUM (
    'BLOOD',
    'URINE',
    'SERUM',
    'PLASMA',
    'STOOL',
    'SWAB',
    'SPUTUM',
    'CSF',
    'TISSUE',
    'OTHER'
);


--
-- TOC entry 1197 (class 1247 OID 138386)
-- Name: SettlementStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SettlementStatus" AS ENUM (
    'EXPECTED',
    'PROCESSING',
    'SETTLED',
    'MISMATCH',
    'FAILED'
);


--
-- TOC entry 924 (class 1247 OID 111476)
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'FRONT_DESK',
    'LAB_TECH',
    'PATHOLOGIST',
    'DOCTOR',
    'SUPER_ADMIN',
    'BRANCH_ADMIN',
    'ACCOUNTANT',
    'AUDITOR'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 111461)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 250 (class 1259 OID 112688)
-- Name: analyzer_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analyzer_alerts (
    id text NOT NULL,
    "analyzerId" text NOT NULL,
    "alertType" text NOT NULL,
    severity public."AlertSeverity" DEFAULT 'INFO'::public."AlertSeverity" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isAcknowledged" boolean DEFAULT false NOT NULL,
    "acknowledgedBy" text,
    "acknowledgedAt" timestamp(3) without time zone,
    "isResolved" boolean DEFAULT false NOT NULL,
    "resolvedBy" text,
    "resolvedAt" timestamp(3) without time zone,
    "resolutionNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    metadata jsonb
);


--
-- TOC entry 251 (class 1259 OID 112709)
-- Name: analyzer_communication_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analyzer_communication_logs (
    id text NOT NULL,
    "analyzerId" text NOT NULL,
    direction text NOT NULL,
    "messageType" text NOT NULL,
    protocol public."AnalyzerProtocol" NOT NULL,
    payload text NOT NULL,
    "parsedData" jsonb,
    status text NOT NULL,
    "errorMessage" text,
    "responseTime" integer,
    "connectionLatency" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 249 (class 1259 OID 112666)
-- Name: analyzer_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analyzer_jobs (
    id text NOT NULL,
    "analyzerId" text NOT NULL,
    "jobId" text NOT NULL,
    "orderId" text,
    "orderNumber" text,
    "sampleId" text,
    "sampleNumber" text,
    barcode text,
    "testId" text,
    "testCode" text,
    "testName" text,
    "analyzerTestCode" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    status public."AnalyzerJobStatus" DEFAULT 'PENDING'::public."AnalyzerJobStatus" NOT NULL,
    "progressPercentage" integer DEFAULT 0,
    "currentStep" text,
    "errorMessage" text,
    "errorDetails" jsonb,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "maxRetries" integer DEFAULT 3 NOT NULL,
    "resultId" text,
    "resultReceived" boolean DEFAULT false NOT NULL,
    "resultReceivedAt" timestamp(3) without time zone,
    priority text DEFAULT 'NORMAL'::text
);


--
-- TOC entry 236 (class 1259 OID 111911)
-- Name: analyzer_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analyzer_logs (
    id text NOT NULL,
    "machineName" text NOT NULL,
    "machineCode" text NOT NULL,
    protocol public."AnalyzerProtocol" NOT NULL,
    "orderNumber" text,
    barcode text,
    "rawMessage" text NOT NULL,
    "parsedJson" jsonb,
    "isProcessed" boolean DEFAULT false NOT NULL,
    "errorMessage" text,
    "receivedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone
);


--
-- TOC entry 254 (class 1259 OID 112764)
-- Name: analyzer_port_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analyzer_port_mappings (
    id text NOT NULL,
    "analyzerId" text NOT NULL,
    "portName" text NOT NULL,
    "portType" text NOT NULL,
    direction text NOT NULL,
    "baudRate" integer,
    "dataBits" integer,
    "stopBits" integer,
    parity text,
    "flowControl" text,
    "hostAddress" text,
    "portNumber" integer,
    "socketType" text,
    timeout integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    description text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 248 (class 1259 OID 112646)
-- Name: analyzer_test_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analyzer_test_mappings (
    id text NOT NULL,
    "analyzerId" text NOT NULL,
    "labCoreTestId" text NOT NULL,
    "labCoreTestCode" text NOT NULL,
    "labCoreTestName" text NOT NULL,
    "analyzerTestCode" text NOT NULL,
    "analyzerTestName" text,
    unit text,
    "referenceRange" text,
    "sampleType" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isValid" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text
);


--
-- TOC entry 245 (class 1259 OID 112594)
-- Name: analyzers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analyzers (
    id text NOT NULL,
    name text NOT NULL,
    "analyzerId" text NOT NULL,
    manufacturer text,
    model text,
    "serialNumber" text,
    "analyzerType" text,
    department text,
    "laboratorySection" text,
    location text,
    "installationDate" timestamp(3) without time zone,
    "connectionType" public."AnalyzerConnectionType" DEFAULT 'NETWORK'::public."AnalyzerConnectionType" NOT NULL,
    protocol public."AnalyzerProtocol" DEFAULT 'ASTM'::public."AnalyzerProtocol" NOT NULL,
    host text,
    port integer,
    "deviceIdentifier" text,
    "connectionString" text,
    status public."AnalyzerStatus" DEFAULT 'OFFLINE'::public."AnalyzerStatus" NOT NULL,
    "lastCommunicationAt" timestamp(3) without time zone,
    "lastSuccessfulHeartbeat" timestamp(3) without time zone,
    "connectionLatency" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "isArchived" boolean DEFAULT false NOT NULL,
    "archivedAt" timestamp(3) without time zone,
    "archivedBy" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 234 (class 1259 OID 111881)
-- Name: approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approvals (
    id text NOT NULL,
    "resultId" text NOT NULL,
    "approvedById" text NOT NULL,
    status public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    remarks text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 111927)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text,
    module text NOT NULL,
    action text NOT NULL,
    "recordId" text,
    "ipAddress" text,
    "userAgent" text,
    "oldData" jsonb,
    "newData" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 246 (class 1259 OID 112617)
-- Name: calibrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calibrations (
    id text NOT NULL,
    "analyzerId" text NOT NULL,
    "calibrationDate" timestamp(3) without time zone NOT NULL,
    "performedBy" text,
    operator text,
    status public."CalibrationStatus" DEFAULT 'VALID'::public."CalibrationStatus" NOT NULL,
    outcome text,
    result text,
    "nextCalibrationDueDate" timestamp(3) without time zone,
    "nextCalibrationReminderDate" timestamp(3) without time zone,
    "calibrationType" text,
    "reagentsUsed" text,
    notes text,
    "performedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text
);


--
-- TOC entry 279 (class 1259 OID 138554)
-- Name: cash_counter_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_counter_sessions (
    id text NOT NULL,
    "counterId" text NOT NULL,
    "userId" text NOT NULL,
    "openingBalance" numeric(10,2) NOT NULL,
    "closingBalance" numeric(10,2),
    "expectedCash" numeric(10,2),
    "actualCash" numeric(10,2),
    variance numeric(10,2),
    "varianceReason" text,
    "openedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "closedAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 278 (class 1259 OID 138529)
-- Name: cash_counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_counters (
    id text NOT NULL,
    "counterNumber" text NOT NULL,
    "counterName" text NOT NULL,
    "branchId" text,
    location text,
    status public."CounterStatus" DEFAULT 'CLOSED'::public."CounterStatus" NOT NULL,
    "openingBalance" numeric(10,2) DEFAULT 0 NOT NULL,
    "currentBalance" numeric(10,2) DEFAULT 0 NOT NULL,
    "assignedUserId" text,
    "openedAt" timestamp(3) without time zone,
    "closedAt" timestamp(3) without time zone,
    "expectedCash" numeric(10,2) DEFAULT 0 NOT NULL,
    "actualCash" numeric(10,2) DEFAULT 0 NOT NULL,
    variance numeric(10,2) DEFAULT 0 NOT NULL,
    "varianceReason" text,
    "denominationData" jsonb,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 280 (class 1259 OID 138569)
-- Name: cash_drawers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_drawers (
    id text NOT NULL,
    "drawerNumber" text NOT NULL,
    "counterId" text NOT NULL,
    "drawerName" text NOT NULL,
    "currentBalance" numeric(10,2) DEFAULT 0 NOT NULL,
    "denominationData" jsonb,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 281 (class 1259 OID 138587)
-- Name: cash_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_movements (
    id text NOT NULL,
    "drawerId" text NOT NULL,
    "movementType" public."CashMovementType" NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text NOT NULL,
    "referenceId" text,
    "referenceType" text,
    "performedById" text NOT NULL,
    "performedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 252 (class 1259 OID 112725)
-- Name: communication_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communication_logs (
    id text NOT NULL,
    "patientId" text NOT NULL,
    type public."CommunicationType" NOT NULL,
    status public."CommunicationStatus" DEFAULT 'PENDING'::public."CommunicationStatus" NOT NULL,
    "recipientContact" text NOT NULL,
    subject text,
    message text NOT NULL,
    provider text,
    "providerMessageId" text,
    "errorReason" text,
    "errorMessage" text,
    metadata jsonb,
    "sentById" text,
    "sentAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "failedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 285 (class 1259 OID 138655)
-- Name: corporate_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.corporate_accounts (
    id text NOT NULL,
    "accountNumber" text NOT NULL,
    "accountName" text NOT NULL,
    "organizationName" text NOT NULL,
    "contactPerson" text,
    "contactPhone" character varying(15),
    "contactEmail" text,
    "billingAddress" text,
    "creditLimit" numeric(10,2) DEFAULT 0 NOT NULL,
    "currentBalance" numeric(10,2) DEFAULT 0 NOT NULL,
    "paymentTerms" text,
    "isActive" boolean DEFAULT true NOT NULL,
    gstin text,
    "panNumber" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 258 (class 1259 OID 112868)
-- Name: critical_value_acknowledgments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.critical_value_acknowledgments (
    id text NOT NULL,
    "resultId" text NOT NULL,
    "resultValueId" text,
    "acknowledgedBy" text NOT NULL,
    "notifiedPerson" text,
    "notifiedPersonContact" text,
    "notificationMode" text,
    "notificationTime" timestamp(3) without time zone,
    notes text,
    "acknowledgmentReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "testParameterId" text
);


--
-- TOC entry 221 (class 1259 OID 111649)
-- Name: doctors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctors (
    id text NOT NULL,
    "doctorCode" text NOT NULL,
    "fullName" text NOT NULL,
    qualification text,
    specialization text,
    phone character varying(15),
    email text,
    "clinicName" text,
    address text,
    "commissionRate" numeric(5,2),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "availableDays" text,
    "availableTime" text,
    "consultationFee" numeric(10,2),
    department text,
    designation text,
    experience integer,
    "licenseExpiry" timestamp(3) without time zone,
    "licenseNumber" text,
    "photoUrl" text,
    "signatureUrl" text,
    "doctorType" public."DoctorType" DEFAULT 'REFERRING_DOCTOR'::public."DoctorType",
    "clinicAddress" character varying(500),
    "whatsappNumber" character varying(15),
    "reportDeliveryEmail" boolean DEFAULT false NOT NULL,
    "reportDeliveryWhatsApp" boolean DEFAULT false NOT NULL,
    "reportDeliveryHardCopy" boolean DEFAULT false NOT NULL,
    "reportDeliveryPortal" boolean DEFAULT false NOT NULL,
    "enablePortalAccess" boolean DEFAULT false NOT NULL,
    "bankAccountNumber" character varying(30),
    "bankIfscCode" character varying(20),
    "bankAccountHolderName" character varying(200),
    "registrationNumber" text
);


--
-- TOC entry 230 (class 1259 OID 111812)
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "orderId" text NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    "gstPercent" numeric(5,2) DEFAULT 18 NOT NULL,
    "gstAmount" numeric(10,2) NOT NULL,
    "grandTotal" numeric(10,2) NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "cgstAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "igstAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "sgstAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "taxableAmount" numeric(10,2) NOT NULL
);


--
-- TOC entry 257 (class 1259 OID 112836)
-- Name: laboratory_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.laboratory_settings (
    id text NOT NULL,
    "labName" text DEFAULT 'LabCore Enterprise LIS'::text NOT NULL,
    "labPhone" character varying(15) DEFAULT ''::character varying NOT NULL,
    "labEmail" text DEFAULT ''::text NOT NULL,
    "labAddress" text,
    "labCity" text,
    "labState" text,
    "labPincode" character varying(10),
    "emailProvider" text,
    "emailApiKey" text,
    "emailFromEmail" text,
    "emailFromName" text,
    "smtpHost" text,
    "smtpPort" integer,
    "smtpUser" text,
    "smtpPassword" text,
    "smsProvider" text,
    "smsApiKey" text,
    "smsApiSecret" text,
    "smsSenderId" text,
    "callProvider" text,
    "callApiKey" text,
    "callApiSecret" text,
    "callCallerId" text,
    "enableAutomatedNotifications" boolean DEFAULT true NOT NULL,
    "enablePatientNotifications" boolean DEFAULT true NOT NULL,
    "enableDoctorNotifications" boolean DEFAULT false NOT NULL,
    "enableAutoResultProcessing" boolean DEFAULT true NOT NULL,
    "enableAutoApproval" boolean DEFAULT false NOT NULL,
    "enableLiveTelemetry" boolean DEFAULT true NOT NULL,
    "demoMode" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "defaultAnalyzer" text,
    "defaultMethodology" text,
    gstin character varying(15),
    "isoCertification" character varying(100),
    "laboratoryDirector" text,
    "laboratoryDirectorQualification" text,
    "licenseNumber" character varying(100),
    "nablAccreditation" character varying(100),
    "pathologistInCharge" text,
    "pathologistInChargeQualification" text,
    "reportIdPrefix" text DEFAULT 'REP'::text,
    "whatsappAIEnabled" boolean DEFAULT false NOT NULL,
    "whatsappAccessToken" text,
    "whatsappBusinessProfileId" text,
    "whatsappPhoneNumberId" text,
    "whatsappProvider" text,
    "whatsappVerifyToken" text,
    "whatsappWebhookUrl" text
);


--
-- TOC entry 247 (class 1259 OID 112631)
-- Name: maintenances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenances (
    id text NOT NULL,
    "analyzerId" text NOT NULL,
    "maintenanceType" text,
    "scheduledDate" timestamp(3) without time zone,
    "completedDate" timestamp(3) without time zone,
    status public."MaintenanceStatus" DEFAULT 'SCHEDULED'::public."MaintenanceStatus" NOT NULL,
    description text NOT NULL,
    technician text,
    "partsReplaced" text,
    cost numeric(10,2),
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text
);


--
-- TOC entry 242 (class 1259 OID 112338)
-- Name: mfa_backup_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mfa_backup_codes (
    id text NOT NULL,
    "userId" text NOT NULL,
    "codeHash" text NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 253 (class 1259 OID 112742)
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_templates (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "eventType" public."NotificationEventType" DEFAULT 'PATIENT_REGISTRATION'::public."NotificationEventType" NOT NULL,
    channel public."CommunicationType" DEFAULT 'EMAIL'::public."CommunicationType" NOT NULL,
    "subjectTemplate" text,
    "bodyTemplate" text DEFAULT ''::text NOT NULL,
    variables text[] DEFAULT ARRAY[]::text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 111773)
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "testId" text,
    price numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    "gstPercentage" numeric(5,2) DEFAULT 0 NOT NULL,
    "gstAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "finalPrice" numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "packageId" text,
    "itemType" text DEFAULT 'TEST'::text NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 111745)
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    barcode text NOT NULL,
    "patientId" text NOT NULL,
    "doctorId" text,
    "createdById" text,
    "orderStatus" public."OrderStatus" DEFAULT 'REGISTERED'::public."OrderStatus" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "sampleCollected" boolean DEFAULT false NOT NULL,
    "collectedAt" timestamp(3) without time zone,
    "reportedAt" timestamp(3) without time zone,
    notes text,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    "gstAmount" numeric(5,2) DEFAULT 0 NOT NULL,
    "grandTotal" numeric(10,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "collectionType" text,
    "discountCode" text,
    "dueAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "homeCollectionAddress" text,
    "paidAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    priority text DEFAULT 'ROUTINE'::text,
    "reportDeliveryEmail" boolean DEFAULT false NOT NULL,
    "reportDeliveryPortal" boolean DEFAULT false NOT NULL,
    "reportDeliveryPrinted" boolean DEFAULT false NOT NULL,
    "reportDeliveryWhatsApp" boolean DEFAULT false NOT NULL,
    "clinicalNotes" text,
    "fastingStatus" text,
    "reportId" text,
    "specimenType" text
);


--
-- TOC entry 240 (class 1259 OID 112311)
-- Name: password_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_history (
    id text NOT NULL,
    "userId" text NOT NULL,
    "passwordHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 275 (class 1259 OID 138484)
-- Name: patient_advances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_advances (
    id text NOT NULL,
    "patientId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    balance numeric(10,2) NOT NULL,
    "transactionType" text NOT NULL,
    "referenceId" text,
    "referenceType" text,
    reason text,
    "receivedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 271 (class 1259 OID 126194)
-- Name: patient_history_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_history_entries (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "reportId" text NOT NULL,
    "entryType" text NOT NULL,
    notes text,
    "addedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 276 (class 1259 OID 138498)
-- Name: patient_wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_wallets (
    id text NOT NULL,
    "patientId" text NOT NULL,
    balance numeric(10,2) DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 111664)
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients (
    id text NOT NULL,
    uhid text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    gender public."Gender" NOT NULL,
    "dateOfBirth" timestamp(3) without time zone,
    age integer,
    "ageMonth" integer,
    "ageDay" integer,
    phone character varying(15),
    email text,
    "bloodGroup" text,
    address text,
    city text,
    state text,
    pincode character varying(10),
    "emergencyContact" character varying(15),
    "referredById" text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "emergencyContactName" text,
    "emergencyContactRelationship" text,
    "fastingStatus" text,
    "insuranceNumber" text,
    "insuranceProvider" text,
    "nationalId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "middleName" text,
    "alternatePhone" character varying(15),
    landmark text,
    country text DEFAULT 'India'::text,
    "emergencyContactAddress" text,
    height double precision,
    weight double precision,
    bmi double precision,
    "aadhaarNumber" character varying(12),
    "panNumber" character varying(10),
    "patientType" text DEFAULT 'GENERAL'::text,
    "maritalStatus" text,
    occupation text,
    nationality text DEFAULT 'Indian'::text,
    allergies jsonb,
    "chronicDiseases" jsonb,
    "currentMedications" jsonb,
    "insuranceGroupNumber" text,
    "insuranceExpiryDate" timestamp(3) without time zone,
    "photoUrl" text,
    "preferredLanguage" text DEFAULT 'ENGLISH'::text,
    "preferredCommunicationMethod" text,
    "communicationPreference" jsonb,
    "consentForTreatment" boolean DEFAULT false NOT NULL,
    "consentForDataSharing" boolean DEFAULT false NOT NULL,
    "consentForMarketing" boolean DEFAULT false NOT NULL,
    "familyHeadId" text,
    "relationshipToHead" text,
    notes text,
    "isDraft" boolean DEFAULT false NOT NULL,
    "registrationSource" text DEFAULT 'WALK_IN'::text,
    "referralSource" text,
    "verificationStatus" text DEFAULT 'UNVERIFIED'::text,
    "phoneVerified" boolean DEFAULT false NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "kycVerified" boolean DEFAULT false NOT NULL,
    "qrCode" text
);


--
-- TOC entry 272 (class 1259 OID 138433)
-- Name: payment_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_allocations (
    id text NOT NULL,
    "paymentId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "allocationType" text NOT NULL,
    "referenceId" text NOT NULL,
    "referenceType" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 288 (class 1259 OID 138711)
-- Name: payment_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_audit_logs (
    id text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    "oldValues" jsonb,
    "newValues" jsonb,
    reason text,
    "ipAddress" text,
    "userAgent" text,
    "branchId" text,
    "counterId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 111834)
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "receiptNumber" text NOT NULL,
    "orderId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" DEFAULT 'PAID'::public."PaymentStatus" NOT NULL,
    "transactionId" text,
    remarks text,
    "receivedById" text,
    "paidAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "allocationId" text,
    "cashDrawerId" text,
    "corporateAccountId" text,
    "counterId" text,
    "gatewayProvider" text,
    "gatewayReference" text,
    "gatewayResponse" jsonb,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    utr text
);


--
-- TOC entry 255 (class 1259 OID 112783)
-- Name: qc_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qc_rules (
    id text NOT NULL,
    "analyzerId" text,
    "testId" text,
    "testParameterId" text,
    "ruleName" text NOT NULL,
    "ruleType" text NOT NULL,
    "ruleCondition" text NOT NULL,
    "minValue" numeric(10,2),
    "maxValue" numeric(10,2),
    "criticalLowThreshold" numeric(10,2),
    "criticalHighThreshold" numeric(10,2),
    "deltaThreshold" numeric(10,2),
    "requireQCPass" boolean DEFAULT true NOT NULL,
    "qcLevel" text,
    "qcSampleType" text,
    "autoApprove" boolean DEFAULT false NOT NULL,
    "requirePathologistReview" boolean DEFAULT false NOT NULL,
    "requireTechnicianReview" boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "generateAlertOnFailure" boolean DEFAULT true NOT NULL,
    "alertSeverity" public."AlertSeverity" DEFAULT 'WARNING'::public."AlertSeverity" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    description text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text
);


--
-- TOC entry 287 (class 1259 OID 138698)
-- Name: receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receipts (
    id text NOT NULL,
    "receiptNumber" text NOT NULL,
    "paymentId" text NOT NULL,
    "receiptType" text NOT NULL,
    "qrCode" text,
    "verificationUrl" text,
    "printedAt" timestamp(3) without time zone,
    "emailedAt" timestamp(3) without time zone,
    "smsedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 286 (class 1259 OID 138675)
-- Name: receivables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receivables (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "patientId" text,
    "corporateAccountId" text,
    "totalAmount" numeric(10,2) NOT NULL,
    "paidAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "outstandingAmount" numeric(10,2) NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "overdueDays" integer DEFAULT 0 NOT NULL,
    status public."ReceivableStatus" DEFAULT 'PENDING'::public."ReceivableStatus" NOT NULL,
    "lastReminderAt" timestamp(3) without time zone,
    "reminderCount" integer DEFAULT 0 NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 284 (class 1259 OID 138639)
-- Name: reconciliation_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reconciliation_records (
    id text NOT NULL,
    "recordDate" timestamp(3) without time zone NOT NULL,
    "sourceType" text NOT NULL,
    "sourceId" text NOT NULL,
    "transactionId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public."ReconciliationStatus" NOT NULL,
    "matchedWith" text,
    discrepancy text,
    notes text,
    "reconciledAt" timestamp(3) without time zone,
    "reconciledById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 111734)
-- Name: reference_ranges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reference_ranges (
    id text NOT NULL,
    "parameterId" text NOT NULL,
    gender public."Gender",
    "minAge" integer,
    "maxAge" integer,
    "criticalLow" numeric(10,2),
    "normalLow" numeric(10,2),
    "normalHigh" numeric(10,2),
    "criticalHigh" numeric(10,2),
    interpretation text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ageGroup" text,
    "minAgeUnit" text,
    "maxAgeUnit" text,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "displayOrder" integer DEFAULT 0,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 274 (class 1259 OID 138469)
-- Name: refund_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refund_approvals (
    id text NOT NULL,
    "refundId" text NOT NULL,
    "approverId" text NOT NULL,
    "approvalStatus" text NOT NULL,
    "approvalNotes" text,
    "approvedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 273 (class 1259 OID 138448)
-- Name: refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refunds (
    id text NOT NULL,
    "refundNumber" text NOT NULL,
    "paymentId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text NOT NULL,
    status public."RefundStatus" DEFAULT 'PENDING'::public."RefundStatus" NOT NULL,
    "refundMethod" public."PaymentMethod" NOT NULL,
    "refundTo" text,
    "approvalId" text,
    "processedAt" timestamp(3) without time zone,
    "processedById" text,
    "transactionId" text,
    utr text,
    remarks text,
    "requestedById" text NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 270 (class 1259 OID 126178)
-- Name: report_addendums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_addendums (
    id text NOT NULL,
    "reportId" text NOT NULL,
    content text NOT NULL,
    "addedBy" text NOT NULL,
    "isPrivate" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 269 (class 1259 OID 126157)
-- Name: report_share_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_share_links (
    id text NOT NULL,
    "reportId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "accessCount" integer DEFAULT 0 NOT NULL,
    "maxAccess" integer,
    "createdBy" text NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 111895)
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id text NOT NULL,
    "reportNumber" text NOT NULL,
    "patientId" text NOT NULL,
    "orderId" text NOT NULL,
    status public."ReportStatus" DEFAULT 'DRAFT'::public."ReportStatus" NOT NULL,
    "reportTitle" text,
    "reportData" jsonb,
    "fileUrl" text,
    "publishedById" text,
    "generatedAt" timestamp(3) without time zone,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "clinicalInterpretation" text,
    methodology text,
    "qualityAssurance" jsonb,
    "reportReferenceId" text,
    "templateType" text DEFAULT 'standard'::text
);


--
-- TOC entry 259 (class 1259 OID 112880)
-- Name: result_amendments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.result_amendments (
    id text NOT NULL,
    "resultId" text NOT NULL,
    "amendedBy" text NOT NULL,
    "amendmentReason" text NOT NULL,
    "amendmentType" text NOT NULL,
    "versionNumber" integer NOT NULL,
    "previousValue" jsonb,
    "newValue" jsonb,
    "changedFields" text[],
    "fieldChanges" jsonb,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    "requiresReportRegeneration" boolean DEFAULT true NOT NULL,
    "reportRegeneratedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 111867)
-- Name: result_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.result_values (
    id text NOT NULL,
    "resultId" text NOT NULL,
    "parameterId" text NOT NULL,
    value text NOT NULL,
    flag public."ResultFlag",
    remark text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "clinicalSignificance" text,
    "rangeIndicator" text
);


--
-- TOC entry 232 (class 1259 OID 111852)
-- Name: results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.results (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "testId" text NOT NULL,
    status public."ResultStatus" DEFAULT 'PENDING'::public."ResultStatus" NOT NULL,
    remarks text,
    interpretation text,
    "enteredById" text,
    "approvedById" text,
    "enteredAt" timestamp(3) without time zone,
    "verifiedAt" timestamp(3) without time zone,
    "approvedAt" timestamp(3) without time zone,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "patientId" text,
    "analyzerUsed" text,
    "calibrationStatus" text,
    "externalQAScheme" text,
    "fastingStatus" text,
    "hemolysisLipemia" text,
    "internalQCStatus" text,
    "methodUsed" text,
    "reportConfidenceScore" text,
    "sampleCollectionTime" timestamp(3) without time zone,
    "specimenQuality" text
);


--
-- TOC entry 243 (class 1259 OID 112350)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    role public."UserRole" NOT NULL,
    permission text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 244 (class 1259 OID 112578)
-- Name: sample_tracking_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sample_tracking_history (
    id text NOT NULL,
    "sampleId" text NOT NULL,
    "orderId" text NOT NULL,
    "patientId" text NOT NULL,
    "eventType" public."SampleTrackingEventType" NOT NULL,
    status text,
    location text,
    notes text,
    "performedById" text,
    "performedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 111793)
-- Name: samples; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.samples (
    id text NOT NULL,
    "sampleNumber" text NOT NULL,
    barcode text NOT NULL,
    "patientId" text NOT NULL,
    "orderId" text NOT NULL,
    "testId" text NOT NULL,
    "sampleType" public."SampleType" NOT NULL,
    status public."SampleStatus" DEFAULT 'PENDING'::public."SampleStatus" NOT NULL,
    "collectedById" text,
    "collectedAt" timestamp(3) without time zone,
    "receivedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "collectionType" text,
    priority text
);


--
-- TOC entry 283 (class 1259 OID 138624)
-- Name: settlement_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settlement_transactions (
    id text NOT NULL,
    "settlementId" text NOT NULL,
    "paymentId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "matchedAmount" numeric(10,2),
    status text DEFAULT 'MATCHED'::text NOT NULL,
    "matchedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 282 (class 1259 OID 138604)
-- Name: settlements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settlements (
    id text NOT NULL,
    "settlementNumber" text NOT NULL,
    provider text NOT NULL,
    "providerType" text NOT NULL,
    "grossAmount" numeric(10,2) NOT NULL,
    fees numeric(10,2) DEFAULT 0 NOT NULL,
    "netAmount" numeric(10,2) NOT NULL,
    "settledAmount" numeric(10,2),
    difference numeric(10,2),
    status public."SettlementStatus" DEFAULT 'EXPECTED'::public."SettlementStatus" NOT NULL,
    "settlementDate" timestamp(3) without time zone,
    "referenceNumber" text,
    utr text,
    metadata jsonb,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 111679)
-- Name: test_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_categories (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    department text,
    color text DEFAULT '#3B82F6'::text,
    icon text,
    "displayOrder" integer DEFAULT 0
);


--
-- TOC entry 239 (class 1259 OID 112258)
-- Name: test_package_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_package_items (
    id text NOT NULL,
    "packageId" text NOT NULL,
    "testId" text NOT NULL,
    "testPrice" numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 112228)
-- Name: test_packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_packages (
    id text NOT NULL,
    "packageCode" text NOT NULL,
    "packageName" text NOT NULL,
    description text,
    "totalPrice" numeric(10,2) NOT NULL,
    "offerPrice" numeric(10,2),
    "discountPercentage" numeric(5,2),
    "gstPercentage" numeric(5,2) DEFAULT 0 NOT NULL,
    "includesTestsCount" integer DEFAULT 0 NOT NULL,
    "tatHours" integer DEFAULT 24 NOT NULL,
    "tatDisplay" text,
    "targetAudience" text,
    "recommendedFor" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isPopular" boolean DEFAULT false NOT NULL,
    "displayOrder" integer DEFAULT 0,
    color text DEFAULT '#10B981'::text,
    icon text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 111716)
-- Name: test_parameters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_parameters (
    id text NOT NULL,
    "testId" text NOT NULL,
    "parameterName" text NOT NULL,
    unit text,
    "dataType" public."ParameterType" NOT NULL,
    "displayOrder" integer DEFAULT 1 NOT NULL,
    "isRequired" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "shortName" text,
    "measurementMethod" text,
    "dropdownOptions" text,
    "allowRichText" boolean DEFAULT false NOT NULL,
    "decimalPrecision" integer,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 111694)
-- Name: tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tests (
    id text NOT NULL,
    "testCode" text NOT NULL,
    "testName" text NOT NULL,
    "categoryId" text,
    "sampleType" public."SampleType" NOT NULL,
    "sampleContainer" text,
    method text,
    price numeric(10,2) NOT NULL,
    "gstPercentage" numeric(5,2) DEFAULT 0 NOT NULL,
    "tatHours" integer DEFAULT 24 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "shortName" text,
    "sampleVolume" text,
    "processingDepartment" text,
    "offerPrice" numeric(10,2),
    "b2bRate" numeric(10,2),
    "tatDisplay" text,
    "displayOrder" integer DEFAULT 0,
    "clinicalSignificance" text,
    "patientPreparation" text,
    "deltaCheckAbsThreshold" numeric(10,2),
    "deltaCheckEnabled" boolean DEFAULT false NOT NULL,
    "deltaThresholdPercentage" numeric(5,2),
    description text
);


--
-- TOC entry 241 (class 1259 OID 112323)
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "refreshTokenHash" text NOT NULL,
    "deviceFingerprint" text,
    "userAgent" text,
    "ipAddress" text,
    "lastSeenAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "revokeReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 111631)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    "employeeCode" text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    phone character varying(15),
    "passwordHash" text NOT NULL,
    role public."UserRole" NOT NULL,
    status public."AccountStatus" DEFAULT 'ACTIVE'::public."AccountStatus" NOT NULL,
    specialization text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "autoApproveResults" boolean DEFAULT false NOT NULL,
    "compactMode" boolean DEFAULT false NOT NULL,
    "darkMode" boolean DEFAULT false NOT NULL,
    "dateFormat" text DEFAULT 'DD/MM/YYYY'::text,
    "defaultReportTemplate" text DEFAULT 'standard'::text,
    department text,
    designation text,
    "emergencyContact" text,
    "emergencyContactPhone" character varying(15),
    "enableCriticalAlerts" boolean DEFAULT true NOT NULL,
    "enableDailyDigest" boolean DEFAULT true NOT NULL,
    "enableEmailNotifications" boolean DEFAULT true NOT NULL,
    "enablePushNotifications" boolean DEFAULT true NOT NULL,
    "enableSmsNotifications" boolean DEFAULT false NOT NULL,
    "firstName" text,
    language text DEFAULT 'English'::text,
    "lastName" text,
    "preferredCommunicationMethod" text DEFAULT 'email'::text,
    "profileImage" text,
    "showTutorial" boolean DEFAULT true NOT NULL,
    signature text,
    "timeFormat" text DEFAULT '24h'::text,
    timezone text DEFAULT 'Asia/Kolkata'::text,
    "workingHoursEnd" text DEFAULT '17:00'::text,
    "workingHoursStart" text DEFAULT '09:00'::text,
    "failedLoginCount" integer DEFAULT 0 NOT NULL,
    "lockedUntil" timestamp(3) without time zone,
    "passwordChangedAt" timestamp(3) without time zone,
    "mfaEnabled" boolean DEFAULT false NOT NULL,
    "totpSecretEnc" text,
    "totpPendingEnc" text
);


--
-- TOC entry 277 (class 1259 OID 138514)
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallet_transactions (
    id text NOT NULL,
    "walletId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "transactionType" text NOT NULL,
    "balanceBefore" numeric(10,2) NOT NULL,
    "balanceAfter" numeric(10,2) NOT NULL,
    "referenceId" text,
    "referenceType" text,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 267 (class 1259 OID 121703)
-- Name: whatsapp_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_analytics (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    period text NOT NULL,
    "sentCount" integer DEFAULT 0 NOT NULL,
    "deliveredCount" integer DEFAULT 0 NOT NULL,
    "readCount" integer DEFAULT 0 NOT NULL,
    "failedCount" integer DEFAULT 0 NOT NULL,
    cost numeric(10,2) DEFAULT 0 NOT NULL,
    "templateBreakdown" jsonb,
    metrics jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 264 (class 1259 OID 121631)
-- Name: whatsapp_auto_reply_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_auto_reply_rules (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "triggerType" text NOT NULL,
    "triggerData" jsonb NOT NULL,
    "responseType" text NOT NULL,
    "responseText" text NOT NULL,
    "templateId" text,
    "interactiveType" text,
    "interactiveData" jsonb,
    "delaySeconds" integer DEFAULT 0 NOT NULL,
    "maxResponsesPerDay" integer,
    "cooldownSeconds" integer,
    priority integer DEFAULT 0 NOT NULL,
    "patientSegment" jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "aiEnabled" boolean DEFAULT false NOT NULL,
    "aiModel" text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 266 (class 1259 OID 121677)
-- Name: whatsapp_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_campaigns (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "campaignType" text NOT NULL,
    "templateId" text,
    "messageContent" text,
    "targetAudience" jsonb NOT NULL,
    "recipientCount" integer DEFAULT 0 NOT NULL,
    "scheduledFor" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "sentCount" integer DEFAULT 0 NOT NULL,
    "deliveredCount" integer DEFAULT 0 NOT NULL,
    "failedCount" integer DEFAULT 0 NOT NULL,
    "costEstimate" numeric(10,2),
    "actualCost" numeric(10,2),
    "aBTestEnabled" boolean DEFAULT false NOT NULL,
    "aBTestVariants" jsonb,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 262 (class 1259 OID 112937)
-- Name: whatsapp_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_conversations (
    id text NOT NULL,
    "patientId" text,
    "phoneNumber" character varying(15) NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "lastMessageAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastMessagePreview" text,
    "messageCount" integer DEFAULT 0 NOT NULL,
    "unreadCount" integer DEFAULT 0 NOT NULL,
    "assignedTo" text,
    "assignedAt" timestamp(3) without time zone,
    "externalConversationId" text,
    "externalFrom" text,
    tags text[],
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 261 (class 1259 OID 112919)
-- Name: whatsapp_incoming_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_incoming_messages (
    id text NOT NULL,
    "patientId" text,
    "phoneNumber" character varying(15) NOT NULL,
    "messageContent" text NOT NULL,
    "messageType" text NOT NULL,
    "mediaUrl" text,
    "mediaMimeType" text,
    "externalMessageId" text NOT NULL,
    "externalFrom" text,
    "externalTo" text,
    "conversationId" text,
    processed boolean DEFAULT false NOT NULL,
    "processedAt" timestamp(3) without time zone,
    "processedBy" text,
    "autoReplySent" boolean DEFAULT false NOT NULL,
    "autoReplyId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 265 (class 1259 OID 121655)
-- Name: whatsapp_notification_triggers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_notification_triggers (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "eventType" text NOT NULL,
    "eventFilter" jsonb,
    "templateId" text NOT NULL,
    "variableMapping" jsonb,
    "recipientType" text DEFAULT 'PATIENT'::text NOT NULL,
    "recipientFilter" jsonb,
    "sendImmediately" boolean DEFAULT true NOT NULL,
    "delayMinutes" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastTriggeredAt" timestamp(3) without time zone,
    "triggerCount" integer DEFAULT 0 NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 260 (class 1259 OID 112897)
-- Name: whatsapp_scheduled_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_scheduled_messages (
    id text NOT NULL,
    "patientId" text,
    "phoneNumber" character varying(15) NOT NULL,
    "templateName" text NOT NULL,
    "templateId" text,
    "messageContent" text,
    language text DEFAULT 'en'::text,
    components jsonb,
    "scheduledFor" timestamp(3) without time zone NOT NULL,
    "sentAt" timestamp(3) without time zone,
    status text DEFAULT 'PENDING'::text NOT NULL,
    priority text DEFAULT 'NORMAL'::text,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "maxRetries" integer DEFAULT 3 NOT NULL,
    "errorMessage" text,
    "externalMessageId" text,
    "conversationId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "campaignId" text
);


--
-- TOC entry 268 (class 1259 OID 121725)
-- Name: whatsapp_sentiments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_sentiments (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "messageCount" integer DEFAULT 0 NOT NULL,
    "overallSentiment" text NOT NULL,
    "sentimentScore" numeric(5,2) DEFAULT 0 NOT NULL,
    emotions jsonb,
    keywords jsonb,
    issues jsonb,
    "analyzedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 263 (class 1259 OID 121610)
-- Name: whatsapp_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_templates (
    id text NOT NULL,
    name text NOT NULL,
    "displayName" text NOT NULL,
    category text NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    components jsonb NOT NULL,
    "templateId" text,
    "templateStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastSyncedAt" timestamp(3) without time zone
);


--
-- TOC entry 256 (class 1259 OID 112813)
-- Name: worklist_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worklist_entries (
    id text NOT NULL,
    "analyzerId" text NOT NULL,
    "orderId" text,
    "orderNumber" text,
    "sampleId" text,
    "sampleNumber" text,
    barcode text NOT NULL,
    "testId" text,
    "testCode" text,
    "testName" text,
    status text NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "acknowledgedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    priority text DEFAULT 'NORMAL'::text NOT NULL,
    "resultReceived" boolean DEFAULT false NOT NULL,
    "resultReceivedAt" timestamp(3) without time zone,
    "errorMessage" text,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "maxRetries" integer DEFAULT 3 NOT NULL,
    protocol public."AnalyzerProtocol" NOT NULL,
    "sequenceNumber" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 6184 (class 0 OID 111461)
-- Dependencies: 219
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
453a43da-82f7-4960-9767-e7a2c6e1ee16	b8e8b31a8277b45944ec2130dc9a3b463b6e5d5ffadde8969bd1303e3e42c7be	2026-09-07 10:40:42.387269+05:30	20260825092845_init	\N	\N	2026-09-07 10:40:42.195436+05:30	1
14d87f8e-9352-449b-84b0-14762e3ad0ba	64aca7ba571f5cf208b599463de539dda83aeb56a67c0d8667aff519dadfecba	2026-09-07 10:40:42.390158+05:30	20260829164352_add_doctor_enhancements	\N	\N	2026-09-07 10:40:42.387811+05:30	1
033ebf10-5a12-456a-acc3-5368817d8ece	fdce30203ef035097b7740feefa23c0d79c08c3285615a1c8eb74a857098f6f2	2026-09-07 10:40:42.40053+05:30	20260831055935_sync_schema	\N	\N	2026-09-07 10:40:42.390837+05:30	1
d95cdebb-2b53-425c-b3a4-678f029efcd8	6732221b9320e3de91ab6f20d7634fc87a016931d3e5ec334d08bf852ea5b204	2026-09-07 10:40:42.406563+05:30	20260901000000_add_doctor_lim_fields	\N	\N	2026-09-07 10:40:42.401009+05:30	1
d3d9879c-133e-4dcc-8f36-924136e27e4e	18aeb6e4d9cb2c2304493907abe743fb05397a0a459260ee11e100c17c5dee18	2026-09-07 10:40:42.435135+05:30	20260901120000_add_enhanced_test_features	\N	\N	2026-09-07 10:40:42.407196+05:30	1
ae6e25f0-de61-4df6-86bb-633d23385e72	65e0e074ca1ccf16770e9da75a50faa57888de143ff51548c5719a1fa0f03a9e	2026-09-07 10:40:42.469135+05:30	20260905120000_phase1_auth_hardening	\N	\N	2026-09-07 10:40:42.435623+05:30	1
241a7c31-f0fc-4a0a-af37-c01e047bee25	08ea06ec3eed6abbf591222c99159326f93e41c655a64503b8a71401630d4744	2026-09-10 12:28:20.010129+05:30	20260910090000_add_premium_report_actions	\N	\N	2026-09-10 12:28:19.568495+05:30	1
\.


--
-- TOC entry 6215 (class 0 OID 112688)
-- Dependencies: 250
-- Data for Name: analyzer_alerts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analyzer_alerts (id, "analyzerId", "alertType", severity, title, message, "isAcknowledged", "acknowledgedBy", "acknowledgedAt", "isResolved", "resolvedBy", "resolvedAt", "resolutionNotes", "createdAt", "updatedAt", metadata) FROM stdin;
\.


--
-- TOC entry 6216 (class 0 OID 112709)
-- Dependencies: 251
-- Data for Name: analyzer_communication_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analyzer_communication_logs (id, "analyzerId", direction, "messageType", protocol, payload, "parsedData", status, "errorMessage", "responseTime", "connectionLatency", "createdAt") FROM stdin;
cmu117akp0001oovgh8npbbnu	cmts6pxla000eikvgoth4h39u	INCOMING	STATUS_UPDATE	ASTM	{"status":"OFFLINE"}	\N	SUCCESS	\N	\N	\N	2026-09-14 09:19:26.283
cmuh6jc2u00014svg1w7i8o6i	cmts6pxla000eikvgoth4h39u	INCOMING	STATUS_UPDATE	ASTM	{"status":"OFFLINE"}	\N	SUCCESS	\N	\N	\N	2026-09-25 16:33:04.999
cmuh6jewr00024svg0pz54jjn	cmu11imy90000mcvgga23b9n1	INCOMING	STATUS_UPDATE	ASTM	{"status":"OFFLINE"}	\N	SUCCESS	\N	\N	\N	2026-09-25 16:33:08.668
cmul30mi60008lwvguv6kvfvn	cmu11imy90000mcvgga23b9n1	INCOMING	HEARTBEAT	ASTM	{"timestamp":"2026-09-28T10:05:37.902Z","latency":32}	\N	SUCCESS	\N	32	\N	2026-09-28 10:05:37.902
cmul30mi50007lwvgmvohjad1	cmts6pxla000eikvgoth4h39u	INCOMING	HEARTBEAT	ASTM	{"timestamp":"2026-09-28T10:05:37.892Z","latency":19}	\N	SUCCESS	\N	19	\N	2026-09-28 10:05:37.901
cmul30rbb0009lwvgofgpzz2h	cmu11imy90000mcvgga23b9n1	INCOMING	HEARTBEAT	ASTM	{"timestamp":"2026-09-28T10:05:44.135Z","latency":24}	\N	SUCCESS	\N	24	\N	2026-09-28 10:05:44.135
cmul30rbh000alwvgkpkzp2cq	cmts6pxla000eikvgoth4h39u	INCOMING	HEARTBEAT	ASTM	{"timestamp":"2026-09-28T10:05:44.141Z","latency":23}	\N	SUCCESS	\N	23	\N	2026-09-28 10:05:44.141
cmul30te2000blwvgg63s43h7	cmu11imy90000mcvgga23b9n1	INCOMING	HEARTBEAT	ASTM	{"timestamp":"2026-09-28T10:05:46.826Z","latency":22}	\N	SUCCESS	\N	22	\N	2026-09-28 10:05:46.827
cmul30te3000clwvg6v9sp6hr	cmts6pxla000eikvgoth4h39u	INCOMING	HEARTBEAT	ASTM	{"timestamp":"2026-09-28T10:05:46.827Z","latency":16}	\N	SUCCESS	\N	16	\N	2026-09-28 10:05:46.827
\.


--
-- TOC entry 6214 (class 0 OID 112666)
-- Dependencies: 249
-- Data for Name: analyzer_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analyzer_jobs (id, "analyzerId", "jobId", "orderId", "orderNumber", "sampleId", "sampleNumber", barcode, "testId", "testCode", "testName", "analyzerTestCode", "createdAt", "startedAt", "completedAt", status, "progressPercentage", "currentStep", "errorMessage", "errorDetails", "retryCount", "maxRetries", "resultId", "resultReceived", "resultReceivedAt", priority) FROM stdin;
\.


--
-- TOC entry 6201 (class 0 OID 111911)
-- Dependencies: 236
-- Data for Name: analyzer_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analyzer_logs (id, "machineName", "machineCode", protocol, "orderNumber", barcode, "rawMessage", "parsedJson", "isProcessed", "errorMessage", "receivedAt", "processedAt") FROM stdin;
\.


--
-- TOC entry 6219 (class 0 OID 112764)
-- Dependencies: 254
-- Data for Name: analyzer_port_mappings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analyzer_port_mappings (id, "analyzerId", "portName", "portType", direction, "baudRate", "dataBits", "stopBits", parity, "flowControl", "hostAddress", "portNumber", "socketType", timeout, "isActive", "isDefault", description, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6213 (class 0 OID 112646)
-- Dependencies: 248
-- Data for Name: analyzer_test_mappings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analyzer_test_mappings (id, "analyzerId", "labCoreTestId", "labCoreTestCode", "labCoreTestName", "analyzerTestCode", "analyzerTestName", unit, "referenceRange", "sampleType", "isActive", "isValid", "createdAt", "updatedAt", "createdBy") FROM stdin;
\.


--
-- TOC entry 6210 (class 0 OID 112594)
-- Dependencies: 245
-- Data for Name: analyzers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analyzers (id, name, "analyzerId", manufacturer, model, "serialNumber", "analyzerType", department, "laboratorySection", location, "installationDate", "connectionType", protocol, host, port, "deviceIdentifier", "connectionString", status, "lastCommunicationAt", "lastSuccessfulHeartbeat", "connectionLatency", "isActive", "isArchived", "archivedAt", "archivedBy", notes, "createdAt", "updatedAt") FROM stdin;
cmu11imy90000mcvgga23b9n1	Bio-Rad D-10 (HbA1c)	CLI-BIO-01	Bio-Rad	D-10 (HbA1c)	SN-9982-XN	Clinical Pathology	Clinical Pathology	Core Clinical Bench	Main Lab - Station A1	\N	NETWORK	ASTM	192.168.1.142	5000	\N	\N	ONLINE	2026-09-28 10:05:46.824	2026-09-28 10:05:46.824	22	t	f	\N	\N	Commissioned via LabCore Interface Gateway. Protocol: ASTM, Mode: BIDIRECTIONAL	2026-09-14 09:28:15.538	2026-09-28 10:05:46.825
cmts6pxla000eikvgoth4h39u	Sysmex Hematology	HEM-SYS-01	Sysmex	XN-1000	SN-8921-XN	Hematology	Hematology	Main Laboratory	Lab Floor 1 - Station A	\N	NETWORK	ASTM	192.168.1.120	5000	\N	\N	ONLINE	2026-09-28 10:05:46.825	2026-09-28 10:05:46.825	16	t	f	\N	\N	Configured via LabCore Interface Gateway. Protocol: ASTM, Mode: BIDIRECTIONAL	2026-09-08 04:43:58.414	2026-09-28 10:05:46.826
\.


--
-- TOC entry 6199 (class 0 OID 111881)
-- Dependencies: 234
-- Data for Name: approvals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.approvals (id, "resultId", "approvedById", status, remarks, "approvedAt", "createdAt") FROM stdin;
\.


--
-- TOC entry 6202 (class 0 OID 111927)
-- Dependencies: 237
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "userId", module, action, "recordId", "ipAddress", "userAgent", "oldData", "newData", "createdAt") FROM stdin;
cmuf96kqu0001bkvgt15yrnr0	cmu0pyur7000050vgy6ct6tcr	PATIENTS	CREATE_PATIENT	cmuf96kos0000bkvgxrujkxec	\N	\N	\N	\N	2026-09-24 08:11:36.198
cmufa8scd0001wwvg9jwr6cqx	cmu0pyur7000050vgy6ct6tcr	PATIENTS	CREATE_PATIENT	cmufa8sb50000wwvgrfrlv6ku	\N	\N	\N	\N	2026-09-24 08:41:18.973
cmuggujwy0001q8vg2nbbgz5a	cmu0pyur7000050vgy6ct6tcr	PATIENTS	CREATE_PATIENT	cmuggujwo0000q8vg1h93bszz	\N	\N	\N	{"uhid": "LC-000004", "gender": "FEMALE", "patientType": "STAFF", "registrationSource": "WALK_IN"}	2026-09-25 04:33:58.354
cmughk9i10000y8vgg0dk98fv	\N	PATIENTS	UPDATE_PATIENT	cmts62u970001ikvgirz91n34	\N	\N	\N	{"uhid": "LC-000001", "updatedFields": ["isActive"]}	2026-09-25 04:53:57.915
cmughkanj0001y8vgyzqx6v1n	\N	PATIENTS	UPDATE_PATIENT	cmts62u970001ikvgirz91n34	\N	\N	\N	{"uhid": "LC-000001", "updatedFields": ["isActive"]}	2026-09-25 04:53:59.407
cmugi9eo10000ekvgx3nr27ea	\N	PATIENTS	UPDATE_PATIENT	cmts62u970001ikvgirz91n34	\N	\N	\N	{"uhid": "LC-000001", "updatedFields": ["isActive"]}	2026-09-25 05:13:31.011
cmugi9rrq0001ekvguwrvfz1y	\N	PATIENTS	UPDATE_PATIENT	cmts62u970001ikvgirz91n34	\N	\N	\N	{"uhid": "LC-000001", "updatedFields": ["isActive"]}	2026-09-25 05:13:47.99
\.


--
-- TOC entry 6211 (class 0 OID 112617)
-- Dependencies: 246
-- Data for Name: calibrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calibrations (id, "analyzerId", "calibrationDate", "performedBy", operator, status, outcome, result, "nextCalibrationDueDate", "nextCalibrationReminderDate", "calibrationType", "reagentsUsed", notes, "performedAt", "createdBy") FROM stdin;
\.


--
-- TOC entry 6244 (class 0 OID 138554)
-- Dependencies: 279
-- Data for Name: cash_counter_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cash_counter_sessions (id, "counterId", "userId", "openingBalance", "closingBalance", "expectedCash", "actualCash", variance, "varianceReason", "openedAt", "closedAt", notes, "createdAt") FROM stdin;
\.


--
-- TOC entry 6243 (class 0 OID 138529)
-- Dependencies: 278
-- Data for Name: cash_counters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cash_counters (id, "counterNumber", "counterName", "branchId", location, status, "openingBalance", "currentBalance", "assignedUserId", "openedAt", "closedAt", "expectedCash", "actualCash", variance, "varianceReason", "denominationData", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6245 (class 0 OID 138569)
-- Dependencies: 280
-- Data for Name: cash_drawers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cash_drawers (id, "drawerNumber", "counterId", "drawerName", "currentBalance", "denominationData", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6246 (class 0 OID 138587)
-- Dependencies: 281
-- Data for Name: cash_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cash_movements (id, "drawerId", "movementType", amount, reason, "referenceId", "referenceType", "performedById", "performedAt", "createdAt") FROM stdin;
\.


--
-- TOC entry 6217 (class 0 OID 112725)
-- Dependencies: 252
-- Data for Name: communication_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.communication_logs (id, "patientId", type, status, "recipientContact", subject, message, provider, "providerMessageId", "errorReason", "errorMessage", metadata, "sentById", "sentAt", "deliveredAt", "failedAt", "createdAt", "updatedAt") FROM stdin;
cmtsg4mnj000024vg2h7r02p9	cmts62u970001ikvgirz91n34	WHATSAPP	FAILED	919106161228	\N	*LABCORE DIAGNOSTICS | VERIFIED REPORT DOSSIER* 📑\n━━━━━━━━━━━━━━━━━━━━\nDear *panchal ashokkumar*,\n\nYour diagnostic report for Order *#ORD-2026-1043* is *COMPLETED, VERIFIED & PUBLISHED* by our clinical laboratory team.\n\n🧾 *REPORT IDENTITY*\n• Order Reference: *#ORD-2026-1043*\n• Patient UHID: *LC-000001*\n• Specimen Barcode: *SMP-1788842082526*\n• Report Status: *COMPLETED*\n• Tests / Package: *Thyroid Stimulating Hormone (TSH)*\n• Referring Doctor: *DR. SUMANBEN *\n• Patient Profile: *MALE*\n• Report Published: *8/9/2026, 11:32:14 am*\n\n🛡️ *QUALITY & VERIFICATION*\n• Parameters reported: *1*\n• Clinical verification: *Jaya Ashapurama*\n• Verification timestamp: *8/9/2026, 10:42:32 am*\n• Collection status: *Accession details available in report*\n\n🔬 *CLINICAL SNAPSHOT*\n• hemoglobin: 10 mg/dL [NORMAL]\n✅ No flagged values detected in the shared snapshot.\n\n📥 *OPEN VERIFIED DIGITAL REPORT*\nhttp://localhost:3001/reports/order/cmts6e0pf0004ikvg2m404dgn\n\n🔐 *SECURITY & AUTHENTICITY*\n• Digitally signed clinical report\n• Secure portal access with audit trail\n• QR authenticity verification included\n• Confidential medical information — share only with authorized care providers\n\nPlease share this report with your consulting physician (*DR. SUMANBEN *) for clinical interpretation.\n\nFor questions, call LabCore Clinical Assistance: +91-22-1234-5678\n_LabCore Diagnostics • Precision testing | Verified care | Better health_ {patientName} {patientName} {orderNumber} {orderNumber} {reportUrl}\n\n📄 *Official Document PDF:* http://localhost:5000/api/communications/documents/doc_1788858440261_62piyj_LabCore_Report_ORD-2026-1043.pdf	twilio	\N	Twilio WhatsApp API credentials not configured	Twilio WhatsApp API credentials not configured	\N	\N	2026-09-08 09:07:20.797	\N	2026-09-08 09:07:20.797	2026-09-08 09:07:20.623	2026-09-08 09:07:20.825
cmtsg5nbx000124vgytaku3k7	cmts62u970001ikvgirz91n34	WHATSAPP	FAILED	919106161228	\N	*LABCORE DIAGNOSTICS | VERIFIED REPORT DOSSIER* 📑\n━━━━━━━━━━━━━━━━━━━━\nDear *panchal ashokkumar*,\n\nYour diagnostic report for Order *#ORD-2026-1043* is *COMPLETED, VERIFIED & PUBLISHED* by our clinical laboratory team.\n\n🧾 *REPORT IDENTITY*\n• Order Reference: *#ORD-2026-1043*\n• Patient UHID: *LC-000001*\n• Specimen Barcode: *SMP-1788842082526*\n• Report Status: *COMPLETED*\n• Tests / Package: *Thyroid Stimulating Hormone (TSH)*\n• Referring Doctor: *DR. SUMANBEN *\n• Patient Profile: *MALE*\n• Report Published: *8/9/2026, 11:32:14 am*\n\n🛡️ *QUALITY & VERIFICATION*\n• Parameters reported: *1*\n• Clinical verification: *Jaya Ashapurama*\n• Verification timestamp: *8/9/2026, 10:42:32 am*\n• Collection status: *Accession details available in report*\n\n🔬 *CLINICAL SNAPSHOT*\n• hemoglobin: 10 mg/dL [NORMAL]\n✅ No flagged values detected in the shared snapshot.\n\n📥 *OPEN VERIFIED DIGITAL REPORT*\nhttp://localhost:3001/reports/order/cmts6e0pf0004ikvg2m404dgn\n\n🔐 *SECURITY & AUTHENTICITY*\n• Digitally signed clinical report\n• Secure portal access with audit trail\n• QR authenticity verification included\n• Confidential medical information — share only with authorized care providers\n\nPlease share this report with your consulting physician (*DR. SUMANBEN *) for clinical interpretation.\n\nFor questions, call LabCore Clinical Assistance: +91-22-1234-5678\n_LabCore Diagnostics • Precision testing | Verified care | Better health_ {patientName} {patientName} {orderNumber} {orderNumber} {reportUrl}\n\n📄 *Official Document PDF:* http://localhost:5000/api/communications/documents/doc_1788858488082_ejsaq4_LabCore_Report_ORD-2026-1043.pdf	twilio	\N	Twilio WhatsApp API credentials not configured	Twilio WhatsApp API credentials not configured	\N	\N	2026-09-08 09:08:08.168	\N	2026-09-08 09:08:08.168	2026-09-08 09:08:08.157	2026-09-08 09:08:08.17
cmtto4sgu00001ovgyzcvgo9t	cmts62u970001ikvgirz91n34	EMAIL	FAILED	nikilpanchal0@gmail.com	Verified Lab Report #ORD-2026-1043 - panchal ashokkumar | LabCore	Dear panchal ashokkumar,\n\nYour diagnostic lab test reports for Order #ORD-2026-1043 (Thyroid Stimulating Hormone (TSH)) are now verified & ready.\n\nDownload Report: http://localhost:3001/reports/order/cmts6e0pf0004ikvg2m404dgn\n\nLabCore Diagnostics	smtp	\N	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials a92af1059eb24-14324356931sm63256680c88.4 - gsmtp	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials a92af1059eb24-14324356931sm63256680c88.4 - gsmtp	\N	\N	2026-09-09 05:39:13.557	\N	2026-09-09 05:39:13.557	2026-09-09 05:39:11.262	2026-09-09 05:39:13.574
cmtsgb43x000224vg8u2u0qil	cmts62u970001ikvgirz91n34	WHATSAPP	FAILED	919106161228	\N	*LABCORE DIAGNOSTICS | VERIFIED REPORT DOSSIER* 📑\n━━━━━━━━━━━━━━━━━━━━\nDear *panchal ashokkumar*,\n\nYour diagnostic report for Order *#ORD-2026-1043* is *COMPLETED, VERIFIED & PUBLISHED* by our clinical laboratory team.\n\n🧾 *REPORT IDENTITY*\n• Order Reference: *#ORD-2026-1043*\n• Patient UHID: *LC-000001*\n• Specimen Barcode: *SMP-1788842082526*\n• Report Status: *COMPLETED*\n• Tests / Package: *Thyroid Stimulating Hormone (TSH)*\n• Referring Doctor: *DR. SUMANBEN *\n• Patient Profile: *MALE*\n• Report Published: *8/9/2026, 11:32:14 am*\n\n🛡️ *QUALITY & VERIFICATION*\n• Parameters reported: *1*\n• Clinical verification: *Jaya Ashapurama*\n• Verification timestamp: *8/9/2026, 10:42:32 am*\n• Collection status: *Accession details available in report*\n\n🔬 *CLINICAL SNAPSHOT*\n• hemoglobin: 10 mg/dL [NORMAL]\n✅ No flagged values detected in the shared snapshot.\n\n📥 *OPEN VERIFIED DIGITAL REPORT*\nhttp://localhost:3001/reports/order/cmts6e0pf0004ikvg2m404dgn\n\n🔐 *SECURITY & AUTHENTICITY*\n• Digitally signed clinical report\n• Secure portal access with audit trail\n• QR authenticity verification included\n• Confidential medical information — share only with authorized care providers\n\nPlease share this report with your consulting physician (*DR. SUMANBEN *) for clinical interpretation.\n\nFor questions, call LabCore Clinical Assistance: +91-22-1234-5678\n_LabCore Diagnostics • Precision testing | Verified care | Better health\n\n📄 *Official Document PDF:* http://localhost:5000/api/communications/documents/doc_1788858742856_60lufg_LabCore_Report_ORD-2026-1043.pdf	twilio	\N	Twilio WhatsApp API credentials not configured	Twilio WhatsApp API credentials not configured	\N	\N	2026-09-08 09:12:23.234	\N	2026-09-08 09:12:23.234	2026-09-08 09:12:23.181	2026-09-08 09:12:23.234
cmtu2uahi0001hgvgd2hhhmw2	cmts62u970001ikvgirz91n34	EMAIL	FAILED	nikilpanchal0@gmail.com	Verified Lab Report #ORD-2026-1043 - panchal ashokkumar | LabCore	Dear panchal ashokkumar,\n\nYour diagnostic lab test reports for Order #ORD-2026-1043 (Thyroid Stimulating Hormone (TSH)) are now verified & ready.\n\nDownload Report: http://localhost:3001/reports/order/cmts6e0pf0004ikvg2m404dgn\n\nLabCore Diagnostics	smtp	\N	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5a478bee46e88-3339b314cfcsm44198541eec.19 - gsmtp	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5a478bee46e88-3339b314cfcsm44198541eec.19 - gsmtp	\N	\N	2026-09-09 12:30:58.891	\N	2026-09-09 12:30:58.891	2026-09-09 12:30:55.638	2026-09-09 12:30:58.902
\.


--
-- TOC entry 6250 (class 0 OID 138655)
-- Dependencies: 285
-- Data for Name: corporate_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.corporate_accounts (id, "accountNumber", "accountName", "organizationName", "contactPerson", "contactPhone", "contactEmail", "billingAddress", "creditLimit", "currentBalance", "paymentTerms", "isActive", gstin, "panNumber", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6223 (class 0 OID 112868)
-- Dependencies: 258
-- Data for Name: critical_value_acknowledgments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.critical_value_acknowledgments (id, "resultId", "resultValueId", "acknowledgedBy", "notifiedPerson", "notifiedPersonContact", "notificationMode", "notificationTime", notes, "acknowledgmentReason", "createdAt", "testParameterId") FROM stdin;
\.


--
-- TOC entry 6186 (class 0 OID 111649)
-- Dependencies: 221
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.doctors (id, "doctorCode", "fullName", qualification, specialization, phone, email, "clinicName", address, "commissionRate", "isActive", "createdAt", "updatedAt", "availableDays", "availableTime", "consultationFee", department, designation, experience, "licenseExpiry", "licenseNumber", "photoUrl", "signatureUrl", "doctorType", "clinicAddress", "whatsappNumber", "reportDeliveryEmail", "reportDeliveryWhatsApp", "reportDeliveryHardCopy", "reportDeliveryPortal", "enablePortalAccess", "bankAccountNumber", "bankIfscCode", "bankAccountHolderName", "registrationNumber") FROM stdin;
cmts67vr50002ikvgv6da4q6z	DOC-0234	DR. SUMANBEN 	MBBS, MD Pathology	Diabetology	+919327960145	sumanpanchal5@gmail.com	PAWAN LAB	\N	15.00	t	2026-09-08 04:29:56.226	2026-09-08 04:29:56.226	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	REFERRING_DOCTOR	IQBALGADH, HIGHWAY	+919327960145	f	f	f	f	f	7041983246@fampay	SBIN0002654		NMC80234
cmugk0yni0000k0vgd9fz7278	DOC-3842	Dr. NIKILKUMAR	MBBS, MD	Nephrology	+919723561529	nikilpanchal0@gmail.com	APEX HOSPITAL	\N	15.00	t	2026-09-25 06:02:56.239	2026-09-25 06:02:56.239	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	REFERRING_DOCTOR	RING ROAD	+919723561529	f	f	f	f	f	7041983246@fampay			NMC73842
\.


--
-- TOC entry 6195 (class 0 OID 111812)
-- Dependencies: 230
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, "invoiceNumber", "orderId", subtotal, discount, "gstPercent", "gstAmount", "grandTotal", "paymentStatus", "createdAt", "updatedAt", "cgstAmount", "dueDate", "igstAmount", "sgstAmount", "taxableAmount") FROM stdin;
cmts6e0rr0008ikvggrds99r6	INV-1788842082526-933	cmts6e0pf0004ikvg2m404dgn	450.00	0.00	18.00	81.00	531.00	PAID	2026-09-08 04:34:42.663	2026-09-08 06:45:41.652	40.50	2026-10-08 04:34:42.649	0.00	40.50	450.00
cmtvhb3650007gwvg18dbtij9	INV-1789041819772-210	cmtvhb30p0001gwvgkvyfhu3i	450.00	0.00	18.00	81.00	531.00	PAID	2026-09-10 12:03:40.109	2026-09-10 12:03:40.682	40.50	2026-10-10 12:03:40.087	0.00	40.50	450.00
cmtvhbyyy000fgwvg0rww4tjt	INV-1789041861237-664	cmtvhbywp0009gwvgswwh8nqw	450.00	0.00	18.00	81.00	531.00	PAID	2026-09-10 12:04:21.322	2026-09-10 12:04:21.684	40.50	2026-10-10 12:04:21.321	0.00	40.50	450.00
cmtvi38m6000ngwvgsuzj43iv	INV-1789043133411-712	cmtvi38jp000hgwvg4w5681vf	450.00	0.00	18.00	81.00	531.00	PARTIAL	2026-09-10 12:25:33.534	2026-09-10 12:25:33.741	40.50	2026-10-10 12:25:33.532	0.00	40.50	450.00
cmufaohgt0006rcvgf17nhjhb	INV-1790240011136-17	cmufaohd60001rcvg709z5u02	120.00	0.00	18.00	21.60	141.60	PAID	2026-09-24 08:53:31.373	2026-09-26 04:09:54.422	10.80	2026-10-24 08:53:31.37	0.00	10.80	120.00
\.


--
-- TOC entry 6222 (class 0 OID 112836)
-- Dependencies: 257
-- Data for Name: laboratory_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.laboratory_settings (id, "labName", "labPhone", "labEmail", "labAddress", "labCity", "labState", "labPincode", "emailProvider", "emailApiKey", "emailFromEmail", "emailFromName", "smtpHost", "smtpPort", "smtpUser", "smtpPassword", "smsProvider", "smsApiKey", "smsApiSecret", "smsSenderId", "callProvider", "callApiKey", "callApiSecret", "callCallerId", "enableAutomatedNotifications", "enablePatientNotifications", "enableDoctorNotifications", "enableAutoResultProcessing", "enableAutoApproval", "enableLiveTelemetry", "demoMode", "createdAt", "updatedAt", "defaultAnalyzer", "defaultMethodology", gstin, "isoCertification", "laboratoryDirector", "laboratoryDirectorQualification", "licenseNumber", "nablAccreditation", "pathologistInCharge", "pathologistInChargeQualification", "reportIdPrefix", "whatsappAIEnabled", "whatsappAccessToken", "whatsappBusinessProfileId", "whatsappPhoneNumberId", "whatsappProvider", "whatsappVerifyToken", "whatsappWebhookUrl") FROM stdin;
\.


--
-- TOC entry 6212 (class 0 OID 112631)
-- Dependencies: 247
-- Data for Name: maintenances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maintenances (id, "analyzerId", "maintenanceType", "scheduledDate", "completedDate", status, description, technician, "partsReplaced", cost, notes, "createdAt", "updatedAt", "createdBy") FROM stdin;
\.


--
-- TOC entry 6207 (class 0 OID 112338)
-- Dependencies: 242
-- Data for Name: mfa_backup_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mfa_backup_codes (id, "userId", "codeHash", "usedAt", "createdAt") FROM stdin;
\.


--
-- TOC entry 6218 (class 0 OID 112742)
-- Dependencies: 253
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_templates (id, name, description, "eventType", channel, "subjectTemplate", "bodyTemplate", variables, "isActive", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6193 (class 0 OID 111773)
-- Dependencies: 228
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, "orderId", "testId", price, discount, "gstPercentage", "gstAmount", "finalPrice", "createdAt", "packageId", "itemType") FROM stdin;
cmts6e0q10005ikvg7i3vaf9q	cmts6e0pf0004ikvg2m404dgn	cmts6agh90003ikvgrxk38xgg	450.00	0.00	0.00	0.00	450.00	2026-09-08 04:34:42.579	\N	TEST
cmtvhb31h0002gwvg3cded422	cmtvhb30p0001gwvgkvyfhu3i	cmts6agh90003ikvgrxk38xgg	450.00	0.00	0.00	0.00	450.00	2026-09-10 12:03:39.913	\N	TEST
cmtvhbyx6000agwvglgy7ffjf	cmtvhbywp0009gwvgswwh8nqw	cmts6agh90003ikvgrxk38xgg	450.00	0.00	0.00	0.00	450.00	2026-09-10 12:04:21.241	\N	TEST
cmtvi38jz000igwvgpempkhv7	cmtvi38jp000hgwvg4w5681vf	cmts6agh90003ikvgrxk38xgg	450.00	0.00	0.00	0.00	450.00	2026-09-10 12:25:33.445	\N	TEST
cmufaohe90002rcvgporfem0h	cmufaohd60001rcvg709z5u02	cmufal8cp0000rcvg3e8mgl5x	120.00	0.00	0.00	0.00	120.00	2026-09-24 08:53:31.243	\N	TEST
\.


--
-- TOC entry 6192 (class 0 OID 111745)
-- Dependencies: 227
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, "orderNumber", barcode, "patientId", "doctorId", "createdById", "orderStatus", "paymentStatus", "sampleCollected", "collectedAt", "reportedAt", notes, subtotal, discount, "gstAmount", "grandTotal", "createdAt", "updatedAt", "collectionType", "discountCode", "dueAmount", "homeCollectionAddress", "paidAmount", priority, "reportDeliveryEmail", "reportDeliveryPortal", "reportDeliveryPrinted", "reportDeliveryWhatsApp", "clinicalNotes", "fastingStatus", "reportId", "specimenType") FROM stdin;
cmts6e0pf0004ikvg2m404dgn	ORD-2026-1043	SMP-1788842082526	cmts62u970001ikvgirz91n34	cmts67vr50002ikvgv6da4q6z	\N	COMPLETED	PAID	f	\N	2026-09-08 06:02:14.058	Fasting: FASTING_12H	450.00	0.00	81.00	531.00	2026-09-08 04:34:42.579	2026-09-08 06:45:41.664	\N	\N	531.00	\N	0.00	ROUTINE	f	f	f	f	\N	\N	\N	\N
cmtvhb30p0001gwvgkvyfhu3i	ORD-2026-5296	SMP-1789041819772	cmts62u970001ikvgirz91n34	\N	\N	REGISTERED	PAID	f	\N	\N	\N	450.00	0.00	81.00	531.00	2026-09-10 12:03:39.913	2026-09-10 12:03:40.692	\N	\N	531.00	\N	0.00	ROUTINE	f	f	f	f	\N	\N	\N	\N
cmtvhbywp0009gwvgswwh8nqw	ORD-2026-3137	SMP-1789041861237	cmts62u970001ikvgirz91n34	\N	\N	REGISTERED	PAID	f	\N	\N	\N	450.00	0.00	81.00	531.00	2026-09-10 12:04:21.241	2026-09-10 12:04:21.69	\N	\N	531.00	\N	0.00	ROUTINE	f	f	f	f	\N	\N	\N	\N
cmtvi38jp000hgwvg4w5681vf	ORD-2026-8636	SMP-1789043133411	cmts62u970001ikvgirz91n34	\N	\N	REGISTERED	PARTIAL	f	\N	\N	\N	450.00	0.00	81.00	531.00	2026-09-10 12:25:33.445	2026-09-10 12:25:33.748	\N	\N	531.00	\N	0.00	ROUTINE	f	f	f	f	\N	\N	\N	\N
cmufaohd60001rcvg709z5u02	ORD-2026-3253	SMP-1790240011136	cmufa8sb50000wwvgrfrlv6ku	cmts67vr50002ikvgv6da4q6z	cmu0pyur7000050vgy6ct6tcr	COMPLETED	PAID	f	\N	\N	VEINS	120.00	0.00	21.60	141.60	2026-09-24 08:53:31.243	2026-09-26 04:09:54.431	\N	\N	141.60	\N	0.00	ROUTINE	f	f	f	f	\N	\N	\N	\N
\.


--
-- TOC entry 6205 (class 0 OID 112311)
-- Dependencies: 240
-- Data for Name: password_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_history (id, "userId", "passwordHash", "createdAt") FROM stdin;
\.


--
-- TOC entry 6240 (class 0 OID 138484)
-- Dependencies: 275
-- Data for Name: patient_advances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_advances (id, "patientId", amount, balance, "transactionType", "referenceId", "referenceType", reason, "receivedById", "createdAt") FROM stdin;
cmtynn0p600007svg8oo1jx9j	cmts62u970001ikvgirz91n34	8999.00	8999.00	CREDIT	\N	\N	kio	\N	2026-09-12 17:24:13.002
cmtynnkuu00037svg22dmbduo	cmts62u970001ikvgirz91n34	10000.00	10000.00	CREDIT	\N	\N	Patient advance balance deposit	\N	2026-09-12 17:24:39.126
\.


--
-- TOC entry 6236 (class 0 OID 126194)
-- Dependencies: 271
-- Data for Name: patient_history_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_history_entries (id, "patientId", "reportId", "entryType", notes, "addedBy", "createdAt") FROM stdin;
\.


--
-- TOC entry 6241 (class 0 OID 138498)
-- Dependencies: 276
-- Data for Name: patient_wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patient_wallets (id, "patientId", balance, "isActive", "createdAt", "updatedAt") FROM stdin;
cmtynn0r600017svgvu9l8kdn	cmts62u970001ikvgirz91n34	18999.00	t	2026-09-12 17:24:13.074	2026-09-12 17:24:39.17
cmuhveejr0000isvgjic17y3w	cmufa8sb50000wwvgrfrlv6ku	0.00	t	2026-09-26 04:09:05.32	2026-09-26 04:09:05.32
\.


--
-- TOC entry 6187 (class 0 OID 111664)
-- Dependencies: 222
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.patients (id, uhid, "firstName", "lastName", gender, "dateOfBirth", age, "ageMonth", "ageDay", phone, email, "bloodGroup", address, city, state, pincode, "emergencyContact", "referredById", "createdById", "createdAt", "updatedAt", "emergencyContactName", "emergencyContactRelationship", "fastingStatus", "insuranceNumber", "insuranceProvider", "nationalId", "isActive", "middleName", "alternatePhone", landmark, country, "emergencyContactAddress", height, weight, bmi, "aadhaarNumber", "panNumber", "patientType", "maritalStatus", occupation, nationality, allergies, "chronicDiseases", "currentMedications", "insuranceGroupNumber", "insuranceExpiryDate", "photoUrl", "preferredLanguage", "preferredCommunicationMethod", "communicationPreference", "consentForTreatment", "consentForDataSharing", "consentForMarketing", "familyHeadId", "relationshipToHead", notes, "isDraft", "registrationSource", "referralSource", "verificationStatus", "phoneVerified", "emailVerified", "kycVerified", "qrCode") FROM stdin;
cmuf96kos0000bkvgxrujkxec	LC-000002	PANCHAL	ASHOKKMUAR	MALE	2007-12-19 00:00:00	\N	\N	\N	9106161228	nikilpanchal5@gmail.com	A+	VRUNDAWAN SOCIRTY	PALANPUR	GUJRAT	385135	9723561529	\N	cmu0pyur7000050vgy6ct6tcr	2026-09-24 08:11:36.124	2026-09-24 08:11:36.124	REKHABEN	MOTHER	\N	BDS-987654321	BLUE SKY LMT	\N	t	NIKILKUMAR	\N	\N	INDIA	SAME	\N	\N	\N	\N	\N	INPATIENT	SINGLE	\N	HINDU	["NO"]	["NO"]	[{"name": "NO"}]	MIK-98765	2030-12-10 00:00:00	\N	ENGLISH	EMAIL	{"sms": false, "call": false, "email": true, "whatsapp": false}	t	t	t	\N	\N	GOOD	f	WALK_IN	\N	UNVERIFIED	f	f	f	{"type":"PATIENT","id":"LC-000002","uhid":"LC-000002","timestamp":"2026-09-24T08:11:36.063Z"}
cmufa8sb50000wwvgrfrlv6ku	LC-000003	PANCHAL	ASHOKKKUMAR	MALE	2001-08-15 00:00:00	\N	\N	\N	7202885030	nikilpanchal@0gmail.com	A-	VRUNDAWAN SOCIETY	PALANPUR	GUJRAT	385135	9106161228	\N	cmu0pyur7000050vgy6ct6tcr	2026-09-24 08:41:18.93	2026-09-24 08:41:18.93	REKHABEN	MOTHER	\N	NBG-987654321	BLUE SKY LMT	\N	t	KIRANBEN	\N	\N	INDIA	SAME	\N	\N	\N	\N	\N	GENERAL	MARRIED	\N	HINDU	["PEANUT ALLERGY"]	["HYPERTENSION"]	[{"name": "PARACETAMOL"}]	98756468	2030-12-10 00:00:00	\N	ENGLISH	EMAIL	{"sms": false, "call": false, "email": true, "whatsapp": false}	t	t	t	\N	\N	GOOD	f	WALK_IN	\N	UNVERIFIED	f	f	f	{"type":"PATIENT","id":"LC-000003","uhid":"LC-000003","timestamp":"2026-09-24T08:41:18.859Z"}
cmuggujwo0000q8vg1h93bszz	LC-000004	panchal	ashokkumar	FEMALE	2003-12-10 00:00:00	\N	\N	\N	9327960145	\N	O-	vrundawan society	palanpur	gujrat	385135	9723561529	\N	cmu0pyur7000050vgy6ct6tcr	2026-09-25 04:33:58.344	2026-09-25 04:33:58.344	nikilkumar	BROTHER	\N	BSK-987654	blue sky lmt	\N	t	sumanben	\N	\N	india	same	\N	\N	\N	\N	\N	STAFF	SINGLE	\N	hindu	["peniclin"]	["diabetes"]	[{"name": "paracetamol"}]	987654321	2030-12-10 00:00:00	\N	GUJARATI	WHATSAPP	{"sms": true, "call": true, "email": true, "whatsapp": true}	t	t	f	\N	\N	good condition	f	WALK_IN	\N	UNVERIFIED	f	f	f	{"type":"PATIENT","id":"LC-000004","uhid":"LC-000004","timestamp":"2026-09-25T04:33:58.315Z"}
cmts62u970001ikvgirz91n34	LC-000001	panchal	ashokkumar	MALE	2007-12-10 00:00:00	\N	\N	\N	919106161228	nikilpanchal0@gmail.com	O+	vrundhawan society iqbalgadh	palanpur	gujrat	385135	916356816375	\N	\N	2026-09-08 04:26:01.003	2026-09-25 05:13:47.983	rekhaben	mother	\N	BCSC-987654321	BLUE CROSS BLUE SHEILD	\N	t	\N	\N	\N	India	\N	\N	\N	\N	\N	\N	GENERAL	\N	\N	Indian	\N	\N	\N	\N	\N	\N	ENGLISH	\N	\N	f	f	f	\N	\N	\N	f	WALK_IN	\N	UNVERIFIED	f	f	f	\N
\.


--
-- TOC entry 6237 (class 0 OID 138433)
-- Dependencies: 272
-- Data for Name: payment_allocations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_allocations (id, "paymentId", amount, "allocationType", "referenceId", "referenceType", "createdAt") FROM stdin;
\.


--
-- TOC entry 6253 (class 0 OID 138711)
-- Dependencies: 288
-- Data for Name: payment_audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_audit_logs (id, "userId", action, "entityType", "entityId", "oldValues", "newValues", reason, "ipAddress", "userAgent", "branchId", "counterId", "createdAt") FROM stdin;
\.


--
-- TOC entry 6196 (class 0 OID 111834)
-- Dependencies: 231
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, "receiptNumber", "orderId", amount, method, status, "transactionId", remarks, "receivedById", "paidAt", "createdAt", "allocationId", "cashDrawerId", "corporateAccountId", "counterId", "gatewayProvider", "gatewayReference", "gatewayResponse", "updatedAt", utr) FROM stdin;
cmtsb2grc0000msvgsw7g5q09	REC-1788849941547-626	cmts6e0pf0004ikvg2m404dgn	531.00	CASH	PAID	\N	\N	\N	2026-09-08 06:45:41.547	2026-09-08 06:45:41.592	\N	\N	\N	\N	\N	\N	\N	2026-09-10 22:55:02.081	\N
cmtvhb3l30008gwvgb2kqucvv	REC-1789041820637-572	cmtvhb30p0001gwvgkvyfhu3i	531.00	CASH	PAID	\N	POS Counter Bill: Tendered ₹531	\N	2026-09-10 12:03:40.637	2026-09-10 12:03:40.647	\N	\N	\N	\N	\N	\N	\N	2026-09-10 22:55:02.081	\N
cmtvhbz8g000ggwvgzmbnxt4h	REC-1789041861657-439	cmtvhbywp0009gwvgswwh8nqw	531.00	UPI	PAID	\N	POS Counter Bill: Tendered ₹531	\N	2026-09-10 12:04:21.657	2026-09-10 12:04:21.664	\N	\N	\N	\N	\N	\N	\N	2026-09-10 22:55:02.081	\N
cmtvi38ql000ogwvgljdw2gbl	REC-1789043133636-363	cmtvi38jp000hgwvg4w5681vf	504.00	CARD	PAID	\N	POS Counter Bill: Tendered ₹504	\N	2026-09-10 12:25:33.636	2026-09-10 12:25:33.693	\N	\N	\N	\N	\N	\N	\N	2026-09-10 22:55:02.081	\N
cmuhvfgdr0001isvge1zix6v8	REC-1790395794308-714	cmufaohd60001rcvg709z5u02	141.60	CASH	PAID	\N	Source: OPD / Walk-in | Counter: Counter 01 – OPD Billing	cmu0pyur7000050vgy6ct6tcr	2026-09-26 04:09:54.309	2026-09-26 04:09:54.351	\N	\N	\N	\N	\N	\N	\N	2026-09-26 04:09:54.351	\N
\.


--
-- TOC entry 6220 (class 0 OID 112783)
-- Dependencies: 255
-- Data for Name: qc_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.qc_rules (id, "analyzerId", "testId", "testParameterId", "ruleName", "ruleType", "ruleCondition", "minValue", "maxValue", "criticalLowThreshold", "criticalHighThreshold", "deltaThreshold", "requireQCPass", "qcLevel", "qcSampleType", "autoApprove", "requirePathologistReview", "requireTechnicianReview", priority, "generateAlertOnFailure", "alertSeverity", "isActive", description, notes, "createdAt", "updatedAt", "createdBy") FROM stdin;
cmts6pxto000fikvgjj3i9dcs	cmts6pxla000eikvgoth4h39u	\N	\N	Sysmex Hematology - Default Auto-Approval	AUTO_APPROVAL	WITHIN_NORMAL_RANGE	\N	\N	\N	\N	20.00	t	\N	\N	t	f	t	0	t	CRITICAL	t	Auto-approve normal results, hold suspect flags and critical delta triggers.	\N	2026-09-08 04:43:58.716	2026-09-08 04:43:58.716	\N
\.


--
-- TOC entry 6252 (class 0 OID 138698)
-- Dependencies: 287
-- Data for Name: receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.receipts (id, "receiptNumber", "paymentId", "receiptType", "qrCode", "verificationUrl", "printedAt", "emailedAt", "smsedAt", "createdAt") FROM stdin;
\.


--
-- TOC entry 6251 (class 0 OID 138675)
-- Dependencies: 286
-- Data for Name: receivables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.receivables (id, "invoiceId", "patientId", "corporateAccountId", "totalAmount", "paidAmount", "outstandingAmount", "dueDate", "overdueDays", status, "lastReminderAt", "reminderCount", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6249 (class 0 OID 138639)
-- Dependencies: 284
-- Data for Name: reconciliation_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reconciliation_records (id, "recordDate", "sourceType", "sourceId", "transactionId", amount, status, "matchedWith", discrepancy, notes, "reconciledAt", "reconciledById", "createdAt") FROM stdin;
\.


--
-- TOC entry 6191 (class 0 OID 111734)
-- Dependencies: 226
-- Data for Name: reference_ranges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reference_ranges (id, "parameterId", gender, "minAge", "maxAge", "criticalLow", "normalLow", "normalHigh", "criticalHigh", interpretation, "createdAt", "ageGroup", "minAgeUnit", "maxAgeUnit", notes, "isActive", "displayOrder", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6239 (class 0 OID 138469)
-- Dependencies: 274
-- Data for Name: refund_approvals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refund_approvals (id, "refundId", "approverId", "approvalStatus", "approvalNotes", "approvedAt", "createdAt") FROM stdin;
\.


--
-- TOC entry 6238 (class 0 OID 138448)
-- Dependencies: 273
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refunds (id, "refundNumber", "paymentId", amount, reason, status, "refundMethod", "refundTo", "approvalId", "processedAt", "processedById", "transactionId", utr, remarks, "requestedById", "requestedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6235 (class 0 OID 126178)
-- Dependencies: 270
-- Data for Name: report_addendums; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report_addendums (id, "reportId", content, "addedBy", "isPrivate", "createdAt") FROM stdin;
\.


--
-- TOC entry 6234 (class 0 OID 126157)
-- Dependencies: 269
-- Data for Name: report_share_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report_share_links (id, "reportId", token, "expiresAt", "accessCount", "maxAccess", "createdBy", revoked, "createdAt") FROM stdin;
\.


--
-- TOC entry 6200 (class 0 OID 111895)
-- Dependencies: 235
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reports (id, "reportNumber", "patientId", "orderId", status, "reportTitle", "reportData", "fileUrl", "publishedById", "generatedAt", "publishedAt", "createdAt", "updatedAt", "clinicalInterpretation", methodology, "qualityAssurance", "reportReferenceId", "templateType") FROM stdin;
\.


--
-- TOC entry 6224 (class 0 OID 112880)
-- Dependencies: 259
-- Data for Name: result_amendments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.result_amendments (id, "resultId", "amendedBy", "amendmentReason", "amendmentType", "versionNumber", "previousValue", "newValue", "changedFields", "fieldChanges", "approvedById", "approvedAt", "requiresReportRegeneration", "reportRegeneratedAt", "createdAt") FROM stdin;
\.


--
-- TOC entry 6198 (class 0 OID 111867)
-- Dependencies: 233
-- Data for Name: result_values; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.result_values (id, "resultId", "parameterId", value, flag, remark, "createdAt", "updatedAt", "clinicalSignificance", "rangeIndicator") FROM stdin;
cmts6xdw1000iikvgwu7dhx07	cmts6jmal000dikvg5e5tcnb8	cmts6vzph000gikvg4tbnqetm	10	NORMAL	8	2026-09-08 04:49:46.126	2026-09-08 04:49:46.126	\N	\N
cmtvhb34a0005gwvgl17ht2ov	cmtvhb33z0004gwvgxvxpzu21	cmts6vzph000gikvg4tbnqetm		NORMAL	\N	2026-09-10 12:03:40.031	2026-09-10 12:03:40.031	\N	\N
cmtvhbyyb000dgwvg32663ajv	cmtvhbyy6000cgwvgbcwknqp3	cmts6vzph000gikvg4tbnqetm		NORMAL	\N	2026-09-10 12:04:21.295	2026-09-10 12:04:21.295	\N	\N
cmtvi38lf000lgwvgkwzy31vg	cmtvi38l6000kgwvgvjrh1tsk	cmts6vzph000gikvg4tbnqetm		NORMAL	\N	2026-09-10 12:25:33.498	2026-09-10 12:25:33.498	\N	\N
\.


--
-- TOC entry 6197 (class 0 OID 111852)
-- Dependencies: 232
-- Data for Name: results; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.results (id, "orderId", "testId", status, remarks, interpretation, "enteredById", "approvedById", "enteredAt", "verifiedAt", "approvedAt", "publishedAt", "createdAt", "updatedAt", "patientId", "analyzerUsed", "calibrationStatus", "externalQAScheme", "fastingStatus", "hemolysisLipemia", "internalQCStatus", "methodUsed", "reportConfidenceScore", "sampleCollectionTime", "specimenQuality") FROM stdin;
cmtvhb33z0004gwvgxvxpzu21	cmtvhb30p0001gwvgkvyfhu3i	cmts6agh90003ikvgrxk38xgg	PENDING	\N	\N	\N	\N	2026-09-10 12:03:40.024	\N	\N	\N	2026-09-10 12:03:40.031	2026-09-10 12:03:40.031	cmts62u970001ikvgirz91n34	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmtvhbyy6000cgwvgbcwknqp3	cmtvhbywp0009gwvgswwh8nqw	cmts6agh90003ikvgrxk38xgg	PENDING	\N	\N	\N	\N	2026-09-10 12:04:21.293	\N	\N	\N	2026-09-10 12:04:21.295	2026-09-10 12:04:21.295	cmts62u970001ikvgirz91n34	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmtvi38l6000kgwvgvjrh1tsk	cmtvi38jp000hgwvg4w5681vf	cmts6agh90003ikvgrxk38xgg	PENDING	\N	\N	\N	\N	2026-09-10 12:25:33.495	\N	\N	\N	2026-09-10 12:25:33.498	2026-09-10 12:25:33.498	cmts62u970001ikvgirz91n34	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmts6jmal000dikvg5e5tcnb8	cmts6e0pf0004ikvg2m404dgn	cmts6agh90003ikvgrxk38xgg	PUBLISHED	\N	\N	\N	\N	2026-09-08 04:39:03.827	\N	2026-09-08 05:12:32.568	2026-09-08 06:02:14.026	2026-09-08 04:39:03.837	2026-09-08 06:03:21.217	cmts62u970001ikvgirz91n34	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmufaohfn0004rcvgwkm8zfsd	cmufaohd60001rcvg709z5u02	cmufal8cp0000rcvg3e8mgl5x	PENDING	\N	\N	\N	\N	2026-09-24 08:53:31.328	\N	\N	\N	2026-09-24 08:53:31.331	2026-09-24 08:53:31.331	cmufa8sb50000wwvgrfrlv6ku	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 6208 (class 0 OID 112350)
-- Dependencies: 243
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (id, role, permission, "createdAt") FROM stdin;
\.


--
-- TOC entry 6209 (class 0 OID 112578)
-- Dependencies: 244
-- Data for Name: sample_tracking_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sample_tracking_history (id, "sampleId", "orderId", "patientId", "eventType", status, location, notes, "performedById", "performedAt", metadata, "createdAt") FROM stdin;
cmts6e0r30007ikvge5x5j22k	cmts6e0qq0006ikvgc7qzl52d	cmts6e0pf0004ikvg2m404dgn	cmts62u970001ikvgirz91n34	ORDER_REGISTERED	REGISTERED	\N	Order ORD-2026-1043 registered for Thyroid Stimulating Hormone (TSH)	\N	2026-09-08 04:34:42.639	{"barcode": "BC-SMP-1788842082623-823", "orderNumber": "ORD-2026-1043", "sampleNumber": "SMP-1788842082623-249"}	2026-09-08 04:34:42.639
cmts6ia040009ikvgzasjtm8j	cmts6e0qq0006ikvgc7qzl52d	cmts6e0pf0004ikvg2m404dgn	cmts62u970001ikvgirz91n34	SAMPLE_COLLECTED	COLLECTED	Phlebotomy Room	Collected at Phlebotomy Room	\N	2026-09-08 04:38:01.253	{"barcode": "1788842082623-823", "priority": "ROUTINE", "collectionType": "WALK_IN"}	2026-09-08 04:38:01.253
cmts6ipof000aikvgxa1wsxza	cmts6e0qq0006ikvgc7qzl52d	cmts6e0pf0004ikvg2m404dgn	cmts62u970001ikvgirz91n34	SAMPLE_RECEIVED	RECEIVED	Laboratory Reception	Integrity checked at receiving desk | Integrity: label, container, volume verified	\N	2026-09-08 04:38:21.567	\N	2026-09-08 04:38:21.567
cmts6j7pa000bikvg3qi2e86o	cmts6e0qq0006ikvgc7qzl52d	cmts6e0pf0004ikvg2m404dgn	cmts62u970001ikvgirz91n34	SAMPLE_PROCESSING	PROCESSING	Laboratory Processing Area	Sample SMP-1788842082623-249 started processing	\N	2026-09-08 04:38:44.926	\N	2026-09-08 04:38:44.926
cmts6jm8k000cikvg498sd4wt	cmts6e0qq0006ikvgc7qzl52d	cmts6e0pf0004ikvg2m404dgn	cmts62u970001ikvgirz91n34	SAMPLE_COMPLETED	COMPLETED	Laboratory Processing Area	Sample SMP-1788842082623-249 processing completed	\N	2026-09-08 04:39:03.765	\N	2026-09-08 04:39:03.765
cmtvhb34s0006gwvgfcjkc5jq	cmtvhb32o0003gwvgkli12o58	cmtvhb30p0001gwvgkvyfhu3i	cmts62u970001ikvgirz91n34	ORDER_REGISTERED	REGISTERED	\N	Order ORD-2026-5296 registered for Thyroid Stimulating Hormone (TSH)	\N	2026-09-10 12:03:40.06	{"barcode": "BC-SMP-1789041819981-404", "orderNumber": "ORD-2026-5296", "sampleNumber": "SMP-1789041819981-022"}	2026-09-10 12:03:40.06
cmtvhbyym000egwvgea6kpbrt	cmtvhbyxt000bgwvgq17tw64r	cmtvhbywp0009gwvgswwh8nqw	cmts62u970001ikvgirz91n34	ORDER_REGISTERED	REGISTERED	\N	Order ORD-2026-3137 registered for Thyroid Stimulating Hormone (TSH)	\N	2026-09-10 12:04:21.31	{"barcode": "BC-SMP-1789041861280-068", "orderNumber": "ORD-2026-3137", "sampleNumber": "SMP-1789041861280-990"}	2026-09-10 12:04:21.31
cmtvi38ls000mgwvguw3nxtec	cmtvi38kp000jgwvgdhgmx9ds	cmtvi38jp000hgwvg4w5681vf	cmts62u970001ikvgirz91n34	ORDER_REGISTERED	REGISTERED	\N	Order ORD-2026-8636 registered for Thyroid Stimulating Hormone (TSH)	\N	2026-09-10 12:25:33.521	{"barcode": "BC-SMP-1789043133477-836", "orderNumber": "ORD-2026-8636", "sampleNumber": "SMP-1789043133477-250"}	2026-09-10 12:25:33.521
cmufaohg30005rcvg2khnp8i4	cmufaohf30003rcvgsfevqqda	cmufaohd60001rcvg709z5u02	cmufa8sb50000wwvgrfrlv6ku	ORDER_REGISTERED	REGISTERED	\N	Order ORD-2026-3253 registered for Fasting Blood Sugar (FBS)	cmu0pyur7000050vgy6ct6tcr	2026-09-24 08:53:31.347	{"barcode": "BC-SMP-1790240011308-586", "orderNumber": "ORD-2026-3253", "sampleNumber": "SMP-1790240011308-080"}	2026-09-24 08:53:31.347
cmufaw2rc0007rcvg9votkoth	cmufaohf30003rcvgsfevqqda	cmufaohd60001rcvg709z5u02	cmufa8sb50000wwvgrfrlv6ku	SAMPLE_COLLECTED	COLLECTED	Phlebotomy Room	Collected at Phlebotomy Room	cmu0pyur7000050vgy6ct6tcr	2026-09-24 08:59:25.56	{"barcode": "ORD-2026-3253", "priority": "ROUTINE", "collectionType": "WALK_IN"}	2026-09-24 08:59:25.56
cmufawhhy0008rcvgzvyb5g95	cmufaohf30003rcvgsfevqqda	cmufaohd60001rcvg709z5u02	cmufa8sb50000wwvgrfrlv6ku	SAMPLE_RECEIVED	RECEIVED	Laboratory Reception	Integrity checked at receiving desk | Integrity: label, container, volume verified	cmu0pyur7000050vgy6ct6tcr	2026-09-24 08:59:44.662	\N	2026-09-24 08:59:44.662
cmufawq630009rcvgiojw81rm	cmufaohf30003rcvgsfevqqda	cmufaohd60001rcvg709z5u02	cmufa8sb50000wwvgrfrlv6ku	SAMPLE_PROCESSING	PROCESSING	Laboratory Processing Area	Sample SMP-1790240011308-080 started processing	cmu0pyur7000050vgy6ct6tcr	2026-09-24 08:59:55.899	\N	2026-09-24 08:59:55.899
cmufawuoz000arcvgb9oblch4	cmufaohf30003rcvgsfevqqda	cmufaohd60001rcvg709z5u02	cmufa8sb50000wwvgrfrlv6ku	SAMPLE_COMPLETED	COMPLETED	Laboratory Processing Area	Sample SMP-1790240011308-080 processing completed	cmu0pyur7000050vgy6ct6tcr	2026-09-24 09:00:01.763	\N	2026-09-24 09:00:01.763
\.


--
-- TOC entry 6194 (class 0 OID 111793)
-- Dependencies: 229
-- Data for Name: samples; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.samples (id, "sampleNumber", barcode, "patientId", "orderId", "testId", "sampleType", status, "collectedById", "collectedAt", "receivedAt", "completedAt", "rejectionReason", "createdAt", "updatedAt", "collectionType", priority) FROM stdin;
cmtvhb32o0003gwvgkli12o58	SMP-1789041819981-022	BC-SMP-1789041819981-404	cmts62u970001ikvgirz91n34	cmtvhb30p0001gwvgkvyfhu3i	cmts6agh90003ikvgrxk38xgg	PLASMA	PENDING	\N	\N	\N	\N	\N	2026-09-10 12:03:39.985	2026-09-10 12:03:39.985	\N	\N
cmtvhbyxt000bgwvgq17tw64r	SMP-1789041861280-990	BC-SMP-1789041861280-068	cmts62u970001ikvgirz91n34	cmtvhbywp0009gwvgswwh8nqw	cmts6agh90003ikvgrxk38xgg	PLASMA	PENDING	\N	\N	\N	\N	\N	2026-09-10 12:04:21.281	2026-09-10 12:04:21.281	\N	\N
cmtvi38kp000jgwvgdhgmx9ds	SMP-1789043133477-250	BC-SMP-1789043133477-836	cmts62u970001ikvgirz91n34	cmtvi38jp000hgwvg4w5681vf	cmts6agh90003ikvgrxk38xgg	PLASMA	PENDING	\N	\N	\N	\N	\N	2026-09-10 12:25:33.481	2026-09-10 12:25:33.481	\N	\N
cmts6e0qq0006ikvgc7qzl52d	SMP-1788842082623-249	1788842082623-823	cmts62u970001ikvgirz91n34	cmts6e0pf0004ikvg2m404dgn	cmts6agh90003ikvgrxk38xgg	PLASMA	COMPLETED	\N	2026-09-08 04:38:01.166	2026-09-08 04:38:21.546	2026-09-08 04:39:03.747	\N	2026-09-08 04:34:42.627	2026-09-08 04:39:03.754	WALK_IN	ROUTINE
cmufaohf30003rcvgsfevqqda	SMP-1790240011308-080	ORD-2026-3253	cmufa8sb50000wwvgrfrlv6ku	cmufaohd60001rcvg709z5u02	cmufal8cp0000rcvg3e8mgl5x	PLASMA	COMPLETED	cmu0pyur7000050vgy6ct6tcr	2026-09-24 08:59:25.492	2026-09-24 08:59:44.645	2026-09-24 09:00:01.753	\N	2026-09-24 08:53:31.311	2026-09-24 09:00:01.756	WALK_IN	ROUTINE
\.


--
-- TOC entry 6248 (class 0 OID 138624)
-- Dependencies: 283
-- Data for Name: settlement_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settlement_transactions (id, "settlementId", "paymentId", amount, "matchedAmount", status, "matchedAt", "createdAt") FROM stdin;
\.


--
-- TOC entry 6247 (class 0 OID 138604)
-- Dependencies: 282
-- Data for Name: settlements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settlements (id, "settlementNumber", provider, "providerType", "grossAmount", fees, "netAmount", "settledAmount", difference, status, "settlementDate", "referenceNumber", utr, metadata, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6188 (class 0 OID 111679)
-- Dependencies: 223
-- Data for Name: test_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_categories (id, code, name, description, "isActive", "createdAt", "updatedAt", department, color, icon, "displayOrder") FROM stdin;
cmu0q72760001ycvg1eb3zwu9	HEMA	Hematology & Coagulation	Complete blood count, coagulation profiles, hemoglobinopathies, and bone marrow cytology.	t	2026-09-14 04:11:19.65	2026-09-14 04:11:19.65	\N	#3B82F6	\N	0
cmu0q727p0002ycvgafzlewm3	BIO	Clinical Biochemistry	Metabolic panels, liver/kidney function, cardiac markers, lipid profiles, and therapeutic drugs.	t	2026-09-14 04:11:19.669	2026-09-14 04:11:19.669	\N	#3B82F6	\N	0
cmu0q72820003ycvgw4xj9e1d	MICRO	Clinical Microbiology	Aerobic/anaerobic cultures, antibiotic susceptibility testing (AST), fungal stains, and parasitology.	t	2026-09-14 04:11:19.682	2026-09-14 04:11:19.682	\N	#3B82F6	\N	0
cmu0q728g0004ycvg1idailve	IMMUNO	Immunology & Serology	Autoimmune disease screening, infectious disease serology, viral hepatitis, and HIV panels.	t	2026-09-14 04:11:19.696	2026-09-14 04:11:19.696	\N	#3B82F6	\N	0
cmu0q728r0005ycvgpn1qamuc	ENDO	Endocrinology & Hormones	Thyroid hormones, reproductive panels, cortisol, vitamin assays, and tumor markers.	t	2026-09-14 04:11:19.707	2026-09-14 04:11:19.707	\N	#3B82F6	\N	0
cmu0q72900006ycvge17anyn2	CPATH	Clinical Pathology & Urinalysis	Routine urine microscopy, body fluid examinations, semen analysis, and stool routine.	t	2026-09-14 04:11:19.716	2026-09-14 04:11:19.716	\N	#3B82F6	\N	0
cmu0q729b0007ycvggepusxd9	HISTO	Histopathology & Cytopathology	Biopsy tissue processing, surgical pathology, FNAC, and cervical Pap smears.	t	2026-09-14 04:11:19.727	2026-09-14 04:11:19.727	\N	#3B82F6	\N	0
\.


--
-- TOC entry 6204 (class 0 OID 112258)
-- Dependencies: 239
-- Data for Name: test_package_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_package_items (id, "packageId", "testId", "testPrice", discount, "displayOrder", "createdAt") FROM stdin;
\.


--
-- TOC entry 6203 (class 0 OID 112228)
-- Dependencies: 238
-- Data for Name: test_packages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_packages (id, "packageCode", "packageName", description, "totalPrice", "offerPrice", "discountPercentage", "gstPercentage", "includesTestsCount", "tatHours", "tatDisplay", "targetAudience", "recommendedFor", "isActive", "isPopular", "displayOrder", color, icon, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6190 (class 0 OID 111716)
-- Dependencies: 225
-- Data for Name: test_parameters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_parameters (id, "testId", "parameterName", unit, "dataType", "displayOrder", "isRequired", "createdAt", "updatedAt", "shortName", "measurementMethod", "dropdownOptions", "allowRichText", "decimalPrecision", "isActive") FROM stdin;
cmts6vzph000gikvg4tbnqetm	cmts6agh90003ikvgrxk38xgg	hemoglobin	mg/dL	NUMERIC	1	t	2026-09-08 04:48:41.093	2026-09-08 04:48:41.093	\N	\N	\N	f	\N	t
cmu0q80940008ycvg8903w9lh	cmts6agh90003ikvgrxk38xgg	Hemoglobin (Hb)	g/dL	NUMERIC	1	t	2026-09-14 04:12:03.784	2026-09-14 04:12:03.784	\N	\N	\N	f	\N	t
cmu0q809n0009ycvgh01zdsox	cmts6agh90003ikvgrxk38xgg	Total Leukocyte Count (WBC)	10^3/µL	NUMERIC	2	t	2026-09-14 04:12:03.803	2026-09-14 04:12:03.803	\N	\N	\N	f	\N	t
cmu0q809y000aycvg99o0wmhi	cmts6agh90003ikvgrxk38xgg	Total RBC Count	10^6/µL	NUMERIC	3	t	2026-09-14 04:12:03.814	2026-09-14 04:12:03.814	\N	\N	\N	f	\N	t
cmu0q80a8000bycvgz2vg2xvb	cmts6agh90003ikvgrxk38xgg	Platelet Count	10^3/µL	NUMERIC	4	t	2026-09-14 04:12:03.824	2026-09-14 04:12:03.824	\N	\N	\N	f	\N	t
cmu0q80al000cycvgm5vdvc5j	cmts6agh90003ikvgrxk38xgg	Packed Cell Volume (PCV / Hematocrit)	%	NUMERIC	5	t	2026-09-14 04:12:03.837	2026-09-14 04:12:03.837	\N	\N	\N	f	\N	t
cmu0q80aw000dycvgc4zi2h2a	cmts6agh90003ikvgrxk38xgg	Mean Corpuscular Volume (MCV)	fL	NUMERIC	6	t	2026-09-14 04:12:03.849	2026-09-14 04:12:03.849	\N	\N	\N	f	\N	t
cmu0q80b7000eycvgj43f13tq	cmts6agh90003ikvgrxk38xgg	Mean Corpuscular Hemoglobin (MCH)	pg	NUMERIC	7	t	2026-09-14 04:12:03.859	2026-09-14 04:12:03.859	\N	\N	\N	f	\N	t
cmu0q80bj000fycvgscniqqjp	cmts6agh90003ikvgrxk38xgg	MCH Concentration (MCHC)	g/dL	NUMERIC	8	t	2026-09-14 04:12:03.871	2026-09-14 04:12:03.871	\N	\N	\N	f	\N	t
cmu0q80bs000gycvgsax77p3d	cmts6agh90003ikvgrxk38xgg	Red Cell Distribution Width (RDW-CV)	%	NUMERIC	9	t	2026-09-14 04:12:03.88	2026-09-14 04:12:03.88	\N	\N	\N	f	\N	t
cmu0q80c1000hycvgymh10ila	cmts6agh90003ikvgrxk38xgg	Neutrophils	%	NUMERIC	10	t	2026-09-14 04:12:03.889	2026-09-14 04:12:03.889	\N	\N	\N	f	\N	t
cmu0q80cd000iycvggbd2jqnx	cmts6agh90003ikvgrxk38xgg	Lymphocytes	%	NUMERIC	11	t	2026-09-14 04:12:03.901	2026-09-14 04:12:03.901	\N	\N	\N	f	\N	t
cmu0q80ck000jycvg0emky26j	cmts6agh90003ikvgrxk38xgg	Monocytes	%	NUMERIC	12	t	2026-09-14 04:12:03.908	2026-09-14 04:12:03.908	\N	\N	\N	f	\N	t
cmu0q80cy000kycvgkg91fr4u	cmts6agh90003ikvgrxk38xgg	Eosinophils	%	NUMERIC	13	t	2026-09-14 04:12:03.922	2026-09-14 04:12:03.922	\N	\N	\N	f	\N	t
cmu0q80dd000lycvgqb60gi6d	cmts6agh90003ikvgrxk38xgg	Basophils	%	NUMERIC	14	t	2026-09-14 04:12:03.937	2026-09-14 04:12:03.937	\N	\N	\N	f	\N	t
\.


--
-- TOC entry 6189 (class 0 OID 111694)
-- Dependencies: 224
-- Data for Name: tests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tests (id, "testCode", "testName", "categoryId", "sampleType", "sampleContainer", method, price, "gstPercentage", "tatHours", "isActive", "createdAt", "updatedAt", "shortName", "sampleVolume", "processingDepartment", "offerPrice", "b2bRate", "tatDisplay", "displayOrder", "clinicalSignificance", "patientPreparation", "deltaCheckAbsThreshold", "deltaCheckEnabled", "deltaThresholdPercentage", description) FROM stdin;
cmts6agh90003ikvgrxk38xgg	TSH	Thyroid Stimulating Hormone (TSH)	\N	PLASMA	Lithium Heparin (green)	CLIA (Chemiluminescence Immunoassay)	450.00	0.00	24	t	2026-09-08 04:31:56.397	2026-09-08 04:31:56.397	TSH Ultrasensitive	2.5 mL	CENTRAL HEMATALOGY	350.00	220.00	24 hours	0	nikil	Early morning fasting sample preferred before taking thyroid hormone medication.	\N	f	\N	Sensitive first-line test for thyroid dysfunction (hypothyroidism and hyperthyroidism).
cmufal8cp0000rcvg3e8mgl5x	FBS	Fasting Blood Sugar (FBS)	\N	PLASMA	Fluoride Oxalate (grey)	Hexokinase / GOD-POD	120.00	0.00	4	t	2026-09-24 08:50:59.594	2026-09-24 08:50:59.594	Blood Sugar Fasting	2.0 mL	\N	80.00	50.00	2 - 4 hours	0	\N	8-10 hours overnight fasting. No morning tea, coffee or medication before draw.	\N	f	\N	Primary screening test for diabetes mellitus and glycemic homeostasis.
\.


--
-- TOC entry 6206 (class 0 OID 112323)
-- Dependencies: 241
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id, "userId", "refreshTokenHash", "deviceFingerprint", "userAgent", "ipAddress", "lastSeenAt", "expiresAt", "revokedAt", "revokeReason", "createdAt") FROM stdin;
cmu153dlg0000b4vghm70d176	cmu0pyur7000050vgy6ct6tcr	ef5123861a0e7c6a9a9890dcfeaafc5a2cfce05bde02b799c2e0db74245cf6dc	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-14 11:11:11.855	2026-09-21 11:08:21.993	2026-09-15 03:57:06.421	session_limit	2026-09-14 11:08:22.037
cmu0pzuh60007ysvgin27y9od	cmu0pyur7000050vgy6ct6tcr	7cbf0284d09483ae5bc94d94787db59d7ac6367c291c48f9367e8c4bcfde58b5	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-14 04:05:45.341	2026-09-21 04:05:43.044	2026-09-14 07:58:13.721	session_limit	2026-09-14 04:05:43.05
cmumgss9c0000q4vgrpuro7jb	cmu0pyur7000050vgy6ct6tcr	09eaf8ec9e014c9c6b399880cbbc771ed560fc9a183f0ad32f1a021c777736bd	f16bff89eedfce00576c8407a4c898d3bcaf6e1d8b1e1283dbc594864f3cedd8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Qoder/0.4.3 Chrome/150.0.7871.114 Electron/43.1.1 Safari/537.36	::1	2026-09-29 09:19:31.917	2026-10-06 09:19:12.892	\N	\N	2026-09-29 09:19:12.912
cmu0pzlrm0004ysvgs8eu3myz	cmu0pyur7000050vgy6ct6tcr	973bd6f0a24fbe582fcbd1ac1293b11bc6d27bb555d7f163a581fee2f901852a	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-14 04:05:34.228	2026-09-21 04:05:31.746	2026-09-14 04:05:38.717	session_limit	2026-09-14 04:05:31.762
cmu0yoh0j0000oovgonjxqrp2	cmu0pyur7000050vgy6ct6tcr	e51a6be774ce2da80e1560cbfa8be4347dd7b4a9caf61420d2f66b164b5cfde3	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-14 09:32:04.274	2026-09-21 08:08:48.815	2026-09-14 11:08:21.996	session_limit	2026-09-14 08:08:48.931
cmu0pzhsn0003ysvgbgcg0a8x	cmu0pyur7000050vgy6ct6tcr	8aeaccedabfc5473446abd7483c8805c71bb421ddadabf5af2b42456cc672c76	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-14 04:05:31.857	2026-09-21 04:05:26.609	2026-09-14 04:05:36.011	session_limit	2026-09-14 04:05:26.615
cmu0q1hqu0000ycvgjubsnb5j	cmu0pyur7000050vgy6ct6tcr	ffcb9ee8ef22b57b7039e0a0ef60e6ebdcb4e644eec237c660ea9501f91f5a66	eec83655c77bda02acf3cc54bc593e6e5da11987b8523c8cc3563fdb8cd3155d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::ffff:10.30.240.158	2026-09-14 04:22:07.183	2026-09-21 04:06:59.805	2026-09-14 07:58:40.321	session_limit	2026-09-14 04:06:59.862
cmu0pz2fh0002ysvgptww927u	cmu0pyur7000050vgy6ct6tcr	3b62aa8b1321f0dabdca0a3f8631278bee252f0e20dd842e80e5b43557734de8	e925a282ab6a263db6bdc9e63eddc3704ce8a0b1629a77f7923946e9ce1b5cc4	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9444	::ffff:10.30.240.158	2026-09-14 04:05:06.701	2026-09-21 04:05:06.696	2026-09-14 04:05:31.751	session_limit	2026-09-14 04:05:06.701
cmu15dgpd0000tgvgta034u0w	cmu0pyur7000050vgy6ct6tcr	932b2f214e7aa791390ea370cf865f17ca3843779030910cf26e4addb54cc411	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-14 12:20:48.171	2026-09-21 11:16:12.584	2026-09-15 05:55:49.421	session_limit	2026-09-14 11:16:12.625
cmu0yauwy000034vgbd9kmoli	cmu0pyur7000050vgy6ct6tcr	85b6b7d0c2295c1f17bd8800487f52f727153547715569e1e60236b404a04eea	1f093184d78d93e63ce8da3bb9cf6bb3a1b1fec61a6ec8e654710d56c18c2f8e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Devin/1.126.0 Chrome/148.0.7778.97 Electron/42.2.0 Safari/537.36	::1	2026-09-14 07:58:38.167	2026-09-21 07:58:13.677	2026-09-14 07:58:46.402	session_limit	2026-09-14 07:58:13.762
cmu0pzr500006ysvgaxb63pwp	cmu0pyur7000050vgy6ct6tcr	5a86cef27e8f1fea9c8eb21b7928f38cbb6135bfc7aec9b5dea5b950c74085b9	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-14 04:05:41.052	2026-09-21 04:05:38.715	2026-09-14 04:06:59.834	session_limit	2026-09-14 04:05:38.724
cmu0ybk3p000234vgvvn88pf4	cmu0pyur7000050vgy6ct6tcr	0c494c872e4dcf18dd051c8b89517e98d51b0bf15c0235fa19c6281b7b41e18a	1f093184d78d93e63ce8da3bb9cf6bb3a1b1fec61a6ec8e654710d56c18c2f8e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Devin/1.126.0 Chrome/148.0.7778.97 Electron/42.2.0 Safari/537.36	::1	2026-09-14 07:58:48.702	2026-09-21 07:58:46.401	2026-09-14 10:42:56.595	session_limit	2026-09-14 07:58:46.405
cmu0pzp1r0005ysvg34v5wm1j	cmu0pyur7000050vgy6ct6tcr	738f2275e0fab92632814d3fbd2f7ba9d4a43ac4008d1e875b4fd7dd6dfe9108	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-14 04:05:37.699	2026-09-21 04:05:36.009	2026-09-14 04:05:43.046	session_limit	2026-09-14 04:05:36.015
cmu0ybfer000134vgonp2t8ru	cmu0pyur7000050vgy6ct6tcr	87b8ed096fb698ddce7de5bd721aa701c462fe5e2d7f8e4ae86cfecb82cd7d36	1f093184d78d93e63ce8da3bb9cf6bb3a1b1fec61a6ec8e654710d56c18c2f8e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Devin/1.126.0 Chrome/148.0.7778.97 Electron/42.2.0 Safari/537.36	::1	2026-09-14 07:58:42.766	2026-09-21 07:58:40.319	2026-09-14 08:08:48.861	session_limit	2026-09-14 07:58:40.323
cmu8f95ce0000k8vggc1v32i2	cmu0pyur7000050vgy6ct6tcr	e3970aa324b7cca464afc1896cea9814bb416529dba617191ac20908d6f37ad1	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-19 15:46:44.53	2026-09-26 13:27:10.593	2026-09-22 17:39:55.729	session_limit	2026-09-19 13:27:10.67
cmu146ol80000psvgv3jk3qxc	cmu0pyur7000050vgy6ct6tcr	f5114504eee3f56d38af2c24bf4796d48cdfe12b25e413233d7bb3f94eaf3c7a	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-14 11:07:55.339	2026-09-21 10:42:56.563	2026-09-14 11:16:12.602	session_limit	2026-09-14 10:42:56.637
cmu3l85hu0000pwvg42gxm5oh	cmu0pyur7000050vgy6ct6tcr	c7154ab679bfaf43698827e8970ed59531249b75b97863f04f168214a0e5fbbc	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-16 04:16:29.161	2026-09-23 04:15:30.95	2026-09-21 09:44:39.112	session_limit	2026-09-16 04:15:31.027
cmu254mjl000098vgxlui4gjh	cmu0pyur7000050vgy6ct6tcr	467a5af61d1a3976fb18cfb9fd75742b5ccec8e005d9f5ff6e014c2f46f33d50	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-15 04:30:35.265	2026-09-22 03:57:06.392	2026-09-16 04:15:30.992	session_limit	2026-09-15 03:57:06.466
cmu29daol0000owvgg0pqksgb	cmu0pyur7000050vgy6ct6tcr	8906a6b988cbc37e8e72ae5ccbee5b264a875a5f73b933d62c929e8e0f689a7f	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-15 06:33:44.108	2026-09-22 05:55:49.387	2026-09-19 13:27:10.632	session_limit	2026-09-15 05:55:49.461
cmuduk4i40000i0vgtuuxfkmx	cmu0pyur7000050vgy6ct6tcr	f59d1290a351c3bff35a433b7a995c88c868adba7e55ae967eef305bebe0c451	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-23 08:39:36.614	2026-09-30 08:34:27.838	2026-09-23 12:35:05.656	session_limit	2026-09-23 08:34:27.916
cmuf5cuvj0000bwvgv5aelxr1	cmu0pyur7000050vgy6ct6tcr	100ac46b0f2e87b0dd03ac92582d45d011748e3af84807e9a7534e61633ee069	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-24 09:02:09.496	2026-10-01 06:24:30.72	2026-09-25 04:29:36.479	session_limit	2026-09-24 06:24:30.8
cmue2rbdj0000ocvgxo0wi2h0	cmu0pyur7000050vgy6ct6tcr	87ea401d34caf2fc8ad726eb65c77f96370810fb3141141e182796cb1b68cf9c	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-23 12:35:01.314	2026-09-30 12:24:00.285	2026-09-24 06:24:30.763	session_limit	2026-09-23 12:24:00.343
cmuh97bp200044svghw7ifvs3	cmu0pyur7000050vgy6ct6tcr	f51161951454109fe47d97fbca6b6adec1fbe689c80ca67d5375bc9579f751e0	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-25 17:47:56.841	2026-10-02 17:47:43.435	2026-09-26 05:09:31.092	session_limit	2026-09-25 17:47:43.478
cmub26ol40000dkvg17vnfknr	cmu0pyur7000050vgy6ct6tcr	467116fa997639906d43a1619cc2c876ce078199ac656b6c56760c19f9e4d313	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-21 09:59:13.65	2026-09-28 09:44:39.056	2026-09-23 06:24:57.261	session_limit	2026-09-21 09:44:39.161
cmugj4u180002ekvgcstq2674	cmu0pyur7000050vgy6ct6tcr	51375bf54e71603a7ca72955b16fe09df373d9f6c4a0c7fb082966b54a0a4c09	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-25 06:03:43.262	2026-10-02 05:37:57.072	2026-09-25 16:25:36.428	session_limit	2026-09-25 05:37:57.26
cmugrfq7r0000eovg0z7mqmv5	cmu0pyur7000050vgy6ct6tcr	4c37ae5a3eb2fa61dda4d49b6391ac7b78f96b5b8846e9699b7c1bfcbff0df58	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-25 09:30:46.538	2026-10-02 09:30:22.38	2026-09-25 17:24:26.685	session_limit	2026-09-25 09:30:22.455
cmucylqsz0000uovg3ly42tkl	cmu0pyur7000050vgy6ct6tcr	0263b57e9c35d84496222cd16eabb20e654cd3cd299b71203dfe53a53f192aea	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-22 18:03:11.928	2026-09-29 17:39:55.695	2026-09-23 08:34:27.875	session_limit	2026-09-22 17:39:55.764
cmudpxknk0000v8vgefr6o50y	cmu0pyur7000050vgy6ct6tcr	c44819b5a35959e9029ee1818bdd16d109592327faf5929ee9dbcb1ef88f9f78	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-23 08:12:13.822	2026-09-30 06:24:57.229	2026-09-23 12:24:00.315	session_limit	2026-09-23 06:24:57.297
cmufj31q70000bcvghcqonj90	cmu0pyur7000050vgy6ct6tcr	79883c57d4956c6a954cfc66693c424b8e9f170fc3ed42e1a5fe96a1df66cf74	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-24 13:48:44.368	2026-10-01 12:48:47.664	2026-09-25 05:37:57.131	session_limit	2026-09-24 12:48:47.743
cmue35kr00001ocvgcpx2nt9z	cmu0pyur7000050vgy6ct6tcr	354f937e7467cc3b105b23c2899ed17f74f3d2a07a510061e1cd5f6116bb2220	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-23 12:42:48.427	2026-09-30 12:35:05.647	2026-09-24 12:48:47.703	session_limit	2026-09-23 12:35:05.676
cmuh69pzr00004svgr5kfmczt	cmu0pyur7000050vgy6ct6tcr	ec25ebc165fcf88cad692b3464acdd63ae2e940fd4d8a8d34bbf50a34879754e	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-25 17:19:43.51	2026-10-02 16:25:36.389	2026-09-25 17:47:43.445	session_limit	2026-09-25 16:25:36.472
cmuggoxvq000008vg2bk29eoi	cmu0pyur7000050vgy6ct6tcr	c8ef66515c669b9059524f5218b9bc297825a4ddade91bd62d88990aab068678	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-25 05:21:14.217	2026-10-02 04:29:36.439	2026-09-25 09:30:22.421	session_limit	2026-09-25 04:29:36.518
cmuhtr6m00000e8vg8eyedbxb	cmu0pyur7000050vgy6ct6tcr	d0e927919da1d408f4e8424c4b233da25d98fb1448009d298852a24f6e636b19	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-26 04:11:25.686	2026-10-03 03:23:02.239	2026-09-26 15:59:39.651	session_limit	2026-09-26 03:23:02.329
cmuh8ddyg00034svg06qb48th	cmu0pyur7000050vgy6ct6tcr	e3961b85d55921888be1d996714b73a421c1f956fef6b4098ad2290c7fa38b19	49407130459595d9e44d13ac9ef1040890721ab72e23931c2f38b2747cbc2345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	::1	2026-09-25 17:47:40.93	2026-10-02 17:24:26.67	2026-09-26 03:23:02.281	session_limit	2026-09-25 17:24:26.728
cmuhxk48s0000q8vg9ovculec	cmu0pyur7000050vgy6ct6tcr	ac82bec6c20fedc8b8a98a432caaec27a6a1fe516772aebab97936fba6bac3f3	a827fbb32fab0d55ef58e5679990247655cdd5fb5a99a40723431ba9ebfad087	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0	::1	2026-09-26 15:43:24.504	2026-10-03 05:09:31.04	2026-09-26 16:10:11.122	session_limit	2026-09-26 05:09:31.133
cmul22bbf0000lwvg1n9r8a1v	cmu0pyur7000050vgy6ct6tcr	cdaafed1ef77163fc407d77ee73b547b4754aa41e139cdde6f5f03f9e5d4ffb2	fd1421f50ed04053ce355bc6d55fe4d21d71a6a8deb062340b230f9c2668cebd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.19.13 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36	::1	2026-09-28 09:39:11.325	2026-10-05 09:38:57.001	2026-09-28 09:39:38.492	session_limit	2026-09-28 09:38:57.099
cmuiks7ga0000jkvgfhar77q3	cmu0pyur7000050vgy6ct6tcr	a4199f9d012351bc0f97aaf920a9e48ece9e03ead1228285070e1612e6c80395	a827fbb32fab0d55ef58e5679990247655cdd5fb5a99a40723431ba9ebfad087	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0	::1	2026-09-26 16:07:32.126	2026-10-03 15:59:39.597	2026-09-28 09:38:57.052	session_limit	2026-09-26 15:59:39.706
cmuil5qnz0001jkvgubs0khkf	cmu0pyur7000050vgy6ct6tcr	e4c39233e9a8467e4a07f00496582c0c96673de758187dfb04b6e2746df9f446	a827fbb32fab0d55ef58e5679990247655cdd5fb5a99a40723431ba9ebfad087	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0	::1	2026-09-26 16:25:11.607	2026-10-03 16:10:11.117	2026-09-28 09:39:34.472	session_limit	2026-09-26 16:10:11.135
cmumc7qx900016kvg8ixkdedm	cmu0pyur7000050vgy6ct6tcr	8cb3e33a68293e49db34a48cb2496f97693a2fa3130806d5ec517b77f543ac2d	65cf33c71fc9837c6d88261e3c51992a63007f635d53c4e69589df1a38748fb4	node	::ffff:127.0.0.1	2026-09-29 07:10:53.083	2026-10-06 07:10:52.932	2026-09-29 07:10:53.083	logout	2026-09-29 07:10:52.941
cmul2379d0002lwvg0yvv8z6m	cmu0pyur7000050vgy6ct6tcr	604813c49e29f448fed99c2d24f3c253b7fae03f46c04503be4712b210566cdf	fd1421f50ed04053ce355bc6d55fe4d21d71a6a8deb062340b230f9c2668cebd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.19.13 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36	::1	2026-09-28 09:39:40.7	2026-10-05 09:39:38.489	2026-09-28 09:39:46.35	session_limit	2026-09-28 09:39:38.497
cmul23su70006lwvg4av22id0	cmu0pyur7000050vgy6ct6tcr	57d7b17af21c27ac0da5ee25c8d3537c2666a5925809ba26a065e90f77361f52	fd1421f50ed04053ce355bc6d55fe4d21d71a6a8deb062340b230f9c2668cebd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.19.13 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36	::1	2026-09-28 10:11:03.433	2026-10-05 09:40:06.454	2026-09-29 05:45:17.359	session_limit	2026-09-28 09:40:06.463
cmul2345s0001lwvgm78z5qqx	cmu0pyur7000050vgy6ct6tcr	fcb258e15703460267e6aacd15c5d8be6e1e2e26777a249b079a34a52ab0ca9c	fd1421f50ed04053ce355bc6d55fe4d21d71a6a8deb062340b230f9c2668cebd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.19.13 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36	::1	2026-09-28 09:39:36.752	2026-10-05 09:39:34.469	2026-09-28 09:39:42.421	session_limit	2026-09-28 09:39:34.48
cmumc4wjy00006kvgsdq493as	cmu0pyur7000050vgy6ct6tcr	0e65735f0154d03fc0e20767a9ff8e8b6f5f8c38ce361119bb3e344756f16924	ee788126daea5b46aadca9f19755f671b8657d23c0486643e8bb41d5e76ab9aa	curl/8.21.0	::ffff:127.0.0.1	2026-09-29 07:08:40.27	2026-10-06 07:08:40.224	2026-09-29 07:13:21.395	session_limit	2026-09-29 07:08:40.27
cmulkv9xh00003svgwbsrmy5u	cmu0pyur7000050vgy6ct6tcr	cf527699d2a87aeb06bc4ae2b04dff2f4f625a40e9cd139600f999ceb555a8f0	a827fbb32fab0d55ef58e5679990247655cdd5fb5a99a40723431ba9ebfad087	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0	::1	2026-09-28 18:31:18.147	2026-10-05 18:25:21.279	2026-09-29 06:40:49.286	session_limit	2026-09-28 18:25:21.413
cmum95oas000048vg7aymjlch	cmu0pyur7000050vgy6ct6tcr	4a1bd1e8a1232d3832d4b5e0cb39d6bb29e81f9775b5921616fdc02d27a0ed0e	f16bff89eedfce00576c8407a4c898d3bcaf6e1d8b1e1283dbc594864f3cedd8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Qoder/0.4.3 Chrome/150.0.7871.114 Electron/43.1.1 Safari/537.36	::1	2026-09-29 05:45:20.476	2026-10-06 05:45:17.332	2026-09-29 07:08:40.241	session_limit	2026-09-29 05:45:17.38
cmul23gdd0005lwvgffv4zmb0	cmu0pyur7000050vgy6ct6tcr	cd0b676455582f7eabae5bdf56f7b443650393bcd91c5b49a5413b0626956623	fd1421f50ed04053ce355bc6d55fe4d21d71a6a8deb062340b230f9c2668cebd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.19.13 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36	::1	2026-09-28 09:39:52.546	2026-10-05 09:39:50.3	2026-09-28 18:25:21.337	session_limit	2026-09-28 09:39:50.305
cmumb537z000148vgeal2681i	cmu0pyur7000050vgy6ct6tcr	784f749c50f38966de351b45a4715168a897704890860c12e6e8c6d70e5e1ddf	ee788126daea5b46aadca9f19755f671b8657d23c0486643e8bb41d5e76ab9aa	curl/8.21.0	::ffff:127.0.0.1	2026-09-29 06:40:49.296	2026-10-06 06:40:49.279	2026-09-29 07:10:52.933	session_limit	2026-09-29 06:40:49.296
cmul23dbl0004lwvgcizanssj	cmu0pyur7000050vgy6ct6tcr	4efb2c061e8c1fbe8d24473302c7f28544e946d839831ed01cb524abd0b0cd56	fd1421f50ed04053ce355bc6d55fe4d21d71a6a8deb062340b230f9c2668cebd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.19.13 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36	::1	2026-09-28 09:39:48.559	2026-10-05 09:39:46.348	2026-09-28 09:40:06.457	session_limit	2026-09-28 09:39:46.354
cmul23aah0003lwvg2oa4ms13	cmu0pyur7000050vgy6ct6tcr	6c4ebb132dd230dc5f8d7391a2a121a6a1990757e493141f8912e1281ce86efd	fd1421f50ed04053ce355bc6d55fe4d21d71a6a8deb062340b230f9c2668cebd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.19.13 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36	::1	2026-09-28 09:39:44.693	2026-10-05 09:39:42.42	2026-09-28 09:39:50.301	session_limit	2026-09-28 09:39:42.425
cmumdxz0q00076kvgadgih8wk	cmu0pyur7000050vgy6ct6tcr	639ffa6fcd84294d0b75a436f861d84aa2e5b9ee64ee33d35be3ae978bbd2c88	f16bff89eedfce00576c8407a4c898d3bcaf6e1d8b1e1283dbc594864f3cedd8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Qoder/0.4.3 Chrome/150.0.7871.114 Electron/43.1.1 Safari/537.36	::1	2026-09-29 08:05:07.209	2026-10-06 07:59:16.086	2026-09-29 08:05:07.209	logout	2026-09-29 07:59:16.106
cmumeenqv00005kvgelmdoqbi	cmu0pyur7000050vgy6ct6tcr	66138eccf23dead0efcf9a2cdfc1b21c50607087bc2e342b4e962cce330b4672	f16bff89eedfce00576c8407a4c898d3bcaf6e1d8b1e1283dbc594864f3cedd8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Qoder/0.4.3 Chrome/150.0.7871.114 Electron/43.1.1 Safari/537.36	::1	2026-09-29 08:16:40.718	2026-10-06 08:12:14.634	\N	\N	2026-09-29 08:12:14.647
cmumc7s4600026kvgo3i1k1a9	cmu0pyur7000050vgy6ct6tcr	ca70cb43911126ec6edc2163b5fb233ce2a983ec99694fb474f09e51dc4d1f25	65cf33c71fc9837c6d88261e3c51992a63007f635d53c4e69589df1a38748fb4	node	::ffff:127.0.0.1	2026-09-29 07:10:54.486	2026-10-06 07:10:54.485	2026-09-29 07:54:34.128	session_limit	2026-09-29 07:10:54.486
cmumcaxh700036kvgfeuikd65	cmu0pyur7000050vgy6ct6tcr	05c56d1d3eccd03fa0d96ef6d3e53aed9b528119d5bed439c28ac5aeb0ad2617	65cf33c71fc9837c6d88261e3c51992a63007f635d53c4e69589df1a38748fb4	node	::ffff:127.0.0.1	2026-09-29 07:13:23.824	2026-10-06 07:13:21.393	2026-09-29 07:59:16.097	session_limit	2026-09-29 07:13:21.403
cmumdrxgk00066kvgezmzmvgx	cmu0pyur7000050vgy6ct6tcr	f87affa02baa1abf68e24a8e379ebc8ab44b869a17af3a93578e1697b24b5902	ee788126daea5b46aadca9f19755f671b8657d23c0486643e8bb41d5e76ab9aa	curl/8.21.0	::ffff:127.0.0.1	2026-09-29 07:54:34.148	2026-10-06 07:54:34.069	2026-09-29 08:26:54.516	session_limit	2026-09-29 07:54:34.148
cmumexiob00015kvgsgri3px3	cmu0pyur7000050vgy6ct6tcr	d861ed2d93c4168b9800d8cee2bf6a60be78d7e2e201c72a9767a5e7dd90b489	65cf33c71fc9837c6d88261e3c51992a63007f635d53c4e69589df1a38748fb4	node	::ffff:127.0.0.1	2026-09-29 08:26:55.126	2026-10-06 08:26:54.511	2026-09-29 08:26:55.133	admin_force_logout	2026-09-29 08:26:54.539
\.


--
-- TOC entry 6185 (class 0 OID 111631)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, "employeeCode", "fullName", email, phone, "passwordHash", role, status, specialization, "createdAt", "updatedAt", "autoApproveResults", "compactMode", "darkMode", "dateFormat", "defaultReportTemplate", department, designation, "emergencyContact", "emergencyContactPhone", "enableCriticalAlerts", "enableDailyDigest", "enableEmailNotifications", "enablePushNotifications", "enableSmsNotifications", "firstName", language, "lastName", "preferredCommunicationMethod", "profileImage", "showTutorial", signature, "timeFormat", timezone, "workingHoursEnd", "workingHoursStart", "failedLoginCount", "lockedUntil", "passwordChangedAt", "mfaEnabled", "totpSecretEnc", "totpPendingEnc") FROM stdin;
cmu0pyur7000050vgy6ct6tcr	ADMIN001	Nikil Panchal	nikilpanchal0@gmail.com	+91 98765 43210	$2b$12$T6mtOYGG94AQp28omlR1KeDK2XnLJkB8eF8g8MjJGAlgyYfC71XAm	ADMIN	ACTIVE	System Administration	2026-09-14 04:04:56.755	2026-09-29 09:19:12.873	f	f	f	DD/MM/YYYY	standard	Pathology	Chief Medical Lab Technologist	\N	\N	t	t	t	t	f	Nikil	English	Panchal	email	data:image/jpeg;base64,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	t	\N	24h	Asia/Kolkata	17:00	09:00	0	\N	2026-09-28 18:16:32.661	f	\N	\N
\.


--
-- TOC entry 6242 (class 0 OID 138514)
-- Dependencies: 277
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_transactions (id, "walletId", amount, "transactionType", "balanceBefore", "balanceAfter", "referenceId", "referenceType", description, "createdAt") FROM stdin;
cmtynn0ri00027svg7q6nbw27	cmtynn0r600017svgvu9l8kdn	8999.00	CREDIT	0.00	8999.00	cmtynn0p600007svg8oo1jx9j	ADVANCE	kio	2026-09-12 17:24:13.086
cmtynnkwj00047svgyzdiu00u	cmtynn0r600017svgvu9l8kdn	10000.00	CREDIT	8999.00	18999.00	cmtynnkuu00037svg22dmbduo	ADVANCE	Patient advance balance deposit	2026-09-12 17:24:39.187
\.


--
-- TOC entry 6232 (class 0 OID 121703)
-- Dependencies: 267
-- Data for Name: whatsapp_analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_analytics (id, date, period, "sentCount", "deliveredCount", "readCount", "failedCount", cost, "templateBreakdown", metrics, "createdAt") FROM stdin;
\.


--
-- TOC entry 6229 (class 0 OID 121631)
-- Dependencies: 264
-- Data for Name: whatsapp_auto_reply_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_auto_reply_rules (id, name, description, "triggerType", "triggerData", "responseType", "responseText", "templateId", "interactiveType", "interactiveData", "delaySeconds", "maxResponsesPerDay", "cooldownSeconds", priority, "patientSegment", "isActive", "aiEnabled", "aiModel", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6231 (class 0 OID 121677)
-- Dependencies: 266
-- Data for Name: whatsapp_campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_campaigns (id, name, description, "campaignType", "templateId", "messageContent", "targetAudience", "recipientCount", "scheduledFor", "sentAt", status, "sentCount", "deliveredCount", "failedCount", "costEstimate", "actualCost", "aBTestEnabled", "aBTestVariants", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6227 (class 0 OID 112937)
-- Dependencies: 262
-- Data for Name: whatsapp_conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_conversations (id, "patientId", "phoneNumber", status, "lastMessageAt", "lastMessagePreview", "messageCount", "unreadCount", "assignedTo", "assignedAt", "externalConversationId", "externalFrom", tags, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6226 (class 0 OID 112919)
-- Dependencies: 261
-- Data for Name: whatsapp_incoming_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_incoming_messages (id, "patientId", "phoneNumber", "messageContent", "messageType", "mediaUrl", "mediaMimeType", "externalMessageId", "externalFrom", "externalTo", "conversationId", processed, "processedAt", "processedBy", "autoReplySent", "autoReplyId", "createdAt") FROM stdin;
\.


--
-- TOC entry 6230 (class 0 OID 121655)
-- Dependencies: 265
-- Data for Name: whatsapp_notification_triggers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_notification_triggers (id, name, description, "eventType", "eventFilter", "templateId", "variableMapping", "recipientType", "recipientFilter", "sendImmediately", "delayMinutes", "isActive", "lastTriggeredAt", "triggerCount", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 6225 (class 0 OID 112897)
-- Dependencies: 260
-- Data for Name: whatsapp_scheduled_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_scheduled_messages (id, "patientId", "phoneNumber", "templateName", "templateId", "messageContent", language, components, "scheduledFor", "sentAt", status, priority, "retryCount", "maxRetries", "errorMessage", "externalMessageId", "conversationId", "createdAt", "updatedAt", "campaignId") FROM stdin;
\.


--
-- TOC entry 6233 (class 0 OID 121725)
-- Dependencies: 268
-- Data for Name: whatsapp_sentiments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_sentiments (id, "conversationId", "messageCount", "overallSentiment", "sentimentScore", emotions, keywords, issues, "analyzedAt") FROM stdin;
\.


--
-- TOC entry 6228 (class 0 OID 121610)
-- Dependencies: 263
-- Data for Name: whatsapp_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_templates (id, name, "displayName", category, language, components, "templateId", "templateStatus", "isActive", "createdBy", "createdAt", "updatedAt", "lastSyncedAt") FROM stdin;
\.


--
-- TOC entry 6221 (class 0 OID 112813)
-- Dependencies: 256
-- Data for Name: worklist_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.worklist_entries (id, "analyzerId", "orderId", "orderNumber", "sampleId", "sampleNumber", barcode, "testId", "testCode", "testName", status, "sentAt", "acknowledgedAt", "completedAt", priority, "resultReceived", "resultReceivedAt", "errorMessage", "retryCount", "maxRetries", protocol, "sequenceNumber", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5511 (class 2606 OID 111474)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5726 (class 2606 OID 112708)
-- Name: analyzer_alerts analyzer_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzer_alerts
    ADD CONSTRAINT analyzer_alerts_pkey PRIMARY KEY (id);


--
-- TOC entry 5733 (class 2606 OID 112724)
-- Name: analyzer_communication_logs analyzer_communication_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzer_communication_logs
    ADD CONSTRAINT analyzer_communication_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5716 (class 2606 OID 112687)
-- Name: analyzer_jobs analyzer_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzer_jobs
    ADD CONSTRAINT analyzer_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 5637 (class 2606 OID 111926)
-- Name: analyzer_logs analyzer_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzer_logs
    ADD CONSTRAINT analyzer_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5751 (class 2606 OID 112782)
-- Name: analyzer_port_mappings analyzer_port_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzer_port_mappings
    ADD CONSTRAINT analyzer_port_mappings_pkey PRIMARY KEY (id);


--
-- TOC entry 5709 (class 2606 OID 112665)
-- Name: analyzer_test_mappings analyzer_test_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzer_test_mappings
    ADD CONSTRAINT analyzer_test_mappings_pkey PRIMARY KEY (id);


--
-- TOC entry 5687 (class 2606 OID 112616)
-- Name: analyzers analyzers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzers
    ADD CONSTRAINT analyzers_pkey PRIMARY KEY (id);


--
-- TOC entry 5621 (class 2606 OID 111894)
-- Name: approvals approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_pkey PRIMARY KEY (id);


--
-- TOC entry 5644 (class 2606 OID 111938)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5695 (class 2606 OID 112630)
-- Name: calibrations calibrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calibrations
    ADD CONSTRAINT calibrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5881 (class 2606 OID 138568)
-- Name: cash_counter_sessions cash_counter_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_counter_sessions
    ADD CONSTRAINT cash_counter_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5876 (class 2606 OID 138553)
-- Name: cash_counters cash_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_counters
    ADD CONSTRAINT cash_counters_pkey PRIMARY KEY (id);


--
-- TOC entry 5886 (class 2606 OID 138586)
-- Name: cash_drawers cash_drawers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_drawers
    ADD CONSTRAINT cash_drawers_pkey PRIMARY KEY (id);


--
-- TOC entry 5891 (class 2606 OID 138603)
-- Name: cash_movements cash_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT cash_movements_pkey PRIMARY KEY (id);


--
-- TOC entry 5738 (class 2606 OID 112741)
-- Name: communication_logs communication_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_logs
    ADD CONSTRAINT communication_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5911 (class 2606 OID 138674)
-- Name: corporate_accounts corporate_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_accounts
    ADD CONSTRAINT corporate_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 5771 (class 2606 OID 112879)
-- Name: critical_value_acknowledgments critical_value_acknowledgments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.critical_value_acknowledgments
    ADD CONSTRAINT critical_value_acknowledgments_pkey PRIMARY KEY (id);


--
-- TOC entry 5525 (class 2606 OID 111663)
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- TOC entry 5589 (class 2606 OID 111833)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 5767 (class 2606 OID 112867)
-- Name: laboratory_settings laboratory_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laboratory_settings
    ADD CONSTRAINT laboratory_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5700 (class 2606 OID 112645)
-- Name: maintenances maintenances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_pkey PRIMARY KEY (id);


--
-- TOC entry 5667 (class 2606 OID 112349)
-- Name: mfa_backup_codes mfa_backup_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mfa_backup_codes
    ADD CONSTRAINT mfa_backup_codes_pkey PRIMARY KEY (id);


--
-- TOC entry 5746 (class 2606 OID 112763)
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 5572 (class 2606 OID 111792)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5566 (class 2606 OID 111772)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5659 (class 2606 OID 112322)
-- Name: password_history password_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_history
    ADD CONSTRAINT password_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5861 (class 2606 OID 138497)
-- Name: patient_advances patient_advances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_advances
    ADD CONSTRAINT patient_advances_pkey PRIMARY KEY (id);


--
-- TOC entry 5839 (class 2606 OID 126207)
-- Name: patient_history_entries patient_history_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_history_entries
    ADD CONSTRAINT patient_history_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 5866 (class 2606 OID 138513)
-- Name: patient_wallets patient_wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_wallets
    ADD CONSTRAINT patient_wallets_pkey PRIMARY KEY (id);


--
-- TOC entry 5531 (class 2606 OID 111678)
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- TOC entry 5844 (class 2606 OID 138447)
-- Name: payment_allocations payment_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_allocations
    ADD CONSTRAINT payment_allocations_pkey PRIMARY KEY (id);


--
-- TOC entry 5930 (class 2606 OID 138724)
-- Name: payment_audit_logs payment_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_audit_logs
    ADD CONSTRAINT payment_audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5596 (class 2606 OID 111851)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5755 (class 2606 OID 112812)
-- Name: qc_rules qc_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_rules
    ADD CONSTRAINT qc_rules_pkey PRIMARY KEY (id);


--
-- TOC entry 5923 (class 2606 OID 138710)
-- Name: receipts receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);


--
-- TOC entry 5918 (class 2606 OID 138697)
-- Name: receivables receivables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT receivables_pkey PRIMARY KEY (id);


--
-- TOC entry 5903 (class 2606 OID 138654)
-- Name: reconciliation_records reconciliation_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reconciliation_records
    ADD CONSTRAINT reconciliation_records_pkey PRIMARY KEY (id);


--
-- TOC entry 5556 (class 2606 OID 111744)
-- Name: reference_ranges reference_ranges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reference_ranges
    ADD CONSTRAINT reference_ranges_pkey PRIMARY KEY (id);


--
-- TOC entry 5855 (class 2606 OID 138483)
-- Name: refund_approvals refund_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund_approvals
    ADD CONSTRAINT refund_approvals_pkey PRIMARY KEY (id);


--
-- TOC entry 5848 (class 2606 OID 138468)
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- TOC entry 5835 (class 2606 OID 126192)
-- Name: report_addendums report_addendums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_addendums
    ADD CONSTRAINT report_addendums_pkey PRIMARY KEY (id);


--
-- TOC entry 5830 (class 2606 OID 126174)
-- Name: report_share_links report_share_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_share_links
    ADD CONSTRAINT report_share_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5627 (class 2606 OID 111910)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 5778 (class 2606 OID 112896)
-- Name: result_amendments result_amendments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_amendments
    ADD CONSTRAINT result_amendments_pkey PRIMARY KEY (id);


--
-- TOC entry 5617 (class 2606 OID 111880)
-- Name: result_values result_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_values
    ADD CONSTRAINT result_values_pkey PRIMARY KEY (id);


--
-- TOC entry 5610 (class 2606 OID 111866)
-- Name: results results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_pkey PRIMARY KEY (id);


--
-- TOC entry 5670 (class 2606 OID 112361)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5678 (class 2606 OID 112593)
-- Name: sample_tracking_history sample_tracking_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_tracking_history
    ADD CONSTRAINT sample_tracking_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5579 (class 2606 OID 111811)
-- Name: samples samples_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT samples_pkey PRIMARY KEY (id);


--
-- TOC entry 5900 (class 2606 OID 138638)
-- Name: settlement_transactions settlement_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlement_transactions
    ADD CONSTRAINT settlement_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5893 (class 2606 OID 138623)
-- Name: settlements settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_pkey PRIMARY KEY (id);


--
-- TOC entry 5539 (class 2606 OID 111693)
-- Name: test_categories test_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_categories
    ADD CONSTRAINT test_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5656 (class 2606 OID 112274)
-- Name: test_package_items test_package_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_package_items
    ADD CONSTRAINT test_package_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5652 (class 2606 OID 112253)
-- Name: test_packages test_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_packages
    ADD CONSTRAINT test_packages_pkey PRIMARY KEY (id);


--
-- TOC entry 5549 (class 2606 OID 111733)
-- Name: test_parameters test_parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_parameters
    ADD CONSTRAINT test_parameters_pkey PRIMARY KEY (id);


--
-- TOC entry 5543 (class 2606 OID 111715)
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);


--
-- TOC entry 5662 (class 2606 OID 112337)
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5516 (class 2606 OID 111648)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5869 (class 2606 OID 138528)
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5823 (class 2606 OID 121724)
-- Name: whatsapp_analytics whatsapp_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_analytics
    ADD CONSTRAINT whatsapp_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 5810 (class 2606 OID 121654)
-- Name: whatsapp_auto_reply_rules whatsapp_auto_reply_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_auto_reply_rules
    ADD CONSTRAINT whatsapp_auto_reply_rules_pkey PRIMARY KEY (id);


--
-- TOC entry 5817 (class 2606 OID 121702)
-- Name: whatsapp_campaigns whatsapp_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_campaigns
    ADD CONSTRAINT whatsapp_campaigns_pkey PRIMARY KEY (id);


--
-- TOC entry 5800 (class 2606 OID 112956)
-- Name: whatsapp_conversations whatsapp_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_conversations
    ADD CONSTRAINT whatsapp_conversations_pkey PRIMARY KEY (id);


--
-- TOC entry 5793 (class 2606 OID 112936)
-- Name: whatsapp_incoming_messages whatsapp_incoming_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_incoming_messages
    ADD CONSTRAINT whatsapp_incoming_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5815 (class 2606 OID 121676)
-- Name: whatsapp_notification_triggers whatsapp_notification_triggers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_notification_triggers
    ADD CONSTRAINT whatsapp_notification_triggers_pkey PRIMARY KEY (id);


--
-- TOC entry 5784 (class 2606 OID 112918)
-- Name: whatsapp_scheduled_messages whatsapp_scheduled_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_scheduled_messages
    ADD CONSTRAINT whatsapp_scheduled_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5827 (class 2606 OID 121740)
-- Name: whatsapp_sentiments whatsapp_sentiments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_sentiments
    ADD CONSTRAINT whatsapp_sentiments_pkey PRIMARY KEY (id);


--
-- TOC entry 5806 (class 2606 OID 121630)
-- Name: whatsapp_templates whatsapp_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_templates
    ADD CONSTRAINT whatsapp_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 5763 (class 2606 OID 112835)
-- Name: worklist_entries worklist_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worklist_entries
    ADD CONSTRAINT worklist_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 5720 (class 1259 OID 112993)
-- Name: analyzer_alerts_alertType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_alerts_alertType_idx" ON public.analyzer_alerts USING btree ("alertType");


--
-- TOC entry 5721 (class 1259 OID 112992)
-- Name: analyzer_alerts_analyzerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_alerts_analyzerId_idx" ON public.analyzer_alerts USING btree ("analyzerId");


--
-- TOC entry 5722 (class 1259 OID 112997)
-- Name: analyzer_alerts_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_alerts_createdAt_idx" ON public.analyzer_alerts USING btree ("createdAt");


--
-- TOC entry 5723 (class 1259 OID 112995)
-- Name: analyzer_alerts_isAcknowledged_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_alerts_isAcknowledged_idx" ON public.analyzer_alerts USING btree ("isAcknowledged");


--
-- TOC entry 5724 (class 1259 OID 112996)
-- Name: analyzer_alerts_isResolved_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_alerts_isResolved_idx" ON public.analyzer_alerts USING btree ("isResolved");


--
-- TOC entry 5727 (class 1259 OID 112994)
-- Name: analyzer_alerts_severity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analyzer_alerts_severity_idx ON public.analyzer_alerts USING btree (severity);


--
-- TOC entry 5728 (class 1259 OID 112998)
-- Name: analyzer_communication_logs_analyzerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_communication_logs_analyzerId_idx" ON public.analyzer_communication_logs USING btree ("analyzerId");


--
-- TOC entry 5729 (class 1259 OID 113002)
-- Name: analyzer_communication_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_communication_logs_createdAt_idx" ON public.analyzer_communication_logs USING btree ("createdAt");


--
-- TOC entry 5730 (class 1259 OID 112999)
-- Name: analyzer_communication_logs_direction_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analyzer_communication_logs_direction_idx ON public.analyzer_communication_logs USING btree (direction);


--
-- TOC entry 5731 (class 1259 OID 113000)
-- Name: analyzer_communication_logs_messageType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_communication_logs_messageType_idx" ON public.analyzer_communication_logs USING btree ("messageType");


--
-- TOC entry 5734 (class 1259 OID 113001)
-- Name: analyzer_communication_logs_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analyzer_communication_logs_status_idx ON public.analyzer_communication_logs USING btree (status);


--
-- TOC entry 5710 (class 1259 OID 112985)
-- Name: analyzer_jobs_analyzerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_jobs_analyzerId_idx" ON public.analyzer_jobs USING btree ("analyzerId");


--
-- TOC entry 5711 (class 1259 OID 112990)
-- Name: analyzer_jobs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_jobs_createdAt_idx" ON public.analyzer_jobs USING btree ("createdAt");


--
-- TOC entry 5712 (class 1259 OID 112989)
-- Name: analyzer_jobs_jobId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_jobs_jobId_idx" ON public.analyzer_jobs USING btree ("jobId");


--
-- TOC entry 5713 (class 1259 OID 112984)
-- Name: analyzer_jobs_jobId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "analyzer_jobs_jobId_key" ON public.analyzer_jobs USING btree ("jobId");


--
-- TOC entry 5714 (class 1259 OID 112987)
-- Name: analyzer_jobs_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_jobs_orderId_idx" ON public.analyzer_jobs USING btree ("orderId");


--
-- TOC entry 5717 (class 1259 OID 112991)
-- Name: analyzer_jobs_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analyzer_jobs_priority_idx ON public.analyzer_jobs USING btree (priority);


--
-- TOC entry 5718 (class 1259 OID 112988)
-- Name: analyzer_jobs_sampleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_jobs_sampleId_idx" ON public.analyzer_jobs USING btree ("sampleId");


--
-- TOC entry 5719 (class 1259 OID 112986)
-- Name: analyzer_jobs_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analyzer_jobs_status_idx ON public.analyzer_jobs USING btree (status);


--
-- TOC entry 5632 (class 1259 OID 112013)
-- Name: analyzer_logs_barcode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analyzer_logs_barcode_idx ON public.analyzer_logs USING btree (barcode);


--
-- TOC entry 5633 (class 1259 OID 112014)
-- Name: analyzer_logs_isProcessed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_logs_isProcessed_idx" ON public.analyzer_logs USING btree ("isProcessed");


--
-- TOC entry 5634 (class 1259 OID 112010)
-- Name: analyzer_logs_machineCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_logs_machineCode_idx" ON public.analyzer_logs USING btree ("machineCode");


--
-- TOC entry 5635 (class 1259 OID 112012)
-- Name: analyzer_logs_orderNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_logs_orderNumber_idx" ON public.analyzer_logs USING btree ("orderNumber");


--
-- TOC entry 5638 (class 1259 OID 112011)
-- Name: analyzer_logs_protocol_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analyzer_logs_protocol_idx ON public.analyzer_logs USING btree (protocol);


--
-- TOC entry 5639 (class 1259 OID 112015)
-- Name: analyzer_logs_receivedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_logs_receivedAt_idx" ON public.analyzer_logs USING btree ("receivedAt");


--
-- TOC entry 5747 (class 1259 OID 113011)
-- Name: analyzer_port_mappings_analyzerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_port_mappings_analyzerId_idx" ON public.analyzer_port_mappings USING btree ("analyzerId");


--
-- TOC entry 5748 (class 1259 OID 113013)
-- Name: analyzer_port_mappings_analyzerId_portName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "analyzer_port_mappings_analyzerId_portName_key" ON public.analyzer_port_mappings USING btree ("analyzerId", "portName");


--
-- TOC entry 5749 (class 1259 OID 113012)
-- Name: analyzer_port_mappings_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_port_mappings_isActive_idx" ON public.analyzer_port_mappings USING btree ("isActive");


--
-- TOC entry 5703 (class 1259 OID 112982)
-- Name: analyzer_test_mappings_analyzerId_analyzerTestCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "analyzer_test_mappings_analyzerId_analyzerTestCode_key" ON public.analyzer_test_mappings USING btree ("analyzerId", "analyzerTestCode");


--
-- TOC entry 5704 (class 1259 OID 112979)
-- Name: analyzer_test_mappings_analyzerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_test_mappings_analyzerId_idx" ON public.analyzer_test_mappings USING btree ("analyzerId");


--
-- TOC entry 5705 (class 1259 OID 112983)
-- Name: analyzer_test_mappings_analyzerId_labCoreTestId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "analyzer_test_mappings_analyzerId_labCoreTestId_key" ON public.analyzer_test_mappings USING btree ("analyzerId", "labCoreTestId");


--
-- TOC entry 5706 (class 1259 OID 112981)
-- Name: analyzer_test_mappings_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_test_mappings_isActive_idx" ON public.analyzer_test_mappings USING btree ("isActive");


--
-- TOC entry 5707 (class 1259 OID 112980)
-- Name: analyzer_test_mappings_labCoreTestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzer_test_mappings_labCoreTestId_idx" ON public.analyzer_test_mappings USING btree ("labCoreTestId");


--
-- TOC entry 5680 (class 1259 OID 112964)
-- Name: analyzers_analyzerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzers_analyzerId_idx" ON public.analyzers USING btree ("analyzerId");


--
-- TOC entry 5681 (class 1259 OID 112962)
-- Name: analyzers_analyzerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "analyzers_analyzerId_key" ON public.analyzers USING btree ("analyzerId");


--
-- TOC entry 5682 (class 1259 OID 112970)
-- Name: analyzers_analyzerType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzers_analyzerType_idx" ON public.analyzers USING btree ("analyzerType");


--
-- TOC entry 5683 (class 1259 OID 112969)
-- Name: analyzers_department_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analyzers_department_idx ON public.analyzers USING btree (department);


--
-- TOC entry 5684 (class 1259 OID 112967)
-- Name: analyzers_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzers_isActive_idx" ON public.analyzers USING btree ("isActive");


--
-- TOC entry 5685 (class 1259 OID 112968)
-- Name: analyzers_isArchived_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzers_isArchived_idx" ON public.analyzers USING btree ("isArchived");


--
-- TOC entry 5688 (class 1259 OID 112965)
-- Name: analyzers_serialNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyzers_serialNumber_idx" ON public.analyzers USING btree ("serialNumber");


--
-- TOC entry 5689 (class 1259 OID 112963)
-- Name: analyzers_serialNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "analyzers_serialNumber_key" ON public.analyzers USING btree ("serialNumber");


--
-- TOC entry 5690 (class 1259 OID 112966)
-- Name: analyzers_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analyzers_status_idx ON public.analyzers USING btree (status);


--
-- TOC entry 5619 (class 1259 OID 112003)
-- Name: approvals_approvedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "approvals_approvedById_idx" ON public.approvals USING btree ("approvedById");


--
-- TOC entry 5622 (class 1259 OID 112002)
-- Name: approvals_resultId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "approvals_resultId_idx" ON public.approvals USING btree ("resultId");


--
-- TOC entry 5623 (class 1259 OID 112004)
-- Name: approvals_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approvals_status_idx ON public.approvals USING btree (status);


--
-- TOC entry 5640 (class 1259 OID 112018)
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- TOC entry 5641 (class 1259 OID 112020)
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- TOC entry 5642 (class 1259 OID 112017)
-- Name: audit_logs_module_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_module_idx ON public.audit_logs USING btree (module);


--
-- TOC entry 5645 (class 1259 OID 112019)
-- Name: audit_logs_recordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_recordId_idx" ON public.audit_logs USING btree ("recordId");


--
-- TOC entry 5646 (class 1259 OID 112016)
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- TOC entry 5691 (class 1259 OID 112971)
-- Name: calibrations_analyzerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calibrations_analyzerId_idx" ON public.calibrations USING btree ("analyzerId");


--
-- TOC entry 5692 (class 1259 OID 112974)
-- Name: calibrations_calibrationDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calibrations_calibrationDate_idx" ON public.calibrations USING btree ("calibrationDate");


--
-- TOC entry 5693 (class 1259 OID 112973)
-- Name: calibrations_nextCalibrationDueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calibrations_nextCalibrationDueDate_idx" ON public.calibrations USING btree ("nextCalibrationDueDate");


--
-- TOC entry 5696 (class 1259 OID 112972)
-- Name: calibrations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calibrations_status_idx ON public.calibrations USING btree (status);


--
-- TOC entry 5878 (class 1259 OID 138748)
-- Name: cash_counter_sessions_counterId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_counter_sessions_counterId_idx" ON public.cash_counter_sessions USING btree ("counterId");


--
-- TOC entry 5879 (class 1259 OID 138750)
-- Name: cash_counter_sessions_openedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_counter_sessions_openedAt_idx" ON public.cash_counter_sessions USING btree ("openedAt");


--
-- TOC entry 5882 (class 1259 OID 138749)
-- Name: cash_counter_sessions_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_counter_sessions_userId_idx" ON public.cash_counter_sessions USING btree ("userId");


--
-- TOC entry 5872 (class 1259 OID 138747)
-- Name: cash_counters_assignedUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_counters_assignedUserId_idx" ON public.cash_counters USING btree ("assignedUserId");


--
-- TOC entry 5873 (class 1259 OID 138745)
-- Name: cash_counters_branchId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_counters_branchId_idx" ON public.cash_counters USING btree ("branchId");


--
-- TOC entry 5874 (class 1259 OID 138744)
-- Name: cash_counters_counterNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "cash_counters_counterNumber_key" ON public.cash_counters USING btree ("counterNumber");


--
-- TOC entry 5877 (class 1259 OID 138746)
-- Name: cash_counters_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cash_counters_status_idx ON public.cash_counters USING btree (status);


--
-- TOC entry 5883 (class 1259 OID 138752)
-- Name: cash_drawers_counterId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_drawers_counterId_idx" ON public.cash_drawers USING btree ("counterId");


--
-- TOC entry 5884 (class 1259 OID 138751)
-- Name: cash_drawers_drawerNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "cash_drawers_drawerNumber_key" ON public.cash_drawers USING btree ("drawerNumber");


--
-- TOC entry 5887 (class 1259 OID 138753)
-- Name: cash_movements_drawerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_movements_drawerId_idx" ON public.cash_movements USING btree ("drawerId");


--
-- TOC entry 5888 (class 1259 OID 138754)
-- Name: cash_movements_movementType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_movements_movementType_idx" ON public.cash_movements USING btree ("movementType");


--
-- TOC entry 5889 (class 1259 OID 138755)
-- Name: cash_movements_performedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_movements_performedAt_idx" ON public.cash_movements USING btree ("performedAt");


--
-- TOC entry 5735 (class 1259 OID 113007)
-- Name: communication_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "communication_logs_createdAt_idx" ON public.communication_logs USING btree ("createdAt");


--
-- TOC entry 5736 (class 1259 OID 113003)
-- Name: communication_logs_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "communication_logs_patientId_idx" ON public.communication_logs USING btree ("patientId");


--
-- TOC entry 5739 (class 1259 OID 113006)
-- Name: communication_logs_sentById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "communication_logs_sentById_idx" ON public.communication_logs USING btree ("sentById");


--
-- TOC entry 5740 (class 1259 OID 113005)
-- Name: communication_logs_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX communication_logs_status_idx ON public.communication_logs USING btree (status);


--
-- TOC entry 5741 (class 1259 OID 113004)
-- Name: communication_logs_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX communication_logs_type_idx ON public.communication_logs USING btree (type);


--
-- TOC entry 5907 (class 1259 OID 138766)
-- Name: corporate_accounts_accountNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "corporate_accounts_accountNumber_idx" ON public.corporate_accounts USING btree ("accountNumber");


--
-- TOC entry 5908 (class 1259 OID 138765)
-- Name: corporate_accounts_accountNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "corporate_accounts_accountNumber_key" ON public.corporate_accounts USING btree ("accountNumber");


--
-- TOC entry 5909 (class 1259 OID 138767)
-- Name: corporate_accounts_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "corporate_accounts_isActive_idx" ON public.corporate_accounts USING btree ("isActive");


--
-- TOC entry 5768 (class 1259 OID 113026)
-- Name: critical_value_acknowledgments_acknowledgedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "critical_value_acknowledgments_acknowledgedBy_idx" ON public.critical_value_acknowledgments USING btree ("acknowledgedBy");


--
-- TOC entry 5769 (class 1259 OID 113027)
-- Name: critical_value_acknowledgments_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "critical_value_acknowledgments_createdAt_idx" ON public.critical_value_acknowledgments USING btree ("createdAt");


--
-- TOC entry 5772 (class 1259 OID 113024)
-- Name: critical_value_acknowledgments_resultId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "critical_value_acknowledgments_resultId_idx" ON public.critical_value_acknowledgments USING btree ("resultId");


--
-- TOC entry 5773 (class 1259 OID 113025)
-- Name: critical_value_acknowledgments_resultValueId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "critical_value_acknowledgments_resultValueId_idx" ON public.critical_value_acknowledgments USING btree ("resultValueId");


--
-- TOC entry 5519 (class 1259 OID 111944)
-- Name: doctors_doctorCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "doctors_doctorCode_key" ON public.doctors USING btree ("doctorCode");


--
-- TOC entry 5520 (class 1259 OID 112219)
-- Name: doctors_doctorType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "doctors_doctorType_idx" ON public.doctors USING btree ("doctorType");


--
-- TOC entry 5521 (class 1259 OID 111945)
-- Name: doctors_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX doctors_email_key ON public.doctors USING btree (email);


--
-- TOC entry 5522 (class 1259 OID 111946)
-- Name: doctors_fullName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "doctors_fullName_idx" ON public.doctors USING btree ("fullName");


--
-- TOC entry 5523 (class 1259 OID 111948)
-- Name: doctors_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "doctors_isActive_idx" ON public.doctors USING btree ("isActive");


--
-- TOC entry 5526 (class 1259 OID 111947)
-- Name: doctors_specialization_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX doctors_specialization_idx ON public.doctors USING btree (specialization);


--
-- TOC entry 5583 (class 1259 OID 111986)
-- Name: invoices_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoices_createdAt_idx" ON public.invoices USING btree ("createdAt");


--
-- TOC entry 5584 (class 1259 OID 112199)
-- Name: invoices_dueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoices_dueDate_idx" ON public.invoices USING btree ("dueDate");


--
-- TOC entry 5585 (class 1259 OID 111983)
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- TOC entry 5586 (class 1259 OID 111984)
-- Name: invoices_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_orderId_key" ON public.invoices USING btree ("orderId");


--
-- TOC entry 5587 (class 1259 OID 111985)
-- Name: invoices_paymentStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoices_paymentStatus_idx" ON public.invoices USING btree ("paymentStatus");


--
-- TOC entry 5697 (class 1259 OID 112975)
-- Name: maintenances_analyzerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "maintenances_analyzerId_idx" ON public.maintenances USING btree ("analyzerId");


--
-- TOC entry 5698 (class 1259 OID 112978)
-- Name: maintenances_completedDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "maintenances_completedDate_idx" ON public.maintenances USING btree ("completedDate");


--
-- TOC entry 5701 (class 1259 OID 112977)
-- Name: maintenances_scheduledDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "maintenances_scheduledDate_idx" ON public.maintenances USING btree ("scheduledDate");


--
-- TOC entry 5702 (class 1259 OID 112976)
-- Name: maintenances_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenances_status_idx ON public.maintenances USING btree (status);


--
-- TOC entry 5668 (class 1259 OID 112366)
-- Name: mfa_backup_codes_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "mfa_backup_codes_userId_idx" ON public.mfa_backup_codes USING btree ("userId");


--
-- TOC entry 5742 (class 1259 OID 113009)
-- Name: notification_templates_channel_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_templates_channel_idx ON public.notification_templates USING btree (channel);


--
-- TOC entry 5743 (class 1259 OID 113008)
-- Name: notification_templates_eventType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_templates_eventType_idx" ON public.notification_templates USING btree ("eventType");


--
-- TOC entry 5744 (class 1259 OID 113010)
-- Name: notification_templates_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_templates_isActive_idx" ON public.notification_templates USING btree ("isActive");


--
-- TOC entry 5568 (class 1259 OID 112295)
-- Name: order_items_itemType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_items_itemType_idx" ON public.order_items USING btree ("itemType");


--
-- TOC entry 5569 (class 1259 OID 113047)
-- Name: order_items_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_items_orderId_idx" ON public.order_items USING btree ("orderId");


--
-- TOC entry 5570 (class 1259 OID 113048)
-- Name: order_items_packageId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_items_packageId_idx" ON public.order_items USING btree ("packageId");


--
-- TOC entry 5573 (class 1259 OID 111974)
-- Name: order_items_testId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_items_testId_idx" ON public.order_items USING btree ("testId");


--
-- TOC entry 5557 (class 1259 OID 111967)
-- Name: orders_barcode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orders_barcode_key ON public.orders USING btree (barcode);


--
-- TOC entry 5558 (class 1259 OID 111973)
-- Name: orders_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "orders_createdAt_idx" ON public.orders USING btree ("createdAt");


--
-- TOC entry 5559 (class 1259 OID 111970)
-- Name: orders_createdById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "orders_createdById_idx" ON public.orders USING btree ("createdById");


--
-- TOC entry 5560 (class 1259 OID 111969)
-- Name: orders_doctorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "orders_doctorId_idx" ON public.orders USING btree ("doctorId");


--
-- TOC entry 5561 (class 1259 OID 111966)
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- TOC entry 5562 (class 1259 OID 111971)
-- Name: orders_orderStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "orders_orderStatus_idx" ON public.orders USING btree ("orderStatus");


--
-- TOC entry 5563 (class 1259 OID 111968)
-- Name: orders_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "orders_patientId_idx" ON public.orders USING btree ("patientId");


--
-- TOC entry 5564 (class 1259 OID 111972)
-- Name: orders_paymentStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "orders_paymentStatus_idx" ON public.orders USING btree ("paymentStatus");


--
-- TOC entry 5567 (class 1259 OID 121755)
-- Name: orders_reportId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "orders_reportId_key" ON public.orders USING btree ("reportId");


--
-- TOC entry 5660 (class 1259 OID 112363)
-- Name: password_history_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "password_history_userId_createdAt_idx" ON public.password_history USING btree ("userId", "createdAt");


--
-- TOC entry 5858 (class 1259 OID 138738)
-- Name: patient_advances_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "patient_advances_createdAt_idx" ON public.patient_advances USING btree ("createdAt");


--
-- TOC entry 5859 (class 1259 OID 138736)
-- Name: patient_advances_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "patient_advances_patientId_idx" ON public.patient_advances USING btree ("patientId");


--
-- TOC entry 5862 (class 1259 OID 138737)
-- Name: patient_advances_transactionType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "patient_advances_transactionType_idx" ON public.patient_advances USING btree ("transactionType");


--
-- TOC entry 5837 (class 1259 OID 126208)
-- Name: patient_history_entries_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "patient_history_entries_patientId_idx" ON public.patient_history_entries USING btree ("patientId");


--
-- TOC entry 5840 (class 1259 OID 126209)
-- Name: patient_history_entries_reportId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "patient_history_entries_reportId_idx" ON public.patient_history_entries USING btree ("reportId");


--
-- TOC entry 5863 (class 1259 OID 138740)
-- Name: patient_wallets_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "patient_wallets_patientId_idx" ON public.patient_wallets USING btree ("patientId");


--
-- TOC entry 5864 (class 1259 OID 138739)
-- Name: patient_wallets_patientId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "patient_wallets_patientId_key" ON public.patient_wallets USING btree ("patientId");


--
-- TOC entry 5527 (class 1259 OID 111953)
-- Name: patients_createdById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "patients_createdById_idx" ON public.patients USING btree ("createdById");


--
-- TOC entry 5528 (class 1259 OID 111951)
-- Name: patients_firstName_lastName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "patients_firstName_lastName_idx" ON public.patients USING btree ("firstName", "lastName");


--
-- TOC entry 5529 (class 1259 OID 111950)
-- Name: patients_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX patients_phone_idx ON public.patients USING btree (phone);


--
-- TOC entry 5532 (class 1259 OID 111952)
-- Name: patients_referredById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "patients_referredById_idx" ON public.patients USING btree ("referredById");


--
-- TOC entry 5533 (class 1259 OID 111949)
-- Name: patients_uhid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX patients_uhid_key ON public.patients USING btree (uhid);


--
-- TOC entry 5841 (class 1259 OID 138726)
-- Name: payment_allocations_allocationType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_allocations_allocationType_idx" ON public.payment_allocations USING btree ("allocationType");


--
-- TOC entry 5842 (class 1259 OID 138725)
-- Name: payment_allocations_paymentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "payment_allocations_paymentId_key" ON public.payment_allocations USING btree ("paymentId");


--
-- TOC entry 5845 (class 1259 OID 138727)
-- Name: payment_allocations_referenceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_allocations_referenceId_idx" ON public.payment_allocations USING btree ("referenceId");


--
-- TOC entry 5926 (class 1259 OID 138781)
-- Name: payment_audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_audit_logs_createdAt_idx" ON public.payment_audit_logs USING btree ("createdAt");


--
-- TOC entry 5927 (class 1259 OID 138780)
-- Name: payment_audit_logs_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_audit_logs_entityId_idx" ON public.payment_audit_logs USING btree ("entityId");


--
-- TOC entry 5928 (class 1259 OID 138779)
-- Name: payment_audit_logs_entityType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_audit_logs_entityType_idx" ON public.payment_audit_logs USING btree ("entityType");


--
-- TOC entry 5931 (class 1259 OID 138778)
-- Name: payment_audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_audit_logs_userId_idx" ON public.payment_audit_logs USING btree ("userId");


--
-- TOC entry 5590 (class 1259 OID 138785)
-- Name: payments_corporateAccountId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_corporateAccountId_idx" ON public.payments USING btree ("corporateAccountId");


--
-- TOC entry 5591 (class 1259 OID 138784)
-- Name: payments_counterId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_counterId_idx" ON public.payments USING btree ("counterId");


--
-- TOC entry 5592 (class 1259 OID 111989)
-- Name: payments_method_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_method_idx ON public.payments USING btree (method);


--
-- TOC entry 5593 (class 1259 OID 111988)
-- Name: payments_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_orderId_idx" ON public.payments USING btree ("orderId");


--
-- TOC entry 5594 (class 1259 OID 111992)
-- Name: payments_paidAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_paidAt_idx" ON public.payments USING btree ("paidAt");


--
-- TOC entry 5597 (class 1259 OID 138782)
-- Name: payments_receiptNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_receiptNumber_idx" ON public.payments USING btree ("receiptNumber");


--
-- TOC entry 5598 (class 1259 OID 111987)
-- Name: payments_receiptNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "payments_receiptNumber_key" ON public.payments USING btree ("receiptNumber");


--
-- TOC entry 5599 (class 1259 OID 111991)
-- Name: payments_receivedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_receivedById_idx" ON public.payments USING btree ("receivedById");


--
-- TOC entry 5600 (class 1259 OID 111990)
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- TOC entry 5601 (class 1259 OID 138783)
-- Name: payments_utr_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_utr_idx ON public.payments USING btree (utr);


--
-- TOC entry 5752 (class 1259 OID 113014)
-- Name: qc_rules_analyzerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "qc_rules_analyzerId_idx" ON public.qc_rules USING btree ("analyzerId");


--
-- TOC entry 5753 (class 1259 OID 113017)
-- Name: qc_rules_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "qc_rules_isActive_idx" ON public.qc_rules USING btree ("isActive");


--
-- TOC entry 5756 (class 1259 OID 113018)
-- Name: qc_rules_ruleType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "qc_rules_ruleType_idx" ON public.qc_rules USING btree ("ruleType");


--
-- TOC entry 5757 (class 1259 OID 113015)
-- Name: qc_rules_testId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "qc_rules_testId_idx" ON public.qc_rules USING btree ("testId");


--
-- TOC entry 5758 (class 1259 OID 113016)
-- Name: qc_rules_testParameterId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "qc_rules_testParameterId_idx" ON public.qc_rules USING btree ("testParameterId");


--
-- TOC entry 5920 (class 1259 OID 138776)
-- Name: receipts_paymentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "receipts_paymentId_idx" ON public.receipts USING btree ("paymentId");


--
-- TOC entry 5921 (class 1259 OID 138775)
-- Name: receipts_paymentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "receipts_paymentId_key" ON public.receipts USING btree ("paymentId");


--
-- TOC entry 5924 (class 1259 OID 138777)
-- Name: receipts_receiptNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "receipts_receiptNumber_idx" ON public.receipts USING btree ("receiptNumber");


--
-- TOC entry 5925 (class 1259 OID 138774)
-- Name: receipts_receiptNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "receipts_receiptNumber_key" ON public.receipts USING btree ("receiptNumber");


--
-- TOC entry 5912 (class 1259 OID 138771)
-- Name: receivables_corporateAccountId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "receivables_corporateAccountId_idx" ON public.receivables USING btree ("corporateAccountId");


--
-- TOC entry 5913 (class 1259 OID 138772)
-- Name: receivables_dueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "receivables_dueDate_idx" ON public.receivables USING btree ("dueDate");


--
-- TOC entry 5914 (class 1259 OID 138769)
-- Name: receivables_invoiceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "receivables_invoiceId_idx" ON public.receivables USING btree ("invoiceId");


--
-- TOC entry 5915 (class 1259 OID 138768)
-- Name: receivables_invoiceId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "receivables_invoiceId_key" ON public.receivables USING btree ("invoiceId");


--
-- TOC entry 5916 (class 1259 OID 138770)
-- Name: receivables_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "receivables_patientId_idx" ON public.receivables USING btree ("patientId");


--
-- TOC entry 5919 (class 1259 OID 138773)
-- Name: receivables_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX receivables_status_idx ON public.receivables USING btree (status);


--
-- TOC entry 5904 (class 1259 OID 138762)
-- Name: reconciliation_records_recordDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reconciliation_records_recordDate_idx" ON public.reconciliation_records USING btree ("recordDate");


--
-- TOC entry 5905 (class 1259 OID 138764)
-- Name: reconciliation_records_sourceType_sourceId_transactionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "reconciliation_records_sourceType_sourceId_transactionId_key" ON public.reconciliation_records USING btree ("sourceType", "sourceId", "transactionId");


--
-- TOC entry 5906 (class 1259 OID 138763)
-- Name: reconciliation_records_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reconciliation_records_status_idx ON public.reconciliation_records USING btree (status);


--
-- TOC entry 5551 (class 1259 OID 112297)
-- Name: reference_ranges_ageGroup_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reference_ranges_ageGroup_idx" ON public.reference_ranges USING btree ("ageGroup");


--
-- TOC entry 5552 (class 1259 OID 111965)
-- Name: reference_ranges_gender_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reference_ranges_gender_idx ON public.reference_ranges USING btree (gender);


--
-- TOC entry 5553 (class 1259 OID 113049)
-- Name: reference_ranges_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reference_ranges_isActive_idx" ON public.reference_ranges USING btree ("isActive");


--
-- TOC entry 5554 (class 1259 OID 111964)
-- Name: reference_ranges_parameterId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reference_ranges_parameterId_idx" ON public.reference_ranges USING btree ("parameterId");


--
-- TOC entry 5853 (class 1259 OID 138735)
-- Name: refund_approvals_approverId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "refund_approvals_approverId_idx" ON public.refund_approvals USING btree ("approverId");


--
-- TOC entry 5856 (class 1259 OID 138734)
-- Name: refund_approvals_refundId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "refund_approvals_refundId_idx" ON public.refund_approvals USING btree ("refundId");


--
-- TOC entry 5857 (class 1259 OID 138733)
-- Name: refund_approvals_refundId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "refund_approvals_refundId_key" ON public.refund_approvals USING btree ("refundId");


--
-- TOC entry 5846 (class 1259 OID 138729)
-- Name: refunds_paymentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "refunds_paymentId_idx" ON public.refunds USING btree ("paymentId");


--
-- TOC entry 5849 (class 1259 OID 138732)
-- Name: refunds_refundNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "refunds_refundNumber_idx" ON public.refunds USING btree ("refundNumber");


--
-- TOC entry 5850 (class 1259 OID 138728)
-- Name: refunds_refundNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "refunds_refundNumber_key" ON public.refunds USING btree ("refundNumber");


--
-- TOC entry 5851 (class 1259 OID 138731)
-- Name: refunds_requestedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "refunds_requestedById_idx" ON public.refunds USING btree ("requestedById");


--
-- TOC entry 5852 (class 1259 OID 138730)
-- Name: refunds_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refunds_status_idx ON public.refunds USING btree (status);


--
-- TOC entry 5836 (class 1259 OID 126193)
-- Name: report_addendums_reportId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "report_addendums_reportId_idx" ON public.report_addendums USING btree ("reportId");


--
-- TOC entry 5828 (class 1259 OID 126177)
-- Name: report_share_links_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "report_share_links_expiresAt_idx" ON public.report_share_links USING btree ("expiresAt");


--
-- TOC entry 5831 (class 1259 OID 126176)
-- Name: report_share_links_reportId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "report_share_links_reportId_idx" ON public.report_share_links USING btree ("reportId");


--
-- TOC entry 5832 (class 1259 OID 138786)
-- Name: report_share_links_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_share_links_token_idx ON public.report_share_links USING btree (token);


--
-- TOC entry 5833 (class 1259 OID 126175)
-- Name: report_share_links_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX report_share_links_token_key ON public.report_share_links USING btree (token);


--
-- TOC entry 5624 (class 1259 OID 112007)
-- Name: reports_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reports_orderId_idx" ON public.reports USING btree ("orderId");


--
-- TOC entry 5625 (class 1259 OID 112006)
-- Name: reports_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reports_patientId_idx" ON public.reports USING btree ("patientId");


--
-- TOC entry 5628 (class 1259 OID 112009)
-- Name: reports_publishedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reports_publishedById_idx" ON public.reports USING btree ("publishedById");


--
-- TOC entry 5629 (class 1259 OID 112005)
-- Name: reports_reportNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "reports_reportNumber_key" ON public.reports USING btree ("reportNumber");


--
-- TOC entry 5630 (class 1259 OID 121756)
-- Name: reports_reportReferenceId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "reports_reportReferenceId_key" ON public.reports USING btree ("reportReferenceId");


--
-- TOC entry 5631 (class 1259 OID 112008)
-- Name: reports_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_status_idx ON public.reports USING btree (status);


--
-- TOC entry 5774 (class 1259 OID 113029)
-- Name: result_amendments_amendedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "result_amendments_amendedBy_idx" ON public.result_amendments USING btree ("amendedBy");


--
-- TOC entry 5775 (class 1259 OID 113030)
-- Name: result_amendments_approvedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "result_amendments_approvedById_idx" ON public.result_amendments USING btree ("approvedById");


--
-- TOC entry 5776 (class 1259 OID 113031)
-- Name: result_amendments_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "result_amendments_createdAt_idx" ON public.result_amendments USING btree ("createdAt");


--
-- TOC entry 5779 (class 1259 OID 113028)
-- Name: result_amendments_resultId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "result_amendments_resultId_idx" ON public.result_amendments USING btree ("resultId");


--
-- TOC entry 5614 (class 1259 OID 112000)
-- Name: result_values_flag_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX result_values_flag_idx ON public.result_values USING btree (flag);


--
-- TOC entry 5615 (class 1259 OID 111999)
-- Name: result_values_parameterId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "result_values_parameterId_idx" ON public.result_values USING btree ("parameterId");


--
-- TOC entry 5618 (class 1259 OID 112001)
-- Name: result_values_resultId_parameterId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "result_values_resultId_parameterId_key" ON public.result_values USING btree ("resultId", "parameterId");


--
-- TOC entry 5602 (class 1259 OID 111997)
-- Name: results_approvedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "results_approvedById_idx" ON public.results USING btree ("approvedById");


--
-- TOC entry 5603 (class 1259 OID 111996)
-- Name: results_enteredById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "results_enteredById_idx" ON public.results USING btree ("enteredById");


--
-- TOC entry 5604 (class 1259 OID 111993)
-- Name: results_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "results_orderId_idx" ON public.results USING btree ("orderId");


--
-- TOC entry 5605 (class 1259 OID 111998)
-- Name: results_orderId_testId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "results_orderId_testId_key" ON public.results USING btree ("orderId", "testId");


--
-- TOC entry 5606 (class 1259 OID 113050)
-- Name: results_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "results_patientId_idx" ON public.results USING btree ("patientId");


--
-- TOC entry 5607 (class 1259 OID 113052)
-- Name: results_patientId_testId_approvedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "results_patientId_testId_approvedAt_idx" ON public.results USING btree ("patientId", "testId", "approvedAt");


--
-- TOC entry 5608 (class 1259 OID 113053)
-- Name: results_patientId_testId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "results_patientId_testId_createdAt_idx" ON public.results USING btree ("patientId", "testId", "createdAt");


--
-- TOC entry 5611 (class 1259 OID 111995)
-- Name: results_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX results_status_idx ON public.results USING btree (status);


--
-- TOC entry 5612 (class 1259 OID 111994)
-- Name: results_testId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "results_testId_idx" ON public.results USING btree ("testId");


--
-- TOC entry 5613 (class 1259 OID 113051)
-- Name: results_testId_status_approvedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "results_testId_status_approvedAt_idx" ON public.results USING btree ("testId", status, "approvedAt");


--
-- TOC entry 5671 (class 1259 OID 112368)
-- Name: role_permissions_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX role_permissions_role_idx ON public.role_permissions USING btree (role);


--
-- TOC entry 5672 (class 1259 OID 112367)
-- Name: role_permissions_role_permission_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX role_permissions_role_permission_key ON public.role_permissions USING btree (role, permission);


--
-- TOC entry 5673 (class 1259 OID 112960)
-- Name: sample_tracking_history_eventType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sample_tracking_history_eventType_idx" ON public.sample_tracking_history USING btree ("eventType");


--
-- TOC entry 5674 (class 1259 OID 112958)
-- Name: sample_tracking_history_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sample_tracking_history_orderId_idx" ON public.sample_tracking_history USING btree ("orderId");


--
-- TOC entry 5675 (class 1259 OID 112959)
-- Name: sample_tracking_history_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sample_tracking_history_patientId_idx" ON public.sample_tracking_history USING btree ("patientId");


--
-- TOC entry 5676 (class 1259 OID 112961)
-- Name: sample_tracking_history_performedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sample_tracking_history_performedAt_idx" ON public.sample_tracking_history USING btree ("performedAt");


--
-- TOC entry 5679 (class 1259 OID 112957)
-- Name: sample_tracking_history_sampleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sample_tracking_history_sampleId_idx" ON public.sample_tracking_history USING btree ("sampleId");


--
-- TOC entry 5574 (class 1259 OID 111977)
-- Name: samples_barcode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX samples_barcode_key ON public.samples USING btree (barcode);


--
-- TOC entry 5575 (class 1259 OID 111982)
-- Name: samples_collectedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "samples_collectedById_idx" ON public.samples USING btree ("collectedById");


--
-- TOC entry 5576 (class 1259 OID 111979)
-- Name: samples_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "samples_orderId_idx" ON public.samples USING btree ("orderId");


--
-- TOC entry 5577 (class 1259 OID 111978)
-- Name: samples_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "samples_patientId_idx" ON public.samples USING btree ("patientId");


--
-- TOC entry 5580 (class 1259 OID 111976)
-- Name: samples_sampleNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "samples_sampleNumber_key" ON public.samples USING btree ("sampleNumber");


--
-- TOC entry 5581 (class 1259 OID 111981)
-- Name: samples_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX samples_status_idx ON public.samples USING btree (status);


--
-- TOC entry 5582 (class 1259 OID 111980)
-- Name: samples_testId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "samples_testId_idx" ON public.samples USING btree ("testId");


--
-- TOC entry 5898 (class 1259 OID 138761)
-- Name: settlement_transactions_paymentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "settlement_transactions_paymentId_idx" ON public.settlement_transactions USING btree ("paymentId");


--
-- TOC entry 5901 (class 1259 OID 138760)
-- Name: settlement_transactions_settlementId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "settlement_transactions_settlementId_idx" ON public.settlement_transactions USING btree ("settlementId");


--
-- TOC entry 5894 (class 1259 OID 138757)
-- Name: settlements_provider_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX settlements_provider_idx ON public.settlements USING btree (provider);


--
-- TOC entry 5895 (class 1259 OID 138759)
-- Name: settlements_settlementDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "settlements_settlementDate_idx" ON public.settlements USING btree ("settlementDate");


--
-- TOC entry 5896 (class 1259 OID 138756)
-- Name: settlements_settlementNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "settlements_settlementNumber_key" ON public.settlements USING btree ("settlementNumber");


--
-- TOC entry 5897 (class 1259 OID 138758)
-- Name: settlements_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX settlements_status_idx ON public.settlements USING btree (status);


--
-- TOC entry 5534 (class 1259 OID 111954)
-- Name: test_categories_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX test_categories_code_key ON public.test_categories USING btree (code);


--
-- TOC entry 5535 (class 1259 OID 112296)
-- Name: test_categories_department_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX test_categories_department_idx ON public.test_categories USING btree (department);


--
-- TOC entry 5536 (class 1259 OID 111956)
-- Name: test_categories_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "test_categories_isActive_idx" ON public.test_categories USING btree ("isActive");


--
-- TOC entry 5537 (class 1259 OID 111955)
-- Name: test_categories_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX test_categories_name_idx ON public.test_categories USING btree (name);


--
-- TOC entry 5653 (class 1259 OID 112276)
-- Name: test_package_items_packageId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "test_package_items_packageId_idx" ON public.test_package_items USING btree ("packageId");


--
-- TOC entry 5654 (class 1259 OID 112275)
-- Name: test_package_items_packageId_testId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "test_package_items_packageId_testId_key" ON public.test_package_items USING btree ("packageId", "testId");


--
-- TOC entry 5657 (class 1259 OID 112277)
-- Name: test_package_items_testId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "test_package_items_testId_idx" ON public.test_package_items USING btree ("testId");


--
-- TOC entry 5647 (class 1259 OID 112256)
-- Name: test_packages_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "test_packages_isActive_idx" ON public.test_packages USING btree ("isActive");


--
-- TOC entry 5648 (class 1259 OID 112257)
-- Name: test_packages_isPopular_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "test_packages_isPopular_idx" ON public.test_packages USING btree ("isPopular");


--
-- TOC entry 5649 (class 1259 OID 112254)
-- Name: test_packages_packageCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "test_packages_packageCode_key" ON public.test_packages USING btree ("packageCode");


--
-- TOC entry 5650 (class 1259 OID 112255)
-- Name: test_packages_packageName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "test_packages_packageName_idx" ON public.test_packages USING btree ("packageName");


--
-- TOC entry 5547 (class 1259 OID 111963)
-- Name: test_parameters_parameterName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "test_parameters_parameterName_idx" ON public.test_parameters USING btree ("parameterName");


--
-- TOC entry 5550 (class 1259 OID 111962)
-- Name: test_parameters_testId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "test_parameters_testId_idx" ON public.test_parameters USING btree ("testId");


--
-- TOC entry 5540 (class 1259 OID 111959)
-- Name: tests_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tests_categoryId_idx" ON public.tests USING btree ("categoryId");


--
-- TOC entry 5541 (class 1259 OID 111961)
-- Name: tests_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tests_isActive_idx" ON public.tests USING btree ("isActive");


--
-- TOC entry 5544 (class 1259 OID 111960)
-- Name: tests_sampleType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tests_sampleType_idx" ON public.tests USING btree ("sampleType");


--
-- TOC entry 5545 (class 1259 OID 111957)
-- Name: tests_testCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "tests_testCode_key" ON public.tests USING btree ("testCode");


--
-- TOC entry 5546 (class 1259 OID 111958)
-- Name: tests_testName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tests_testName_idx" ON public.tests USING btree ("testName");


--
-- TOC entry 5663 (class 1259 OID 112362)
-- Name: user_sessions_refreshTokenHash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "user_sessions_refreshTokenHash_key" ON public.user_sessions USING btree ("refreshTokenHash");


--
-- TOC entry 5664 (class 1259 OID 112364)
-- Name: user_sessions_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_sessions_userId_idx" ON public.user_sessions USING btree ("userId");


--
-- TOC entry 5665 (class 1259 OID 112365)
-- Name: user_sessions_userId_revokedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_sessions_userId_revokedAt_idx" ON public.user_sessions USING btree ("userId", "revokedAt");


--
-- TOC entry 5512 (class 1259 OID 111940)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 5513 (class 1259 OID 111939)
-- Name: users_employeeCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "users_employeeCode_key" ON public.users USING btree ("employeeCode");


--
-- TOC entry 5514 (class 1259 OID 111943)
-- Name: users_fullName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_fullName_idx" ON public.users USING btree ("fullName");


--
-- TOC entry 5517 (class 1259 OID 111941)
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- TOC entry 5518 (class 1259 OID 111942)
-- Name: users_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_status_idx ON public.users USING btree (status);


--
-- TOC entry 5867 (class 1259 OID 138743)
-- Name: wallet_transactions_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wallet_transactions_createdAt_idx" ON public.wallet_transactions USING btree ("createdAt");


--
-- TOC entry 5870 (class 1259 OID 138742)
-- Name: wallet_transactions_transactionType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wallet_transactions_transactionType_idx" ON public.wallet_transactions USING btree ("transactionType");


--
-- TOC entry 5871 (class 1259 OID 138741)
-- Name: wallet_transactions_walletId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "wallet_transactions_walletId_idx" ON public.wallet_transactions USING btree ("walletId");


--
-- TOC entry 5820 (class 1259 OID 121751)
-- Name: whatsapp_analytics_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_analytics_date_idx ON public.whatsapp_analytics USING btree (date);


--
-- TOC entry 5821 (class 1259 OID 121752)
-- Name: whatsapp_analytics_date_period_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX whatsapp_analytics_date_period_key ON public.whatsapp_analytics USING btree (date, period);


--
-- TOC entry 5808 (class 1259 OID 121745)
-- Name: whatsapp_auto_reply_rules_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_auto_reply_rules_isActive_idx" ON public.whatsapp_auto_reply_rules USING btree ("isActive");


--
-- TOC entry 5811 (class 1259 OID 121746)
-- Name: whatsapp_auto_reply_rules_triggerType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_auto_reply_rules_triggerType_idx" ON public.whatsapp_auto_reply_rules USING btree ("triggerType");


--
-- TOC entry 5818 (class 1259 OID 121750)
-- Name: whatsapp_campaigns_scheduledFor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_campaigns_scheduledFor_idx" ON public.whatsapp_campaigns USING btree ("scheduledFor");


--
-- TOC entry 5819 (class 1259 OID 121749)
-- Name: whatsapp_campaigns_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_campaigns_status_idx ON public.whatsapp_campaigns USING btree (status);


--
-- TOC entry 5795 (class 1259 OID 113046)
-- Name: whatsapp_conversations_assignedTo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_conversations_assignedTo_idx" ON public.whatsapp_conversations USING btree ("assignedTo");


--
-- TOC entry 5796 (class 1259 OID 113045)
-- Name: whatsapp_conversations_lastMessageAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_conversations_lastMessageAt_idx" ON public.whatsapp_conversations USING btree ("lastMessageAt");


--
-- TOC entry 5797 (class 1259 OID 113042)
-- Name: whatsapp_conversations_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_conversations_patientId_idx" ON public.whatsapp_conversations USING btree ("patientId");


--
-- TOC entry 5798 (class 1259 OID 113043)
-- Name: whatsapp_conversations_phoneNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_conversations_phoneNumber_idx" ON public.whatsapp_conversations USING btree ("phoneNumber");


--
-- TOC entry 5801 (class 1259 OID 113044)
-- Name: whatsapp_conversations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_conversations_status_idx ON public.whatsapp_conversations USING btree (status);


--
-- TOC entry 5787 (class 1259 OID 113041)
-- Name: whatsapp_incoming_messages_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_incoming_messages_createdAt_idx" ON public.whatsapp_incoming_messages USING btree ("createdAt");


--
-- TOC entry 5788 (class 1259 OID 113039)
-- Name: whatsapp_incoming_messages_externalMessageId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_incoming_messages_externalMessageId_idx" ON public.whatsapp_incoming_messages USING btree ("externalMessageId");


--
-- TOC entry 5789 (class 1259 OID 113036)
-- Name: whatsapp_incoming_messages_externalMessageId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "whatsapp_incoming_messages_externalMessageId_key" ON public.whatsapp_incoming_messages USING btree ("externalMessageId");


--
-- TOC entry 5790 (class 1259 OID 113037)
-- Name: whatsapp_incoming_messages_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_incoming_messages_patientId_idx" ON public.whatsapp_incoming_messages USING btree ("patientId");


--
-- TOC entry 5791 (class 1259 OID 113038)
-- Name: whatsapp_incoming_messages_phoneNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_incoming_messages_phoneNumber_idx" ON public.whatsapp_incoming_messages USING btree ("phoneNumber");


--
-- TOC entry 5794 (class 1259 OID 113040)
-- Name: whatsapp_incoming_messages_processed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_incoming_messages_processed_idx ON public.whatsapp_incoming_messages USING btree (processed);


--
-- TOC entry 5812 (class 1259 OID 121747)
-- Name: whatsapp_notification_triggers_eventType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_notification_triggers_eventType_idx" ON public.whatsapp_notification_triggers USING btree ("eventType");


--
-- TOC entry 5813 (class 1259 OID 121748)
-- Name: whatsapp_notification_triggers_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_notification_triggers_isActive_idx" ON public.whatsapp_notification_triggers USING btree ("isActive");


--
-- TOC entry 5780 (class 1259 OID 121757)
-- Name: whatsapp_scheduled_messages_campaignId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_scheduled_messages_campaignId_idx" ON public.whatsapp_scheduled_messages USING btree ("campaignId");


--
-- TOC entry 5781 (class 1259 OID 113032)
-- Name: whatsapp_scheduled_messages_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_scheduled_messages_patientId_idx" ON public.whatsapp_scheduled_messages USING btree ("patientId");


--
-- TOC entry 5782 (class 1259 OID 113035)
-- Name: whatsapp_scheduled_messages_phoneNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_scheduled_messages_phoneNumber_idx" ON public.whatsapp_scheduled_messages USING btree ("phoneNumber");


--
-- TOC entry 5785 (class 1259 OID 113033)
-- Name: whatsapp_scheduled_messages_scheduledFor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_scheduled_messages_scheduledFor_idx" ON public.whatsapp_scheduled_messages USING btree ("scheduledFor");


--
-- TOC entry 5786 (class 1259 OID 113034)
-- Name: whatsapp_scheduled_messages_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_scheduled_messages_status_idx ON public.whatsapp_scheduled_messages USING btree (status);


--
-- TOC entry 5824 (class 1259 OID 121754)
-- Name: whatsapp_sentiments_analyzedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_sentiments_analyzedAt_idx" ON public.whatsapp_sentiments USING btree ("analyzedAt");


--
-- TOC entry 5825 (class 1259 OID 121753)
-- Name: whatsapp_sentiments_conversationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_sentiments_conversationId_idx" ON public.whatsapp_sentiments USING btree ("conversationId");


--
-- TOC entry 5802 (class 1259 OID 121742)
-- Name: whatsapp_templates_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_templates_category_idx ON public.whatsapp_templates USING btree (category);


--
-- TOC entry 5803 (class 1259 OID 121744)
-- Name: whatsapp_templates_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_templates_isActive_idx" ON public.whatsapp_templates USING btree ("isActive");


--
-- TOC entry 5804 (class 1259 OID 121741)
-- Name: whatsapp_templates_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX whatsapp_templates_name_key ON public.whatsapp_templates USING btree (name);


--
-- TOC entry 5807 (class 1259 OID 121743)
-- Name: whatsapp_templates_templateStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "whatsapp_templates_templateStatus_idx" ON public.whatsapp_templates USING btree ("templateStatus");


--
-- TOC entry 5759 (class 1259 OID 113019)
-- Name: worklist_entries_analyzerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "worklist_entries_analyzerId_idx" ON public.worklist_entries USING btree ("analyzerId");


--
-- TOC entry 5760 (class 1259 OID 113020)
-- Name: worklist_entries_barcode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX worklist_entries_barcode_idx ON public.worklist_entries USING btree (barcode);


--
-- TOC entry 5761 (class 1259 OID 113023)
-- Name: worklist_entries_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "worklist_entries_createdAt_idx" ON public.worklist_entries USING btree ("createdAt");


--
-- TOC entry 5764 (class 1259 OID 113022)
-- Name: worklist_entries_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX worklist_entries_priority_idx ON public.worklist_entries USING btree (priority);


--
-- TOC entry 5765 (class 1259 OID 113021)
-- Name: worklist_entries_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX worklist_entries_status_idx ON public.worklist_entries USING btree (status);


--
-- TOC entry 5983 (class 2606 OID 113124)
-- Name: analyzer_alerts analyzer_alerts_analyzerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzer_alerts
    ADD CONSTRAINT "analyzer_alerts_analyzerId_fkey" FOREIGN KEY ("analyzerId") REFERENCES public.analyzers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5984 (class 2606 OID 113129)
-- Name: analyzer_communication_logs analyzer_communication_logs_analyzerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzer_communication_logs
    ADD CONSTRAINT "analyzer_communication_logs_analyzerId_fkey" FOREIGN KEY ("analyzerId") REFERENCES public.analyzers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5982 (class 2606 OID 113119)
-- Name: analyzer_jobs analyzer_jobs_analyzerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzer_jobs
    ADD CONSTRAINT "analyzer_jobs_analyzerId_fkey" FOREIGN KEY ("analyzerId") REFERENCES public.analyzers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5988 (class 2606 OID 113149)
-- Name: analyzer_port_mappings analyzer_port_mappings_analyzerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzer_port_mappings
    ADD CONSTRAINT "analyzer_port_mappings_analyzerId_fkey" FOREIGN KEY ("analyzerId") REFERENCES public.analyzers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5980 (class 2606 OID 113109)
-- Name: analyzer_test_mappings analyzer_test_mappings_analyzerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzer_test_mappings
    ADD CONSTRAINT "analyzer_test_mappings_analyzerId_fkey" FOREIGN KEY ("analyzerId") REFERENCES public.analyzers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5981 (class 2606 OID 113114)
-- Name: analyzer_test_mappings analyzer_test_mappings_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyzer_test_mappings
    ADD CONSTRAINT "analyzer_test_mappings_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5961 (class 2606 OID 112141)
-- Name: approvals approvals_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT "approvals_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5962 (class 2606 OID 112136)
-- Name: approvals approvals_resultId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT "approvals_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES public.results(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5966 (class 2606 OID 112161)
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5976 (class 2606 OID 113089)
-- Name: calibrations calibrations_analyzerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calibrations
    ADD CONSTRAINT "calibrations_analyzerId_fkey" FOREIGN KEY ("analyzerId") REFERENCES public.analyzers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5977 (class 2606 OID 113094)
-- Name: calibrations calibrations_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calibrations
    ADD CONSTRAINT "calibrations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6028 (class 2606 OID 138867)
-- Name: cash_counter_sessions cash_counter_sessions_counterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_counter_sessions
    ADD CONSTRAINT "cash_counter_sessions_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES public.cash_counters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 6029 (class 2606 OID 138872)
-- Name: cash_counter_sessions cash_counter_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_counter_sessions
    ADD CONSTRAINT "cash_counter_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6027 (class 2606 OID 138862)
-- Name: cash_counters cash_counters_assignedUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_counters
    ADD CONSTRAINT "cash_counters_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6030 (class 2606 OID 138877)
-- Name: cash_drawers cash_drawers_counterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_drawers
    ADD CONSTRAINT "cash_drawers_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES public.cash_counters(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6031 (class 2606 OID 138882)
-- Name: cash_movements cash_movements_drawerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT "cash_movements_drawerId_fkey" FOREIGN KEY ("drawerId") REFERENCES public.cash_drawers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6032 (class 2606 OID 138887)
-- Name: cash_movements cash_movements_performedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_movements
    ADD CONSTRAINT "cash_movements_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5985 (class 2606 OID 113134)
-- Name: communication_logs communication_logs_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_logs
    ADD CONSTRAINT "communication_logs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5986 (class 2606 OID 113139)
-- Name: communication_logs communication_logs_sentById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_logs
    ADD CONSTRAINT "communication_logs_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5992 (class 2606 OID 113179)
-- Name: critical_value_acknowledgments critical_value_acknowledgments_acknowledgedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.critical_value_acknowledgments
    ADD CONSTRAINT "critical_value_acknowledgments_acknowledgedBy_fkey" FOREIGN KEY ("acknowledgedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5993 (class 2606 OID 113169)
-- Name: critical_value_acknowledgments critical_value_acknowledgments_resultId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.critical_value_acknowledgments
    ADD CONSTRAINT "critical_value_acknowledgments_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES public.results(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5994 (class 2606 OID 113174)
-- Name: critical_value_acknowledgments critical_value_acknowledgments_resultValueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.critical_value_acknowledgments
    ADD CONSTRAINT "critical_value_acknowledgments_resultValueId_fkey" FOREIGN KEY ("resultValueId") REFERENCES public.result_values(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5995 (class 2606 OID 113184)
-- Name: critical_value_acknowledgments critical_value_acknowledgments_testParameterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.critical_value_acknowledgments
    ADD CONSTRAINT "critical_value_acknowledgments_testParameterId_fkey" FOREIGN KEY ("testParameterId") REFERENCES public.test_parameters(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5948 (class 2606 OID 112091)
-- Name: invoices invoices_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5978 (class 2606 OID 113099)
-- Name: maintenances maintenances_analyzerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "maintenances_analyzerId_fkey" FOREIGN KEY ("analyzerId") REFERENCES public.analyzers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5979 (class 2606 OID 113104)
-- Name: maintenances maintenances_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "maintenances_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5971 (class 2606 OID 112379)
-- Name: mfa_backup_codes mfa_backup_codes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mfa_backup_codes
    ADD CONSTRAINT "mfa_backup_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5987 (class 2606 OID 113144)
-- Name: notification_templates notification_templates_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT "notification_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5941 (class 2606 OID 112061)
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5942 (class 2606 OID 112290)
-- Name: order_items order_items_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public.test_packages(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5943 (class 2606 OID 113059)
-- Name: order_items order_items_testId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_testId_fkey" FOREIGN KEY ("testId") REFERENCES public.tests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5938 (class 2606 OID 112056)
-- Name: orders orders_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5939 (class 2606 OID 112051)
-- Name: orders orders_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public.doctors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5940 (class 2606 OID 112046)
-- Name: orders orders_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5969 (class 2606 OID 112369)
-- Name: password_history password_history_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_history
    ADD CONSTRAINT "password_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 6023 (class 2606 OID 138842)
-- Name: patient_advances patient_advances_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_advances
    ADD CONSTRAINT "patient_advances_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 6024 (class 2606 OID 138847)
-- Name: patient_advances patient_advances_receivedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_advances
    ADD CONSTRAINT "patient_advances_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6014 (class 2606 OID 126240)
-- Name: patient_history_entries patient_history_entries_addedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_history_entries
    ADD CONSTRAINT "patient_history_entries_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6015 (class 2606 OID 126230)
-- Name: patient_history_entries patient_history_entries_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_history_entries
    ADD CONSTRAINT "patient_history_entries_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6016 (class 2606 OID 126235)
-- Name: patient_history_entries patient_history_entries_reportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_history_entries
    ADD CONSTRAINT "patient_history_entries_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES public.reports(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6025 (class 2606 OID 138852)
-- Name: patient_wallets patient_wallets_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_wallets
    ADD CONSTRAINT "patient_wallets_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5932 (class 2606 OID 112026)
-- Name: patients patients_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT "patients_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5933 (class 2606 OID 146675)
-- Name: patients patients_familyHeadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT "patients_familyHeadId_fkey" FOREIGN KEY ("familyHeadId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5934 (class 2606 OID 112021)
-- Name: patients patients_referredById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT "patients_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES public.doctors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6017 (class 2606 OID 138812)
-- Name: payment_allocations payment_allocations_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_allocations
    ADD CONSTRAINT "payment_allocations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 6036 (class 2606 OID 138907)
-- Name: payment_audit_logs payment_audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_audit_logs
    ADD CONSTRAINT "payment_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5949 (class 2606 OID 138792)
-- Name: payments payments_cashDrawerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_cashDrawerId_fkey" FOREIGN KEY ("cashDrawerId") REFERENCES public.cash_drawers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5950 (class 2606 OID 138797)
-- Name: payments payments_corporateAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_corporateAccountId_fkey" FOREIGN KEY ("corporateAccountId") REFERENCES public.corporate_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5951 (class 2606 OID 138787)
-- Name: payments payments_counterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES public.cash_counters(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5952 (class 2606 OID 112096)
-- Name: payments payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5953 (class 2606 OID 112101)
-- Name: payments payments_receivedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5989 (class 2606 OID 113154)
-- Name: qc_rules qc_rules_analyzerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_rules
    ADD CONSTRAINT "qc_rules_analyzerId_fkey" FOREIGN KEY ("analyzerId") REFERENCES public.analyzers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5990 (class 2606 OID 113159)
-- Name: qc_rules qc_rules_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_rules
    ADD CONSTRAINT "qc_rules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6035 (class 2606 OID 138902)
-- Name: reconciliation_records reconciliation_records_reconciledById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reconciliation_records
    ADD CONSTRAINT "reconciliation_records_reconciledById_fkey" FOREIGN KEY ("reconciledById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5937 (class 2606 OID 112041)
-- Name: reference_ranges reference_ranges_parameterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reference_ranges
    ADD CONSTRAINT "reference_ranges_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES public.test_parameters(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 6022 (class 2606 OID 138837)
-- Name: refund_approvals refund_approvals_approverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund_approvals
    ADD CONSTRAINT "refund_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 6018 (class 2606 OID 138822)
-- Name: refunds refunds_approvalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "refunds_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES public.refund_approvals(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6019 (class 2606 OID 138817)
-- Name: refunds refunds_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6020 (class 2606 OID 138827)
-- Name: refunds refunds_processedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "refunds_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6021 (class 2606 OID 138832)
-- Name: refunds refunds_requestedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT "refunds_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6012 (class 2606 OID 126225)
-- Name: report_addendums report_addendums_addedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_addendums
    ADD CONSTRAINT "report_addendums_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6013 (class 2606 OID 138807)
-- Name: report_addendums report_addendums_reportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_addendums
    ADD CONSTRAINT "report_addendums_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES public.reports(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6010 (class 2606 OID 126215)
-- Name: report_share_links report_share_links_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_share_links
    ADD CONSTRAINT "report_share_links_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6011 (class 2606 OID 138802)
-- Name: report_share_links report_share_links_reportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_share_links
    ADD CONSTRAINT "report_share_links_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES public.reports(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5963 (class 2606 OID 112151)
-- Name: reports reports_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "reports_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5964 (class 2606 OID 112146)
-- Name: reports reports_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "reports_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5965 (class 2606 OID 112156)
-- Name: reports reports_publishedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "reports_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5996 (class 2606 OID 113194)
-- Name: result_amendments result_amendments_amendedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_amendments
    ADD CONSTRAINT "result_amendments_amendedBy_fkey" FOREIGN KEY ("amendedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5997 (class 2606 OID 113199)
-- Name: result_amendments result_amendments_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_amendments
    ADD CONSTRAINT "result_amendments_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5998 (class 2606 OID 113189)
-- Name: result_amendments result_amendments_resultId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_amendments
    ADD CONSTRAINT "result_amendments_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES public.results(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5959 (class 2606 OID 112131)
-- Name: result_values result_values_parameterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_values
    ADD CONSTRAINT "result_values_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES public.test_parameters(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5960 (class 2606 OID 112126)
-- Name: result_values result_values_resultId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.result_values
    ADD CONSTRAINT "result_values_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES public.results(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5954 (class 2606 OID 112121)
-- Name: results results_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "results_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5955 (class 2606 OID 112116)
-- Name: results results_enteredById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "results_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5956 (class 2606 OID 112106)
-- Name: results results_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "results_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5957 (class 2606 OID 113084)
-- Name: results results_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "results_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5958 (class 2606 OID 112111)
-- Name: results results_testId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT "results_testId_fkey" FOREIGN KEY ("testId") REFERENCES public.tests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5972 (class 2606 OID 113069)
-- Name: sample_tracking_history sample_tracking_history_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_tracking_history
    ADD CONSTRAINT "sample_tracking_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5973 (class 2606 OID 113074)
-- Name: sample_tracking_history sample_tracking_history_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_tracking_history
    ADD CONSTRAINT "sample_tracking_history_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5974 (class 2606 OID 113079)
-- Name: sample_tracking_history sample_tracking_history_performedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_tracking_history
    ADD CONSTRAINT "sample_tracking_history_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5975 (class 2606 OID 113064)
-- Name: sample_tracking_history sample_tracking_history_sampleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_tracking_history
    ADD CONSTRAINT "sample_tracking_history_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES public.samples(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5944 (class 2606 OID 112086)
-- Name: samples samples_collectedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT "samples_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5945 (class 2606 OID 112076)
-- Name: samples samples_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT "samples_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5946 (class 2606 OID 112071)
-- Name: samples samples_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT "samples_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5947 (class 2606 OID 112081)
-- Name: samples samples_testId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT "samples_testId_fkey" FOREIGN KEY ("testId") REFERENCES public.tests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6033 (class 2606 OID 138897)
-- Name: settlement_transactions settlement_transactions_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlement_transactions
    ADD CONSTRAINT "settlement_transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6034 (class 2606 OID 138892)
-- Name: settlement_transactions settlement_transactions_settlementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlement_transactions
    ADD CONSTRAINT "settlement_transactions_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES public.settlements(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5967 (class 2606 OID 112278)
-- Name: test_package_items test_package_items_packageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_package_items
    ADD CONSTRAINT "test_package_items_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES public.test_packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5968 (class 2606 OID 112283)
-- Name: test_package_items test_package_items_testId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_package_items
    ADD CONSTRAINT "test_package_items_testId_fkey" FOREIGN KEY ("testId") REFERENCES public.tests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5936 (class 2606 OID 112036)
-- Name: test_parameters test_parameters_testId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_parameters
    ADD CONSTRAINT "test_parameters_testId_fkey" FOREIGN KEY ("testId") REFERENCES public.tests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5935 (class 2606 OID 113054)
-- Name: tests tests_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT "tests_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.test_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5970 (class 2606 OID 112374)
-- Name: user_sessions user_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 6026 (class 2606 OID 138857)
-- Name: wallet_transactions wallet_transactions_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public.patient_wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 6005 (class 2606 OID 121773)
-- Name: whatsapp_auto_reply_rules whatsapp_auto_reply_rules_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_auto_reply_rules
    ADD CONSTRAINT "whatsapp_auto_reply_rules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6008 (class 2606 OID 121788)
-- Name: whatsapp_campaigns whatsapp_campaigns_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_campaigns
    ADD CONSTRAINT "whatsapp_campaigns_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6003 (class 2606 OID 113214)
-- Name: whatsapp_conversations whatsapp_conversations_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_conversations
    ADD CONSTRAINT "whatsapp_conversations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6002 (class 2606 OID 113209)
-- Name: whatsapp_incoming_messages whatsapp_incoming_messages_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_incoming_messages
    ADD CONSTRAINT "whatsapp_incoming_messages_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6006 (class 2606 OID 121783)
-- Name: whatsapp_notification_triggers whatsapp_notification_triggers_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_notification_triggers
    ADD CONSTRAINT "whatsapp_notification_triggers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6007 (class 2606 OID 121778)
-- Name: whatsapp_notification_triggers whatsapp_notification_triggers_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_notification_triggers
    ADD CONSTRAINT "whatsapp_notification_triggers_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.whatsapp_templates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5999 (class 2606 OID 121763)
-- Name: whatsapp_scheduled_messages whatsapp_scheduled_messages_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_scheduled_messages
    ADD CONSTRAINT "whatsapp_scheduled_messages_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.whatsapp_campaigns(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6000 (class 2606 OID 113204)
-- Name: whatsapp_scheduled_messages whatsapp_scheduled_messages_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_scheduled_messages
    ADD CONSTRAINT "whatsapp_scheduled_messages_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6001 (class 2606 OID 121758)
-- Name: whatsapp_scheduled_messages whatsapp_scheduled_messages_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_scheduled_messages
    ADD CONSTRAINT "whatsapp_scheduled_messages_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.whatsapp_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6009 (class 2606 OID 121793)
-- Name: whatsapp_sentiments whatsapp_sentiments_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_sentiments
    ADD CONSTRAINT "whatsapp_sentiments_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public.whatsapp_conversations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6004 (class 2606 OID 121768)
-- Name: whatsapp_templates whatsapp_templates_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_templates
    ADD CONSTRAINT "whatsapp_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5991 (class 2606 OID 113164)
-- Name: worklist_entries worklist_entries_analyzerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worklist_entries
    ADD CONSTRAINT "worklist_entries_analyzerId_fkey" FOREIGN KEY ("analyzerId") REFERENCES public.analyzers(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-09-29 16:16:50

--
-- PostgreSQL database dump complete
--

\unrestrict inTHxkaO7Oh6tXhsILpUhMwCbETibykQljFoBacvzeXtppGNY08oZEEhZbrhTC5

