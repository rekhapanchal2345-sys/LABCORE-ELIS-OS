import {
  Request,
  Response,
  NextFunction,
} from "express";
import type { AuthRequest } from "../../../middleware/auth.middleware";
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  scheduleMessage,
  getScheduledMessages,
  processScheduledMessages,
  cancelScheduledMessage,
  sendBulkMessages,
  createAutoReplyRule,
  getAutoReplyRules,
  updateAutoReplyRule,
  deleteAutoReplyRule,
  createNotificationTrigger,
  getNotificationTriggers,
  triggerNotification,
  getConversations,
  updateConversation,
  getIncomingMessages,
  markMessageAsProcessed,
  sendMessageWithAI,
  getConversationWithAI,
  getSuggestedResponse,
  getOptimalEngagementTime,
  getPersonalizedContent,
  updateConversationWithBroadcast,
  processIncomingMessageWithAI,
  getDashboardOverview,
} from "./whatsapp-advanced.service";
import { WhatsAppCampaignService } from "./whatsapp-campaign.service";
import { WhatsAppAnalyticsService } from "./whatsapp-analytics.service";
import {
  successResponse,
  createdResponse,
} from "../../utils/response";

// Template Management Controllers
export const createTemplateController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    
    const template = await createTemplate({
      ...body,
      createdBy: req.user?.id
    });

    return createdResponse(
      res,
      template,
      "WhatsApp template created successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getTemplatesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const templates = await getTemplates({
      category: query.category as string,
      status: query.status as string,
      isActive: query.isActive ? query.isActive === 'true' : undefined
    });

    return successResponse(
      res,
      templates,
      "Templates fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getTemplateByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    const template = await getTemplateById(params.id as string);

    return successResponse(
      res,
      template,
      "Template fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateTemplateController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;
    
    const template = await updateTemplate(params.id as string, body);

    return successResponse(
      res,
      template,
      "Template updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const deleteTemplateController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    await deleteTemplate(params.id as string);

    return successResponse(
      res,
      { success: true },
      "Template deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Scheduled Messages Controllers
export const scheduleMessageController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    
    const scheduledMessage = await scheduleMessage({
      ...body,
      createdBy: req.user?.id
    });

    return createdResponse(
      res,
      scheduledMessage,
      "Message scheduled successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getScheduledMessagesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const messages = await getScheduledMessages({
      status: query.status as string,
      patientId: query.patientId as string,
      scheduledBefore: query.scheduledBefore ? new Date(query.scheduledBefore as string) : undefined,
      scheduledAfter: query.scheduledAfter ? new Date(query.scheduledAfter as string) : undefined
    });

    return successResponse(
      res,
      messages,
      "Scheduled messages fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const processScheduledMessagesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const results = await processScheduledMessages();

    return successResponse(
      res,
      results,
      "Scheduled messages processed successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const cancelScheduledMessageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    const message = await cancelScheduledMessage(params.id as string);

    return successResponse(
      res,
      message,
      "Scheduled message cancelled successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Bulk Messaging Controllers
export const sendBulkMessagesController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    
    const result = await sendBulkMessages({
      ...body,
      createdBy: req.user?.id
    });

    return successResponse(
      res,
      result,
      "Bulk messages sent successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Auto-Reply Rules Controllers
export const createAutoReplyRuleController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    
    const rule = await createAutoReplyRule({
      ...body,
      createdBy: req.user?.id
    });

    return createdResponse(
      res,
      rule,
      "Auto-reply rule created successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getAutoReplyRulesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const rules = await getAutoReplyRules({
      isActive: query.isActive ? query.isActive === 'true' : undefined,
      triggerType: query.triggerType as string
    });

    return successResponse(
      res,
      rules,
      "Auto-reply rules fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateAutoReplyRuleController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;
    
    const rule = await updateAutoReplyRule(params.id as string, body);

    return successResponse(
      res,
      rule,
      "Auto-reply rule updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const deleteAutoReplyRuleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    await deleteAutoReplyRule(params.id as string);

    return successResponse(
      res,
      { success: true },
      "Auto-reply rule deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Notification Triggers Controllers
export const createNotificationTriggerController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    
    const trigger = await createNotificationTrigger({
      ...body,
      createdBy: req.user?.id
    });

    return createdResponse(
      res,
      trigger,
      "Notification trigger created successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getNotificationTriggersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const triggers = await getNotificationTriggers({
      eventType: query.eventType as string,
      isActive: query.isActive ? query.isActive === 'true' : undefined
    });

    return successResponse(
      res,
      triggers,
      "Notification triggers fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const triggerNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    
    const results = await triggerNotification(body.eventType, body.eventData);

    return successResponse(
      res,
      results,
      "Notification triggered successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Conversation Management Controllers
export const getConversationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const conversations = await getConversations({
      status: query.status as string,
      patientId: query.patientId as string,
      phoneNumber: query.phoneNumber as string
    });

    return successResponse(
      res,
      conversations,
      "Conversations fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateConversationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;
    
    const conversation = await updateConversation(params.id as string, body);

    return successResponse(
      res,
      conversation,
      "Conversation updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Incoming Messages Controllers
export const getIncomingMessagesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const messages = await getIncomingMessages({
      isProcessed: query.isProcessed ? query.isProcessed === 'true' : undefined,
      conversationId: query.conversationId as string,
      patientId: query.patientId as string,
      limit: query.limit ? parseInt(query.limit as string) : undefined
    });

    return successResponse(
      res,
      messages,
      "Incoming messages fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const markMessageAsProcessedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    const message = await markMessageAsProcessed(params.id as string);

    return successResponse(
      res,
      message,
      "Message marked as processed successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Premium AI-Powered Controllers

export const sendMessageWithAIController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    
    const result = await sendMessageWithAI({
      ...body,
      createdBy: req.user?.id
    });

    return successResponse(
      res,
      result,
      "Message sent with AI analysis successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getConversationWithAIController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    const result = await getConversationWithAI(params.id as string);

    return successResponse(
      res,
      result,
      "Conversation with AI insights fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getSuggestedResponseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const query = (req as any).validated?.query || req.query;
    
    const result = await getSuggestedResponse(
      params.id as string,
      query.aiModel as string
    );

    return successResponse(
      res,
      result,
      "Suggested response generated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getOptimalEngagementTimeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    const result = await getOptimalEngagementTime(params.patientId as string);

    return successResponse(
      res,
      result,
      "Optimal engagement time predicted successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getPersonalizedContentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const query = (req as any).validated?.query || req.query;
    
    const result = await getPersonalizedContent(
      params.patientId as string,
      query.messageType as string
    );

    return successResponse(
      res,
      result,
      "Personalized content suggestions generated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateConversationWithBroadcastController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;
    
    const result = await updateConversationWithBroadcast(params.id as string, body);

    return successResponse(
      res,
      result,
      "Conversation updated and broadcast successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const processIncomingMessageWithAIController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    
    const result = await processIncomingMessageWithAI(body);

    return successResponse(
      res,
      result,
      "Incoming message processed with AI successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getDashboardOverviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getDashboardOverview();

    return successResponse(
      res,
      result,
      "Dashboard overview fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Campaign Management Controllers

export const createCampaignController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = (req as any).validated?.body || req.body;
    
    const campaign = await WhatsAppCampaignService.createCampaign({
      ...body,
      createdBy: req.user?.id
    });

    return createdResponse(
      res,
      campaign,
      "Campaign created successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getCampaignsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const result = await WhatsAppCampaignService.getCampaigns({
      status: query.status as string,
      campaignType: query.campaignType as string,
      createdBy: query.createdBy as string,
      limit: query.limit ? parseInt(query.limit as string) : undefined,
      offset: query.offset ? parseInt(query.offset as string) : undefined
    });

    return successResponse(
      res,
      result,
      "Campaigns fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getCampaignController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    const campaign = await WhatsAppCampaignService.getCampaign(params.id as string);

    return successResponse(
      res,
      campaign,
      "Campaign fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateCampaignController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;
    
    const campaign = await WhatsAppCampaignService.updateCampaign(params.id as string, body);

    return successResponse(
      res,
      campaign,
      "Campaign updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const scheduleCampaignController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;
    
    const campaign = await WhatsAppCampaignService.scheduleCampaign(
      params.id as string,
      new Date(body.scheduledFor)
    );

    return successResponse(
      res,
      campaign,
      "Campaign scheduled successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const sendCampaignController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    const campaign = await WhatsAppCampaignService.sendCampaign(params.id as string);

    return successResponse(
      res,
      campaign,
      "Campaign sent successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const cancelCampaignController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    const campaign = await WhatsAppCampaignService.cancelCampaign(params.id as string);

    return successResponse(
      res,
      campaign,
      "Campaign cancelled successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const deleteCampaignController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    await WhatsAppCampaignService.deleteCampaign(params.id as string);

    return successResponse(
      res,
      { success: true },
      "Campaign deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getCampaignStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    
    const stats = await WhatsAppCampaignService.getCampaignStats(params.id as string);

    return successResponse(
      res,
      stats,
      "Campaign statistics fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const duplicateCampaignController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = (req as any).validated?.params || req.params;
    const body = (req as any).validated?.body || req.body;
    
    const campaign = await WhatsAppCampaignService.duplicateCampaign(
      params.id as string,
      body.name
    );

    return createdResponse(
      res,
      campaign,
      "Campaign duplicated successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Analytics Controllers

export const getOverviewMetricsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const startDate = query.startDate ? new Date(query.startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate as string) : new Date();
    
    const metrics = await WhatsAppAnalyticsService.getOverviewMetrics(startDate, endDate);

    return successResponse(
      res,
      metrics,
      "Overview metrics fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getTemplatePerformanceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const startDate = query.startDate ? new Date(query.startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate as string) : new Date();
    
    const performance = await WhatsAppAnalyticsService.getTemplatePerformance(startDate, endDate);

    return successResponse(
      res,
      performance,
      "Template performance fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getHourlyMetricsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const date = query.date ? new Date(query.date as string) : new Date();
    
    const metrics = await WhatsAppAnalyticsService.getHourlyMetrics(date);

    return successResponse(
      res,
      metrics,
      "Hourly metrics fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getDailyMetricsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const startDate = query.startDate ? new Date(query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate as string) : new Date();
    
    const metrics = await WhatsAppAnalyticsService.getDailyMetrics(startDate, endDate);

    return successResponse(
      res,
      metrics,
      "Daily metrics fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getSentimentTrendsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const startDate = query.startDate ? new Date(query.startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate as string) : new Date();
    
    const trends = await WhatsAppAnalyticsService.getSentimentTrends(startDate, endDate);

    return successResponse(
      res,
      trends,
      "Sentiment trends fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getCostAnalysisController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const startDate = query.startDate ? new Date(query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate as string) : new Date();
    
    const analysis = await WhatsAppAnalyticsService.getCostAnalysis(startDate, endDate);

    return successResponse(
      res,
      analysis,
      "Cost analysis fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getConversationAnalyticsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const startDate = query.startDate ? new Date(query.startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate as string) : new Date();
    
    const analytics = await WhatsAppAnalyticsService.getConversationAnalytics(startDate, endDate);

    return successResponse(
      res,
      analytics,
      "Conversation analytics fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const generateReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req as any).validated?.query || req.query;
    
    const startDate = query.startDate ? new Date(query.startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate as string) : new Date();
    const reportType = query.reportType as string || 'comprehensive';
    
    const report = await WhatsAppAnalyticsService.generateReport(startDate, endDate, reportType);

    return successResponse(
      res,
      report,
      "Report generated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getRealTimeDashboardController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dashboard = await WhatsAppAnalyticsService.getRealTimeDashboard();

    return successResponse(
      res,
      dashboard,
      "Real-time dashboard data fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};