import { z } from "zod";

// Template Validation Schemas
export const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(512, "Template name too long"),
  displayName: z.string().min(1, "Display name is required").max(512, "Display name too long"),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"], {
    error: "Category must be MARKETING, UTILITY, or AUTHENTICATION"
  }),
  language: z.string().min(2, "Language code is required").max(10, "Language code too long").default("en"),
  components: z.object({
    // Template components structure
  }).passthrough(),
});

export const updateTemplateSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(512, "Display name too long").optional(),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"], {
    error: "Category must be MARKETING, UTILITY, or AUTHENTICATION"
  }).optional(),
  language: z.string().min(2, "Language code is required").max(10, "Language code too long").optional(),
  components: z.object({
    // Template components structure
  }).passthrough().optional(),
  isActive: z.boolean().optional(),
});

// Scheduled Message Validation Schemas
export const scheduleMessageSchema = z.object({
  recipientPhone: z.string().min(10, "Phone number is required").max(15, "Phone number too long"),
  recipientType: z.enum(["individual", "group"]).default("individual"),
  templateId: z.string().optional(),
  messageType: z.enum(["text", "image", "document", "video", "audio"]).default("text"),
  messageBody: z.string().min(1, "Message body is required").max(4096, "Message body too long"),
  mediaUrl: z.string().url("Invalid media URL").optional(),
  templateVariables: z.record(z.string(), z.any()).optional(),
  scheduledFor: z.string().or(z.date()).transform((val) => new Date(val)),
  timezone: z.string().default("UTC"),
  patientId: z.string().optional(),
});

// Bulk Message Validation Schema
export const bulkMessageSchema = z.object({
  recipientPhones: z.array(z.string().min(10, "Phone number is required")).min(1, "At least one recipient is required").max(1000, "Too many recipients"),
  templateId: z.string().optional(),
  messageType: z.enum(["text", "image", "document", "video", "audio"]).default("text"),
  messageBody: z.string().min(1, "Message body is required").max(4096, "Message body too long"),
  mediaUrl: z.string().url("Invalid media URL").optional(),
  templateVariables: z.record(z.string(), z.any()).optional(),
  patientIds: z.array(z.string()).optional(),
});

// Auto-Reply Rule Validation Schemas
export const autoReplyRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required").max(255, "Rule name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  triggerType: z.enum(["KEYWORD", "PATTERN", "ALL", "STATE"], {
    error: "Trigger type must be KEYWORD, PATTERN, ALL, or STATE"
  }),
  triggerData: z.object({
    keywords: z.array(z.string()).optional(),
    pattern: z.string().optional(),
    states: z.array(z.string()).optional(),
  }).passthrough().optional(),
  responseType: z.enum(["TEXT", "TEMPLATE", "INTERACTIVE"], {
    error: "Response type must be TEXT, TEMPLATE, or INTERACTIVE"
  }),
  responseText: z.string().min(1, "Response text is required").max(4096, "Response text too long"),
  templateId: z.string().optional(),
  interactiveType: z.enum(["button", "list"]).optional(),
  interactiveData: z.object({
    buttons: z.array(z.object({
      id: z.string(),
      title: z.string()
    })).optional(),
    buttonText: z.string().optional(),
    list: z.array(z.any()).optional(),
    header: z.string().optional(),
    footer: z.string().optional(),
  }).passthrough().optional(),
  delaySeconds: z.number().int().min(0).max(3600).default(0),
  maxResponsesPerDay: z.number().int().min(1).max(1000).optional(),
  cooldownSeconds: z.number().int().min(0).max(86400).optional(),
  priority: z.number().int().min(0).max(100).default(0),
  patientSegment: z.record(z.string(), z.any()).optional(),
});

export const updateAutoReplyRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required").max(255, "Rule name too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  triggerType: z.enum(["KEYWORD", "PATTERN", "ALL", "STATE"], {
    error: "Trigger type must be KEYWORD, PATTERN, ALL, or STATE"
  }).optional(),
  triggerData: z.object({
    keywords: z.array(z.string()).optional(),
    pattern: z.string().optional(),
    states: z.array(z.string()).optional(),
  }).passthrough().optional(),
  responseType: z.enum(["TEXT", "TEMPLATE", "INTERACTIVE"], {
    error: "Response type must be TEXT, TEMPLATE, or INTERACTIVE"
  }).optional(),
  responseText: z.string().min(1, "Response text is required").max(4096, "Response text too long").optional(),
  templateId: z.string().optional(),
  interactiveType: z.enum(["button", "list"]).optional(),
  interactiveData: z.object({
    buttons: z.array(z.object({
      id: z.string(),
      title: z.string()
    })).optional(),
    buttonText: z.string().optional(),
    list: z.array(z.any()).optional(),
    header: z.string().optional(),
    footer: z.string().optional(),
  }).passthrough().optional(),
  delaySeconds: z.number().int().min(0).max(3600).optional(),
  maxResponsesPerDay: z.number().int().min(1).max(1000).optional(),
  cooldownSeconds: z.number().int().min(0).max(86400).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  patientSegment: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional(),
});

