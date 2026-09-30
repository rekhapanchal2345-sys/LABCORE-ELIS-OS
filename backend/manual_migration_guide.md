# Manual Database Migration Guide

Since the automated migration command may fail due to PowerShell execution policies, follow these manual steps:

## Option 1: Enable PowerShell Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd backend
npx prisma migrate dev --name add_whatsapp_advanced_features
```

## Option 2: Generate Prisma Client Directly
If you don't need the migration history, you can generate the client directly:
```bash
cd backend
npx prisma generate
```

## Option 3: Manual SQL Migration
If the above options don't work, you can manually execute the SQL commands:

```sql
-- Create WhatsApp Templates table
CREATE TABLE "whatsapp_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "components" JSONB,
    "templateId" TEXT,
    "templateStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "qualityRating" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "whatsapp_templates_pkey" PRIMARY KEY ("id")
);

-- Create WhatsApp Scheduled Messages table
CREATE TABLE "whatsapp_scheduled_messages" (
    "id" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL DEFAULT 'individual',
    "templateId" TEXT,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "messageBody" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "templateVariables" JSONB,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "providerMessageId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorReason" TEXT,
    "errorMessage" TEXT,
    "patientId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "whatsapp_scheduled_messages_pkey" PRIMARY KEY ("id")
);

-- Create WhatsApp Incoming Messages table
CREATE TABLE "whatsapp_incoming_messages" (
    "id" TEXT NOT NULL,
    "senderPhone" TEXT NOT NULL,
    "senderType" TEXT NOT NULL DEFAULT 'individual',
    "messageBody" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaMimeType" TEXT,
    "mediaFilename" TEXT,
    "interactiveType" TEXT,
    "interactiveData" JSONB,
    "replyToMessageId" TEXT,
    "webhookTimestamp" TIMESTAMP(3) NOT NULL,
    "webhookMessageId" TEXT,
    "webhookPayload" JSONB,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "conversationId" TEXT,
    "patientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "whatsapp_incoming_messages_pkey" PRIMARY KEY ("id")
);

-- Create WhatsApp Conversations table
CREATE TABLE "whatsapp_conversations" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentState" TEXT NOT NULL DEFAULT 'INITIAL',
    "stateData" JSONB,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT,
    "chatbotEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "whatsapp_conversations_pkey" PRIMARY KEY ("id")
);

-- Create WhatsApp Auto Reply Rules table
CREATE TABLE "whatsapp_auto_reply_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "triggerType" TEXT NOT NULL DEFAULT 'KEYWORD',
    "triggerData" JSONB,
    "responseType" TEXT NOT NULL DEFAULT 'TEXT',
    "responseText" TEXT NOT NULL,
    "templateId" TEXT,
    "interactiveType" TEXT,
    "interactiveData" JSONB,
    "delaySeconds" INTEGER NOT NULL DEFAULT 0,
    "maxResponsesPerDay" INTEGER,
    "cooldownSeconds" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "patientSegment" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "whatsapp_auto_reply_rules_pkey" PRIMARY KEY ("id")
);

-- Create WhatsApp Notification Triggers table
CREATE TABLE "whatsapp_notification_triggers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "eventType" TEXT NOT NULL,
    "eventFilter" JSONB,
    "templateId" TEXT NOT NULL,
    "variableMapping" JSONB,
    "recipientType" TEXT NOT NULL DEFAULT 'PATIENT',
    "recipientFilter" JSONB,
    "sendImmediately" BOOLEAN NOT NULL DEFAULT true,
    "delayMinutes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "whatsapp_notification_triggers_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "whatsapp_scheduled_messages" ADD CONSTRAINT "whatsapp_scheduled_messages_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "whatsapp_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "whatsapp_scheduled_messages" ADD CONSTRAINT "whatsapp_scheduled_messages_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "whatsapp_scheduled_messages" ADD CONSTRAINT "whatsapp_scheduled_messages_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "whatsapp_incoming_messages" ADD CONSTRAINT "whatsapp_incoming_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "whatsapp_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "whatsapp_incoming_messages" ADD CONSTRAINT "whatsapp_incoming_messages_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "whatsapp_templates" ADD CONSTRAINT "whatsapp_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "whatsapp_templates" ADD CONSTRAINT "whatsapp_templates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "whatsapp_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "whatsapp_auto_reply_rules" ADD CONSTRAINT "whatsapp_auto_reply_rules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "whatsapp_notification_triggers" ADD CONSTRAINT "whatsapp_notification_triggers_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "whatsapp_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "whatsapp_notification_triggers" ADD CONSTRAINT "whatsapp_notification_triggers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update User model to include WhatsApp relations
