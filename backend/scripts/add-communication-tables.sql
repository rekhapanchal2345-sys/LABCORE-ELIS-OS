-- Add communication-related enums and tables to LabCore ELIS database

-- Add enums (PostgreSQL doesn't support enum changes easily, so we'll use check constraints or text with validation)
-- For simplicity, we'll use text fields with check constraints

-- Communication Log Table
CREATE TABLE IF NOT EXISTS communication_logs (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('EMAIL', 'SMS', 'CALL')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED')),
  recipient_contact TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  provider TEXT,
  provider_message_id TEXT,
  error_reason TEXT,
  error_message TEXT,
  metadata JSONB,
  sent_by_id TEXT,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  failed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_communication_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_communication_sender FOREIGN KEY (sent_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for communication_logs
CREATE INDEX IF NOT EXISTS idx_communication_logs_patient_id ON communication_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_type ON communication_logs(type);
CREATE INDEX IF NOT EXISTS idx_communication_logs_status ON communication_logs(status);
CREATE INDEX IF NOT EXISTS idx_communication_logs_sent_by_id ON communication_logs(sent_by_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_created_at ON communication_logs(created_at);

-- Notification Template Table
CREATE TABLE IF NOT EXISTS notification_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'PATIENT_REGISTRATION', 'ORDER_CREATED', 'SAMPLE_COLLECTED', 'SAMPLE_RECEIVED',
    'TEST_COMPLETED', 'RESULT_READY', 'RESULT_APPROVED', 'INVOICE_GENERATED',
    'PAYMENT_RECEIVED', 'APPOINTMENT_SCHEDULED', 'APPOINTMENT_REMINDER'
  )),
  channel TEXT NOT NULL CHECK (channel IN ('EMAIL', 'SMS', 'CALL')),
  subject_template TEXT,
  body_template TEXT NOT NULL,
  variables TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_notification_template_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for notification_templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_event_type ON notification_templates(event_type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_channel ON notification_templates(channel);
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON notification_templates(is_active);

-- Laboratory Settings Table
CREATE TABLE IF NOT EXISTS laboratory_settings (
  id TEXT PRIMARY KEY,
  
  -- Laboratory Contact Information
  lab_name TEXT DEFAULT 'LabCore Enterprise LIS',
  lab_phone VARCHAR(15) NOT NULL,
  lab_email TEXT NOT NULL,
  lab_address TEXT,
  lab_city TEXT,
  lab_state TEXT,
  lab_pincode VARCHAR(10),
  
  -- Communication Provider Configuration
  email_provider TEXT,
  email_api_key TEXT,
  email_from_email TEXT,
  email_from_name TEXT,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_user TEXT,
  smtp_password TEXT,
  
  sms_provider TEXT,
  sms_api_key TEXT,
  sms_api_secret TEXT,
  sms_sender_id TEXT,
  
  call_provider TEXT,
  call_api_key TEXT,
  call_api_secret TEXT,
  call_caller_id TEXT,
  
  -- Notification Settings
  enable_automated_notifications BOOLEAN DEFAULT true,
  enable_patient_notifications BOOLEAN DEFAULT true,
  enable_doctor_notifications BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default laboratory settings
INSERT INTO laboratory_settings (
  id, lab_name, lab_phone, lab_email
) VALUES (
  'default-settings',
  'LabCore Enterprise LIS',
  '9723561529',
  'nikilpanchal5@gmail.com'
) ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_communication_logs_updated_at ON communication_logs;
DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
DROP TRIGGER IF EXISTS update_laboratory_settings_updated_at ON laboratory_settings;

-- Create triggers
CREATE TRIGGER update_communication_logs_updated_at BEFORE UPDATE ON communication_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_laboratory_settings_updated_at BEFORE UPDATE ON laboratory_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Additional indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_communication_logs_status_created_at ON communication_logs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_communication_logs_patient_status ON communication_logs(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_notification_templates_event_active ON notification_templates(event_type, is_active);

-- Function to check if patient communication preferences exist
CREATE OR REPLACE FUNCTION check_patient_communication_preferences()
RETURNS TRIGGER AS $$
BEGIN
    -- This function can be used to validate communication preferences
    -- when sending communications to patients
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to log communication attempts for audit purposes
CREATE OR REPLACE FUNCTION log_communication_attempt()
RETURNS TRIGGER AS $$
BEGIN
    -- Log successful communication attempts to audit log if needed
    IF NEW.status = 'SENT' THEN
        INSERT INTO audit_logs (module, action, record_id, created_at)
        VALUES ('communications', 'sent', NEW.id, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to log communication attempts
DROP TRIGGER IF EXISTS log_communication_sent ON communication_logs;
CREATE TRIGGER log_communication_sent AFTER INSERT OR UPDATE ON communication_logs
    FOR EACH ROW WHEN (NEW.status = 'SENT')
    EXECUTE FUNCTION log_communication_attempt();

-- Function to validate notification template variables
CREATE OR REPLACE FUNCTION validate_template_variables()
RETURNS TRIGGER AS $$
DECLARE
    template_variables TEXT[];
    body_content TEXT;
BEGIN
    -- Ensure that the variables array matches the placeholders in the template
    template_variables := NEW.variables;
    body_content := NEW.body_template;
    
    -- Basic validation: check if variables array is not empty
    IF array_length(template_variables, 1) IS NULL THEN
        RAISE EXCEPTION 'Notification template must have at least one variable';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to validate notification templates before insert/update
DROP TRIGGER IF EXISTS validate_notification_template ON notification_templates;
CREATE TRIGGER validate_notification_template BEFORE INSERT OR UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION validate_template_variables();

-- Add comments to tables for documentation
COMMENT ON TABLE communication_logs IS 'Stores all communication history including emails, SMS, and calls sent to patients';
COMMENT ON TABLE notification_templates IS 'Stores configurable notification templates for automated communications';
COMMENT ON TABLE laboratory_settings IS 'Stores laboratory contact information and communication provider configurations';

-- Add comments to important columns
COMMENT ON COLUMN communication_logs.status IS 'Current status of the communication: PENDING, SENT, DELIVERED, FAILED, or CANCELLED';
COMMENT ON COLUMN communication_logs.provider_message_id IS 'External provider message ID for tracking delivery status';
COMMENT ON COLUMN notification_templates.event_type IS 'Type of event that triggers this notification (e.g., RESULT_READY, ORDER_CREATED)';
COMMENT ON COLUMN laboratory_settings.enable_automated_notifications IS 'Master switch for enabling/disabling all automated notifications';