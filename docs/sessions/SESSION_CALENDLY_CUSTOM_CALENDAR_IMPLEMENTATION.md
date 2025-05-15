# Calendly Custom Calendar Implementation Session

## Date: May 15, 2025

## Overview
This session replaced the problematic Calendly iframe embed with a custom calendar component that uses the Calendly API directly. The iframe was showing the full Calendly website instead of just the widget, degrading the user experience.

## Problems Addressed
1. Calendly iframe showing full website instead of widget-only view
2. Poor user experience with external site loading in our application
3. Lack of control over the booking interface styling
4. No proper error handling for failed calendar loads

## Solution Implemented

### 1. Calendly API Integration
- Added `getEventTypeAvailableTimes` method to `/lib/scheduling/calendly/api-client.ts`
- Created `getAvailableTimeSlots` service method in `/lib/scheduling/calendly/service.ts`
- Built new API endpoint `/api/scheduling/calendly/available-times/route.ts`
- Added client-side helper in `/lib/scheduling/calendly/client-api.ts`

### 2. Custom Calendar Component
- Created `/components/scheduling/calendly/calendly-calendar.tsx`
  - Uses existing UI calendar component
  - Fetches available times via API
  - Groups time slots by morning/afternoon/evening
  - Shows availability with proper loading states
  - Matches our design system perfectly

### 3. Booking Flow Updates
- Modified `/components/scheduling/client/booking-flow.tsx`
  - Replaced CalendlyEmbed import with CalendlyCalendar
  - Updated rendering logic to use custom calendar
  - Maintained compatibility with existing booking state machine

### 4. Optimized Embed (Alternative)
- Created `/components/scheduling/calendly/calendly-embed-optimized.tsx`
  - Improved iframe parameters to try showing widget-only
  - Better error handling and loading states
  - Still shows full site (Calendly limitation)

## Files Created/Modified

### New Files
1. `/components/scheduling/calendly/calendly-calendar.tsx` - Custom calendar component
2. `/components/scheduling/calendly/calendly-embed-optimized.tsx` - Optimized embed attempt
3. `/app/api/scheduling/calendly/available-times/route.ts` - API endpoint
4. `/app/test/calendly-api/page.tsx` - Test page for API integration
5. `/app/test/calendly-optimized/page.tsx` - Test page for optimized embed
6. `/app/test/booking-flow-custom/page.tsx` - Test page for custom booking flow
7. `/scripts/sync-calendly-event-slugs.js` - Sync script for URIs
8. `/scripts/fix-calendly-urls.js` - Fix URLs in database
9. `/scripts/update-calendly-event-type-ids.js` - Update event type IDs

### Modified Files
1. `/lib/scheduling/calendly/api-client.ts` - Added available times method
2. `/lib/scheduling/calendly/service.ts` - Added service method
3. `/lib/scheduling/calendly/client-api.ts` - Added client helper
4. `/components/scheduling/client/booking-flow.tsx` - Replaced embed with calendar

## Implementation Details

### CalendlyCalendar Component
```typescript
// Fetches available dates for next 7 days
// Shows calendar with disabled unavailable dates
// Time slots grouped by time of day
// Handles loading and error states
// Fully responsive design
```

### API Integration
```typescript
// GET /event_type_available_times endpoint
// Requires event_type, start_time, end_time parameters
// Max 7 day range per request
// Returns array of available time slots
```

## Scripts Required

### 1. Fix Calendly URLs
```bash
# Development
node scripts/fix-calendly-urls.js

# Production
DATABASE_URL=<production_url> node scripts/fix-calendly-urls.js
```

### 2. Update Event Type IDs
First, get actual IDs from Calendly, then:
```bash
# Update the script with actual IDs
# Then run for both environments
node scripts/update-calendly-event-type-ids.js
```

## Next Steps

1. **Get Calendly Event Type IDs**
   - Login to Calendly dashboard
   - Find each event type's ID
   - Update database with actual IDs

2. **Create Booking Confirmation Endpoint**
   - Build `/api/scheduling/bookings/confirm`
   - Handle time slot selection
   - Create booking via Calendly API

3. **Test End-to-End**
   - Verify time slots display correctly
   - Test booking creation
   - Ensure payment flow works

## Benefits Achieved

1. **No More Iframe Issues** - Custom calendar eliminates full site loading
2. **Better UX** - Native interface matches our design
3. **Improved Performance** - API calls are faster than iframe loading
4. **Full Control** - Can customize every aspect of the booking experience
5. **Better Error Handling** - Proper loading and error states

## Testing

Test the implementation at:
- `/test/calendly-api` - API integration test
- `/test/booking-flow-custom` - Full booking flow test

## Notes

- Calendly API has a 7-day limit for available times queries
- Event type IDs must be fetched from Calendly account
- The custom calendar provides a much better user experience
- Iframe approach is kept as fallback but not recommended