-- (This is handled by Prisma automatically when you run prisma generate)

-- Update Patient model to include WhatsApp relations
-- (This is handled by Prisma automatically when you run prisma generate)

-- Create indexes
CREATE INDEX "whatsapp_templates_templateId_idx" ON "whatsapp_templates"("templateId");
CREATE INDEX "whatsapp_templates_templateStatus_idx" ON "whatsapp_templates"("templateStatus");
CREATE INDEX "whatsapp_templates_category_idx" ON "whatsapp_templates"("category");
CREATE INDEX "whatsapp_templates_isActive_idx" ON "whatsapp_templates"("isActive");

CREATE INDEX "whatsapp_scheduled_messages_scheduledFor_idx" ON "whatsapp_scheduled_messages"("scheduledFor");
CREATE INDEX "whatsapp_scheduled_messages_status_idx" ON "whatsapp_scheduled_messages"("status");
CREATE INDEX "whatsapp_scheduled_messages_templateId_idx" ON "whatsapp_scheduled_messages"("templateId");
CREATE INDEX "whatsapp_scheduled_messages_patientId_idx" ON "whatsapp_scheduled_messages"("patientId");

CREATE INDEX "whatsapp_incoming_messages_senderPhone_idx" ON "whatsapp_incoming_messages"("senderPhone");
CREATE INDEX "whatsapp_incoming_messages_isProcessed_idx" ON "whatsapp_incoming_messages"("isProcessed");
CREATE INDEX "whatsapp_incoming_messages_conversationId_idx" ON "whatsapp_incoming_messages"("conversationId");
CREATE INDEX "whatsapp_incoming_messages_patientId_idx" ON "whatsapp_incoming_messages"("patientId");
CREATE INDEX "whatsapp_incoming_messages_createdAt_idx" ON "whatsapp_incoming_messages"("createdAt");

CREATE INDEX "whatsapp_conversations_phoneNumber_idx" ON "whatsapp_conversations"("phoneNumber");
CREATE INDEX "whatsapp_conversations_status_idx" ON "whatsapp_conversations"("status");
CREATE INDEX "whatsapp_conversations_patientId_idx" ON "whatsapp_conversations"("patientId");

CREATE INDEX "whatsapp_auto_reply_rules_isActive_idx" ON "whatsapp_auto_reply_rules"("isActive");
CREATE INDEX "whatsapp_auto_reply_rules_priority_idx" ON "whatsapp_auto_reply_rules"("priority");

CREATE INDEX "whatsapp_notification_triggers_eventType_idx" ON "whatsapp_notification_triggers"("eventType");
CREATE INDEX "whatsapp_notification_triggers_isActive_idx" ON "whatsapp_notification_triggers"("isActive");
```

## After Manual Migration
After executing the SQL commands, generate the Prisma client:
```bash
cd backend
npx prisma generate
```

## Verification
Check that the tables were created:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'whatsapp_%';
```

The output should show:
- whatsapp_templates
- whatsapp_scheduled_messages
- whatsapp_incoming_messages
- whatsapp_conversations
- whatsapp_auto_reply_rules
- whatsapp_notification_triggers