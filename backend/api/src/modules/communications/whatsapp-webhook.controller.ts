import {
  Request,
  Response,
  NextFunction,
} from "express";
import crypto from "crypto";
import prisma from "../../lib/prisma";
import { verifyWebhookSignature } from "../../lib/communication-providers";

export const verifyWebhook = async (
  req: Request,
  res: Response
) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "labcore_webhook_verify";

    if (mode === "subscribe" && token === verifyToken) {
      console.log("[WhatsApp Webhook] Webhook verified successfully");
      return res.status(200).send(challenge);
    }

    return res.status(403).json({ error: "Invalid verification token" });
  } catch (error) {
    console.error("[WhatsApp Webhook] Verification error:", error);
    return res.status(500).json({ error: "Webhook verification failed" });
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const signature = req.headers["x-hub-signature-256"] as string;
    const appSecret = process.env.WHATSAPP_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (appSecret && signature) {
      const rawBody = JSON.stringify(body);
      const isValid = verifyWebhookSignature(rawBody, signature, appSecret);
      
      if (!isValid) {
        console.error("[WhatsApp Webhook] Invalid signature");
        return res.status(403).json({ error: "Invalid signature" });
      }
    }

    console.log("[WhatsApp Webhook] Received webhook:", JSON.stringify(body, null, 2));

    // Process webhook entries
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            await processWebhookChange(change);
          }
        }
      }
    }

    return res.status(200).json({ status: "received" });
  } catch (error) {
    console.error("[WhatsApp Webhook] Processing error:", error);
    next(error);
  }
};

async function processWebhookChange(change: any) {
  try {
    const field = change.field;

    // Handle messages
    if (field === "messages") {
      await processMessagesWebhook(change);
    }
    // Handle message status updates
    else if (field === "message_delivery_status" || field === "message_status") {
      await processMessageStatusWebhook(change);
    }
    // Handle template status updates
    else if (field === "message_template_status_update") {
      await processTemplateStatusWebhook(change);
    }
    // Handle template quality updates
    else if (field === "message_template_quality_update") {
      await processTemplateQualityWebhook(change);
    }
    // Handle business capability updates
    else if (field === "business_capability_update") {
      await processBusinessCapabilityWebhook(change);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing change:", error);
  }
}

async function processMessagesWebhook(change: any) {
  try {
    const value = change.value;
    
    // Handle incoming messages
    if (value.messages && Array.isArray(value.messages)) {
      for (const message of value.messages) {
        await processIncomingMessage(message, value.metadata);
      }
    }
    
    // Handle outgoing message status
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const status of value.statuses) {
        await processMessageStatus(status);
      }
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing messages webhook:", error);
  }
}

