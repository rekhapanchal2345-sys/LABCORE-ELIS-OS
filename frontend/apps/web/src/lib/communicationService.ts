// Communication Integration Service
// This service now uses the real backend API for communication

import { communicationApi, laboratorySettingsApi } from './api';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

interface SmsTemplate {
  id: string;
  name: string;
  message: string;
  variables: string[];
}

class CommunicationService {
  private emailTemplates: EmailTemplate[] = [
    {
      id: 'lab-results',
      name: 'Lab Results Notification',
      subject: 'Your Lab Results are Ready - {{patientName}}',
      body: `Dear {{patientName}},

Your lab results are now available for viewing.

Test Details:
- Test Name: {{testName}}
- Test Date: {{testDate}}
- Result: {{result}}

Please log in to your patient portal to view the complete report.

If you have any questions, please don't hesitate to contact us.

Best regards,
{{labName}}
LabCore Enterprise LIS`,
      variables: ['patientName', 'testName', 'testDate', 'result', 'labName']
    },
    {
      id: 'appointment-reminder',
      name: 'Appointment Reminder',
      subject: 'Appointment Reminder - {{appointmentDate}} at {{appointmentTime}}',
      body: `Dear {{patientName}},

This is a reminder of your upcoming appointment:

Date: {{appointmentDate}}
Time: {{appointmentTime}}
Type: {{appointmentType}}
Location: {{location}}

Please arrive 15 minutes before your scheduled time.

If you need to reschedule, please call us at {{contactNumber}}.

Best regards,
{{labName}}`,
      variables: ['patientName', 'appointmentDate', 'appointmentTime', 'appointmentType', 'location', 'contactNumber', 'labName']
    },
    {
      id: 'sample-collection',
      name: 'Sample Collection Instructions',
      subject: 'Sample Collection Instructions - {{patientName}}',
      body: `Dear {{patientName}},

Your sample collection has been scheduled for {{collectionDate}} at {{collectionTime}}.

Preparation Instructions:
{{instructions}}

Please bring:
- Valid ID proof
- Previous medical reports (if any)
- Doctor's prescription

Contact us at {{contactNumber}} if you have any questions.

Best regards,
{{labName}}`,
      variables: ['patientName', 'collectionDate', 'collectionTime', 'instructions', 'contactNumber', 'labName']
    },
    {
      id: 'payment-reminder',
      name: 'Payment Reminder',
      subject: 'Payment Reminder - Invoice #{{invoiceNumber}}',
      body: `Dear {{patientName}},

This is a reminder regarding your pending payment:

Invoice Number: {{invoiceNumber}}
Amount Due: {{amount}}
Due Date: {{dueDate}}

Please complete the payment to avoid any service interruptions.

Payment Methods:
- Online: {{paymentLink}}
- In-person: Visit our reception
- Bank Transfer: {{bankDetails}}

If you have already made the payment, please disregard this notice.

Best regards,
{{labName}}`,
      variables: ['patientName', 'invoiceNumber', 'amount', 'dueDate', 'paymentLink', 'bankDetails', 'labName']
    }
  ];

  private smsTemplates: SmsTemplate[] = [
    {
      id: 'quick-reminder',
      name: 'Quick Reminder',
      message: `Hi {{patientName}}, reminder: {{appointmentType}} on {{appointmentDate}} at {{appointmentTime}}. Reply CONFIRM or call {{contactNumber}} to reschedule.`,
      variables: ['patientName', 'appointmentType', 'appointmentDate', 'appointmentTime', 'contactNumber']
    },
    {
      id: 'results-ready',
      name: 'Results Ready',
      message: `Hi {{patientName}}, your lab results for {{testName}} are ready. Log in to patient portal or call {{contactNumber}} for details.`,
      variables: ['patientName', 'testName', 'contactNumber']
    },
    {
      id: 'collection-reminder',
      name: 'Sample Collection Reminder',
      message: `Hi {{patientName}}, sample collection tomorrow at {{collectionTime}}. Fast for {{fastingHours}}hrs if required. Bring ID & prescription. Call {{contactNumber}} for queries.`,
      variables: ['patientName', 'collectionTime', 'fastingHours', 'contactNumber']
    },
    {
      id: 'payment-due',
      name: 'Payment Due',
      message: `Hi {{patientName}}, payment of ₹{{amount}} due by {{dueDate}}. Pay: {{paymentLink}} or visit reception. Invoice #{{invoiceNumber}}`,
      variables: ['patientName', 'amount', 'dueDate', 'paymentLink', 'invoiceNumber']
    }
  ];

