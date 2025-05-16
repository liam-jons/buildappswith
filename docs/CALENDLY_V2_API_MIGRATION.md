# Calendly API v2 Migration Status

## Current Status: ✅ Already on v2

Our implementation is already using the Calendly v2 API. We don't need to migrate.

## How We Know We're on v2

1. **API Endpoints**: Our endpoints don't use `/v1/` prefix
   - Example: `/event_types` not `/v1/event_types`
   - This is the v2 pattern

2. **Base URL**: We use `https://api.calendly.com`
   - This is the v2 base URL
   - v1 would be `https://api.calendly.com/v1`

3. **Authentication**: Using Bearer token
   - v2 uses personal access tokens with Bearer auth
   - v1 used API keys

## Webhook Migration

While our API is on v2, webhooks have a separate migration path:

### Current Webhook Implementation
- We're still using v1 webhooks in `/api/webhooks/calendly`
- These will be deprecated by May 2025

### Migration Plan for Webhooks

1. **Update Webhook Registration**:
   - Use the new webhook subscription API
   - Update event names (they may change slightly)

2. **Update Webhook Handler**:
   - Check for payload structure changes
   - Update signature verification if needed

3. **Test in Development**:
   - Use Calendly's webhook testing tools
   - Verify all events are handled correctly

## Action Items

1. **No API Changes Needed**: Our API client is already v2 compatible
2. **Monitor Webhook Deprecation**: Keep an eye on Calendly announcements
3. **Plan Webhook Migration**: Schedule webhook updates before May 2025

## Time Validation Fix

We've also fixed the "Start time must be in the future" error:

### Previous Issue
- Calendar was trying to fetch slots for past times
- `startOfDay(selectedDate)` could be in the past

### Solution
- Use current time as minimum start time
- Only fetch slots from now onwards
- Updated both date range and time slot fetching

### Code Changes
```typescript
// Before
const startDate = startOfDay(selectedDate);

// After  
const now = new Date();
const selectedStart = startOfDay(selectedDate);
const startDate = selectedStart > now ? selectedStart : now;
```

## Resources
- [Calendly API v2 Docs](https://developer.calendly.com/api-docs/v2)
- [Webhook Migration Guide](https://developer.calendly.com/api-docs/docs/migrating-to-v2-webhooks)
- [API Changelog](https://developer.calendly.com/api-docs/changelog)