async function processIncomingMessage(message: any, metadata: any) {
  try {
    const from = message.from;
    const messageId = message.id;
    const timestamp = new Date(message.timestamp * 1000);
    const messageType = message.type;

    let messageBody = "";
    let mediaUrl = null;
    let mediaMimeType = null;
    let mediaFilename = null;
    let interactiveType = null;
    let interactiveData = null;
    let replyToMessageId = null;

    // Extract message content based on type
    switch (messageType) {
      case "text":
        messageBody = message.text?.body || "";
        break;
      case "image":
        messageBody = message.image?.caption || "";
        mediaUrl = message.image?.id; // Can be used to download media
        mediaMimeType = "image";
        break;
      case "document":
        messageBody = message.document?.caption || "";
        mediaUrl = message.document?.id;
        mediaMimeType = "document";
        mediaFilename = message.document?.filename;
        break;
      case "video":
        messageBody = message.video?.caption || "";
        mediaUrl = message.video?.id;
        mediaMimeType = "video";
        break;
      case "audio":
        mediaUrl = message.audio?.id;
        mediaMimeType = "audio";
        break;
      case "interactive":
        interactiveType = message.interactive?.type;
        if (interactiveType === "button_reply") {
          interactiveData = {
            buttonId: message.interactive.button_reply.id,
            buttonText: message.interactive.button_reply.title
          };
          messageBody = `Button: ${interactiveData.buttonText}`;
        } else if (interactiveType === "list_reply") {
          interactiveData = {
            listId: message.interactive.list_reply.id,
            listTitle: message.interactive.list_reply.title
          };
          messageBody = `List Selection: ${interactiveData.listTitle}`;
        }
        break;
      case "button":
        interactiveType = "button";
        interactiveData = {
          button: message.button
        };
        break;
      case "location":
        messageBody = `Location: ${message.location.latitude}, ${message.location.longitude}`;
        break;
      case "contact":
        messageBody = `Contact: ${message.contact.name?.formatted_name}`;
        break;
    }

    // Check if this is a reply to a previous message
    if (message.context) {
      replyToMessageId = message.context.id;
    }

    // Find or create conversation
    let conversation = await prisma.whatsappConversation.findFirst({
      where: { phoneNumber: from }
    });

    if (!conversation) {
      // Try to match phone number to patient
      const patient = await prisma.patient.findFirst({
        where: { phone: from }
      });

      conversation = await prisma.whatsappConversation.create({
        data: {
          phoneNumber: from,
          patientId: patient?.id,
          status: "ACTIVE",
          currentState: "INITIAL"
        }
      });
    } else {
      // Update last activity
      await prisma.whatsappConversation.update({
        where: { id: conversation.id },
        data: {
          lastActivity: new Date(),
          status: "ACTIVE"
        }
      });
    }

    // Store incoming message
    const incomingMessage = await prisma.whatsappIncomingMessage.create({
      data: {
        senderPhone: from,
        senderType: "individual",
        messageBody,
        messageType,
        mediaUrl,
        mediaMimeType,
        mediaFilename,
        interactiveType,
        interactiveData,
        replyToMessageId,
        webhookTimestamp: timestamp,
        webhookMessageId: messageId,
        webhookPayload: message,
        conversationId: conversation.id,
        patientId: conversation.patientId
      }
    });

    console.log(`[WhatsApp Webhook] Incoming message stored: ${incomingMessage.id}`);

    // Trigger auto-reply if enabled
    if (conversation.autoReplyEnabled) {
      await triggerAutoReply(conversation, incomingMessage);
    }

  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing incoming message:", error);
  }
}

async function processMessageStatus(status: any) {
  try {
    const messageId = status.id;
    const statusType = status.status; // sent, delivered, read, failed
    const timestamp = new Date(status.timestamp * 1000);
    const recipientPhone = status.recipient;

    // Find the communication log by provider message ID
    const communicationLog = await prisma.communicationLog.findFirst({
      where: {
        providerMessageId: messageId,
        type: "WHATSAPP"
      }
    });

    if (communicationLog) {
      const updateData: any = {
        updatedAt: new Date()
      };

      switch (statusType) {
        case "sent":
          updateData.sentAt = timestamp;
          updateData.status = "SENT";
          break;
        case "delivered":
          updateData.deliveredAt = timestamp;
          updateData.status = "DELIVERED";
          break;
        case "read":
          updateData.status = "READ";
          break;
        case "failed":
          updateData.status = "FAILED";
          updateData.failedAt = timestamp;
          updateData.errorReason = status.errors?.[0]?.title || "Message failed";
          updateData.errorMessage = status.errors?.[0]?.message;
          break;
      }

      await prisma.communicationLog.update({
        where: { id: communicationLog.id },
        data: updateData
      });

      console.log(`[WhatsApp Webhook] Communication log ${communicationLog.id} updated to ${statusType}`);
    }

    // Update scheduled message if this was a scheduled message
    const scheduledMessage = await prisma.whatsappScheduledMessage.findFirst({
      where: { providerMessageId: messageId }
    });

    if (scheduledMessage) {
      const updateData: any = {};

      switch (statusType) {
        case "sent":
          updateData.sentAt = timestamp;
          updateData.status = "SENT";
          break;
        case "delivered":
          updateData.deliveredAt = timestamp;
          break;
        case "failed":
          updateData.status = "FAILED";
          updateData.failedAt = timestamp;
          updateData.errorReason = status.errors?.[0]?.title || "Message failed";
          updateData.errorMessage = status.errors?.[0]?.message;
          break;
      }

      await prisma.whatsappScheduledMessage.update({
        where: { id: scheduledMessage.id },
        data: updateData
      });

      console.log(`[WhatsApp Webhook] Scheduled message ${scheduledMessage.id} updated to ${statusType}`);
    }

  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing message status:", error);
  }
}

