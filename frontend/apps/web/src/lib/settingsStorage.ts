"use client";

import { AUTH_KEY, USER_KEY, readAuth, writeAuth } from "./auth-storage";
import type { ProfileSettingsData } from "@/components/settings/ProfileSettings";
import type { LaboratorySettingsData } from "@/components/settings/LaboratorySettings";
import type { GeneralSettingsData } from "@/components/settings/GeneralSettings";
import type { BillingSettingsData } from "@/components/settings/BillingSettings";
import type { NotificationSettingsData } from "@/components/settings/NotificationSettings";
import type { SecuritySettingsData } from "@/components/settings/SecuritySettings";
import type { IntegrationSettingsData } from "@/components/settings/IntegrationSettings";
import type { AdvancedSettingsData } from "@/components/settings/AdvancedSettings";
import type { DataRetentionSettingsData } from "@/components/settings/DataRetentionSettings";
import type { BrandingSettingsData } from "@/components/settings/BrandingSettings";
import type { BackupSettingsData } from "@/components/settings/BackupSettings";

/**
 * Enterprise Settings Storage & Synchronization Engine
 * Handles multi-tier persistence (localStorage + API) with cross-component reactivity
 */

export interface SettingsStoreState {
  profile: ProfileSettingsData;
  laboratory: LaboratorySettingsData;
  general: GeneralSettingsData;
  users: Record<string, any>;
  billing: BillingSettingsData;
  notifications: NotificationSettingsData;
  security: SecuritySettingsData;
  integrations: IntegrationSettingsData;
  advanced: AdvancedSettingsData;
  data_retention: DataRetentionSettingsData;
  branding: BrandingSettingsData;
  backup: BackupSettingsData;
}

const SETTINGS_STORAGE_PREFIX = "labcore_settings_";

