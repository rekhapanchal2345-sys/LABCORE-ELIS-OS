import prisma from "../../lib/prisma";
import { sendWhatsApp } from "../../lib/communication-providers";
import { WhatsAppAIService } from "../../lib/whatsapp-ai.service";

// Campaign Management Service
export class WhatsAppCampaignService {
  
  /**
   * Create a new WhatsApp campaign
   */
  static async createCampaign(data: {
    name: string;
    description?: string;
    campaignType: string;
    templateId?: string;
    messageContent?: string;
    targetAudience: any;
    createdBy?: string;
    aBTestEnabled?: boolean;
    aBTestVariants?: any;
  }) {
    try {
      // Calculate recipient count based on audience filters
      const recipientCount = await this.calculateRecipientCount(data.targetAudience);
      
      // Estimate cost (simple calculation)
      const costPerMessage = 0.05; // Adjust based on actual WhatsApp pricing
      const costEstimate = recipientCount * costPerMessage;
      
      const campaign = await prisma.whatsappCampaign.create({
        data: {
          name: data.name,
          description: data.description,
          campaignType: data.campaignType,
          templateId: data.templateId,
          messageContent: data.messageContent,
          targetAudience: data.targetAudience,
          recipientCount,
          costEstimate,
          aBTestEnabled: data.aBTestEnabled || false,
          aBTestVariants: data.aBTestVariants,
          createdBy: data.createdBy,
          status: 'DRAFT'
        }
      });
      
      return campaign;
    } catch (error) {
      console.error('[WhatsApp Campaign] Error creating campaign:', error);
      throw error;
    }
  }
  
  /**
   * Calculate recipient count based on audience filters
   */
  private static async calculateRecipientCount(targetAudience: any): Promise<number> {
    try {
      const where: any = {};
      
      // Apply audience filters
      if (targetAudience.phone && targetAudience.phone.length > 0) {
        where.phone = { in: targetAudience.phone };
      }
      
      if (targetAudience.testCategories && targetAudience.testCategories.length > 0) {
        // Complex query for patients who ordered specific test categories
        // This would require more complex Prisma queries
      }
      
      if (targetAudience.dateRange) {
        where.createdAt = {
          gte: new Date(targetAudience.dateRange.start),
          lte: new Date(targetAudience.dateRange.end)
        };
      }
      
      const count = await prisma.patient.count({ where });
      return count;
    } catch (error) {
      console.error('[WhatsApp Campaign] Error calculating recipient count:', error);
      return 0;
    }
  }
  
  /**
   * Get campaign recipients based on audience filters
   */
  private static async getCampaignRecipients(targetAudience: any): Promise<Array<{
    phone: string;
    patientId?: string;
  }>> {
    try {
      const where: any = { phone: { not: null } };
      
      if (targetAudience.phone && targetAudience.phone.length > 0) {
        where.phone = { in: targetAudience.phone };
      }
      
      if (targetAudience.dateRange) {
        where.createdAt = {
          gte: new Date(targetAudience.dateRange.start),
          lte: new Date(targetAudience.dateRange.end)
        };
      }
      
      const patients = await prisma.patient.findMany({
        where,
        select: {
          id: true,
          phone: true
        }
      });
      
      return patients.map(p => ({
        phone: p.phone!,
        patientId: p.id
      }));
    } catch (error) {
      console.error('[WhatsApp Campaign] Error getting campaign recipients:', error);
      return [];
    }
  }
  
  /**
   * Schedule a campaign for future delivery
   */
  static async scheduleCampaign(campaignId: string, scheduledFor: Date) {
    try {
      const campaign = await prisma.whatsappCampaign.update({
        where: { id: campaignId },
        data: {
          scheduledFor,
          status: 'SCHEDULED'
        }
      });
      
      // Create scheduled messages for all recipients
      const recipients = await this.getCampaignRecipients(campaign.targetAudience);
      
      for (const recipient of recipients) {
        await prisma.whatsappScheduledMessage.create({
          data: {
            recipientPhone: recipient.phone,
            patientId: recipient.patientId,
            templateName: campaign.messageContent || 'Campaign Message',
            templateId: campaign.templateId,
            messageBody: campaign.messageContent,
            scheduledFor,
            campaignId: campaign.id,
            status: 'PENDING'
          }
        });
      }
      
      return campaign;
    } catch (error) {
      console.error('[WhatsApp Campaign] Error scheduling campaign:', error);
      throw error;
    }
  }
  