async function processMessageStatusWebhook(change: any) {
  // Similar to processMessageStatus, handles specific status webhook format
  try {
    const value = change.value;
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const status of value.statuses) {
        await processMessageStatus(status);
      }
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing message status webhook:", error);
  }
}

async function processTemplateStatusWebhook(change: any) {
  try {
    const value = change.value;
    const templateId = value.message_template_id;
    const newStatus = value.event_type; // APPROVED, REJECTED, PAUSED, etc.

    if (templateId) {
      const template = await prisma.whatsappTemplate.findFirst({
        where: { templateId }
      });

      if (template) {
        await prisma.whatsappTemplate.update({
          where: { id: template.id },
          data: {
            templateStatus: newStatus,
            lastSyncedAt: new Date()
          }
        });

        console.log(`[WhatsApp Webhook] Template ${templateId} status updated to ${newStatus}`);
      }
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing template status webhook:", error);
  }
}

async function processTemplateQualityWebhook(change: any) {
  try {
    const value = change.value;
    const templateId = value.message_template_id;
    const qualityRating = value.quality_rating; // HIGH, MEDIUM, LOW, UNKNOWN

    if (templateId) {
      const template = await prisma.whatsAppTemplate.findFirst({
        where: { templateId }
      });

      if (template) {
        await prisma.whatsAppTemplate.update({
          where: { id: template.id },
          data: {
            qualityRating,
            lastSyncedAt: new Date()
          }
        });

        console.log(`[WhatsApp Webhook] Template ${templateId} quality rating updated to ${qualityRating}`);
      }
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing template quality webhook:", error);
  }
}

async function processBusinessCapabilityWebhook(change: any) {
  try {
    const value = change.value;
    console.log("[WhatsApp Webhook] Business capability update:", value);
    // Handle business capability changes like messaging limit increases
  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing business capability webhook:", error);
  }
}

async function triggerAutoReply(conversation: any, incomingMessage: any) {
  try {
    // Get active auto-reply rules
    const rules = await prisma.whatsAppAutoReplyRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' }
    });

    for (const rule of rules) {
      if (await shouldTriggerRule(rule, conversation, incomingMessage)) {
        // Apply delay if configured
        if (rule.delaySeconds > 0) {
          setTimeout(async () => {
            await executeAutoReply(rule, conversation, incomingMessage);
          }, rule.delaySeconds * 1000);
        } else {
          await executeAutoReply(rule, conversation, incomingMessage);
        }
        break; // Only trigger the first matching rule
      }
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error triggering auto-reply:", error);
  }
}

async function shouldTriggerRule(rule: any, conversation: any, incomingMessage: any): Promise<boolean> {
  try {
    const triggerType = rule.triggerType;
    const triggerData = rule.triggerData;

    switch (triggerType) {
      case "KEYWORD":
        const keywords = triggerData?.keywords || [];
        const messageBody = incomingMessage.messageBody.toLowerCase();
        return keywords.some((keyword: string) => 
          messageBody.includes(keyword.toLowerCase())
        );

      case "PATTERN":
        const pattern = triggerData?.pattern;
        if (pattern) {
          const regex = new RegExp(pattern, 'i');
          return regex.test(incomingMessage.messageBody);
        }
        return false;

      case "STATE":
        const states = triggerData?.states || [];
        return states.includes(conversation.currentState);

      case "ALL":
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error checking rule trigger:", error);
    return false;
  }
}

async function executeAutoReply(rule: any, conversation: any, incomingMessage: any) {
  try {
    const { sendWhatsApp } = await import("../../lib/communication-providers");

    // Replace variables in response text
    let responseText = rule.responseText;
    responseText = responseText.replace(/\{patient_name\}/g, conversation.patientId ? "Patient" : "there");
    responseText = responseText.replace(/\{phone\}/g, conversation.phoneNumber);

    if (rule.responseType === "TEXT") {
      await sendWhatsApp({
        to: conversation.phoneNumber,
        message: responseText
      });
    } else if (rule.responseType === "INTERACTIVE" && rule.interactiveType) {
      await sendWhatsApp({
        to: conversation.phoneNumber,
        message: responseText,
        interactiveType: rule.interactiveType,
        interactiveData: rule.interactiveData
      });
    }

    console.log(`[WhatsApp Webhook] Auto-reply sent for rule: ${rule.name}`);
  } catch (error) {
    console.error("[WhatsApp Webhook] Error executing auto-reply:", error);
  }
}