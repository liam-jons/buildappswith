# Calendly Dashboard Setup Guide

## Step-by-Step Instructions

### 1. Login to Calendly
- Go to https://calendly.com/app/login
- Sign in with your credentials

### 2. Navigate to Webhook Settings
- Click on your profile icon (top right)
- Select "Account Settings"
- In the left sidebar, click "Integrations"
- Scroll down to "Webhooks"
- Click "Create webhook subscription"

### 3. Configure Webhook Subscription

Fill in the following fields:

**Subscriber URL**:
```
https://www.buildappswith.com/api/webhooks/calendly
```

**Events to Subscribe To**:
- ✅ `invitee.created` - When someone books a session
- ✅ `invitee.canceled` - When someone cancels a booking
- ✅ `routing_form_submission.created` - Optional for form submissions

**Click "Create Webhook"**

### 4. Save the Signing Secret
After creating the webhook, Calendly will show you a signing secret. This is critical for security.

1. Copy the signing secret
2. Go to Vercel Dashboard: https://vercel.com/dashboard
3. Select your project
4. Go to Settings > Environment Variables
5. Add new variable:
   - Key: `CALENDLY_WEBHOOK_SIGNING_KEY`
   - Value: [paste the signing secret]
   - Environment: Production

### 5. Test the Webhook
1. In Calendly dashboard, find your webhook
2. Click the "..." menu and select "Test"
3. Send a test event
4. Check your application logs to confirm receipt

### 6. Verify Event Types
1. Navigate to "Event Types" in Calendly
2. Ensure these are configured:
   - Free sessions (3 types)
   - Pathway sessions (3 types)
   - Specialized sessions (2 types)
3. Note the URLs/slugs for each event type

### 7. Configure OAuth (Optional)
If you need OAuth for advanced integrations:
1. Go to "Integrations" > "API & Webhooks"
2. Click "OAuth Applications"
3. Create new application
4. Set redirect URI: `https://www.buildappswith.com/api/auth/calendly/callback`

## Troubleshooting

### Webhook Not Receiving Events
1. Check the webhook URL is correct
2. Verify signing secret in environment variables
3. Check application logs for errors
4. Ensure webhook is active in Calendly

### Signature Validation Failing
1. Double-check the signing secret
2. Ensure no extra spaces when copying
3. Verify environment variable is loaded
4. Check webhook security implementation

### Missing Event Types
1. Create any missing event types
2. Set appropriate durations
3. Configure availability
4. Update database with new IDs/URIs

## Support Resources
- Calendly API Docs: https://developer.calendly.com
- Webhook Guide: https://developer.calendly.com/api-docs/docs/getting-started-webhooks
- Support: https://help.calendly.com