  // Load laboratory settings from backend
  async loadLaboratorySettings() {
    try {
      const response = await laboratorySettingsApi.getSettings();
      return response.data;
    } catch (error) {
      console.error('Error loading laboratory settings:', error);
      return null;
    }
  }

  // Template Methods
  getEmailTemplates(): EmailTemplate[] {
    return this.emailTemplates;
  }

  getSmsTemplates(): SmsTemplate[] {
    return this.smsTemplates;
  }

  getEmailTemplate(id: string): EmailTemplate | undefined {
    return this.emailTemplates.find(t => t.id === id);
  }

  getSmsTemplate(id: string): SmsTemplate | undefined {
    return this.smsTemplates.find(t => t.id === id);
  }

  applyEmailTemplate(templateId: string, variables: Record<string, string>): { subject: string; body: string } {
    const template = this.getEmailTemplate(templateId);
    if (!template) throw new Error('Template not found');

    let subject = template.subject;
    let body = template.body;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value || '');
      body = body.replace(new RegExp(placeholder, 'g'), value || '');
    });

    return { subject, body };
  }

  applySmsTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.getSmsTemplate(templateId);
    if (!template) throw new Error('Template not found');

    let message = template.message;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      message = message.replace(new RegExp(placeholder, 'g'), value || '');
    });

    return message;
  }

  // Call Integration Methods - Now uses backend API
  async initiateCall(patientId: string, phoneNumber: string, notes?: string): Promise<{ success: boolean; callId?: string; error?: string }> {
    try {
      const response = await communicationApi.initiateCall({
        patientId,
        to: phoneNumber,
        notes,
      });

      if (response.success) {
        return {
          success: true,
          callId: response.data?.providerMessageId,
        };
      } else {
        return {
          success: false,
          error: response.message || 'Call initiation failed',
        };
      }
    } catch (error) {
      console.error('Call initiation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Call initiation failed',
      };
    }
  }

  // Email Integration Methods - Now uses backend API
  async sendEmail(patientId: string, to: string, subject: string, body: string, attachments?: Array<{ filename: string; content: string; contentType?: string }>): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await communicationApi.sendEmail({
        patientId,
        to,
        subject,
        body,
        attachments,
      });

      if (response.success) {
        return {
          success: true,
          messageId: response.data?.providerMessageId,
        };
      } else {
        return {
          success: false,
          error: response.message || 'Email sending failed',
        };
      }
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed',
      };
    }
  }

  // SMS Integration Methods - Now uses backend API
  async sendSms(patientId: string, to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await communicationApi.sendSMS({
        patientId,
        to,
        message,
      });

      if (response.success) {
        return {
          success: true,
          messageId: response.data?.providerMessageId,
        };
      } else {
        return {
          success: false,
          error: response.message || 'SMS sending failed',
        };
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMS sending failed',
      };
    }
  }

  // Get communication history from backend
  async getCommunicationHistory(patientId: string, page = 1, limit = 20) {
    try {
      const response = await communicationApi.getHistory(patientId, page, limit);
      return response.data;
    } catch (error) {
      console.error('Error fetching communication history:', error);
      return { communications: [], pagination: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
    }
  }
}

// Export singleton instance
export const communicationService = new CommunicationService();