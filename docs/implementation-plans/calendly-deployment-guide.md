# Calendly Integration Deployment Guide

## Overview

This document provides instructions for deploying the Calendly integration to staging and production environments. It includes environment variable configuration, deployment procedures, and post-deployment verification steps.

## Required Environment Variables

The Calendly integration requires the following environment variables:

### API Keys and Authentication
```
# Primary Calendly API token (required)
CALENDLY_API_TOKEN=

# Secondary Calendly API token (for key rotation, optional)
CALENDLY_API_TOKEN_SECONDARY=

# Webhook signing key (required for production)
CALENDLY_WEBHOOK_SIGNING_KEY=

# Secondary webhook signing key (for key rotation, optional)
CALENDLY_WEBHOOK_SIGNING_KEY_SECONDARY=
```

### Configuration Settings
```
# Enable caching (recommended for production)
CALENDLY_ENABLE_CACHING=true

# Cache TTL in seconds (default: 300)
CALENDLY_CACHE_TTL=300

# Maximum cache entries (default: 1000)
CALENDLY_CACHE_MAX_ENTRIES=1000

# Enable key rotation monitoring (recommended for production)
CALENDLY_KEY_ROTATION_MONITORING=true

# Key rotation check interval in milliseconds (default: 3600000, 1 hour)
CALENDLY_KEY_ROTATION_CHECK_INTERVAL=3600000

# Maximum usage per key before recommending rotation (default: 10000)
CALENDLY_MAX_USAGE_PER_KEY=10000

# Replay protection window for webhooks in seconds (default: 300, 5 minutes)
CALENDLY_WEBHOOK_REPLAY_PROTECTION_WINDOW=300
```

### Webhook Configuration
```
# Base URL for webhook callbacks
CALENDLY_WEBHOOK_BASE_URL=https://your-domain.com

# Prefix for webhook endpoint (default: /api/webhooks/calendly)
CALENDLY_WEBHOOK_ENDPOINT_PREFIX=/api/webhooks/calendly
```

## Generating Secure Keys

### API Token
1. Log in to Calendly as the builder (Liam)
2. Go to Account > Integrations > API & Webhooks
3. Click "Generate New Token"
4. Copy the token and save it securely
5. Add the token as `CALENDLY_API_TOKEN` in your environment variables

### Webhook Signing Key
1. Generate a secure random key using a tool like OpenSSL:
   ```sh
   openssl rand -hex 32
   ```
2. Copy the generated key and save it securely
3. Add the key as `CALENDLY_WEBHOOK_SIGNING_KEY` in your environment variables

## Deployment Procedure

### Staging Deployment

1. Configure environment variables for staging:
   - Use the staging Calendly API token
   - Set up the webhook signing key
   - Configure the staging webhook URL

2. Deploy to staging:
   ```sh
   pnpm build
   pnpm start
   ```

3. Register the webhook with Calendly:
   - Go to Calendly > Account > Integrations > API & Webhooks
   - Add a new webhook with the URL: `https://staging.your-domain.com/api/webhooks/calendly`
   - Select the events to subscribe to: `invitee.created`, `invitee.canceled`, `invitee.rescheduled`
   - Add the signing key that you generated

4. Verify the deployment:
   - Test the booking flow from the UI
   - Verify webhook reception using the Calendly webhook tester
   - Check logs for any errors

### Production Deployment

1. Configure environment variables for production:
   - Use the production Calendly API token
   - Set up both primary and secondary webhook signing keys
   - Configure the production webhook URL
   - Enable all monitoring and security features

2. Deploy to production:
   ```sh
   pnpm build
   pnpm start
   ```

3. Register the webhook with Calendly:
   - Go to Calendly > Account > Integrations > API & Webhooks
   - Add a new webhook with the URL: `https://your-domain.com/api/webhooks/calendly`
   - Select the events to subscribe to: `invitee.created`, `invitee.canceled`, `invitee.rescheduled`
   - Add the signing key that you generated

4. Verify the deployment:
   - Perform a complete end-to-end test of the booking flow
   - Monitor logs for any errors
   - Check for successful webhook processing

## Key Rotation Procedure

### API Token Rotation

1. Generate a new Calendly API token
2. Add the new token as `CALENDLY_API_TOKEN_SECONDARY` in environment variables
3. Deploy the changes to production
4. Wait for 24 hours to ensure the new token works correctly
5. Move the secondary token to primary:
   - `CALENDLY_API_TOKEN` = [value from `CALENDLY_API_TOKEN_SECONDARY`]
   - Generate a new token for `CALENDLY_API_TOKEN_SECONDARY` (optional)
6. Deploy the changes
7. Revoke the old token in Calendly

### Webhook Signing Key Rotation

1. Generate a new signing key
2. Add the new key as `CALENDLY_WEBHOOK_SIGNING_KEY_SECONDARY` in environment variables
3. Deploy the changes to production
4. Wait for 24 hours to ensure the new key works correctly
5. Update the webhook in Calendly with the new key
6. Move the secondary key to primary:
   - `CALENDLY_WEBHOOK_SIGNING_KEY` = [value from `CALENDLY_WEBHOOK_SIGNING_KEY_SECONDARY`]
   - Generate a new key for `CALENDLY_WEBHOOK_SIGNING_KEY_SECONDARY` (optional)
7. Deploy the changes

## Monitoring and Alerting

### Monitoring Endpoints

Set up monitoring for the following endpoints:

- `/api/health/calendly` - Health check for Calendly integration
- `/api/webhooks/calendly` - Webhook endpoint

### Datadog Integration

Add the following Datadog monitors:

1. **API Token Usage**
   - Alert when token usage approaches the rotation limit
   - Alert on authentication failures

2. **Webhook Reception**
   - Alert if no webhooks are received in a specified period
   - Alert on webhook signature failures

3. **Booking Flow**
   - Monitor end-to-end booking completion rate
   - Alert on booking conflicts and errors

## Rollback Procedure

If issues are detected with the deployment, follow these steps to roll back:

1. Restore the previous version of the code
2. Restore the previous environment variables
3. Deploy the rollback
4. Verify the rollback fixed the issue
5. If the issue persists, contact Calendly support

## Troubleshooting

### Common Issues

1. **Webhook Signature Failures**
   - Verify the webhook signing key is correctly configured
   - Check for clock skew between servers
   - Ensure the raw request body is used for validation

2. **API Authentication Failures**
   - Verify the API token is correctly configured
   - Check if the token has expired or been revoked
   - Ensure the token has the necessary permissions

3. **Booking Conflicts**
   - Check for timezone conversion issues
   - Verify the Calendly event type exists
   - Check for rate limiting issues

### Support Contacts

- **Calendly API Support**: support@calendly.com
- **Internal Support**: calendly-integration-team@buildappswith.com

## Conclusion

Following this deployment guide will ensure a smooth deployment of the Calendly integration to staging and production environments. Regular monitoring and periodic key rotation will maintain the security and reliability of the integration.