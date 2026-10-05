export type ID = string;

export type Nullable<T> =
  T | null;

export type ApiStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

export type Status =
  | "active"
  | "inactive"
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "rejected"
  | "approved"
  | "draft";

export type Gender =
  | "male"
  | "female"
  | "other"
  | "unknown";

export type UserRole =
  | "admin"
  | "administrator"
  | "super_admin"
  | "doctor"
  | "pathologist"
  | "lab_technician"
  | "technician"
  | "receptionist"
  | "front_desk"
  | "accountant"
  | "manager"
  | "user";

export type DoctorType =
  | "REFERRING_DOCTOR"
  | "INTERNAL_PATHOLOGIST"
  | "CONSULTANT_PATHOLOGIST";

/* =======================================================
   USER
======================================================= */

export interface Role {
  id: ID;
  name: string;
  code?: string;
  description?: string | null;
  permissions?: Permission[];
}

export interface Permission {
  id: ID;
  name: string;
  code: string;
  description?: string | null;
}

export interface User {
  id: ID;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  role?: UserRole | Role;
  avatar?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

/* =======================================================
   PATIENT
======================================================= */

export interface Patient {
  id: ID;
  patientId?: string;
  mrn?: string;

  firstName: string;
  lastName: string;
  middleName?: string | null;

  name?: string;

  dateOfBirth?: string | null;
  age?: number | null;

  gender: Gender;

  phone?: string | null;
  email?: string | null;

  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;

  bloodGroup?: string | null;

  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  allergies?: string[];
  medicalHistory?: string | null;

  referringDoctorId?: ID | null;
  referringDoctor?: Doctor | null;

  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

/* =======================================================
   DOCTOR
======================================================= */

export interface Doctor {
  id: ID;
  doctorId?: string;

  firstName: string;
  lastName: string;
  middleName?: string | null;

  name?: string;

  email?: string | null;
  phone?: string | null;

  specialization?: string | null;
  qualification?: string | null;

  registrationNumber?: string | null;

  hospital?: string | null;
  clinic?: string | null;

  address?: string | null;

  // Essential LIMS fields
  signatureUrl?: string | null;
  
  // Optional legacy fields (kept for backward compatibility)
  photoUrl?: string | null;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  experience?: number | null;
  consultationFee?: number | null;
  department?: string | null;
  designation?: string | null;

  // New LIMS-specific fields
  doctorType?: DoctorType;
  clinicName?: string | null;
  clinicAddress?: string | null;
  whatsappNumber?: string | null;
  reportDeliveryEmail?: boolean;
  reportDeliveryWhatsApp?: boolean;
  reportDeliveryHardCopy?: boolean;
  reportDeliveryPortal?: boolean;
  enablePortalAccess?: boolean;
  commissionRate?: number;
  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  bankAccountHolderName?: string | null;

  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

/* =======================================================
   TEST CATEGORY
======================================================= */

export interface TestCategory {
  id: ID;
  name: string;
  code?: string;
  description?: string | null;
  department?: string | null;
  color?: string | null;
  icon?: string | null;
  displayOrder?: number | null;

  isActive?: boolean;

  tests?: Test[];

  createdAt?: string;
  updatedAt?: string;
}

/* =======================================================
   LAB TEST
======================================================= */

export type SampleType =
  | "BLOOD"
  | "URINE"
  | "SERUM"
  | "PLASMA"
  | "STOOL"
  | "SWAB"
  | "SPUTUM"
  | "CSF"
  | "TISSUE"
  | "OTHER";

export type DataType =
  | "NUMERIC"
  | "TEXT"
  | "BOOLEAN"
  | "OPTION";

export interface TestParameter {
  id: ID;
  parameterName: string;
  shortName?: string | null;
  unit?: string | null;
  dataType: DataType;
  measurementMethod?: string | null;
  dropdownOptions?: string | null;
  allowRichText?: boolean | null;
  decimalPrecision?: number | null;
  displayOrder?: number | null;
  isRequired?: boolean | null;
  isActive?: boolean | null;

