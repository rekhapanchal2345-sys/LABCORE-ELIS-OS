import prisma from "../../lib/prisma";

interface LaboratorySettingsInput {
  labName?: string;
  labPhone?: string;
  labEmail?: string;
  labAddress?: string;
  labCity?: string;
  labState?: string;
  labPincode?: string;
  emailProvider?: string;
  emailApiKey?: string;
  emailFromEmail?: string;
  emailFromName?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smsProvider?: string;
  smsApiKey?: string;
  smsApiSecret?: string;
  smsSenderId?: string;
  callProvider?: string;
  callApiKey?: string;
  callApiSecret?: string;
  callCallerId?: string;
  enableAutomatedNotifications?: boolean;
  enablePatientNotifications?: boolean;
  enableDoctorNotifications?: boolean;
}

export const getLaboratorySettings = async () => {
  let settings = await prisma.$queryRaw`SELECT * FROM laboratory_settings LIMIT 1`;
  
  if (!settings || (Array.isArray(settings) && settings.length === 0)) {
    // Create default settings if none exist
    settings = await prisma.$queryRaw`
      INSERT INTO laboratory_settings (id, lab_name, lab_phone, lab_email)
      VALUES ('default-settings', 'LabCore Enterprise LIS', '9723561529', 'nikilpanchal5@gmail.com')
      RETURNING *
    `;
  }
  
  // Handle array or single object result
  const settingsArray = Array.isArray(settings) ? settings : [settings];
  const settingsData = settingsArray[0];
  
  // Convert snake_case to camelCase for API response
  return {
    id: settingsData.id,
    labName: settingsData.lab_name,
    labPhone: settingsData.lab_phone,
    labEmail: settingsData.lab_email,
    labAddress: settingsData.lab_address,
    labCity: settingsData.lab_city,
    labState: settingsData.lab_state,
    labPincode: settingsData.lab_pincode,
    emailProvider: settingsData.email_provider,
    emailApiKey: settingsData.email_api_key,
    emailFromEmail: settingsData.email_from_email,
    emailFromName: settingsData.email_from_name,
    smtpHost: settingsData.smtp_host,
    smtpPort: settingsData.smtp_port,
    smtpUser: settingsData.smtp_user,
    smtpPassword: settingsData.smtp_password,
    smsProvider: settingsData.sms_provider,
    smsApiKey: settingsData.sms_api_key,
    smsApiSecret: settingsData.sms_api_secret,
    smsSenderId: settingsData.sms_sender_id,
    callProvider: settingsData.call_provider,
    callApiKey: settingsData.call_api_key,
    callApiSecret: settingsData.call_api_secret,
    callCallerId: settingsData.call_caller_id,
    enableAutomatedNotifications: settingsData.enable_automated_notifications,
    enablePatientNotifications: settingsData.enable_patient_notifications,
    enableDoctorNotifications: settingsData.enable_doctor_notifications,
    createdAt: settingsData.created_at,
    updatedAt: settingsData.updated_at,
  };
};

export const updateLaboratorySettings = async (data: LaboratorySettingsInput) => {
  const result = await prisma.$queryRaw`
    UPDATE laboratory_settings
    SET 
      lab_name = COALESCE(${data.labName || null}, lab_name),
      lab_phone = COALESCE(${data.labPhone || null}, lab_phone),
      lab_email = COALESCE(${data.labEmail || null}, lab_email),
      lab_address = COALESCE(${data.labAddress || null}, lab_address),
      lab_city = COALESCE(${data.labCity || null}, lab_city),
      lab_state = COALESCE(${data.labState || null}, lab_state),
      lab_pincode = COALESCE(${data.labPincode || null}, lab_pincode),
      email_provider = COALESCE(${data.emailProvider || null}, email_provider),
      email_api_key = COALESCE(${data.emailApiKey || null}, email_api_key),
      email_from_email = COALESCE(${data.emailFromEmail || null}, email_from_email),
      email_from_name = COALESCE(${data.emailFromName || null}, email_from_name),
      smtp_host = COALESCE(${data.smtpHost || null}, smtp_host),
      smtp_port = COALESCE(${data.smtpPort || null}, smtp_port),
      smtp_user = COALESCE(${data.smtpUser || null}, smtp_user),
      smtp_password = COALESCE(${data.smtpPassword || null}, smtp_password),
      sms_provider = COALESCE(${data.smsProvider || null}, sms_provider),
      sms_api_key = COALESCE(${data.smsApiKey || null}, sms_api_key),
      sms_api_secret = COALESCE(${data.smsApiSecret || null}, sms_api_secret),
      sms_sender_id = COALESCE(${data.smsSenderId || null}, sms_sender_id),
      call_provider = COALESCE(${data.callProvider || null}, call_provider),
      call_api_key = COALESCE(${data.callApiKey || null}, call_api_key),
      call_api_secret = COALESCE(${data.callApiSecret || null}, call_api_secret),
      call_caller_id = COALESCE(${data.callCallerId || null}, call_caller_id),
      enable_automated_notifications = COALESCE(${data.enableAutomatedNotifications !== undefined ? data.enableAutomatedNotifications : null}, enable_automated_notifications),
      enable_patient_notifications = COALESCE(${data.enablePatientNotifications !== undefined ? data.enablePatientNotifications : null}, enable_patient_notifications),
      enable_doctor_notifications = COALESCE(${data.enableDoctorNotifications !== undefined ? data.enableDoctorNotifications : null}, enable_doctor_notifications),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 'default-settings'
    RETURNING *
  `;
  
  const resultArray = Array.isArray(result) ? result : [result];
  const settingsData = resultArray[0];
  
  // Convert snake_case to camelCase for API response
  return {
    id: settingsData.id,
    labName: settingsData.lab_name,
    labPhone: settingsData.lab_phone,
    labEmail: settingsData.lab_email,
    labAddress: settingsData.lab_address,
    labCity: settingsData.lab_city,
    labState: settingsData.lab_state,
    labPincode: settingsData.lab_pincode,
    emailProvider: settingsData.email_provider,
    emailApiKey: settingsData.email_api_key,
    emailFromEmail: settingsData.email_from_email,
    emailFromName: settingsData.email_from_name,
    smtpHost: settingsData.smtp_host,
    smtpPort: settingsData.smtp_port,
    smtpUser: settingsData.smtp_user,
    smtpPassword: settingsData.smtp_password,
    smsProvider: settingsData.sms_provider,
    smsApiKey: settingsData.sms_api_key,
    smsApiSecret: settingsData.sms_api_secret,
    smsSenderId: settingsData.sms_sender_id,
    callProvider: settingsData.call_provider,
    callApiKey: settingsData.call_api_key,
    callApiSecret: settingsData.call_api_secret,
    callCallerId: settingsData.call_caller_id,
    enableAutomatedNotifications: settingsData.enable_automated_notifications,
    enablePatientNotifications: settingsData.enable_patient_notifications,
    enableDoctorNotifications: settingsData.enable_doctor_notifications,
    createdAt: settingsData.created_at,
    updatedAt: settingsData.updated_at,
  };
};