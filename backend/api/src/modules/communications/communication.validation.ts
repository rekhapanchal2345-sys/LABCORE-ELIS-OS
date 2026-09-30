import { z } from "zod";

export const sendEmailSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(500),
  body: z.string().min(1, "Email body is required"),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(), // base64 encoded content
    contentType: z.string().optional(),
  })).optional(),
});

export const sendSMSSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  to: z.string().min(10, "Invalid phone number").max(20),
  message: z.string().min(1, "Message is required").max(1600),
});

export const initiateCallSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  to: z.string().min(10, "Invalid phone number").max(20),
  notes: z.string().max(500).optional(),
});

export const sendWhatsAppSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  to: z.string().min(10, "Invalid phone number").max(20),
  message: z.string().min(1, "Message is required").max(4000),
  mediaUrl: z.string().url("Invalid media URL").optional().or(z.literal("")),
  pdfBase64: z.string().optional(),
  filename: z.string().optional(),
});

export const communicationHistorySchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const communicationIdSchema = z.object({
  id: z.string().min(1, "Invalid communication ID"),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type SendSMSInput = z.infer<typeof sendSMSSchema>;
export type InitiateCallInput = z.infer<typeof initiateCallSchema>;
export type SendWhatsAppInput = z.infer<typeof sendWhatsAppSchema>;
export type CommunicationHistoryInput = z.infer<typeof communicationHistorySchema>;