// Notification Trigger Validation Schema
export const notificationTriggerSchema = z.object({
  name: z.string().min(1, "Trigger name is required").max(255, "Trigger name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  eventType: z.string().min(1, "Event type is required").max(100, "Event type too long"),
  eventFilter: z.record(z.string(), z.any()).optional(),
  templateId: z.string().min(1, "Template ID is required"),
  variableMapping: z.record(z.string(), z.string()).optional(),
  recipientType: z.enum(["PATIENT", "DOCTOR", "CUSTOM"]).default("PATIENT"),
  recipientFilter: z.record(z.string(), z.any()).optional(),
  sendImmediately: z.boolean().default(true),
  delayMinutes: z.number().int().min(0).max(10080).optional(), // Max 1 week
});

// Conversation Update Validation Schema
export const updateConversationSchema = z.object({
  status: z.enum(["ACTIVE", "CLOSED", "ARCHIVED"]).optional(),
  currentState: z.string().max(100, "State too long").optional(),
  stateData: z.record(z.string(), z.any()).optional(),
  chatbotEnabled: z.boolean().optional(),
  autoReplyEnabled: z.boolean().optional(),
});

// Interactive Message Validation Schemas
export const interactiveButtonSchema = z.object({
  to: z.string().min(10, "Phone number is required").max(15, "Phone number too long"),
  message: z.string().min(1, "Message is required").max(1024, "Message too long"),
  buttons: z.array(z.object({
    id: z.string().min(1, "Button ID is required").max(256, "Button ID too long"),
    title: z.string().min(1, "Button title is required").max(20, "Button title too long")
  })).min(1, "At least one button is required").max(3, "Maximum 3 buttons allowed"),
  header: z.string().max(60, "Header too long").optional(),
  footer: z.string().max(60, "Footer too long").optional(),
});

export const interactiveListSchema = z.object({
  to: z.string().min(10, "Phone number is required").max(15, "Phone number too long"),
  message: z.string().min(1, "Message is required").max(1024, "Message too long"),
  buttonText: z.string().min(1, "Button text is required").max(20, "Button text too long"),
  list: z.array(z.object({
    title: z.string().min(1, "Section title is required").max(24, "Section title too long"),
    rows: z.array(z.object({
      id: z.string().min(1, "Row ID is required").max(200, "Row ID too long"),
      title: z.string().min(1, "Row title is required").max(24, "Row title too long"),
      description: z.string().max(72, "Description too long").optional(),
    })).min(1, "At least one row is required").max(10, "Maximum 10 rows allowed"),
  })).min(1, "At least one section is required").max(10, "Maximum 10 sections allowed"),
  header: z.string().max(60, "Header too long").optional(),
  footer: z.string().max(60, "Footer too long").optional(),
});

// Media Upload Validation Schema
export const mediaUploadSchema = z.object({
  file: z.any(), // File object will be validated by multer
  mimeType: z.string().regex(/^(image|video|audio|application)\/[a-z0-9\-+]+$/, "Invalid MIME type"),
  filename: z.string().min(1, "Filename is required").max(255, "Filename too long"),
});

// Webhook Validation Schema
export const webhookVerifySchema = z.object({
  "hub.mode": z.enum(["subscribe"]),
  "hub.verify_token": z.string(),
  "hub.challenge": z.string(),
});

// ID Validation Schema (common for most routes)
export const idSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Trigger Notification Validation Schema
export const triggerNotificationRequestSchema = z.object({
  eventType: z.string().min(1, "Event type is required"),
  eventData: z.record(z.string(), z.any()).optional(),
});

// Campaign Validation Schemas
export const createCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(255, "Campaign name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  campaignType: z.enum(["MARKETING", "REMINDER", "ANNOUNCEMENT"], {
    error: "Campaign type must be MARKETING, REMINDER, or ANNOUNCEMENT"
  }),
  templateId: z.string().optional(),
  messageContent: z.string().min(1, "Message content is required").max(4096, "Message content too long").optional(),
  targetAudience: z.object({
    phone: z.array(z.string()).optional(),
    testCategories: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string().or(z.date()),
      end: z.string().or(z.date())
    }).optional()
  }).passthrough(),
  aBTestEnabled: z.boolean().default(false),
  aBTestVariants: z.array(z.any()).optional(),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(255, "Campaign name too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  campaignType: z.enum(["MARKETING", "REMINDER", "ANNOUNCEMENT"]).optional(),
  templateId: z.string().optional(),
  messageContent: z.string().min(1, "Message content is required").max(4096, "Message content too long").optional(),
  targetAudience: z.object({
    phone: z.array(z.string()).optional(),
    testCategories: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string().or(z.date()),
      end: z.string().or(z.date())
    }).optional()
  }).passthrough().optional(),
  aBTestEnabled: z.boolean().optional(),
  aBTestVariants: z.array(z.any()).optional(),
});

export const scheduleCampaignSchema = z.object({
  scheduledFor: z.string().or(z.date()).transform((val) => new Date(val)),
});

// AI Features Validation Schemas
export const sendMessageWithAISchema = z.object({
  to: z.string().min(10, "Phone number is required").max(15, "Phone number too long"),
  message: z.string().min(1, "Message is required").max(4096, "Message too long"),
  patientId: z.string().optional(),
  enableAutoResponse: z.boolean().default(false),
  aiModel: z.string().default("basic"),
});

export const processIncomingMessageWithAISchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required").max(15, "Phone number too long"),
  messageContent: z.string().min(1, "Message content is required").max(4096, "Message content too long"),
  messageType: z.string().default("text"),
  externalMessageId: z.string().min(1, "External message ID is required"),
  patientId: z.string().optional(),
});

// Analytics Validation Schemas
export const analyticsDateRangeSchema = z.object({
  startDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
});

export const generateReportSchema = z.object({
  startDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  reportType: z.enum(["overview", "templates", "sentiment", "cost", "conversations", "comprehensive"]).default("comprehensive"),
});