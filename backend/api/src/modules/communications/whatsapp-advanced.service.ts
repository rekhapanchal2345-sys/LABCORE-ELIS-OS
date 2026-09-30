import prisma from "../../lib/prisma";
import { sendWhatsApp, createWhatsAppTemplate, uploadMediaToWhatsApp } from "../../lib/communication-providers";
import { WhatsAppAIService } from "../../lib/whatsapp-ai.service";
import { broadcastWhatsAppMessage, broadcastConversationStatus } from "../../lib/websocket";

// Template Management
export const createTemplate = async (data: {
  name: string;
  displayName: string;
  category: string;
  language: string;
  components: any;
  createdBy?: string;
}) => {
  try {
    // First, create template in Meta
    const templateData = {
      name: data.name,
      category: data.category,
      language: data.language,
      components: data.components
    };

    const metaResult = await createWhatsAppTemplate(templateData);

    if (!metaResult.success) {
      throw new Error(metaResult.error || "Failed to create template in Meta");
    }

    // Store template in database
    const template = await prisma.whatsappTemplate.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        category: data.category,
        language: data.language,
        components: data.components,
        templateId: metaResult.templateId,
        templateStatus: "PENDING",
        createdBy: data.createdBy
      }
    });

    return template;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error creating template:", error);
    throw error;
  }
};

export const getTemplates = async (filters?: {
  category?: string;
  status?: string;
  isActive?: boolean;
}) => {
  try {
    const where: any = {};
    
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.status) {
      where.templateStatus = filters.status;
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const templates = await prisma.whatsappTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return templates;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error fetching templates:", error);
    throw error;
  }
};

export const getTemplateById = async (id: string) => {
  try {
    const template = await prisma.whatsappTemplate.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        scheduledMessages: true,
        notificationTriggers: true
      }
    });

    if (!template) {
      throw new Error("Template not found");
    }

    return template;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error fetching template:", error);
    throw error;
  }
};

export const updateTemplate = async (id: string, data: {
  displayName?: string;
  category?: string;
  language?: string;
  components?: any;
  isActive?: boolean;
}) => {
  try {
    const template = await prisma.whatsappTemplate.update({
      where: { id },
      data: {
        ...data,
        templateStatus: "PENDING", // Reset to pending when updated
        lastSyncedAt: new Date()
      }
    });

    return template;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error updating template:", error);
    throw error;
  }
};

export const deleteTemplate = async (id: string) => {
  try {
    await prisma.whatsappTemplate.delete({
      where: { id }
    });

    return { success: true };
  } catch (error) {
    console.error("[WhatsApp Advanced] Error deleting template:", error);
    throw error;
  }
};

// Scheduled Messages
export const scheduleMessage = async (data: {
  recipientPhone: string;
  recipientType?: string;
  templateId?: string;
  messageType?: string;
  messageBody: string;
  mediaUrl?: string;
  templateVariables?: any;
  scheduledFor: Date;
  timezone?: string;
  patientId?: string;
  createdBy?: string;
}) => {
  try {
    const scheduledMessage = await prisma.whatsappScheduledMessage.create({
      data: {
        recipientPhone: data.recipientPhone,
        recipientType: data.recipientType || "individual",
        templateId: data.templateId,
        messageType: data.messageType || "text",
        messageBody: data.messageBody,
        mediaUrl: data.mediaUrl,
        templateVariables: data.templateVariables,
        scheduledFor: data.scheduledFor,
        timezone: data.timezone || "UTC",
        patientId: data.patientId,
        createdBy: data.createdBy
      }
    });

    return scheduledMessage;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error scheduling message:", error);
    throw error;
  }
};

