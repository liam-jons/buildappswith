# Calendly Webhook Creation Guide

## Prerequisites
1. Ensure you have `CALENDLY_API_TOKEN` in your `.env` file
2. Ensure your application is deployed (webhooks need a public URL)

## Method 1: Using the Script (Recommended)

### Step 1: List Existing Webhooks
First, check if you already have webhooks:
```bash
node scripts/list-calendly-webhooks.js
```

### Step 2: Create Webhook
If no webhooks exist, create one:
```bash
node scripts/create-calendly-webhook.js
```

This script will:
1. Find your organization URI automatically
2. Create the webhook subscription
3. Generate a signing key for security
4. Test the webhook endpoint

### Step 3: Save the Signing Key
The script will output a signing key. You MUST save this:

1. Add to `.env`:
   ```
   CALENDLY_WEBHOOK_SIGNING_KEY=your_generated_key_here
   ```

2. Add to Vercel:
   - Go to Vercel Dashboard
   - Select your project
   - Settings > Environment Variables
   - Add `CALENDLY_WEBHOOK_SIGNING_KEY` with the same value

## Method 2: Manual API Call

If you prefer to do it manually:

```bash
# First, get your organization URI
curl --request GET \
  --url https://api.calendly.com/users/me \
  --header "Authorization: Bearer YOUR_API_TOKEN"

# Then create the webhook
curl --request POST \
  --url https://api.calendly.com/webhook_subscriptions \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer YOUR_API_TOKEN" \
  --data '{
    "url": "https://www.buildappswith.com/api/webhooks/calendly",
    "events": ["invitee.created", "invitee.canceled"],
    "organization": "YOUR_ORGANIZATION_URI",
    "scope": "organization"
  }'
```

## Webhook Events Explained

- **invitee.created**: Triggered when someone books a session
- **invitee.canceled**: Triggered when someone cancels a booking

## Testing Your Webhook

After creation, you can test it by:
1. Creating a test booking in Calendly
2. Checking your application logs
3. Verifying the booking appears in your database

## Troubleshooting

### Webhook Already Exists (409 Error)
```bash
# List existing webhooks
node scripts/list-calendly-webhooks.js

# Delete if needed
node scripts/delete-calendly-webhook.js <webhook-uri>
```

### Webhook Not Receiving Events
1. Check the webhook URL is correct
2. Verify signing key is in environment variables
3. Check application logs for errors
4. Ensure webhook is in "active" state

### Signature Validation Failing
1. Double-check the signing key in environment variables
2. Make sure there are no extra spaces
3. Verify the key is exactly as generated

## What Happens After Setup

When someone books a session:
1. Calendly sends a POST request to your webhook URL
2. Your app verifies the signature
3. Your app processes the booking data
4. Your database is updated
5. Confirmation emails are sent

## Next Steps

After creating the webhook:
1. Test with a real booking
2. Monitor logs for any errors
3. Ensure database updates correctly
4. Verify email notifications work