  testId: ID;
  test?: Test;

  referenceRanges?: ReferenceRange[];

  createdAt?: string;
  updatedAt?: string;
}

export interface ReferenceRange {
  id: ID;
  ageGroup?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  minAge?: number | null;
  maxAge?: number | null;
  minAgeUnit?: string | null;
  maxAgeUnit?: string | null;
  criticalLow?: number | null;
  normalLow?: number | null;
  normalHigh?: number | null;
  criticalHigh?: number | null;
  interpretation?: string | null;
  notes?: string | null;
  displayOrder?: number | null;
  isActive?: boolean | null;

  parameterId: ID;
  parameter?: TestParameter;

  createdAt?: string;
  updatedAt?: string;
}

// Extended ReferenceRange with minAge/maxAge for compatibility
export interface ExtendedReferenceRange extends ReferenceRange {
  minAge?: number;
  maxAge?: number;
}

export interface TestPackageItem {
  id: ID;
  packageId: ID;
  package?: TestPackage;
  testId: ID;
  test?: Test;
  testPrice?: number | null;
  discount?: number | null;
  displayOrder?: number | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface TestPackage {
  id: ID;
  packageCode: string;
  packageName: string;
  description?: string | null;
  totalPrice: number;
  offerPrice?: number | null;
  discountPercentage?: number | null;
  gstPercentage?: number | null;
  tatHours?: number | null;
  tatDisplay?: string | null;
  targetAudience?: string | null;
  recommendedFor?: string | null;
  isPopular?: boolean | null;
  displayOrder?: number | null;
  color?: string | null;
  icon?: string | null;
  includesTestsCount?: number | null;
  isActive?: boolean | null;

  items?: TestPackageItem[];

  createdAt?: string;
  updatedAt?: string;
}

export interface Test {
  id: ID;
  testCode: string;
  testName: string;
  shortName?: string | null;

  categoryId?: ID | null;
  category?: TestCategory | null;

  sampleType: SampleType;
  sampleContainer?: string | null;
  sampleVolume?: string | null;
  processingDepartment?: string | null;
  method?: string | null;

  description?: string | null;
  clinicalSignificance?: string | null;
  patientPreparation?: string | null;

  price: number;
  offerPrice?: number | null;
  b2bRate?: number | null;
  gstPercentage?: number | null;

  tatHours?: number | null;
  tatDisplay?: string | null;
  displayOrder?: number | null;

  isActive?: boolean | null;

  parameters?: TestParameter[];

  createdAt?: string;
  updatedAt?: string;
}

export interface LabTest {
  id: ID;
  testId?: string;

  name: string;
  code: string;

  shortName?: string | null;

  categoryId?: ID | null;
  category?: TestCategory | null;

  description?: string | null;

  specimenType?: string | null;
  containerType?: string | null;

  turnaroundTime?: number | null;
  turnaroundUnit?:
    | "minutes"
    | "hours"
    | "days";

  price: number;

  discount?: number;
  tax?: number;

  referenceRange?: string | null;

  unit?: string | null;

  methodology?: string | null;

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
}

/* =======================================================
   ORDER
======================================================= */

export type OrderStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "processing"
  | "completed"
  | "cancelled";

export interface OrderItem {
  id: ID;

  orderId: ID;
  testId: ID;

  test?: LabTest;

  quantity: number;
  price: number;

  discount?: number;
  total: number;

  status?: OrderStatus;
}

export interface Order {
  id: ID;
  orderNumber: string;

  patientId: ID;
  patient?: Patient;

  doctorId?: ID | null;
  doctor?: Doctor | null;

  items: OrderItem[];

  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  paidAmount?: number;
  dueAmount?: number;

  status: OrderStatus;

  priority?:
    | "normal"
    | "urgent"
    | "stat";

  notes?: string | null;

  orderedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* =======================================================
   SAMPLE
======================================================= */

export type SampleStatus =
  | "pending"
  | "collected"
  | "received"
  | "processing"
  | "rejected"
  | "completed";

export interface Sample {
  id: ID;
  sampleNumber: string;

