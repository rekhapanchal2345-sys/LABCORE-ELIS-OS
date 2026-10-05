import prisma from "../../lib/prisma";

export interface LaboratorySettingsData {
  id?: string;
  labName?: string;
  labPhone?: string;
  labEmail?: string;
  labAddress?: string;
  labCity?: string;
  labState?: string;
  labPincode?: string;
  labWebsite?: string;
  labSupportEmail?: string;
  labEmergencyPhone?: string;
  // Email
  emailProvider?: string;
  emailApiKey?: string;
  emailApiSecret?: string;
  emailFromEmail?: string;
  emailFromName?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSsl?: boolean;
  emailMaxRetries?: number;
  emailRetryIntervalMinutes?: number;
  emailDailyLimit?: number;
  emailReportEnabled?: boolean;
  emailAppointmentEnabled?: boolean;
  emailCriticalAlertEnabled?: boolean;
  // SMS
  smsProvider?: string;
  smsApiKey?: string;
  smsApiSecret?: string;
  smsSenderId?: string;
  smsDltEntityId?: string;
  smsDltTemplateId?: string;
  smsMaxRetries?: number;
  smsReportEnabled?: boolean;
  smsAppointmentEnabled?: boolean;
  smsCriticalAlertEnabled?: boolean;
  // WhatsApp
  whatsappProvider?: string;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  whatsappWebhookUrl?: string;
  whatsappVerifyToken?: string;
  whatsappBusinessProfileId?: string;
  whatsappAIEnabled?: boolean;
  whatsappTemplateReportId?: string;
  whatsappTemplateAppointmentId?: string;
  whatsappTemplateCriticalId?: string;
  // Voice Calls
  callProvider?: string;
  callApiKey?: string;
  callApiSecret?: string;
  callCallerId?: string;
  callIvrEnabled?: boolean;
  callRecordingEnabled?: boolean;
  // Notifications & Escalation
  notificationCriticalThresholdMinutes?: number;
  notificationEscalationEnabled?: boolean;
  notificationEscalationAfterMinutes?: number;
  notificationEscalationEmail?: string;
  notificationQuietHoursEnabled?: boolean;
  notificationQuietStart?: string;
  notificationQuietEnd?: string;
  notificationBatchEnabled?: boolean;
  notificationBatchIntervalMinutes?: number;
  // DPDP Act 2023
  dpdpConsentEnabled?: boolean;
  dpdpConsentLanguages?: string[];
  dpdpRetentionDays?: number;
  dpdpOptOutSmsEnabled?: boolean;
  dpdpOptOutEmailEnabled?: boolean;
  dpdpOptOutWhatsappEnabled?: boolean;
  dpdpDataFiduciaryName?: string;
  dpdpGrievanceEmail?: string;
  dpdpGrievancePhone?: string;
  // General toggles
  enableAutomatedNotifications?: boolean;
  enablePatientNotifications?: boolean;
  enableDoctorNotifications?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// In-memory fallback cache to ensure zero-downtime even during DB initialisation
let inMemorySettingsCache: LaboratorySettingsData = {
  id: "default-settings",
  labName: "LabCore Enterprise LIS",
  labPhone: "9723561529",
  labEmail: "nikilpanchal5@gmail.com",
  labAddress: "Main Diagnostic Wing, Health City",
  labCity: "Surat",
  labState: "Gujarat",
  labPincode: "395001",
  emailProvider: process.env.EMAIL_PROVIDER || "smtp",
  emailFromEmail: process.env.EMAIL_FROM_EMAIL || "nikilpanchal5@gmail.com",
  emailFromName: process.env.EMAIL_FROM_NAME || "LabCore Enterprise LIS",
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser: process.env.SMTP_USER || "nikilpanchal5@gmail.com",
  smtpSsl: true,
  smsProvider: process.env.SMS_PROVIDER || "custom",
  whatsappProvider: process.env.WHATSAPP_PROVIDER || "custom",
  callProvider: process.env.CALL_PROVIDER || "custom",
  enableAutomatedNotifications: true,
  enablePatientNotifications: true,
  enableDoctorNotifications: false,
  notificationCriticalThresholdMinutes: 15,
  notificationEscalationEnabled: true,
  notificationEscalationAfterMinutes: 30,
  notificationQuietHoursEnabled: false,
  notificationQuietStart: "22:00",
  notificationQuietEnd: "07:00",
  dpdpConsentEnabled: true,
  dpdpConsentLanguages: ["en", "hi"],
  dpdpRetentionDays: 180,
  dpdpOptOutSmsEnabled: true,
  dpdpOptOutEmailEnabled: true,
  dpdpOptOutWhatsappEnabled: true,
};

let tableEnsured = false;

async function ensureSettingsTable(): Promise<void> {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS laboratory_settings (
        id VARCHAR(255) PRIMARY KEY,
        lab_name VARCHAR(255) DEFAULT 'LabCore Enterprise LIS',
        lab_phone VARCHAR(50) DEFAULT '',
        lab_email VARCHAR(255) DEFAULT '',
        lab_address TEXT,
        lab_city VARCHAR(100),
        lab_state VARCHAR(100),
        lab_pincode VARCHAR(20),
        lab_website VARCHAR(255),
        lab_support_email VARCHAR(255),
        lab_emergency_phone VARCHAR(50),
        email_provider VARCHAR(50) DEFAULT 'custom',
        email_api_key TEXT,
        email_api_secret TEXT,
        email_from_email VARCHAR(255),
        email_from_name VARCHAR(255),
        smtp_host VARCHAR(255),
        smtp_port INT DEFAULT 587,
        smtp_user VARCHAR(255),
        smtp_password TEXT,
        smtp_ssl BOOLEAN DEFAULT TRUE,
        email_max_retries INT DEFAULT 3,
        email_retry_interval_minutes INT DEFAULT 5,
        email_daily_limit INT DEFAULT 1000,
        email_report_enabled BOOLEAN DEFAULT TRUE,
        email_appointment_enabled BOOLEAN DEFAULT TRUE,
        email_critical_alert_enabled BOOLEAN DEFAULT TRUE,
        sms_provider VARCHAR(50) DEFAULT 'custom',
        sms_api_key TEXT,
        sms_api_secret TEXT,
        sms_sender_id VARCHAR(50),
        sms_dlt_entity_id VARCHAR(100),
        sms_dlt_template_id VARCHAR(100),
        sms_max_retries INT DEFAULT 2,
        sms_report_enabled BOOLEAN DEFAULT TRUE,
        sms_appointment_enabled BOOLEAN DEFAULT TRUE,
        sms_critical_alert_enabled BOOLEAN DEFAULT TRUE,
        whatsapp_provider VARCHAR(50) DEFAULT 'custom',
        whatsapp_phone_number_id VARCHAR(255),
        whatsapp_access_token TEXT,
        whatsapp_webhook_url TEXT,
        whatsapp_verify_token TEXT,
        whatsapp_business_profile_id VARCHAR(255),
        whatsapp_ai_enabled BOOLEAN DEFAULT FALSE,
        whatsapp_template_report_id VARCHAR(255),
        whatsapp_template_appointment_id VARCHAR(255),
        whatsapp_template_critical_id VARCHAR(255),
        call_provider VARCHAR(50) DEFAULT 'custom',
        call_api_key TEXT,
        call_api_secret TEXT,
        call_caller_id VARCHAR(50),
        call_ivr_enabled BOOLEAN DEFAULT FALSE,
        call_recording_enabled BOOLEAN DEFAULT FALSE,
        notification_critical_threshold_minutes INT DEFAULT 15,
        notification_escalation_enabled BOOLEAN DEFAULT TRUE,
        notification_escalation_after_minutes INT DEFAULT 30,
        notification_escalation_email VARCHAR(255),
        notification_quiet_hours_enabled BOOLEAN DEFAULT FALSE,
        notification_quiet_start VARCHAR(10) DEFAULT '22:00',
        notification_quiet_end VARCHAR(10) DEFAULT '07:00',
        notification_batch_enabled BOOLEAN DEFAULT FALSE,
        notification_batch_interval_minutes INT DEFAULT 60,
        dpdp_consent_enabled BOOLEAN DEFAULT TRUE,
        dpdp_consent_languages TEXT DEFAULT 'en,hi',
        dpdp_retention_days INT DEFAULT 180,
        dpdp_opt_out_sms_enabled BOOLEAN DEFAULT TRUE,
        dpdp_opt_out_email_enabled BOOLEAN DEFAULT TRUE,
        dpdp_opt_out_whatsapp_enabled BOOLEAN DEFAULT TRUE,
        dpdp_data_fiduciary_name VARCHAR(255),
        dpdp_grievance_email VARCHAR(255),
        dpdp_grievance_phone VARCHAR(50),
        enable_automated_notifications BOOLEAN DEFAULT TRUE,
        enable_patient_notifications BOOLEAN DEFAULT TRUE,
        enable_doctor_notifications BOOLEAN DEFAULT FALSE,
        extra_settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure default row exists
    await prisma.$executeRawUnsafe(`
      INSERT INTO laboratory_settings (id, lab_name, lab_phone, lab_email)
      VALUES ('default-settings', 'LabCore Enterprise LIS', '9723561529', 'nikilpanchal5@gmail.com')
      ON CONFLICT (id) DO NOTHING;
    `);

    tableEnsured = true;
  } catch (err) {
    console.warn("Notice: laboratory_settings table creation skipped or non-fatal error:", err);
  }
}

export const getLaboratorySettings = async (): Promise<LaboratorySettingsData> => {
  try {
    await ensureSettingsTable();

    const rows: any = await prisma.$queryRawUnsafe(`SELECT * FROM laboratory_settings LIMIT 1`);
    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (row) {
      const extra = row.extra_settings || {};
      const parsed: LaboratorySettingsData = {
        id: row.id,
        labName: row.lab_name || inMemorySettingsCache.labName,
        labPhone: row.lab_phone || inMemorySettingsCache.labPhone,
        labEmail: row.lab_email || inMemorySettingsCache.labEmail,
        labAddress: row.lab_address,
        labCity: row.lab_city,
        labState: row.lab_state,
        labPincode: row.lab_pincode,
        labWebsite: row.lab_website,
        labSupportEmail: row.lab_support_email,
        labEmergencyPhone: row.lab_emergency_phone,
        emailProvider: row.email_provider || "custom",
        emailApiKey: row.email_api_key,
        emailApiSecret: row.email_api_secret,
        emailFromEmail: row.email_from_email,
        emailFromName: row.email_from_name,
        smtpHost: row.smtp_host,
        smtpPort: row.smtp_port ? Number(row.smtp_port) : 587,
        smtpUser: row.smtp_user,
        smtpPassword: row.smtp_password,
        smtpSsl: row.smtp_ssl ?? true,
        emailMaxRetries: row.email_max_retries ?? 3,
        emailRetryIntervalMinutes: row.email_retry_interval_minutes ?? 5,
        emailDailyLimit: row.email_daily_limit ?? 1000,
        emailReportEnabled: row.email_report_enabled ?? true,
        emailAppointmentEnabled: row.email_appointment_enabled ?? true,
        emailCriticalAlertEnabled: row.email_critical_alert_enabled ?? true,
        smsProvider: row.sms_provider || "custom",
        smsApiKey: row.sms_api_key,
        smsApiSecret: row.sms_api_secret,
        smsSenderId: row.sms_sender_id,
        smsDltEntityId: row.sms_dlt_entity_id,
        smsDltTemplateId: row.sms_dlt_template_id,
        smsMaxRetries: row.sms_max_retries ?? 2,
        smsReportEnabled: row.sms_report_enabled ?? true,
        smsAppointmentEnabled: row.sms_appointment_enabled ?? true,
        smsCriticalAlertEnabled: row.sms_critical_alert_enabled ?? true,
        whatsappProvider: row.whatsapp_provider || "custom",
        whatsappPhoneNumberId: row.whatsapp_phone_number_id,
        whatsappAccessToken: row.whatsapp_access_token,
        whatsappWebhookUrl: row.whatsapp_webhook_url,
        whatsappVerifyToken: row.whatsapp_verify_token,
        whatsappBusinessProfileId: row.whatsapp_business_profile_id,
        whatsappAIEnabled: row.whatsapp_ai_enabled ?? false,
        whatsappTemplateReportId: row.whatsapp_template_report_id,
        whatsappTemplateAppointmentId: row.whatsapp_template_appointment_id,
        whatsappTemplateCriticalId: row.whatsapp_template_critical_id,
        callProvider: row.call_provider || "custom",
        callApiKey: row.call_api_key,
        callApiSecret: row.call_api_secret,
        callCallerId: row.call_caller_id,
        callIvrEnabled: row.call_ivr_enabled ?? false,
        callRecordingEnabled: row.call_recording_enabled ?? false,
        notificationCriticalThresholdMinutes: row.notification_critical_threshold_minutes ?? 15,
        notificationEscalationEnabled: row.notification_escalation_enabled ?? true,
        notificationEscalationAfterMinutes: row.notification_escalation_after_minutes ?? 30,
        notificationEscalationEmail: row.notification_escalation_email,
        notificationQuietHoursEnabled: row.notification_quiet_hours_enabled ?? false,
        notificationQuietStart: row.notification_quiet_start || "22:00",
        notificationQuietEnd: row.notification_quiet_end || "07:00",
        notificationBatchEnabled: row.notification_batch_enabled ?? false,
        notificationBatchIntervalMinutes: row.notification_batch_interval_minutes ?? 60,
        dpdpConsentEnabled: row.dpdp_consent_enabled ?? true,
        dpdpConsentLanguages: typeof row.dpdp_consent_languages === "string" ? row.dpdp_consent_languages.split(",") : ["en", "hi"],
        dpdpRetentionDays: row.dpdp_retention_days ?? 180,
        dpdpOptOutSmsEnabled: row.dpdp_opt_out_sms_enabled ?? true,
        dpdpOptOutEmailEnabled: row.dpdp_opt_out_email_enabled ?? true,
        dpdpOptOutWhatsappEnabled: row.dpdp_opt_out_whatsapp_enabled ?? true,
        dpdpDataFiduciaryName: row.dpdp_data_fiduciary_name,
        dpdpGrievanceEmail: row.dpdp_grievance_email,
        dpdpGrievancePhone: row.dpdp_grievance_phone,
        enableAutomatedNotifications: row.enable_automated_notifications ?? true,
        enablePatientNotifications: row.enable_patient_notifications ?? true,
        enableDoctorNotifications: row.enable_doctor_notifications ?? false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        ...extra,
      };

      // Update in-memory cache
      inMemorySettingsCache = { ...inMemorySettingsCache, ...parsed };
      return parsed;
    }
  } catch (error) {
    console.warn("Database query for laboratory settings failed, using resilient fallback cache:", error);
  }

  return inMemorySettingsCache;
};

export const updateLaboratorySettings = async (data: LaboratorySettingsData): Promise<LaboratorySettingsData> => {
  // Update in-memory cache immediately
  inMemorySettingsCache = {
    ...inMemorySettingsCache,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  try {
    await ensureSettingsTable();

    const languagesStr = Array.isArray(data.dpdpConsentLanguages)
      ? data.dpdpConsentLanguages.join(",")
      : data.dpdpConsentLanguages || "en,hi";

    await prisma.$executeRawUnsafe(`
      UPDATE laboratory_settings
      SET 
        lab_name = COALESCE($1, lab_name),
        lab_phone = COALESCE($2, lab_phone),
        lab_email = COALESCE($3, lab_email),
        lab_address = COALESCE($4, lab_address),
        lab_city = COALESCE($5, lab_city),
        lab_state = COALESCE($6, lab_state),
        lab_pincode = COALESCE($7, lab_pincode),
        email_provider = COALESCE($8, email_provider),
        email_api_key = COALESCE($9, email_api_key),
        email_from_email = COALESCE($10, email_from_email),
        email_from_name = COALESCE($11, email_from_name),
        smtp_host = COALESCE($12, smtp_host),
        smtp_port = COALESCE($13, smtp_port),
        smtp_user = COALESCE($14, smtp_user),
        smtp_password = COALESCE($15, smtp_password),
        sms_provider = COALESCE($16, sms_provider),
        sms_api_key = COALESCE($17, sms_api_key),
        sms_api_secret = COALESCE($18, sms_api_secret),
        sms_sender_id = COALESCE($19, sms_sender_id),
        call_provider = COALESCE($20, call_provider),
        call_api_key = COALESCE($21, call_api_key),
        call_api_secret = COALESCE($22, call_api_secret),
        call_caller_id = COALESCE($23, call_caller_id),
        whatsapp_provider = COALESCE($24, whatsapp_provider),
        whatsapp_phone_number_id = COALESCE($25, whatsapp_phone_number_id),
        whatsapp_access_token = COALESCE($26, whatsapp_access_token),
        whatsapp_webhook_url = COALESCE($27, whatsapp_webhook_url),
        whatsapp_verify_token = COALESCE($28, whatsapp_verify_token),
        whatsapp_business_profile_id = COALESCE($29, whatsapp_business_profile_id),
        whatsapp_ai_enabled = COALESCE($30, whatsapp_ai_enabled),
        extra_settings = COALESCE($31::jsonb, extra_settings),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 'default-settings';
    `,
      data.labName ?? null,
      data.labPhone ?? null,
      data.labEmail ?? null,
      data.labAddress ?? null,
      data.labCity ?? null,
      data.labState ?? null,
      data.labPincode ?? null,
      data.emailProvider ?? null,
      data.emailApiKey ?? null,
      data.emailFromEmail ?? null,
      data.emailFromName ?? null,
      data.smtpHost ?? null,
      data.smtpPort ?? null,
      data.smtpUser ?? null,
      data.smtpPassword ?? null,
      data.smsProvider ?? null,
      data.smsApiKey ?? null,
      data.smsApiSecret ?? null,
      data.smsSenderId ?? null,
      data.callProvider ?? null,
      data.callApiKey ?? null,
      data.callApiSecret ?? null,
      data.callCallerId ?? null,
      data.whatsappProvider ?? null,
      data.whatsappPhoneNumberId ?? null,
      data.whatsappAccessToken ?? null,
      data.whatsappWebhookUrl ?? null,
      data.whatsappVerifyToken ?? null,
      data.whatsappBusinessProfileId ?? null,
      data.whatsappAIEnabled ?? null,
      JSON.stringify({
        labWebsite: data.labWebsite,
        labSupportEmail: data.labSupportEmail,
        labEmergencyPhone: data.labEmergencyPhone,
        emailApiSecret: data.emailApiSecret,
        smtpSsl: data.smtpSsl,
        emailMaxRetries: data.emailMaxRetries,
        emailRetryIntervalMinutes: data.emailRetryIntervalMinutes,
        emailDailyLimit: data.emailDailyLimit,
        emailReportEnabled: data.emailReportEnabled,
        emailAppointmentEnabled: data.emailAppointmentEnabled,
        emailCriticalAlertEnabled: data.emailCriticalAlertEnabled,
        smsDltEntityId: data.smsDltEntityId,
        smsDltTemplateId: data.smsDltTemplateId,
        smsMaxRetries: data.smsMaxRetries,
        smsReportEnabled: data.smsReportEnabled,
        smsAppointmentEnabled: data.smsAppointmentEnabled,
        smsCriticalAlertEnabled: data.smsCriticalAlertEnabled,
        whatsappTemplateReportId: data.whatsappTemplateReportId,
        whatsappTemplateAppointmentId: data.whatsappTemplateAppointmentId,
        whatsappTemplateCriticalId: data.whatsappTemplateCriticalId,
        callIvrEnabled: data.callIvrEnabled,
        callRecordingEnabled: data.callRecordingEnabled,
        notificationCriticalThresholdMinutes: data.notificationCriticalThresholdMinutes,
        notificationEscalationEnabled: data.notificationEscalationEnabled,
        notificationEscalationAfterMinutes: data.notificationEscalationAfterMinutes,
        notificationEscalationEmail: data.notificationEscalationEmail,
        notificationQuietHoursEnabled: data.notificationQuietHoursEnabled,
        notificationQuietStart: data.notificationQuietStart,
        notificationQuietEnd: data.notificationQuietEnd,
        notificationBatchEnabled: data.notificationBatchEnabled,
        notificationBatchIntervalMinutes: data.notificationBatchIntervalMinutes,
        dpdpConsentEnabled: data.dpdpConsentEnabled,
        dpdpConsentLanguages: data.dpdpConsentLanguages,
        dpdpRetentionDays: data.dpdpRetentionDays,
        dpdpOptOutSmsEnabled: data.dpdpOptOutSmsEnabled,
        dpdpOptOutEmailEnabled: data.dpdpOptOutEmailEnabled,
        dpdpOptOutWhatsappEnabled: data.dpdpOptOutWhatsappEnabled,
        dpdpDataFiduciaryName: data.dpdpDataFiduciaryName,
        dpdpGrievanceEmail: data.dpdpGrievanceEmail,
        dpdpGrievancePhone: data.dpdpGrievancePhone,
      })
    );
  } catch (error) {
    console.warn("Could not persist settings to PostgreSQL, held safely in cache:", error);
  }

  return inMemorySettingsCache;
};