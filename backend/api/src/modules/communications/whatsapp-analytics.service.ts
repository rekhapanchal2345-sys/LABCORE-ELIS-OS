import prisma from "../../lib/prisma";

// WhatsApp Analytics Service
export class WhatsAppAnalyticsService {
  
  /**
   * Get overview metrics for a date range
   */
  static async getOverviewMetrics(startDate: Date, endDate: Date) {
    try {
      const scheduledMessages = await prisma.whatsappScheduledMessage.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      const incomingMessages = await prisma.whatsappIncomingMessage.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      const conversations = await prisma.whatsappConversation.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      const campaigns = await prisma.whatsappCampaign.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      const metrics = {
        sent: scheduledMessages.filter(m => m.status === 'SENT').length,
        delivered: scheduledMessages.filter(m => m.status === 'SENT').length, // Assuming sent = delivered
        failed: scheduledMessages.filter(m => m.status === 'FAILED').length,
        pending: scheduledMessages.filter(m => m.status === 'PENDING').length,
        read: scheduledMessages.filter(m => m.status === 'SENT').length * 0.7, // Estimate
        incoming: incomingMessages.length,
        conversations: conversations.length,
        activeConversations: conversations.filter(c => c.status === 'ACTIVE').length,
        campaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'SENDING' || c.status === 'SCHEDULED').length
      };
      
      const total = metrics.sent + metrics.failed;
      const deliveryRate = total > 0 ? (metrics.delivered / total) * 100 : 0;
      const failureRate = total > 0 ? (metrics.failed / total) * 100 : 0;
      const readRate = metrics.delivered > 0 ? (metrics.read / metrics.delivered) * 100 : 0;
      
      return {
        metrics,
        rates: {
          delivery: deliveryRate,
          failure: failureRate,
          read: readRate
        },
        cost: metrics.sent * 0.05 // Estimate cost
      };
    } catch (error) {
      console.error('[WhatsApp Analytics] Error getting overview metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get metrics by template
   */
  static async getTemplatePerformance(startDate: Date, endDate: Date) {
    try {
      const messages = await prisma.whatsappScheduledMessage.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          templateId: { not: null }
        },
        include: {
          template: true
        }
      });
      
      const templateStats: Record<string, any> = {};
      
      messages.forEach(message => {
        const templateId = message.templateId || 'unknown';
        const templateName = message.template?.displayName || message.templateName || 'Unknown';
        
        if (!templateStats[templateId]) {
          templateStats[templateId] = {
            templateId,
            templateName,
            sent: 0,
            delivered: 0,
            failed: 0,
            read: 0
          };
        }
        
        templateStats[templateId].sent++;
        if (message.status === 'SENT') {
          templateStats[templateId].delivered++;
          templateStats[templateId].read += 0.7; // Estimate
        } else if (message.status === 'FAILED') {
          templateStats[templateId].failed++;
        }
      });
      
      // Calculate rates for each template
      return Object.values(templateStats).map(stat => ({
        ...stat,
        deliveryRate: stat.sent > 0 ? (stat.delivered / stat.sent) * 100 : 0,
        failureRate: stat.sent > 0 ? (stat.failed / stat.sent) * 100 : 0,
        readRate: stat.delivered > 0 ? (stat.read / stat.delivered) * 100 : 0
      })).sort((a, b) => b.sent - a.sent);
    } catch (error) {
      console.error('[WhatsApp Analytics] Error getting template performance:', error);
      throw error;
    }
  }
  
  /**
   * Get hourly metrics for charts
   */
  static async getHourlyMetrics(date: Date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const messages = await prisma.whatsappScheduledMessage.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });
      
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        sent: 0,
        delivered: 0,
        failed: 0,
        incoming: 0
      }));
      
      messages.forEach(message => {
        const hour = message.createdAt.getHours();
        if (hourlyData[hour]) {
          hourlyData[hour].sent++;
          if (message.status === 'SENT') {
            hourlyData[hour].delivered++;
          } else if (message.status === 'FAILED') {
            hourlyData[hour].failed++;
          }
        }
      });
      
      // Get incoming messages
      const incomingMessages = await prisma.whatsappIncomingMessage.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });
      
      incomingMessages.forEach(message => {
        const hour = message.createdAt.getHours();
        if (hourlyData[hour]) {
          hourlyData[hour].incoming++;
        }
      });
      
      return hourlyData;
    } catch (error) {
      console.error('[WhatsApp Analytics] Error getting hourly metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get daily metrics for a date range
   */
  static async getDailyMetrics(startDate: Date, endDate: Date) {
    try {
      const messages = await prisma.whatsappScheduledMessage.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      const dailyData: Record<string, any> = {};
      
      messages.forEach(message => {
        const date = message.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            sent: 0,
            delivered: 0,
            failed: 0,
            incoming: 0
          };
        }
        
        dailyData[date].sent++;
        if (message.status === 'SENT') {
          dailyData[date].delivered++;
        } else if (message.status === 'FAILED') {
          dailyData[date].failed++;
        }
      });
      
      // Get incoming messages
      const incomingMessages = await prisma.whatsappIncomingMessage.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      incomingMessages.forEach(message => {
        const date = message.createdAt.toISOString().slice(0, 10);
        if (dailyData[date]) {
          dailyData[date].incoming++;
        }
      });
      
      return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('[WhatsApp Analytics] Error getting daily metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get sentiment analysis trends
   */
  static async getSentimentTrends(startDate: Date, endDate: Date) {
    try {
      const sentiments = await prisma.whatsappSentiment.findMany({
        where: {
          analyzedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          conversation: true
        }
      });
      
      const dailySentiment: Record<string, any> = {};
      
      sentiments.forEach(sentiment => {
        const date = sentiment.analyzedAt.toISOString().slice(0, 10);
        if (!dailySentiment[date]) {
          dailySentiment[date] = {
            date,
            positive: 0,
            neutral: 0,
            negative: 0,
            totalScore: 0,
            count: 0
          };
        }
        
        if (sentiment.overallSentiment === 'POSITIVE') {
          dailySentiment[date].positive++;
        } else if (sentiment.overallSentiment === 'NEGATIVE') {
          dailySentiment[date].negative++;
        } else {
          dailySentiment[date].neutral++;
        }
        
        dailySentiment[date].totalScore += Number(sentiment.sentimentScore);
        dailySentiment[date].count++;
      });
      
      // Calculate average scores
      return Object.values(dailySentiment).map(data => ({
        ...data,
        averageScore: data.count > 0 ? data.totalScore / data.count : 0,
        positiveRate: data.count > 0 ? (data.positive / data.count) * 100 : 0,
        negativeRate: data.count > 0 ? (data.negative / data.count) * 100 : 0
      })).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('[WhatsApp Analytics] Error getting sentiment trends:', error);
      throw error;
    }
  }
  
  /**
   * Get cost analysis
   */
  static async getCostAnalysis(startDate: Date, endDate: Date) {
    try {
      const messages = await prisma.whatsappScheduledMessage.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      const campaigns = await prisma.whatsappCampaign.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });
      
      const costPerMessage = 0.05; // Adjust based on actual pricing
      
      const messageCost = messages.filter(m => m.status === 'SENT').length * costPerMessage;
      const campaignCost = campaigns.reduce((total, campaign) => {
        return total + (campaign.actualCost ? Number(campaign.actualCost) : 0);
      }, 0);
      
      const totalCost = messageCost + campaignCost;
      
      // Cost breakdown by type
      const costByType = {
        individual: messageCost,
        campaigns: campaignCost
      };
      
      // Cost by day
      const dailyCost: Record<string, number> = {};
      messages.forEach(message => {
        if (message.status === 'SENT') {
          const date = message.createdAt.toISOString().slice(0, 10);
          dailyCost[date] = (dailyCost[date] || 0) + costPerMessage;
        }
      });
      
      return {
        totalCost,
        costByType,
        dailyCost: Object.entries(dailyCost).map(([date, cost]) => ({ date, cost })),
        messageCount: messages.filter(m => m.status === 'SENT').length,
        campaignCount: campaigns.length,
        averageCostPerMessage: messages.filter(m => m.status === 'SENT').length > 0 
          ? totalCost / messages.filter(m => m.status === 'SENT').length 
          : 0
      };
    } catch (error) {
      console.error('[WhatsApp Analytics] Error getting cost analysis:', error);
      throw error;
    }
  }
  
  /**
   * Get conversation analytics
   */
  static async getConversationAnalytics(startDate: Date, endDate: Date) {
    try {
      const conversations = await prisma.whatsappConversation.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          incomingMessages: true,
          patient: true
        }
      });
      
      const analytics = {
        total: conversations.length,
        active: conversations.filter(c => c.status === 'ACTIVE').length,
        closed: conversations.filter(c => c.status === 'CLOSED').length,
        withMessages: conversations.filter(c => c.messageCount > 0).length,
        averageMessages: 0,
        averageResponseTime: 0, // Would need more detailed tracking
        topContacts: [] as any[]
      };
      
      if (conversations.length > 0) {
        analytics.averageMessages = conversations.reduce((sum, c) => sum + c.messageCount, 0) / conversations.length;
      }
      
      // Get top contacts by message count
      const contactCounts: Record<string, any> = {};
      conversations.forEach(conv => {
        const phone = conv.phoneNumber;
        if (!contactCounts[phone]) {
          contactCounts[phone] = {
            phone,
            messageCount: 0,
            patientName: conv.patient ? `${conv.patient.firstName} ${conv.patient.lastName}` : 'Unknown'
          };
        }
        contactCounts[phone].messageCount += conv.messageCount;
      });
      
      analytics.topContacts = Object.values(contactCounts)
        .sort((a, b) => b.messageCount - a.messageCount)
        .slice(0, 10);
      
      return analytics;
    } catch (error) {
      console.error('[WhatsApp Analytics] Error getting conversation analytics:', error);
      throw error;
    }
  }
  
  /**
   * Generate analytics report
   */
  static async generateReport(startDate: Date, endDate: Date, reportType: string) {
    try {
      const report = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        generatedAt: new Date().toISOString(),
        type: reportType
      };
      
      switch (reportType) {
        case 'overview':
          return {
            ...report,
            data: await this.getOverviewMetrics(startDate, endDate)
          };
        case 'templates':
          return {
            ...report,
            data: await this.getTemplatePerformance(startDate, endDate)
          };
        case 'sentiment':
          return {
            ...report,
            data: await this.getSentimentTrends(startDate, endDate)
          };
        case 'cost':
          return {
            ...report,
            data: await this.getCostAnalysis(startDate, endDate)
          };
        case 'conversations':
          return {
            ...report,
            data: await this.getConversationAnalytics(startDate, endDate)
          };
        case 'comprehensive':
          return {
            ...report,
            data: {
              overview: await this.getOverviewMetrics(startDate, endDate),
              templates: await this.getTemplatePerformance(startDate, endDate),
              sentiment: await this.getSentimentTrends(startDate, endDate),
              cost: await this.getCostAnalysis(startDate, endDate),
              conversations: await this.getConversationAnalytics(startDate, endDate)
            }
          };
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
    } catch (error) {
      console.error('[WhatsApp Analytics] Error generating report:', error);
      throw error;
    }
  }
  
  /**
   * Aggregate and store daily analytics (cron job)
   */
  static async aggregateDailyAnalytics(date: Date = new Date()) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const metrics = await this.getOverviewMetrics(startOfDay, endOfDay);
      
      // Check if analytics already exist for this date
      const existing = await prisma.whatsappAnalytics.findUnique({
        where: {
          date_period: {
            date: startOfDay,
            period: 'DAILY'
          }
        }
      });
      
      const analyticsData = {
        date: startOfDay,
        period: 'DAILY',
        sentCount: metrics.metrics.sent,
        deliveredCount: metrics.metrics.delivered,
        readCount: metrics.metrics.read,
        failedCount: metrics.metrics.failed,
        cost: metrics.cost,
        templateBreakdown: null, // Could be populated separately
        metrics: metrics
      };
      
      if (existing) {
        return await prisma.whatsappAnalytics.update({
          where: { id: existing.id },
          data: analyticsData
        });
      } else {
        return await prisma.whatsappAnalytics.create({
          data: analyticsData
        });
      }
    } catch (error) {
      console.error('[WhatsApp Analytics] Error aggregating daily analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get aggregated analytics for a date range
   */
  static async getAggregatedAnalytics(startDate: Date, endDate: Date, period: string = 'DAILY') {
    try {
      const analytics = await prisma.whatsappAnalytics.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          period
        },
        orderBy: { date: 'asc' }
      });
      
      return analytics;
    } catch (error) {
      console.error('[WhatsApp Analytics] Error getting aggregated analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get real-time dashboard data
   */
  static async getRealTimeDashboard() {
    try {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const [
        todayMetrics,
        weekMetrics,
        recentConversations,
        activeCampaigns,
        pendingMessages
      ] = await Promise.all([
        this.getOverviewMetrics(startOfToday, now),
        this.getOverviewMetrics(startOfWeek, now),
        prisma.whatsappConversation.findMany({
          where: { status: 'ACTIVE' },
          orderBy: { lastMessageAt: 'desc' },
          take: 10,
          include: {
            patient: {
              select: {
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        }),
        prisma.whatsappCampaign.findMany({
          where: { status: { in: ['SENDING', 'SCHEDULED'] } },
          orderBy: { scheduledFor: 'asc' },
          take: 5
        }),
        prisma.whatsappScheduledMessage.count({
          where: { status: 'PENDING' }
        })
      ]);
      
      return {
        today: todayMetrics,
        week: weekMetrics,
        recentConversations,
        activeCampaigns,
        pendingMessages,
        timestamp: now.toISOString()
      };
    } catch (error) {
      console.error('[WhatsApp Analytics] Error getting real-time dashboard:', error);
      throw error;
    }
  }
}