export const getScheduledMessages = async (filters?: {
  status?: string;
  patientId?: string;
  scheduledBefore?: Date;
  scheduledAfter?: Date;
}) => {
  try {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters?.scheduledBefore) {
      where.scheduledFor = { ...where.scheduledFor, lte: filters.scheduledBefore };
    }
    if (filters?.scheduledAfter) {
      where.scheduledFor = { ...where.scheduledFor, gte: filters.scheduledAfter };
    }

    const messages = await prisma.whatsappScheduledMessage.findMany({
      where,
      orderBy: { scheduledFor: 'asc' },
      include: {
        template: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return messages;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error fetching scheduled messages:", error);
    throw error;
  }
};

export const processScheduledMessages = async () => {
  try {
    const now = new Date();
    
    const pendingMessages = await prisma.whatsappScheduledMessage.findMany({
      where: {
        status: "PENDING",
        scheduledFor: { lte: now }
      },
      include: {
        template: true,
        patient: true
      }
    });

    const results = [];

    for (const message of pendingMessages) {
      try {
        let result;
        
        if (message.template) {
          // Send template message
          result = await sendWhatsApp({
            to: message.recipientPhone,
            templateName: message.template.name,
            templateLanguage: message.template.language,
            templateVariables: message.templateVariables,
            message: message.messageBody
          });
        } else {
          // Send custom message
          result = await sendWhatsApp({
            to: message.recipientPhone,
            message: message.messageBody,
            mediaUrl: message.mediaUrl
          });
        }

        // Update scheduled message status
        const updatedMessage = await prisma.whatsappScheduledMessage.update({
          where: { id: message.id },
          data: {
            status: result.success ? "SENT" : "FAILED",
            providerMessageId: result.messageId,
            sentAt: new Date(),
            failedAt: result.success ? null : new Date(),
            errorReason: result.error
          }
        });

        results.push(updatedMessage);
      } catch (error) {
        await prisma.whatsappScheduledMessage.update({
          where: { id: message.id },
          data: {
            status: "FAILED",
            failedAt: new Date(),
            errorReason: "Processing error",
            errorMessage: error instanceof Error ? error.message : "Unknown error"
          }
        });
      }
    }

    return results;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error processing scheduled messages:", error);
    throw error;
  }
};

export const cancelScheduledMessage = async (id: string) => {
  try {
    const message = await prisma.whatsappScheduledMessage.update({
      where: { id },
      data: {
        status: "CANCELLED"
      }
    });

    return message;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error cancelling scheduled message:", error);
    throw error;
  }
};

// Bulk Messaging
export const sendBulkMessages = async (data: {
  recipientPhones: string[];
  templateId?: string;
  messageType?: string;
  messageBody: string;
  mediaUrl?: string;
  templateVariables?: any;
  patientIds?: string[];
  createdBy?: string;
}) => {
  try {
    const results = [];
    const batchSize = 50; // Process in batches to avoid overwhelming the API

    for (let i = 0; i < data.recipientPhones.length; i += batchSize) {
      const batch = data.recipientPhones.slice(i, i + batchSize);
      
      for (const phone of batch) {
        try {
          let result;
          
          if (data.templateId) {
            result = await sendWhatsApp({
              to: phone,
              templateName: data.templateId,
              templateVariables: data.templateVariables,
              message: data.messageBody
            });
          } else {
            result = await sendWhatsApp({
              to: phone,
              message: data.messageBody,
              mediaUrl: data.mediaUrl
            });
          }

          results.push({
            phone,
            success: result.success,
            messageId: result.messageId,
            error: result.error
          });
        } catch (error) {
          results.push({
            phone,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < data.recipientPhones.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      total: results.length,
      success: successCount,
      failed: failureCount,
      results
    };
  } catch (error) {
    console.error("[WhatsApp Advanced] Error sending bulk messages:", error);
    throw error;
  }
};

// Auto-Reply Rules
export const createAutoReplyRule = async (data: {
  name: string;
  description?: string;
  triggerType: string;
  triggerData: any;
  responseType: string;
  responseText: string;
  templateId?: string;
  interactiveType?: string;
  interactiveData?: any;
  delaySeconds?: number;
  maxResponsesPerDay?: number;
  cooldownSeconds?: number;
  priority?: number;
  patientSegment?: any;
  createdBy?: string;
}) => {
  try {
    const rule = await prisma.whatsappAutoReplyRule.create({
      data: {
        name: data.name,
        description: data.description,
        triggerType: data.triggerType,
        triggerData: data.triggerData,
        responseType: data.responseType,
        responseText: data.responseText,
        templateId: data.templateId,
        interactiveType: data.interactiveType,
        interactiveData: data.interactiveData,
        delaySeconds: data.delaySeconds || 0,
        maxResponsesPerDay: data.maxResponsesPerDay,
        cooldownSeconds: data.cooldownSeconds,
        priority: data.priority || 0,
        patientSegment: data.patientSegment,
        createdBy: data.createdBy
      }
    });

    return rule;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error creating auto-reply rule:", error);
    throw error;
  }
};

export const getAutoReplyRules = async (filters?: {
  isActive?: boolean;
  triggerType?: string;
}) => {
  try {
    const where: any = {};
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters?.triggerType) {
      where.triggerType = filters.triggerType;
    }

    const rules = await prisma.whatsappAutoReplyRule.findMany({
      where,
      orderBy: { priority: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return rules;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error fetching auto-reply rules:", error);
    throw error;
  }
};

export const updateAutoReplyRule = async (id: string, data: any) => {
  try {
    const rule = await prisma.whatsappAutoReplyRule.update({
      where: { id },
      data
    });

    return rule;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error updating auto-reply rule:", error);
    throw error;
  }
};

export const deleteAutoReplyRule = async (id: string) => {
  try {
    await prisma.whatsappAutoReplyRule.delete({
      where: { id }
    });

    return { success: true };
  } catch (error) {
    console.error("[WhatsApp Advanced] Error deleting auto-reply rule:", error);
    throw error;
  }
};

// Notification Triggers
export const createNotificationTrigger = async (data: {
  name: string;
  description?: string;
  eventType: string;
  eventFilter?: any;
  templateId: string;
  variableMapping?: any;
  recipientType?: string;
  recipientFilter?: any;
  sendImmediately?: boolean;
  delayMinutes?: number;
  createdBy?: string;
}) => {
  try {
    const trigger = await prisma.whatsappNotificationTrigger.create({
      data: {
        name: data.name,
        description: data.description,
        eventType: data.eventType,
        eventFilter: data.eventFilter,
        templateId: data.templateId,
        variableMapping: data.variableMapping,
        recipientType: data.recipientType || "PATIENT",
        recipientFilter: data.recipientFilter,
        sendImmediately: data.sendImmediately !== undefined ? data.sendImmediately : true,
        delayMinutes: data.delayMinutes,
        createdBy: data.createdBy
      }
    });

    return trigger;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error creating notification trigger:", error);
    throw error;
  }
};

export const getNotificationTriggers = async (filters?: {
  eventType?: string;
  isActive?: boolean;
}) => {
  try {
    const where: any = {};
    
    if (filters?.eventType) {
      where.eventType = filters.eventType;
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const triggers = await prisma.whatsappNotificationTrigger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return triggers;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error fetching notification triggers:", error);
    throw error;
  }
};

export const triggerNotification = async (eventType: string, eventData: any) => {
  try {
    const triggers = await prisma.whatsappNotificationTrigger.findMany({
      where: {
        eventType,
        isActive: true
      },
      include: {
        template: true
      }
    });

    const results = [];

    for (const trigger of triggers) {
      try {
        // Check event filter
        if (trigger.eventFilter) {
          const matchesFilter = Object.entries(trigger.eventFilter).every(([key, value]) => 
            eventData[key] === value
          );
          if (!matchesFilter) continue;
        }

        // Determine recipient
        let recipientPhone;
        if (trigger.recipientType === "PATIENT" && eventData.patientId) {
          const patient = await prisma.patient.findUnique({
            where: { id: eventData.patientId }
          });
          recipientPhone = patient?.phone;
        } else if (trigger.recipientType === "CUSTOM" && trigger.recipientFilter) {
          recipientPhone = trigger.recipientFilter.phone;
        }

        if (!recipientPhone) {
          console.log(`[WhatsApp Advanced] No recipient found for trigger ${trigger.name}`);
          continue;
        }

        // Apply variable mapping
        let templateVariables = {};
        if (trigger.variableMapping) {
          templateVariables = Object.entries(trigger.variableMapping).reduce((acc, [key, value]) => {
            acc[key] = eventData[value as string] || "";
            return acc;
          }, {} as any);
        }

        // Schedule or send immediately
        if (trigger.sendImmediately) {
          const result = await sendWhatsApp({
            to: recipientPhone,
            templateName: trigger.template.name,
            templateLanguage: trigger.template.language,
            templateVariables: { body: Object.values(templateVariables) },
            message: `Notification from ${trigger.name}`
          });

          // Update trigger stats
          await prisma.whatsappNotificationTrigger.update({
            where: { id: trigger.id },
            data: {
              lastTriggeredAt: new Date(),
              triggerCount: { increment: 1 }
            }
          });

          results.push({
            triggerId: trigger.id,
            recipient: recipientPhone,
            success: result.success,
            messageId: result.messageId
          });
        } else if (trigger.delayMinutes) {
          const scheduledFor = new Date(Date.now() + trigger.delayMinutes * 60 * 1000);
          await scheduleMessage({
            recipientPhone,
            templateId: trigger.template.id,
            templateVariables,
            messageBody: `Notification from ${trigger.name}`,
            scheduledFor
          });

          results.push({
            triggerId: trigger.id,
            recipient: recipientPhone,
            success: true,
            scheduled: true,
            scheduledFor
          });
        }
      } catch (error) {
        console.error(`[WhatsApp Advanced] Error executing trigger ${trigger.name}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error triggering notifications:", error);
    throw error;
  }
};

// Conversation Management
export const getConversations = async (filters?: {
  status?: string;
  patientId?: string;
  phoneNumber?: string;
}) => {
  try {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters?.phoneNumber) {
      where.phoneNumber = filters.phoneNumber;
    }

    const conversations = await prisma.whatsappConversation.findMany({
      where,
      orderBy: { lastActivity: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        incomingMessages: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    return conversations;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error fetching conversations:", error);
    throw error;
  }
};

export const updateConversation = async (id: string, data: {
  status?: string;
  currentState?: string;
  stateData?: any;
  chatbotEnabled?: boolean;
  autoReplyEnabled?: boolean;
}) => {
  try {
    const conversation = await prisma.whatsappConversation.update({
      where: { id },
      data: {
        ...data,
        lastActivity: new Date()
      }
    });

    return conversation;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error updating conversation:", error);
    throw error;
  }
};

// Incoming Messages
export const getIncomingMessages = async (filters?: {
  isProcessed?: boolean;
  conversationId?: string;
  patientId?: string;
  limit?: number;
}) => {
  try {
    const where: any = {};
    
    if (filters?.isProcessed !== undefined) {
      where.isProcessed = filters.isProcessed;
    }
    if (filters?.conversationId) {
      where.conversationId = filters.conversationId;
    }
    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    const messages = await prisma.whatsappIncomingMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      include: {
        conversation: {
          select: {
            id: true,
            phoneNumber: true,
            status: true
          }
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    return messages;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error fetching incoming messages:", error);
    throw error;
  }
};

export const markMessageAsProcessed = async (id: string) => {
  try {
    const message = await prisma.whatsappIncomingMessage.update({
      where: { id },
      data: {
        isProcessed: true,
        processedAt: new Date()
      }
    });

    return message;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error marking message as processed:", error);
    throw error;
  }
};

// Enhanced Premium Features

/**
 * Send message with AI-powered auto-response analysis
 */
export const sendMessageWithAI = async (data: {
  to: string;
  message: string;
  patientId?: string;
  enableAutoResponse?: boolean;
  aiModel?: string;
}) => {
  try {
    // Send the message
    const result = await sendWhatsApp({
      to: data.to,
      message: data.message
    });

    if (result.success && data.enableAutoResponse) {
      // Analyze the message for potential AI responses
      const sentiment = await WhatsAppAIService.analyzeSentiment(data.message);
      
      // Store sentiment analysis if conversation exists
      if (data.patientId) {
        const conversation = await prisma.whatsappConversation.findFirst({
          where: {
            patientId: data.patientId,
            phoneNumber: data.to
          }
        });

        if (conversation) {
          await prisma.whatsappSentiment.create({
            data: {
              conversationId: conversation.id,
              messageCount: 1,
              overallSentiment: sentiment.sentiment,
              sentimentScore: sentiment.score,
              emotions: sentiment.emotions,
              keywords: sentiment.keywords
            }
          });
        }
      }
    }

    return result;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error sending message with AI:", error);
    throw error;
  }
};

/**
 * Get conversation with AI insights
 */
export const getConversationWithAI = async (conversationId: string) => {
  try {
    const conversation = await prisma.whatsappConversation.findUnique({
      where: { id: conversationId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true
          }
        },
        incomingMessages: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        sentiments: {
          orderBy: { analyzedAt: 'desc' },
          take: 5
        }
      }
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Get AI-powered insights
    const sentimentAnalysis = await WhatsAppAIService.analyzeConversationSentiment(conversationId);
    const issues = await WhatsAppAIService.detectIssues(conversationId);

    return {
      conversation,
      insights: {
        sentiment: sentimentAnalysis,
        issues
      }
    };
  } catch (error) {
    console.error("[WhatsApp Advanced] Error getting conversation with AI:", error);
    throw error;
  }
};

/**
 * Get AI-suggested response for a conversation
 */
export const getSuggestedResponse = async (conversationId: string, aiModel: string = 'basic') => {
  try {
    const conversation = await prisma.whatsappConversation.findUnique({
      where: { id: conversationId },
      include: {
        incomingMessages: {
          where: { processed: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!conversation || conversation.incomingMessages.length === 0) {
      return {
        response: "No recent messages to analyze for suggestions.",
        confidence: 0,
        suggestedActions: []
      };
    }

    const lastMessage = conversation.incomingMessages[0];
    const suggestion = await WhatsAppAIService.generateAutoResponse(
      lastMessage.messageContent,
      { conversationId },
      aiModel
    );

    return suggestion;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error getting suggested response:", error);
    throw error;
  }
};

/**
 * Get optimal engagement time for a patient
 */
export const getOptimalEngagementTime = async (patientId: string) => {
  try {
    const prediction = await WhatsAppAIService.predictOptimalEngagementTime(patientId);
    return prediction;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error getting optimal engagement time:", error);
    throw error;
  }
};

/**
 * Get personalized content suggestions
 */
export const getPersonalizedContent = async (patientId: string, messageType: string) => {
  try {
    const suggestions = await WhatsAppAIService.suggestPersonalizedContent(patientId, messageType);
    return suggestions;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error getting personalized content:", error);
    throw error;
  }
};

/**
 * Create or update conversation with real-time broadcast
 */
export const updateConversationWithBroadcast = async (conversationId: string, data: any) => {
  try {
    const conversation = await prisma.whatsappConversation.update({
      where: { id: conversationId },
      data: {
        ...data,
        lastActivity: new Date()
      }
    });

    // Broadcast update to connected clients
    broadcastConversationStatus(conversationId, data);

    return conversation;
  } catch (error) {
    console.error("[WhatsApp Advanced] Error updating conversation with broadcast:", error);
    throw error;
  }
};

/**
 * Process incoming message with AI analysis
 */
export const processIncomingMessageWithAI = async (messageData: {
  phoneNumber: string;
  messageContent: string;
  messageType: string;
  externalMessageId: string;
  patientId?: string;
}) => {
  try {
    // Find or create conversation
    let conversation = await prisma.whatsappConversation.findFirst({
      where: {
        phoneNumber: messageData.phoneNumber,
        patientId: messageData.patientId
      }
    });

    if (!conversation) {
      conversation = await prisma.whatsappConversation.create({
        data: {
          phoneNumber: messageData.phoneNumber,
          patientId: messageData.patientId,
          status: 'ACTIVE',
          lastMessageAt: new Date(),
          lastMessagePreview: messageData.messageContent.substring(0, 50),
          messageCount: 1
        }
      });
    } else {
      conversation = await prisma.whatsappConversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: messageData.messageContent.substring(0, 50),
          messageCount: { increment: 1 },
          unreadCount: { increment: 1 }
        }
      });
    }

    // Store incoming message
    const incomingMessage = await prisma.whatsappIncomingMessage.create({
      data: {
        patientId: messageData.patientId,
        phoneNumber: messageData.phoneNumber,
        messageContent: messageData.messageContent,
        messageType: messageData.messageType,
        externalMessageId: messageData.externalMessageId,
        conversationId: conversation.id,
        processed: false
      }
    });

    // Analyze sentiment
    const sentiment = await WhatsAppAIService.analyzeSentiment(messageData.messageContent);

    // Broadcast new message to connected clients
    broadcastWhatsAppMessage(conversation.id, {
      id: incomingMessage.id,
      content: messageData.messageContent,
      type: messageData.messageType,
      timestamp: incomingMessage.createdAt,
      sentiment: sentiment.sentiment
    });

    return {
      conversation,
      message: incomingMessage,
      sentiment
    };
  } catch (error) {
    console.error("[WhatsApp Advanced] Error processing incoming message with AI:", error);
    throw error;
  }
};

/**
 * Get dashboard overview with real-time data
 */
export const getDashboardOverview = async () => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      todayMessages,
      weekMessages,
      activeConversations,
      pendingMessages,
      recentTemplates,
      activeCampaigns
    ] = await Promise.all([
      prisma.whatsappScheduledMessage.count({
        where: {
          createdAt: { gte: startOfToday },
          status: 'SENT'
        }
      }),
      prisma.whatsappScheduledMessage.count({
        where: {
          createdAt: { gte: startOfWeek },
          status: 'SENT'
        }
      }),
      prisma.whatsappConversation.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.whatsappScheduledMessage.count({
        where: { status: 'PENDING' }
      }),
      prisma.whatsappTemplate.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.whatsappCampaign.findMany({
        where: { status: { in: ['SENDING', 'SCHEDULED'] } },
        orderBy: { scheduledFor: 'asc' },
        take: 5
      })
    ]);

    return {
      today: {
        sent: todayMessages,
        delivered: Math.floor(todayMessages * 0.9), // Estimate
        failed: Math.floor(todayMessages * 0.1) // Estimate
      },
      week: {
        sent: weekMessages,
        delivered: Math.floor(weekMessages * 0.9),
        failed: Math.floor(weekMessages * 0.1)
      },
      conversations: {
        active: activeConversations,
        pending: pendingMessages
      },
      recentTemplates,
      activeCampaigns,
      timestamp: now.toISOString()
    };
  } catch (error) {
    console.error("[WhatsApp Advanced] Error getting dashboard overview:", error);
    throw error;
  }
};