export const defaultSettings: SettingsStoreState = {
  profile: {
    firstName: "Jaya",
    lastName: "Ashapurama",
    email: "jayaashapurama891@gmail.com",
    phone: "+91 98765 43210",
    designation: "Chief Medical Lab Technologist",
    department: "Pathology",
    profileImage: "",
    signature: "",
    signatureStamp: "SHA256:8f4e2b01c59d9921ef4a",
    signatureDate: new Date().toISOString().split("T")[0],
    registrationNo: "MCI-LAB-2024-8849",
    language: "English",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    timezone: "Asia/Kolkata (IST +5:30)",
    enableEmailNotifications: true,
    enableSmsNotifications: true,
    enablePushNotifications: true,
    darkMode: false,
    compactMode: false,
    showTutorial: false,
    defaultReportTemplate: "nabl_luxury",
    autoApproveResults: false,
    enableCriticalAlerts: true,
    enableDailyDigest: true,
    preferredCommunicationMethod: "email",
    workingHoursStart: "08:30",
    workingHoursEnd: "18:00",
    emergencyContact: "Emergency Lab Helpline",
    emergencyContactPhone: "+91 98765 00112",
  },
  laboratory: {
    labName: "LabCore Diagnostic & Molecular Reference Center",
    legalName: "LabCore Healthcare Private Limited",
    labCode: "LABCORE-REF-01",
    nablAccreditationNo: "MC-4819",
    nablExpiry: "2027-12-31",
    nablStatus: "VERIFIED",
    isoCertification: "ISO 15189:2022 Medical Laboratories",
    capNumber: "CAP-91024-USA",
    icmrId: "ICMR-GJ-MED-049",
    cliaId: "CLIA-99D208119",
    gstin: "24AABCL1234F1Z8",
    accessionPrefix: "ACC-2026-",
    patientPrefix: "PAT-",
    invoicePrefix: "INV-",
    reportPrefix: "RPT-",
    defaultSampleType: "Whole Blood (EDTA)",
    defaultPriority: "Routine",
    autoGeneratePatientId: true,
    autoGenerateAccessionNumber: true,
    autoGenerateInvoiceNumber: true,
    allowDuplicatePatients: false,
    requireResultApproval: true,
    enableCriticalValueAlerts: true,
    criticalValueNotification: true,
    chiefPathologist: "Dr. Vikramaditya Sharma, MD (Pathology)",
    labAddress: "Suite 401-404, Apex Healthcare Tower, CG Road, Ahmedabad, Gujarat 380009",
    contactEmail: "lab.director@labcore-lis.com",
    contactPhone: "+91 79 4001 8800",
  },
  general: {
    laboratoryName: "LabCore Diagnostics & Pathology",
    legalName: "LabCore Healthcare Pvt. Ltd.",
    registrationNumber: "GJ-AHM-MED-2024-912",
    email: "contact@labcore-lis.com",
    phone: "+91 79 4001 8800",
    website: "https://labcore-lis.com",
    address: "Suite 401, Apex Healthcare Tower, CG Road",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380009",
    country: "India",
    timezone: "Asia/Kolkata",
    currency: "INR (₹)",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    language: "English",
    numberFormat: "indian",
    firstDayOfWeek: "monday",
    workingHours: { start: "08:00", end: "20:00" },
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    holidays: [],
  },
  users: {
    allowSelfRegistration: false,
    defaultRole: "Technician",
    sessionTimeoutMinutes: 60,
    enforceMfa: true,
  },
  billing: {
    gstEnabled: true,
    gstPercentage: 18,
    cgstPercentage: 9,
    sgstPercentage: 9,
    igstPercentage: 18,
    taxInclusive: false,
    invoicePrefix: "INV",
    invoiceDueDays: 0,
    allowPartialPayments: true,
    allowCreditBilling: false,
    paymentReceiptRequired: true,
    autoGenerateInvoice: true,
    defaultPaymentMethod: "CASH",
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    inAppEnabled: true,
    resultReady: true,
    resultApproved: true,
    criticalResult: true,
    paymentReceived: true,
    invoiceGenerated: true,
    analyzerOffline: true,
    analyzerError: true,
    failedLogin: true,
    reportGenerated: true,
    recipientEmail: "",
    senderName: "LabCore ELIS",
  },
  security: {
    minPasswordLength: 10,
    passwordExpiryDays: 90,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialCharacter: true,
    twoFactorEnabled: true,
    twoFactorMethod: "app",
    twoFactorRequired: true,
    auditLoginActivity: true,
    auditDataChanges: true,
    deviceFingerprinting: true,
    sessionHijackingProtection: true,
    hipaaCompliantLogging: true,
  },
  integrations: {
    apiEnabled: true,
    apiBaseUrl: "",
    webhookEnabled: false,
    webhookUrl: "",
    hl7Enabled: false,
    astmEnabled: false,
    analyzerAutoSync: true,
    emailProvider: "SMTP",
    smsProvider: "NONE",
  },
  advanced: {
    maintenanceMode: false,
    maintenanceMessage: "System is under maintenance. Please try again later.",
    debugMode: false,
    logLevel: "info",
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "jpg", "jpeg", "png", "doc", "docx"],
    sessionTimeout: 30,
    concurrentLogins: 1,
    apiRateLimit: 1000,
    cacheEnabled: true,
    cacheTtl: 3600,
    enableAuditLogs: true,
    auditLogRetention: 90,
    dataEncryption: true,
    backupEnabled: true,
    backupFrequency: "daily",
    backupRetention: 30,
    autoUpdates: false,
    betaFeatures: false,
    performanceMonitoring: true,
    errorReporting: true,
  },
  data_retention: {
    patientDataRetention: 3650,
    patientDataArchive: true,
    patientDataArchiveDays: 1825,
    resultDataRetention: 3650,
    resultDataArchive: true,
    resultDataArchiveDays: 1825,
    invoiceDataRetention: 2555,
    invoiceDataArchive: true,
    invoiceDataArchiveDays: 1825,
    auditLogRetention: 365,
    auditLogArchive: false,
    auditLogArchiveDays: 90,
    analyzerDataRetention: 365,
    enableAutoPurge: false,
    autoPurgeFrequency: "monthly",
    retainInactivePatients: true,
    inactivePatientDays: 365,
    retainCompletedOrders: true,
    completedOrderDays: 90,
    enableDataExport: true,
    exportFormat: "csv",
    gdprCompliance: false,
    rightToErasure: false,
    dataMinimization: true,
    consentManagement: true,
  },
  branding: {
    brandName: "LabCore Diagnostics",
    primaryColor: "#0f172a",
    accentColor: "#0284c7",
    reportHeaderStyle: "luxury_crest",
    showNablLogoOnReport: true,
    showQrCodeOnReport: true,
    showDigitalSignatureStamp: true,
    reportWatermarkText: "LABCORE CONFIDENTIAL MEDICAL REPORT",
    footerDisclaimer: "This is a computer-verified diagnostic report accredited under ISO 15189:2022 & NABL guidelines.",
    logoUrl: "",
  },
  backup: {
    autoBackupEnabled: true,
    backupFrequency: "Daily at 02:00 AM IST",
    storageDestination: "Encrypted AWS S3 + Local Redundant NAS",
    lastBackupTimestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    retentionCount: 30,
    encryptionAlgorithm: "AES-256-GCM",
  },
};