  orderId: ID;
  order?: Order;

  patientId: ID;
  patient?: Patient;

  specimenType: string;
  containerType?: string | null;

  collectionDate?: string | null;
  collectionTime?: string | null;

  receivedAt?: string | null;
  processedAt?: string | null;

  collectedBy?: ID | null;
  receivedBy?: ID | null;

  status: SampleStatus;

  rejectionReason?: string | null;

  notes?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

/* =======================================================
   INVOICE
======================================================= */

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "paid"
  | "partial"
  | "overdue"
  | "cancelled";

export interface InvoiceItem {
  id: ID;
  invoiceId: ID;

  description: string;

  quantity: number;
  unitPrice: number;

  discount?: number;
  tax?: number;

  total: number;
}

export interface Invoice {
  id: ID;
  invoiceNumber: string;

  patientId: ID;
  patient?: Patient;

  orderId?: ID | null;
  order?: Order | null;

  items: InvoiceItem[];

  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  paidAmount: number;
  dueAmount: number;

  status: InvoiceStatus;

  issuedAt?: string;
  dueDate?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

/* =======================================================
   PAYMENT
======================================================= */

export type PaymentMethod =
  | "cash"
  | "card"
  | "upi"
  | "bank_transfer"
  | "online"
  | "cheque";

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

export interface Payment {
  id: ID;
  paymentNumber?: string;

  invoiceId?: ID | null;
  invoice?: Invoice | null;

  patientId?: ID | null;
  patient?: Patient | null;

  amount: number;

  method: PaymentMethod;
  status: PaymentStatus;

  transactionId?: string | null;
  referenceNumber?: string | null;

  notes?: string | null;

  paidAt?: string;

  createdAt?: string;
  updatedAt?: string;
}

/* =======================================================
   RESULT
======================================================= */

export type ResultStatus =
  | "pending"
  | "processing"
  | "entered"
  | "verified"
  | "approved"
  | "released"
  | "rejected";

export interface ResultValue {
  id: ID;

  resultId: ID;
  testId: ID;

  test?: LabTest;

  parameter?: string | null;

  value: string | number;

  unit?: string | null;

  referenceRange?: string | null;

  flag?:
    | "normal"
    | "low"
    | "high"
    | "critical"
    | null;

  remarks?: string | null;
}

export interface Result {
  id: ID;
  resultNumber?: string;

  orderId: ID;
  order?: Order;

  patientId: ID;
  patient?: Patient;

  testId?: ID | null;
  test?: LabTest | null;

  values?: ResultValue[];

  status: ResultStatus;

  technicianId?: ID | null;
  technician?: User | null;

  verifiedBy?: ID | null;
  verifier?: User | null;

  approvedBy?: ID | null;
  approver?: User | null;

  enteredAt?: string | null;
  verifiedAt?: string | null;
  approvedAt?: string | null;
  releasedAt?: string | null;

  remarks?: string | null;

