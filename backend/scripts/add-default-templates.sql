-- Add default notification templates for LabCore ELIS

-- Email Templates
INSERT INTO notification_templates (id, name, description, event_type, channel, subject_template, body_template, variables, is_active) VALUES
(
  'default-patient-registration-email',
  'Patient Registration Email',
  'Email sent when a new patient is registered',
  'PATIENT_REGISTRATION',
  'EMAIL',
  'Welcome to {{labName}} - Your Registration is Complete',
  'Dear {{patientName},

Welcome to {{labName}}! Your patient registration has been successfully completed.

Your Patient Details:
- UHID: {{uhid}}
- Registration Date: {{registrationDate}}

We are committed to providing you with the highest quality laboratory services. If you have any questions or need assistance, please don''t hesitate to contact us.

Contact Information:
- Phone: {{labPhone}}
- Email: {{labEmail}}

Thank you for choosing {{labName}}.

Best regards,
{{labName}} Team',
  ARRAY['patientName', 'labName', 'uhid', 'registrationDate', 'labPhone', 'labEmail'],
  true
),
(
  'default-order-created-email',
  'Order Created Email',
  'Email sent when a new laboratory order is created',
  'ORDER_CREATED',
  'EMAIL',
  'Your Laboratory Order has been Created - Order #{{orderNumber}}',
  'Dear {{patientName},

Your laboratory order has been successfully created.

Order Details:
- Order Number: {{orderNumber}}
- Order Date: {{orderDate}}
- Tests Ordered: {{testNames}}

Next Steps:
1. Please follow any preparation instructions provided by your doctor
2. Visit our laboratory for sample collection
3. You will be notified when your results are ready

If you have any questions, please contact us at {{labPhone}}.

Best regards,
{{labName}} Team',
  ARRAY['patientName', 'orderNumber', 'orderDate', 'testNames', 'labPhone', 'labName'],
  true
),
(
  'default-result-ready-email',
  'Result Ready Email',
  'Email sent when test results are ready',
  'RESULT_READY',
  'EMAIL',
  'Your Laboratory Results are Ready - {{labName}}',
  'Dear {{patientName},

Your laboratory test results are now ready for viewing.

Report Details:
- Order Number: {{orderNumber}}
- Report Date: {{reportDate}}
- Tests: {{testNames}}

You can view your complete report by:
1. Logging into your patient portal
2. Visiting our laboratory with your UHID: {{uhid}}

If you have any questions about your results, please consult your referring doctor or contact us at {{labPhone}}.

Best regards,
{{labName}} Team',
  ARRAY['patientName', 'orderNumber', 'reportDate', 'testNames', 'uhid', 'labPhone', 'labName'],
  true
),
(
  'default-payment-received-email',
  'Payment Received Email',
  'Email sent when payment is received',
  'PAYMENT_RECEIVED',
  'EMAIL',
  'Payment Received - Invoice #{{invoiceNumber}}',
  'Dear {{patientName},

Thank you for your payment.

Payment Details:
- Invoice Number: {{invoiceNumber}}
- Amount Received: {{amount}}
- Payment Date: {{paymentDate}}
- Payment Method: {{paymentMethod}}

Your payment has been successfully processed. If you have any questions, please contact us at {{labPhone}}.

Best regards,
{{labName}} Team',
  ARRAY['patientName', 'invoiceNumber', 'amount', 'paymentDate', 'paymentMethod', 'labPhone', 'labName'],
  true
);

-- SMS Templates
INSERT INTO notification_templates (id, name, description, event_type, channel, subject_template, body_template, variables, is_active) VALUES
(
  'default-order-created-sms',
  'Order Created SMS',
  'SMS sent when a new laboratory order is created',
  'ORDER_CREATED',
  'SMS',
  NULL,
  'Hi {{patientName}}, your lab order #{{orderNumber}} has been created. Tests: {{testNames}}. Visit {{labName}} for sample collection. Call {{labPhone}} for queries.',
  ARRAY['patientName', 'orderNumber', 'testNames', 'labName', 'labPhone'],
  true
),
(
  'default-result-ready-sms',
  'Result Ready SMS',
  'SMS sent when test results are ready',
  'RESULT_READY',
  'SMS',
  NULL,
  'Hi {{patientName}}, your lab results for order #{{orderNumber}} are ready. Log in to patient portal or visit {{labName}} with UHID {{uhid}}. Call {{labPhone}} for details.',
  ARRAY['patientName', 'orderNumber', 'uhid', 'labName', 'labPhone'],
  true
),
(
  'default-sample-collection-reminder-sms',
  'Sample Collection Reminder SMS',
  'SMS reminder for sample collection',
  'APPOINTMENT_REMINDER',
  'SMS',
  NULL,
  'Hi {{patientName}}, reminder: Sample collection tomorrow at {{collectionTime}} for order #{{orderNumber}}. Fast if required. Bring ID & prescription. Call {{labPhone}} to reschedule.',
  ARRAY['patientName', 'collectionTime', 'orderNumber', 'labPhone'],
  true
),
(
  'default-payment-reminder-sms',
  'Payment Reminder SMS',
  'SMS reminder for pending payment',
  'INVOICE_GENERATED',
  'SMS',
  NULL,
  'Hi {{patientName}}, payment of ₹{{amount}} due for invoice #{{invoiceNumber}} by {{dueDate}}. Pay at {{labName}} or call {{labPhone}} for payment options.',
  ARRAY['patientName', 'amount', 'invoiceNumber', 'dueDate', 'labName', 'labPhone'],
  true
);

-- Call Scripts (for CALL channel)
INSERT INTO notification_templates (id, name, description, event_type, channel, subject_template, body_template, variables, is_active) VALUES
(
  'default-result-ready-call-script',
  'Result Ready Call Script',
  'Script for calling patients when results are ready',
  'RESULT_READY',
  'CALL',
  NULL,
  'Hello, may I speak with {{patientName}}? This is {{labName}} calling to inform you that your laboratory test results for order #{{orderNumber}} are now ready. You can view your results by logging into your patient portal or visiting our laboratory with your UHID {{uhid}}. If you have any questions, please call us at {{labPhone}}. Thank you.',
  ARRAY['patientName', 'orderNumber', 'uhid', 'labName', 'labPhone'],
  true
),
(
  'default-appointment-reminder-call-script',
  'Appointment Reminder Call Script',
  'Script for calling patients for appointment reminders',
  'APPOINTMENT_REMINDER',
  'CALL',
  NULL,
  'Hello, may I speak with {{patientName}}? This is {{labName}} calling to remind you about your sample collection appointment tomorrow at {{collectionTime}} for order #{{orderNumber}}. Please follow any preparation instructions and bring your ID and prescription. If you need to reschedule, please call us at {{labPhone}}. Thank you.',
  ARRAY['patientName', 'collectionTime', 'orderNumber', 'labPhone', 'labName'],
  true
);