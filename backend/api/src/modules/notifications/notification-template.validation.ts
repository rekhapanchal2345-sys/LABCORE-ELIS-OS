import { z } from "zod";

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(255),
  description: z.string().max(500).optional(),
  eventType: z.enum([
    "PATIENT_REGISTRATION",
    "ORDER_CREATED",
    "SAMPLE_COLLECTED",
    "SAMPLE_RECEIVED",
    "TEST_COMPLETED",
    "RESULT_READY",
    "RESULT_APPROVED",
    "INVOICE_GENERATED",
    "PAYMENT_RECEIVED",
    "APPOINTMENT_SCHEDULED",
    "APPOINTMENT_REMINDER"
  ]),
  channel: z.enum(["EMAIL", "SMS", "CALL"]),
  subjectTemplate: z.string().max(500).optional(),
  bodyTemplate: z.string().min(1, "Body template is required"),
  variables: z.array(z.string()).min(1, "At least one variable is required"),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(500).optional(),
  eventType: z.enum([
    "PATIENT_REGISTRATION",
    "ORDER_CREATED",
    "SAMPLE_COLLECTED",
    "SAMPLE_RECEIVED",
    "TEST_COMPLETED",
    "RESULT_READY",
    "RESULT_APPROVED",
    "INVOICE_GENERATED",
    "PAYMENT_RECEIVED",
    "APPOINTMENT_SCHEDULED",
    "APPOINTMENT_REMINDER"
  ]).optional(),
  channel: z.enum(["EMAIL", "SMS", "CALL"]).optional(),
  subjectTemplate: z.string().max(500).optional(),
  bodyTemplate: z.string().min(1).optional(),
  variables: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
});

export const applyTemplateSchema = z.object({
  templateId: z.string().uuid("Invalid template ID"),
  variables: z.record(z.string(), z.string()),
});

export const templateIdSchema = z.object({
  id: z.string().uuid("Invalid template ID"),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type ApplyTemplateInput = z.infer<typeof applyTemplateSchema>;