  reportUrl?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

/* =======================================================
   APPROVAL
======================================================= */

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface Approval {
  id: ID;

  resultId: ID;
  result?: Result;

  approvedById?: ID | null;
  approvedBy?: User | null;

  rejectedById?: ID | null;
  rejectedBy?: User | null;

  status: ApprovalStatus;

  remarks?: string | null;
  rejectionReason?: string | null;

  approvedAt?: string | null;
  rejectedAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

/* =======================================================
   REPORT
======================================================= */

export type ReportStatus =
  | "draft"
  | "generating"
  | "generated"
  | "released"
  | "failed";

export interface Report {
  id: ID;
  reportNumber?: string;

  patientId: ID;
  patient?: Patient;

  orderId?: ID | null;
  order?: Order | null;

  resultIds?: ID[];

  status: ReportStatus;

  reportUrl?: string | null;
  pdfUrl?: string | null;

  generatedBy?: ID | null;
  generator?: User | null;

  releasedBy?: ID | null;
  releaser?: User | null;

  generatedAt?: string | null;
  releasedAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

/* =======================================================
   ANALYZER
======================================================= */

export type AnalyzerStatus =
  | "ONLINE"
  | "OFFLINE"
  | "IDLE"
  | "BUSY"
  | "ERROR"
  | "MAINTENANCE"
  | "CALIBRATION_REQUIRED";

export type AnalyzerConnectionType =
  | "NETWORK"
  | "SERIAL"
  | "USB"
  | "BLUETOOTH"
  | "MANUAL";

export type AnalyzerProtocol =
  | "ASTM"
  | "HL7"
  | "HTTP_API"
  | "TCP_IP"
  | "SERIAL_RS232"
  | "VENDOR_SPECIFIC";

export type CalibrationStatus =
  | "VALID"
  | "DUE"
  | "OVERDUE"
  | "FAILED"
  | "IN_PROGRESS";

export type MaintenanceStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "OVERDUE"
  | "CANCELLED";

export type AnalyzerJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "RETRYING";

export type AlertSeverity =
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "CRITICAL";

export interface Analyzer {
  id: ID;

  name: string;
  analyzerId: string;

  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;

  analyzerType?: string | null;
  department?: string | null;
  laboratorySection?: string | null;
  location?: string | null;

  installationDate?: string | null;

  connectionType: AnalyzerConnectionType;
  protocol: AnalyzerProtocol;

  host?: string | null;
  port?: number | null;
  deviceIdentifier?: string | null;
  connectionString?: string | null;

  status: AnalyzerStatus;

  lastCommunicationAt?: string | null;
  lastSuccessfulHeartbeat?: string | null;
  connectionLatency?: number | null;

  isActive: boolean;
  isArchived: boolean;
  archivedAt?: string | null;
  archivedBy?: string | null;

  notes?: string | null;

  createdAt?: string;
  updatedAt?: string;

  // Relations counts
  _count?: {
    calibrations: number;
    maintenances: number;
    jobs: number;
    alerts: number;
  };
}

export interface Calibration {
  id: ID;

  analyzerId: ID;
  analyzer?: Analyzer;

  calibrationDate: string;
  performedBy?: string | null;
  operator?: string | null;

  status: CalibrationStatus;
  outcome?: string | null;
  result?: string | null;

  nextCalibrationDueDate?: string | null;
  nextCalibrationReminderDate?: string | null;

  calibrationType?: string | null;
  reagentsUsed?: string | null;
  notes?: string | null;

  performedAt: string;

  createdBy?: string | null;
  creator?: User | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface Maintenance {
  id: ID;

  analyzerId: ID;
  analyzer?: Analyzer;

  maintenanceType?: string | null;
  scheduledDate?: string | null;
  completedDate?: string | null;

  status: MaintenanceStatus;

  description: string;
  technician?: string | null;
  partsReplaced?: string | null;
  cost?: number | null;
  notes?: string | null;

  createdAt: string;
  updatedAt: string;

  createdBy?: string | null;
  creator?: User | null;
}

export interface AnalyzerTestMapping {
  id: ID;

  analyzerId: ID;
  analyzer?: Analyzer;

  labCoreTestId: ID;
  labCoreTestCode: string;
  labCoreTestName: string;

  analyzerTestCode: string;
  analyzerTestName?: string | null;

  unit?: string | null;
  referenceRange?: string | null;
  sampleType?: string | null;

  isActive: boolean;
  isValid: boolean;

  createdAt: string;
  updatedAt: string;

  createdBy?: string | null;
  creator?: User | null;
}

export interface AnalyzerJob {
  id: ID;

  analyzerId: ID;
  analyzer?: Analyzer;

  jobId: string;
  orderId?: string | null;
  orderNumber?: string | null;
  sampleId?: string | null;
  sampleNumber?: string | null;
  barcode?: string | null;

  testId?: string | null;
  testCode?: string | null;
  testName?: string | null;
  analyzerTestCode?: string | null;

  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;

  status: AnalyzerJobStatus;

  progressPercentage?: number | null;
  currentStep?: string | null;

  errorMessage?: string | null;
  errorDetails?: any;

  retryCount: number;
  maxRetries: number;

  resultId?: string | null;
  resultReceived: boolean;
  resultReceivedAt?: string | null;

  priority?: string | null;
}

export interface AnalyzerAlert {
  id: ID;

  analyzerId: ID;
  analyzer?: Analyzer;

  alertType: string;
  severity: AlertSeverity;

  title: string;
  message: string;

  isAcknowledged: boolean;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;

  isResolved: boolean;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;

  createdAt: string;
  updatedAt: string;

  metadata?: any;
}

export interface AnalyzerCommunicationLog {
  id: ID;

  analyzerId: ID;
  analyzer?: Analyzer;

  direction: string;
  messageType: string;
  protocol: AnalyzerProtocol;

  payload: string;
  parsedData?: any;

  status: string;
  errorMessage?: string | null;

  responseTime?: number | null;
  connectionLatency?: number | null;

  createdAt: string;
}

export interface AnalyzerHealth {
  total: number;
  online: number;
  offline: number;
  busy: number;
  error: number;
  maintenance: number;
  pendingJobs: number;
  failedJobs: number;
  unresolvedAlerts: number;
  criticalAlerts: number;
}

/* =======================================================
   DASHBOARD
======================================================= */

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalTests: number;
  totalOrders: number;

  pendingSamples: number;
  pendingResults: number;
  pendingApprovals: number;

  todayRevenue: number;
  monthlyRevenue: number;

  overdueInvoices: number;

  activeAnalyzers: number;
  offlineAnalyzers: number;
}

export interface DashboardActivity {
  id: ID;

  type:
    | "patient"
    | "order"
    | "sample"
    | "result"
    | "payment"
    | "report";

  title: string;
  description?: string;

  timestamp: string;

  user?: User | null;
}

/* =======================================================
   PAGINATION
======================================================= */

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

/* =======================================================
   API RESPONSE
======================================================= */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
}

export interface ApiError {
  success: false;
  message: string;
  error?: unknown;
  statusCode?: number;
}

/* =======================================================
   TABLE / FILTER
======================================================= */

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DateRange {
  from?: string;
  to?: string;
}

export interface FilterParams
  extends PaginationParams {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

/* =======================================================
   FORM TYPES
======================================================= */

export interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender: "" | "MALE" | "FEMALE" | "OTHER";
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  referringDoctorId?: string;
}

export interface DoctorFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialization?: string;
  qualification?: string;
  registrationNumber?: string;
  hospital?: string;
  clinic?: string;
  // New LIMS-specific fields
  doctorType?: DoctorType;
  clinicName?: string;
  clinicAddress?: string;
  whatsappNumber?: string;
  reportDeliveryEmail?: boolean;
  reportDeliveryWhatsApp?: boolean;
  reportDeliveryHardCopy?: boolean;
  reportDeliveryPortal?: boolean;
  enablePortalAccess?: boolean;
  commissionRate?: number;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankAccountHolderName?: string;
}

export interface TestFormData {
  testCode: string;
  testName: string;
  shortName?: string;
  categoryId?: string;
  sampleType: SampleType;
  sampleContainer?: string;
  sampleVolume?: string;
  processingDepartment?: string;
  method?: string;
  description?: string;
  clinicalSignificance?: string;
  patientPreparation?: string;
  price: number;
  offerPrice?: number;
  b2bRate?: number;
  gstPercentage?: number;
  tatHours?: number;
  tatDisplay?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface TestCategoryFormData {
  code: string;
  name: string;
  description?: string;
  department?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface TestPackageFormData {
  packageCode: string;
  packageName: string;
  description?: string;
  totalPrice: number;
  offerPrice?: number;
  discountPercentage?: number;
  gstPercentage?: number;
  tatHours?: number;
  tatDisplay?: string;
  targetAudience?: string;
  recommendedFor?: string;
  isPopular?: boolean;
  displayOrder?: number;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface TestParameterFormData {
  parameterName: string;
  shortName?: string;
  unit?: string;
  dataType: DataType;
  measurementMethod?: string;
  dropdownOptions?: string;
  allowRichText?: boolean;
  decimalPrecision?: number;
  displayOrder?: number;
  isRequired?: boolean;
}

export interface ReferenceRangeFormData {
  ageGroup?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  minAge?: number;
  maxAge?: number;
  minAgeUnit?: string;
  maxAgeUnit?: string;
  criticalLow?: number;
  normalLow?: number;
  normalHigh?: number;
  criticalHigh?: number;
  interpretation?: string;
  notes?: string;
  displayOrder?: number;
}

export interface TestCatalog {
  categories: TestCategory[];
  tests: Test[];
  parameters: TestParameter[];
  referenceRanges: ReferenceRange[];
  packages: TestPackage[];
  exportedAt: string;
  version: string;
}

export interface CatalogImportResult {
  categories: { created: number; errors: string[] };
  tests: { created: number; errors: string[] };
  parameters: { created: number; errors: string[] };
  referenceRanges: { created: number; errors: string[] };
  packages: { created: number; errors: string[] };
}

/* =======================================================
   NAVIGATION
======================================================= */

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
  roles?: UserRole[];
}

/* =======================================================
   NOTIFICATIONS
======================================================= */

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error";

export interface Notification {
  id: ID;

  title: string;
  message: string;

  type: NotificationType;

  read: boolean;

  href?: string | null;

  createdAt: string;
}

/* =======================================================
   AUDIT
======================================================= */

export interface AuditLog {
  id: ID;

  userId?: ID | null;
  user?: User | null;

  action: string;
  entity: string;
  entityId?: ID | null;

  description?: string | null;

  ipAddress?: string | null;
  userAgent?: string | null;

  createdAt: string;
}

/* =======================================================
   SETTINGS
======================================================= */

export interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  profileImage: string;
  signature: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  enablePushNotifications: boolean;
  darkMode: boolean;
  compactMode: boolean;
  showTutorial: boolean;
}

export interface GeneralSettings {
  laboratoryName: string;
  legalName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  numberFormat: string;
  firstDayOfWeek: string;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
  holidays: string[];
}

export interface LaboratorySettings {
  labCode: string;
  accessionPrefix: string;
  patientPrefix: string;
  invoicePrefix: string;
  reportPrefix: string;
  defaultSampleType: string;
  defaultPriority: string;
  autoGeneratePatientId: boolean;
  autoGenerateAccessionNumber: boolean;
  autoGenerateInvoiceNumber: boolean;
  allowDuplicatePatients: boolean;
  requireResultApproval: boolean;
  enableCriticalValueAlerts: boolean;
  criticalValueNotification: boolean;
}

export interface SecuritySettings {
  minPasswordLength: number;
  passwordExpiryDays: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialCharacter: boolean;
  enforcePasswordHistory: boolean;
  passwordHistoryCount: number;
  twoFactorEnabled: boolean;
  twoFactorMethod: "sms" | "email" | "app" | "all";
  twoFactorRequired: boolean;
  auditLoginActivity: boolean;
  auditDataChanges: boolean;
  ipWhitelistEnabled: boolean;
  ipWhitelist: string[];
  deviceFingerprinting: boolean;
  sessionHijackingProtection: boolean;
  ssoEnabled: boolean;
  ssoProvider: string;
  ssoConfig: string;
  ldapEnabled: boolean;
  ldapServer: string;
  ldapPort: number;
  ldapBaseDn: string;
  captchaEnabled: boolean;
  captchaOnLogin: boolean;
  captchaOnSensitiveActions: boolean;
  apiKeyEnabled: boolean;
  apiKeyExpiry: number;
  enforceStrongPassword: boolean;
  preventPasswordReuse: boolean;
  passwordReuseCount: number;
  accountRecoveryEnabled: boolean;
  recoveryMethod: "email" | "sms" | "security_questions";
  securityQuestionsEnabled: boolean;
  biometricAuthEnabled: boolean;
}

export interface BillingSettings {
  gstEnabled: boolean;
  gstPercentage: number;
  cgstPercentage: number;
  sgstPercentage: number;
  igstPercentage: number;
  taxInclusive: boolean;
  invoicePrefix: string;
  invoiceDueDays: number;
  allowPartialPayments: boolean;
  allowCreditBilling: boolean;
  paymentReceiptRequired: boolean;
  autoGenerateInvoice: boolean;
  defaultPaymentMethod: string;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  resultReady: boolean;
  resultApproved: boolean;
  criticalResult: boolean;
  paymentReceived: boolean;
  invoiceGenerated: boolean;
  analyzerOffline: boolean;
  analyzerError: boolean;
  failedLogin: boolean;
  reportGenerated: boolean;
  recipientEmail: string;
  senderName: string;
}

export interface IntegrationSettings {
  apiEnabled: boolean;
  apiBaseUrl: string;
  webhookEnabled: boolean;
  webhookUrl: string;
  hl7Enabled: boolean;
  astmEnabled: boolean;
  analyzerAutoSync: boolean;
  emailProvider: string;
  smsProvider: string;
}

export interface AdvancedSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  debugMode: boolean;
  logLevel: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  concurrentLogins: number;
  apiRateLimit: number;
  cacheEnabled: boolean;
  cacheTtl: number;
  enableAuditLogs: boolean;
  auditLogRetention: number;
  dataEncryption: boolean;
  backupEnabled: boolean;
  backupFrequency: string;
  backupRetention: number;
  autoUpdates: boolean;
  betaFeatures: boolean;
  performanceMonitoring: boolean;
  errorReporting: boolean;
}

export interface DataRetentionSettings {
  patientDataRetention: number;
  patientDataArchive: boolean;
  patientDataArchiveDays: number;
  resultDataRetention: number;
  resultDataArchive: boolean;
  resultDataArchiveDays: number;
  invoiceDataRetention: number;
  invoiceDataArchive: boolean;
  invoiceDataArchiveDays: number;
  auditLogRetention: number;
  auditLogArchive: boolean;
  auditLogArchiveDays: number;
  analyzerDataRetention: number;
  enableAutoPurge: boolean;
  autoPurgeFrequency: string;
  retainInactivePatients: boolean;
  inactivePatientDays: number;
  retainCompletedOrders: boolean;
  completedOrderDays: number;
  enableDataExport: boolean;
  exportFormat: string;
  gdprCompliance: boolean;
  rightToErasure: boolean;
  dataMinimization: boolean;
  consentManagement: boolean;
}

export interface BrandingSettings {
  customLogo: string;
  logoType: "image" | "text";
  logoText: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  customCss: string;
  favicon: string;
  loginBanner: string;
  loginMessage: string;
  reportHeader: string;
  reportFooter: string;
  reportLogo: string;
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkOpacity: number;
  customEmailTemplate: boolean;
  emailHeader: string;
  emailFooter: string;
  whiteLabelMode: boolean;
  hidePoweredBy: boolean;
  customDomain: string;
}

export interface BackupSettings {
  autoBackupEnabled: boolean;
  backupFrequency: "hourly" | "daily" | "weekly" | "monthly";
  backupTime: string;
  backupRetention: number;
  backupLocation: "local" | "cloud" | "both";
  cloudProvider: string;
  cloudBucket: string;
  cloudCredentials: string;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  encryptionKey: string;
  includeAttachments: boolean;
  includeAuditLogs: boolean;
  backupNotification: boolean;
  backupEmail: string;
  lastBackup: string;
  lastBackupSize: string;
  backupStatus: "success" | "failed" | "in_progress" | "none";
  scheduledBackups: string[];
  manualBackupInProgress: boolean;
  restoreInProgress: boolean;
}

export interface UserRolePermission {
  role: string;
  description: string;
  permissions: string[];
  enabled: boolean;
}