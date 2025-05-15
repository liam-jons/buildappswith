# Calendly Integration Fixes - Session Summary

## Date: January 15, 2025

## Issue Summary
The Calendly integration was failing with a "null has no properties" error and showing a perpetual loading screen. Additionally, when it did load, it was showing a 404 error page instead of the calendar widget.

## Root Causes Identified

1. **Content Security Policy (CSP) Issue**
   - The CSP was blocking Calendly iframes
   - `frame-src` only allowed `https://*.calendly.com` but Calendly was trying to load from `https://calendly.com` (without subdomain)

2. **Incorrect URL Format in Database**
   - Database had URIs stored as `/getting-started-businesses`
   - Calendly expected format: `liam-buildappswith/getting-started-businesses`

3. **Script Loading Issues**
   - Next.js Script component with `lazyOnload` strategy was causing timing issues
   - `window.Calendly` was not being initialized properly

## Fixes Applied

### 1. CSP Configuration Update
**File**: `/next.config.mjs`
```javascript
// Updated frame-src to include base domain
frame-src 'self' https://js.stripe.com https://*.stripe.com https://*.clerk.accounts.dev https://calendly.com https://*.calendly.com;
```

### 2. Component Updates

#### CalendlyEmbed Component Enhancements
**File**: `/components/scheduling/calendly/calendly-embed.tsx`
- Added retry logic for initialization (up to 5 attempts)
- Improved URL formatting to handle different input formats
- Added comprehensive debug logging
- Changed script loading strategy from `lazyOnload` to `afterInteractive`
- Added error handling around Calendly initialization

#### Created Alternative Implementations
1. **CalendlyEmbedSimple** (`/components/scheduling/calendly/calendly-embed-simple.tsx`)
   - Uses data-url approach for auto-initialization
   - Simplified implementation without complex state management

2. **CalendlyEmbedNative** (`/components/scheduling/calendly/calendly-embed-native.tsx`)
   - Uses native script tag approach
   - Bypasses Next.js Script component issues

### 3. Testing Infrastructure

Created multiple test pages to debug the issue:
- `/app/calendly-test/page.tsx` - Comprehensive test page with multiple embed types
- `/app/calendly-direct-test/page.tsx` - Direct HTML embed test
- `/scripts/test-calendly-formats.html` - Static HTML test file

### 4. Database Fixes

Created scripts to fix URI format:
- `/scripts/check-calendly-urls.js` - Debug current URI format
- `/scripts/verify-calendly-format.js` - Verify correct format
- `/scripts/fix-calendly-uri-format.js` - Update URIs to correct format

### 5. Middleware Updates
Added test pages to public routes in `middleware.ts`:
```javascript
// Test pages (public)
"/calendly-test",
"/calendly-direct-test",
```

## Current Status

1. **Native embed works** - The CalendlyEmbedNative component successfully loads the calendar
2. **URL format is correct** - Database URIs updated to `liam-buildappswith/event-name` format
3. **CSP is properly configured** - No more frame-src blocking issues

## Remaining Issues

1. **Calendly loads entire page in iframe** - The widget is showing Calendly's full website instead of just the calendar widget
2. **Event slugs mismatch** - Calendly has generic slugs (e.g., "session-1") vs our descriptive slugs (e.g., "getting-started-businesses")

## Recommendations for Next Session

1. Investigate if we have a custom calendar component that could replace Calendly embed
2. Check if Calendly API can be used instead of iframe embed
3. Consider building a custom booking interface using Calendly API
4. Verify actual Calendly event URLs match what's in our database

## Files Modified/Created

### Modified
- `/next.config.mjs` - Updated CSP configuration
- `/components/scheduling/calendly/calendly-embed.tsx` - Enhanced with retry logic and better error handling
- `/middleware.ts` - Added test pages to public routes

### Created
- `/components/scheduling/calendly/calendly-embed-simple.tsx`
- `/components/scheduling/calendly/calendly-embed-native.tsx`
- `/app/calendly-test/page.tsx`
- `/app/calendly-direct-test/page.tsx`
- `/scripts/check-calendly-urls.js`
- `/scripts/verify-calendly-format.js`
- `/scripts/fix-calendly-uri-format.js`
- `/scripts/test-calendly-formats.html`
- `/scripts/debug-calendly-embed.js`

## Debug Commands for Future Reference

```bash
# Check current URI format in database
node scripts/verify-calendly-format.js

# Fix URI format if needed
node scripts/fix-calendly-uri-format.js

# Test calendly integration
# Visit: http://localhost:3000/calendly-test
```