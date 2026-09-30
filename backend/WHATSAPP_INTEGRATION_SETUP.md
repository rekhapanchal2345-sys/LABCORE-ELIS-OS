# WhatsApp Advanced Integration Setup Instructions

## Overview
This document provides setup instructions for the advanced WhatsApp integration for LabCore ELIS using Meta Cloud API.

## Prerequisites
- Meta WhatsApp Business Account with verified business
- Meta Business App with WhatsApp product enabled
- Access Token with necessary permissions
- Phone number configured in WhatsApp Business Account

## Database Migration

### Method 1: Using Prisma Migrate (Recommended)
```bash
cd backend
npx prisma migrate dev --name add_whatsapp_advanced_features
```

### Method 2: Manual Migration
If the above command fails due to PowerShell execution policies, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd backend
npx prisma migrate dev --name add_whatsapp_advanced_features
```

### Method 3: Generate Client Directly
If migration fails, you can generate the Prisma client directly:
```bash
cd backend
npx prisma generate
```

## Environment Configuration

### Required Environment Variables
Add the following to your `.env` file:

```env
# WhatsApp Provider Configuration
WHATSAPP_PROVIDER=twilio  # or 'cloudapi' for Meta Cloud API
WHATSAPP_API_KEY=your_account_sid_or_access_token
WHATSAPP_API_SECRET=your_auth_token
WHATSAPP_SENDER_ID=whatsapp:+14155238886  # For Twilio
WHATSAPP_BUSINESS_NUMBER=+919723561529  # For Meta Cloud API
WHATSAPP_API_VERSION=v19.0
WHATSAPP_WEBHOOK_SECRET=your_webhook_secret
WHATSAPP_WEBHOOK_VERIFY_TOKEN=labcore_webhook_verify
```

### Meta Cloud API Setup
1. Go to Meta for Developers
2. Create or select your Business App
3. Add WhatsApp product
4. Get your Access Token (System User or Permanent)
5. Get your Phone Number ID
6. Configure webhooks:
   - Webhook URL: `https://your-domain.com/api/communications/whatsapp/webhook`
   - Verify Token: `labcore_webhook_verify` (or your custom token)
   - Subscribe to: `messages`, `message_delivery_status`, `message_template_status_update`

## WhatsApp Business Account Setup

### Step 1: Create Templates
Create message templates in Meta Business Manager or via API:
- Marketing templates for promotions
- Utility templates for order updates, result notifications
- Authentication templates for OTP verification

### Step 2: Configure Webhook
Set up your webhook endpoint to receive:
- Incoming messages from users
- Message status updates (sent, delivered, read)
- Template status updates
- Business capability updates

### Step 3: Test Integration
Use the provided API endpoints to test:
- Send test messages
- Verify webhook connectivity
- Test template messages
- Test interactive messages

## API Endpoints

### Template Management
- `POST /api/communications/whatsapp/templates` - Create template
- `GET /api/communications/whatsapp/templates` - List templates
- `GET /api/communications/whatsapp/templates/:id` - Get template details
- `PUT /api/communications/whatsapp/templates/:id` - Update template
- `DELETE /api/communications/whatsapp/templates/:id` - Delete template

### Scheduled Messages
- `POST /api/communications/whatsapp/schedule` - Schedule message
- `GET /api/communications/whatsapp/scheduled` - List scheduled messages
- `POST /api/communications/whatsapp/scheduled/process` - Process scheduled messages
- `DELETE /api/communications/whatsapp/scheduled/:id` - Cancel scheduled message

### Bulk Messaging
- `POST /api/communications/whatsapp/bulk` - Send bulk messages

### Auto-Reply Rules
- `POST /api/communications/whatsapp/auto-reply` - Create auto-reply rule
- `GET /api/communications/whatsapp/auto-reply` - List auto-reply rules
- `PUT /api/communications/whatsapp/auto-reply/:id` - Update auto-reply rule
- `DELETE /api/communications/whatsapp/auto-reply/:id` - Delete auto-reply rule

### Notification Triggers
- `POST /api/communications/whatsapp/triggers` - Create notification trigger
- `GET /api/communications/whatsapp/triggers` - List notification triggers
- `POST /api/communications/whatsapp/triggers/trigger` - Manually trigger notification

### Conversation Management
- `GET /api/communications/whatsapp/conversations` - List conversations
- `PUT /api/communications/whatsapp/conversations/:id` - Update conversation

### Incoming Messages
- `GET /api/communications/whatsapp/incoming` - List incoming messages
- `PUT /api/communications/whatsapp/incoming/:id/process` - Mark message as processed

### Webhook Endpoints
- `GET /api/communications/whatsapp/webhook` - Webhook verification
- `POST /api/communications/whatsapp/webhook` - Webhook handler

## Automated Notifications

The system now automatically triggers WhatsApp notifications for:

### Patient Registration
When a new patient is registered, triggers `PATIENT_REGISTRATION` event.

### Order Status Changes
When order status changes, triggers `ORDER_STATUS` event.

### Result Approval
When results are approved, triggers `RESULT_APPROVED` event.

To enable these notifications, create corresponding notification triggers using the API.

## Cron Job for Scheduled Messages

Set up a cron job to process scheduled messages:

```bash
# Add to crontab
*/5 * * * * cd /path/to/backend && npm run process-scheduled-messages
```

Or add to package.json scripts:
```json
{
  "scripts": {
    "process-scheduled-messages": "ts-node ./scripts/process-scheduled-messages.ts"
  }
}
```

## Testing Checklist

- [ ] Database migration completed successfully
- [ ] Environment variables configured
- [ ] Webhook endpoint accessible from internet
- [ ] Webhook verification successful
- [ ] Template creation working
- [ ] Test message sent successfully
- [ ] Interactive messages working
- [ ] Scheduled messages processed
- [ ] Auto-reply rules functioning
- [ ] Notification triggers working
- [ ] Incoming messages stored correctly
- [ ] Conversation tracking working

## Troubleshooting

### Webhook Verification Fails
- Check that webhook URL is publicly accessible
- Verify token matches environment variable
- Ensure HTTPS is used for production

### Template Creation Fails
- Verify business account is verified
- Check template meets Meta's requirements
- Ensure you have sufficient template quota

### Messages Not Sending
- Check API credentials are correct
- Verify phone number is active
- Check recipient phone number format
- Review rate limits and messaging tier

### Notifications Not Triggering
- Verify notification triggers are active
- Check event type matches trigger configuration
- Ensure recipient has valid phone number
- Review error logs for specific issues

## Rate Limits and Best Practices

- Follow Meta's messaging limits based on your tier
- Use templates for bulk messaging
- Implement proper error handling
- Monitor message delivery status
- Use conversation windows for non-template messages
- Respect user opt-out requests

## Security Considerations

- Never commit API credentials to version control
- Use webhook signature verification
- Implement proper access controls
- Log all message activities
- Comply with healthcare data regulations
- Use HTTPS for all communications

## Support

For issues with:
- Meta API: https://developers.facebook.com/docs/whatsapp/
- Database migration: Check Prisma documentation
- Integration issues: Review server logs and webhook payloads