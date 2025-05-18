# Calendly Integration Fixes - Session Summary

## Date: May 16, 2025 (Latest Session)
## Previous Session: January 15, 2025

## Current Issue Summary
The Calendly iframe integration was displaying the full Calendly website instead of just the calendar widget. This session replaced the iframe with a custom calendar component using the Calendly API.

## Recent Session: May 16, 2025

### Issues Addressed
1. Calendly iframe showing full website instead of widget-only view
2. Authentication errors (401) when accessing Calendly API
3. Incorrect API endpoint paths (v1/v2 prefixes)
4. Missing event type URIs in test scripts

### Solutions Implemented

#### 1. Custom Calendar Component
Created `/components/scheduling/calendly/calendly-calendar.tsx`:
- Fetches available times via Calendly API
- Custom calendar UI matching our design system
- Time slots grouped by morning/afternoon/evening
- Loading states and error handling

#### 2. API Integration
Created `/app/api/scheduling/calendly/available-times/route.ts`:
- POST endpoint for fetching available times
- Validates date ranges (max 7 days)
- Returns formatted time slot data

#### 3. Authentication Fix
Updated `/middleware.ts`:
```javascript
// Added to public routes
"/api/scheduling/calendly/available-times"
```

#### 4. API Client Updates
Fixed `/lib/scheduling/calendly/api-client.ts`:
- Removed v1/v2 prefixes from endpoints
- Correct endpoint: `/event_type_available_times`

#### 5. Service Layer
Enhanced `/lib/scheduling/calendly/service.ts`:
- Added `getAvailableTimeSlots` method
- Handles event type details fetching

### Key Discoveries
1. Calendly API uses unversioned endpoints (no /v1 or /v2)
2. Must use actual event type URIs from Calendly account
3. Public route configuration required in middleware
4. Correct endpoint format: `https://api.calendly.com/event_type_available_times`

### Test Scripts Created
- `test-calendly-available-times.js` - Tests API endpoint
- `test-calendly-event-types.js` - Lists all event types
- `test-calendly-real-event.js` - Tests with real event URI
- `test-calendar-with-real-event.js` - Tests custom calendar API

### Results
✅ Custom calendar component working
✅ API authentication resolved
✅ Available times successfully fetched
✅ Better user experience than iframe

## Previous Session: January 15, 2025

### Root Causes Identified

1. **Content Security Policy (CSP) Issue**
   - The CSP was blocking Calendly iframes
   - `frame-src` only allowed `https://*.calendly.com` but Calendly was trying to load from `https://calendly.com` (without subdomain)

2. **Incorrect URL Format in Database**
   - Database had URIs stored as `/getting-started-businesses`
   - Calendly expected format: `liam-buildappswith/getting-started-businesses`

3. **Script Loading Issues**
   - Next.js Script component with `lazyOnload` strategy was causing timing issues
   - `window.Calendly` was not being initialized properly

### Fixes Applied

#### 1. CSP Configuration Update
**File**: `/next.config.mjs`
```javascript
// Updated frame-src to include base domain
frame-src 'self' https://js.stripe.com https://*.stripe.com https://*.clerk.accounts.dev https://calendly.com https://*.calendly.com;
```

#### 2. Component Updates

##### CalendlyEmbed Component Enhancements
**File**: `/components/scheduling/calendly/calendly-embed.tsx`
- Added retry logic for initialization (up to 5 attempts)
- Improved URL formatting to handle different input formats
- Added comprehensive debug logging
- Changed script loading strategy from `lazyOnload` to `afterInteractive`
- Added error handling around Calendly initialization

##### Created Alternative Implementations
1. **CalendlyEmbedSimple** (`/components/scheduling/calendly/calendly-embed-simple.tsx`)
   - Uses data-url approach for auto-initialization
   - Simplified implementation without complex state management

2. **CalendlyEmbedNative** (`/components/scheduling/calendly/calendly-embed-native.tsx`)
   - Uses native script tag approach
   - Bypasses Next.js Script component issues

#### 3. Testing Infrastructure

Created multiple test pages to debug the issue:
- `/app/calendly-test/page.tsx` - Comprehensive test page with multiple embed types
- `/app/calendly-direct-test/page.tsx` - Direct HTML embed test
- `/scripts/test-calendly-formats.html` - Static HTML test file

#### 4. Database Fixes

Created scripts to fix URI format:
- `/scripts/check-calendly-urls.js` - Debug current URI format
- `/scripts/verify-calendly-format.js` - Verify correct format
- `/scripts/fix-calendly-uri-format.js` - Update URIs to correct format

#### 5. Middleware Updates
Added test pages to public routes in `middleware.ts`:
```javascript
// Test pages (public)
"/calendly-test",
"/calendly-direct-test",
```

## Current Status

1. **Custom calendar component implemented** - No more iframe issues
2. **API integration working** - Available times successfully fetched
3. **Authentication configured** - Public route allows API access
4. **Database synchronized** - Event types match Calendly account

## Next Steps

1. Implement booking confirmation endpoint (`/api/scheduling/bookings/confirm`)
2. Add time slot selection handling
3. Integrate with payment flow for paid sessions
4. Test end-to-end booking process
5. Deploy to production

## Files Modified/Created

### Latest Session (May 16, 2025)
- `/components/scheduling/calendly/calendly-calendar.tsx` - New custom calendar
- `/components/scheduling/client/booking-flow.tsx` - Updated to use custom calendar
- `/app/api/scheduling/calendly/available-times/route.ts` - New API endpoint
- `/lib/scheduling/calendly/api-client.ts` - Fixed API paths
- `/lib/scheduling/calendly/service.ts` - Added getAvailableTimeSlots method
- `/middleware.ts` - Added public route for API
- Multiple test scripts for API verification

### Previous Session (January 15, 2025)
- `/next.config.mjs` - Updated CSP configuration
- `/components/scheduling/calendly/calendly-embed.tsx` - Enhanced with retry logic
- `/components/scheduling/calendly/calendly-embed-simple.tsx` - Created
- `/components/scheduling/calendly/calendly-embed-native.tsx` - Created
- Various test pages and scripts

## Debug Commands for Future Reference

```bash
# Test API endpoints
node scripts/test-calendly-available-times.js
node scripts/test-calendly-real-event.js

# Check event types
node scripts/test-calendly-event-types.js

# Test custom calendar API
node scripts/test-calendar-with-real-event.js

# Visit test pages
http://localhost:3001/calendly-test
http://localhost:3001/book/{sessionTypeId}
```