/**
 * Load settings for a specific category with fallback to defaults
 */
export function getStoredSettings<K extends keyof SettingsStoreState>(
  category: K
): SettingsStoreState[K] {
  if (typeof window === "undefined") {
    return defaultSettings[category];
  }

  try {
    const raw = localStorage.getItem(`${SETTINGS_STORAGE_PREFIX}${category}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultSettings[category],
        ...parsed,
      };
    }
  } catch (err) {
    console.warn(`Error reading ${category} settings from storage:`, err);
  }

  return defaultSettings[category];
}

/**
 * Save settings for a specific category and dispatch change events
 */
export function setStoredSettings<K extends keyof SettingsStoreState>(
  category: K,
  data: Partial<SettingsStoreState[K]>
): SettingsStoreState[K] {
  if (typeof window === "undefined") {
    return { ...defaultSettings[category], ...data };
  }

  try {
    const current = getStoredSettings(category);
    const updated = {
      ...current,
      ...data,
    };

    localStorage.setItem(
      `${SETTINGS_STORAGE_PREFIX}${category}`,
      JSON.stringify(updated)
    );

    // If updating profile, keep labcore_user and labcore_auth synchronized
    if (category === "profile") {
      syncProfileWithAuth(updated);
    }

    // Dispatch global events so UI updates everywhere
    window.dispatchEvent(
      new CustomEvent("labcore:settings-updated", {
        detail: { category, data: updated },
      })
    );

    return updated;
  } catch (err) {
    console.error(`Error saving ${category} settings:`, err);
    return { ...defaultSettings[category], ...data };
  }
}

/**
 * Synchronize profile changes into Auth storage keys
 */
function syncProfileWithAuth(profileData: any) {
  if (typeof window === "undefined") return;

  try {
    const fullName = `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() || profileData.fullName || "Jaya Ashapurama";
    
    // Update labcore_user
    const storedUserRaw = readAuth(USER_KEY);
    let storedUser: any = {};
    if (storedUserRaw) {
      try {
        storedUser = JSON.parse(storedUserRaw);
      } catch (e) {
        storedUser = {};
      }
    }

    const updatedUser = {
      ...storedUser,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      fullName: fullName,
      email: profileData.email || storedUser.email,
      phone: profileData.phone || storedUser.phone,
      designation: profileData.designation,
      department: profileData.department,
      avatar: profileData.profileImage || storedUser.avatar,
      profileImage: profileData.profileImage || storedUser.profileImage,
      signature: profileData.signature,
      signatureStamp: profileData.signatureStamp,
    };

    writeAuth(USER_KEY, JSON.stringify(updatedUser));

    // Update labcore_auth
    const authDataRaw = readAuth(AUTH_KEY);
    if (authDataRaw) {
      try {
        const authData = JSON.parse(authDataRaw);
        if (authData && authData.user) {
          authData.user = {
            ...authData.user,
            ...updatedUser,
          };
          writeAuth(AUTH_KEY, JSON.stringify(authData));
        }
      } catch (e) {
        // ignore
      }
    }

    // Fire profile-updated custom event
    window.dispatchEvent(
      new CustomEvent("labcore:profile-updated", {
        detail: updatedUser,
      })
    );
  } catch (e) {
    console.warn("Failed to sync profile with auth storage:", e);
  }
}