  /**
   * Send campaign immediately
   */
  static async sendCampaign(campaignId: string) {
    try {
      const campaign = await prisma.whatsappCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'SENDING',
          sentAt: new Date()
        }
      });
      
      const recipients = await this.getCampaignRecipients(campaign.targetAudience);
      let sentCount = 0;
      let deliveredCount = 0;
      let failedCount = 0;
      
      // Process in batches to avoid overwhelming the API
      const batchSize = 50;
      
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        for (const recipient of batch) {
          try {
            let result;
            
            if (campaign.templateId) {
              // Send template message
              result = await sendWhatsApp({
                to: recipient.phone,
                templateName: campaign.templateId,
                message: campaign.messageContent
              });
            } else {
              // Send custom message
              result = await sendWhatsApp({
                to: recipient.phone,
                message: campaign.messageContent
              });
            }
            
            if (result.success) {
              sentCount++;
              deliveredCount++;
              
              // Log communication
              if (recipient.patientId) {
                await prisma.communicationLog.create({
                  data: {
                    patientId: recipient.patientId,
                    type: 'WHATSAPP',
                    status: 'SENT',
                    recipientContact: recipient.phone,
                    subject: `Campaign: ${campaign.name}`,
                    message: campaign.messageContent,
                    provider: 'whatsapp',
                    providerMessageId: result.messageId,
                    sentAt: new Date()
                  }
                });
              }
            } else {
              failedCount++;
            }
          } catch (error) {
            failedCount++;
            console.error(`[WhatsApp Campaign] Error sending to ${recipient.phone}:`, error);
          }
        }
        
        // Add delay between batches
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Update campaign with results
      const updatedCampaign = await prisma.whatsappCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'SENT',
          sentCount,
          deliveredCount,
          failedCount,
          actualCost: sentCount * 0.05 // Adjust based on actual pricing
        }
      });
      
      return updatedCampaign;
    } catch (error) {
      console.error('[WhatsApp Campaign] Error sending campaign:', error);
      throw error;
    }
  }
  
  /**
   * Get campaign by ID
   */
  static async getCampaign(campaignId: string) {
    try {
      const campaign = await prisma.whatsappCampaign.findUnique({
        where: { id: campaignId },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          messages: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      
      return campaign;
    } catch (error) {
      console.error('[WhatsApp Campaign] Error getting campaign:', error);
      throw error;
    }
  }
  
  /**
   * Get all campaigns with filters
   */
  static async getCampaigns(filters?: {
    status?: string;
    campaignType?: string;
    createdBy?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};
      
      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.campaignType) {
        where.campaignType = filters.campaignType;
      }
      if (filters?.createdBy) {
        where.createdBy = filters.createdBy;
      }
      
      const campaigns = await prisma.whatsappCampaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
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
      
      const total = await prisma.whatsappCampaign.count({ where });
      
      return {
        campaigns,
        total,
        hasMore: (filters?.offset || 0) + campaigns.length < total
      };
    } catch (error) {
      console.error('[WhatsApp Campaign] Error getting campaigns:', error);
      throw error;
    }
  }
  
  /**
   * Update campaign
   */
  static async updateCampaign(campaignId: string, data: any) {
    try {
      const campaign = await prisma.whatsappCampaign.findUnique({
        where: { id: campaignId }
      });
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      // Only allow updates if campaign is in DRAFT status
      if (campaign.status !== 'DRAFT') {
        throw new Error('Can only update campaigns in DRAFT status');
      }
      
      // Recalculate recipient count if audience changed
      let recipientCount = campaign.recipientCount;
      let costEstimate = campaign.costEstimate;
      
      if (data.targetAudience) {
        recipientCount = await this.calculateRecipientCount(data.targetAudience);
        costEstimate = recipientCount * 0.05;
      }
      
      const updatedCampaign = await prisma.whatsappCampaign.update({
        where: { id: campaignId },
        data: {
          ...data,
          recipientCount,
          costEstimate
        }
      });
      
      return updatedCampaign;
    } catch (error) {
      console.error('[WhatsApp Campaign] Error updating campaign:', error);
      throw error;
    }
  }
  
  /**
   * Cancel campaign
   */
  static async cancelCampaign(campaignId: string) {
    try {
      const campaign = await prisma.whatsappCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'CANCELLED'
        }
      });
      
      // Cancel all associated scheduled messages
      await prisma.whatsappScheduledMessage.updateMany({
        where: { campaignId },
        data: {
          status: 'CANCELLED'
        }
      });
      
      return campaign;
    } catch (error) {
      console.error('[WhatsApp Campaign] Error cancelling campaign:', error);
      throw error;
    }
  }
  
  /**
   * Delete campaign
   */
  static async deleteCampaign(campaignId: string) {
    try {
      // Delete associated scheduled messages first
      await prisma.whatsappScheduledMessage.deleteMany({
        where: { campaignId }
      });
      
      // Delete campaign
      await prisma.whatsappCampaign.delete({
        where: { id: campaignId }
      });
      
      return { success: true };
    } catch (error) {
      console.error('[WhatsApp Campaign] Error deleting campaign:', error);
      throw error;
    }
  }
  
  /**
   * Get campaign statistics
   */
  static async getCampaignStats(campaignId: string) {
    try {
      const campaign = await prisma.whatsappCampaign.findUnique({
        where: { id: campaignId },
        include: {
          messages: true
        }
      });
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      const messages = campaign.messages;
      
      const stats = {
        total: messages.length,
        sent: messages.filter(m => m.status === 'SENT').length,
        delivered: messages.filter(m => m.status === 'SENT').length, // Assuming sent = delivered for now
        failed: messages.filter(m => m.status === 'FAILED').length,
        pending: messages.filter(m => m.status === 'PENDING').length,
        cancelled: messages.filter(m => m.status === 'CANCELLED').length
      };
      
      return {
        campaign,
        stats,
        deliveryRate: stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0,
        failureRate: stats.total > 0 ? (stats.failed / stats.total) * 100 : 0
      };
    } catch (error) {
      console.error('[WhatsApp Campaign] Error getting campaign stats:', error);
      throw error;
    }
  }
  
  /**
   * Get campaign performance over time
   */
  static async getCampaignPerformance(campaignId: string) {
    try {
      const campaign = await prisma.whatsappCampaign.findUnique({
        where: { id: campaignId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      // Group messages by hour
      const hourlyData: Record<string, any> = {};
      
      campaign.messages.forEach(message => {
        const hour = new Date(message.createdAt).toISOString().slice(0, 13); // YYYY-MM-DDTHH
        if (!hourlyData[hour]) {
          hourlyData[hour] = {
            timestamp: hour,
            sent: 0,
            delivered: 0,
            failed: 0
          };
        }
        
        if (message.status === 'SENT') {
          hourlyData[hour].sent++;
          hourlyData[hour].delivered++;
        } else if (message.status === 'FAILED') {
          hourlyData[hour].failed++;
        }
      });
      
      return {
        campaign,
        performance: Object.values(hourlyData)
      };
    } catch (error) {
      console.error('[WhatsApp Campaign] Error getting campaign performance:', error);
      throw error;
    }
  }
  
  /**
   * Process scheduled campaigns (cron job)
   */
  static async processScheduledCampaigns() {
    try {
      const now = new Date();
      
      const campaigns = await prisma.whatsappCampaign.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledFor: { lte: now }
        }
      });
      
      const results = [];
      
      for (const campaign of campaigns) {
        try {
          const result = await this.sendCampaign(campaign.id);
          results.push({
            campaignId: campaign.id,
            success: true,
            sentCount: result.sentCount
          });
        } catch (error) {
          results.push({
            campaignId: campaign.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('[WhatsApp Campaign] Error processing scheduled campaigns:', error);
      throw error;
    }
  }
  
  /**
   * Duplicate campaign
   */
  static async duplicateCampaign(campaignId: string, newName?: string) {
    try {
      const originalCampaign = await prisma.whatsappCampaign.findUnique({
        where: { id: campaignId }
      });
      
      if (!originalCampaign) {
        throw new Error('Campaign not found');
      }
      
      const duplicatedCampaign = await prisma.whatsappCampaign.create({
        data: {
          name: newName || `${originalCampaign.name} (Copy)`,
          description: originalCampaign.description,
          campaignType: originalCampaign.campaignType,
          templateId: originalCampaign.templateId,
          messageContent: originalCampaign.messageContent,
          targetAudience: originalCampaign.targetAudience,
          recipientCount: originalCampaign.recipientCount,
          costEstimate: originalCampaign.costEstimate,
          aBTestEnabled: originalCampaign.aBTestEnabled,
          aBTestVariants: originalCampaign.aBTestVariants,
          createdBy: originalCampaign.createdBy,
          status: 'DRAFT'
        }
      });
      
      return duplicatedCampaign;
    } catch (error) {
      console.error('[WhatsApp Campaign] Error duplicating campaign:', error);
      throw error;
    }
  }
}