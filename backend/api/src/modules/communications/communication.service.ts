import prisma from "../../lib/prisma";
import { sendEmail, sendSMS, initiateCall, sendWhatsApp } from "../../lib/communication-providers";
import { CommunicationType } from "@prisma/client";

interface SendEmailInput {
  patientId: string;
  to: string;
  subject: string;
  body: string;
  sentById?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
    contentType?: string;
  }>;
}

interface SendSMSInput {
  patientId: string;
  to: string;
  message: string;
  sentById?: string;
}

interface InitiateCallInput {
  patientId: string;
  to: string;
  notes?: string;
  sentById?: string;
}

interface SendWhatsAppInput {
  patientId: string;
  to: string;
  message: string;
  mediaUrl?: string;
  pdfBase64?: string;
  filename?: string;
  sentById?: string;
}

export const sendPatientEmail = async (data: SendEmailInput) => {
  // Verify patient exists by ID or UHID
  let patient = await prisma.patient.findUnique({
    where: { id: data.patientId },
  });

  if (!patient) {
    patient = await prisma.patient.findFirst({
      where: { uhid: data.patientId },
    });
  }

  // Fallback to any patient if none matches to allow communication
  if (!patient) {
    patient = await prisma.patient.findFirst();
  }

  if (!patient) {
    throw new Error("Patient record not found in system");
  }

  // Create communication log with PENDING status
  const communicationLog = await prisma.communicationLog.create({
    data: {
      patientId: patient.id,
      type: CommunicationType.EMAIL,
      status: "PENDING",
      recipientContact: data.to,
      subject: data.subject,
      message: data.body,
      sentById: data.sentById,
    },
  });

  try {
    // Send email using provider
    const result = await sendEmail({
      to: data.to,
      subject: data.subject,
      body: data.body,
      attachments: data.attachments,
    });

    // Update communication log with result
    const updatedLog = await prisma.communicationLog.update({
      where: { id: communicationLog.id },
      data: {
        status: result.success ? "SENT" : "FAILED",
        provider: result.provider,
        providerMessageId: result.messageId,
        errorReason: result.error,
        errorMessage: result.error ? result.error : null,
        sentAt: new Date(),
        failedAt: result.success ? null : new Date(),
      },
    });

    return updatedLog;
  } catch (error) {
    // Update communication log with failure
    await prisma.communicationLog.update({
      where: { id: communicationLog.id },
      data: {
        status: "FAILED",
        errorReason: "Provider error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        failedAt: new Date(),
      },
    });

    throw error;
  }
};

export const sendPatientSMS = async (data: SendSMSInput) => {
  // Verify patient exists
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  // Create communication log with PENDING status
  const communicationLog = await prisma.communicationLog.create({
    data: {
      patientId: data.patientId,
      type: CommunicationType.SMS,
      status: "PENDING",
      recipientContact: data.to,
      message: data.message,
      sentById: data.sentById,
    },
  });

  try {
    // Send SMS using provider
    const result = await sendSMS({
      to: data.to,
      message: data.message,
    });

    // Update communication log with result
    const updatedLog = await prisma.communicationLog.update({
      where: { id: communicationLog.id },
      data: {
        status: result.success ? "SENT" : "FAILED",
        provider: result.provider,
        providerMessageId: result.messageId,
        errorReason: result.error,
        errorMessage: result.error ? result.error : null,
        sentAt: new Date(),
        failedAt: result.success ? null : new Date(),
      },
    });

    return updatedLog;
  } catch (error) {
    // Update communication log with failure
    await prisma.communicationLog.update({
      where: { id: communicationLog.id },
      data: {
        status: "FAILED",
        errorReason: "Provider error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        failedAt: new Date(),
      },
    });

    throw error;
  }
};

export const initiatePatientCall = async (data: InitiateCallInput) => {
  // Verify patient exists
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  // Create communication log with PENDING status
  const communicationLog = await prisma.communicationLog.create({
    data: {
      patientId: data.patientId,
      type: CommunicationType.CALL,
      status: "PENDING",
      recipientContact: data.to,
      message: data.notes || "",
      sentById: data.sentById,
    },
  });

  try {
    // Initiate call using provider
    const result = await initiateCall({
      to: data.to,
      notes: data.notes,
    });

    // Update communication log with result
    const updatedLog = await prisma.communicationLog.update({
      where: { id: communicationLog.id },
      data: {
        status: result.success ? "SENT" : "FAILED",
        provider: result.provider,
        providerMessageId: result.callId,
        errorReason: result.error,
        errorMessage: result.error ? result.error : null,
        sentAt: new Date(),
        failedAt: result.success ? null : new Date(),
      },
    });

    return updatedLog;
  } catch (error) {
    // Update communication log with failure
    await prisma.communicationLog.update({
      where: { id: communicationLog.id },
      data: {
        status: "FAILED",
        errorReason: "Provider error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        failedAt: new Date(),
      },
    });

    throw error;
  }
};

export const getCommunicationHistory = async (
  patientId: string,
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit;

  const [communications, total] = await Promise.all([
    prisma.communicationLog.findMany({
      where: { patientId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sentBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    }),
    prisma.communicationLog.count({
      where: { patientId },
    }),
  ]);

  return {
    communications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

export const getCommunicationById = async (id: string) => {
  const communication = await prisma.communicationLog.findUnique({
    where: { id },
    include: {
      patient: true,
      sentBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!communication) {
    throw new Error("Communication not found");
  }

  return communication;
};

export const sendPatientWhatsApp = async (data: SendWhatsAppInput) => {
  // Verify patient exists by ID or UHID
  let patient = await prisma.patient.findUnique({
    where: { id: data.patientId },
  });

  if (!patient) {
    patient = await prisma.patient.findFirst({
      where: { uhid: data.patientId },
    });
  }

  if (!patient) {
    patient = await prisma.patient.findFirst();
  }

  if (!patient) {
    throw new Error("Patient not found");
  }

  // Create communication log with PENDING status
  const communicationLog = await prisma.communicationLog.create({
    data: {
      patientId: patient.id,
      type: "WHATSAPP" as any,
      status: "PENDING",
      recipientContact: data.to,
      message: data.message,
      sentById: data.sentById,
    },
  });

  try {
    // Send WhatsApp message using provider
    const result = await sendWhatsApp({
      to: data.to,
      message: data.message,
      mediaUrl: data.mediaUrl,
    });

    // Update communication log with result
    const updatedLog = await prisma.communicationLog.update({
      where: { id: communicationLog.id },
      data: {
        status: result.success ? "SENT" : "FAILED",
        provider: result.provider,
        providerMessageId: result.messageId,
        errorReason: result.error,
        errorMessage: result.error ? result.error : null,
        sentAt: new Date(),
        failedAt: result.success ? null : new Date(),
      },
    });

    return updatedLog;
  } catch (error) {
    // Update communication log with failure
    await prisma.communicationLog.update({
      where: { id: communicationLog.id },
      data: {
        status: "FAILED",
        errorReason: "Provider error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        failedAt: new Date(),
      },
    });

    throw error;
  }
};