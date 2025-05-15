# Session Context
- Session Type: Implementation
- Component Focus: Calendly Integration Optimization - Investigating custom calendar components and improving booking experience
- Current Branch: feature/builder-cards
- Related Documentation: 
  - /docs/CALENDLY_INTEGRATION_FIXES.md
  - /docs/CALENDLY_SESSION_IMPLEMENTATION_SUMMARY.md
  - /docs/PATHWAY_BOOKING_IMPLEMENTATION_COMPLETE.md
- Project root directory: /Users/liamj/Documents/development/buildappswith

# Implementation Objectives
- Investigate existing custom calendar components in the codebase
- Evaluate if we can replace Calendly iframe with a better UX
- Implement direct Calendly API integration if possible
- Fix the iframe loading issue (full Calendly site loading in widget)
- Create a seamless booking experience that matches our design system
- Ensure proper event slug matching between our DB and Calendly

# Implementation Plan

## 1. Calendar Component Investigation
- Search for existing calendar/booking components in the codebase
- Check for any previous calendar implementations in components/scheduling
- Review components/booking for custom booking interfaces
- Evaluate if we have a date/time picker that could work with Calendly API
- Document findings about existing calendar solutions

## 2. Calendly API Integration Research
- Investigate Calendly API documentation for direct integration
- Check if we can fetch available times via API instead of iframe
- Explore webhook options for booking confirmations
- Determine if API keys or OAuth is needed
- Create proof-of-concept for API-based booking

## 3. Custom Calendar Interface
- Design a custom calendar UI that matches our design system
- Implement date selection component
- Create time slot selection interface
- Build booking confirmation flow
- Integrate with existing booking state machine

## 4. Fix Current Implementation Issues
- Debug why Calendly shows full website in iframe
- Investigate correct iframe parameters for widget-only view
- Fix event slug mismatches between DB and Calendly
- Ensure proper URL formatting for all session types
- Test with actual Calendly account settings

## 5. Booking Flow Optimization
- Streamline the booking process with fewer steps
- Implement loading states and error handling
- Add booking preview before confirmation
- Ensure mobile responsiveness
- Test both authenticated and unauthenticated flows

# Technical Specifications

## Calendar Component Structure
Search for and evaluate existing components:
```typescript
// Potential locations to check:
// components/scheduling/calendar/*
// components/booking/calendar/*
// components/ui/calendar/*
// components/scheduling/client/booking-calendar.tsx
```

## Calendly API Integration Pattern
```typescript
// lib/calendly/api.ts
export async function getAvailableSlots(
  eventTypeUri: string,
  startDate: Date,
  endDate: Date
) {
  // Fetch available slots from Calendly API
  // Return formatted time slots
}

export async function createBooking(
  eventTypeUri: string,
  selectedTime: Date,
  inviteeInfo: InviteeInfo
) {
  // Create booking via Calendly API
  // Return booking confirmation
}
```

## Custom Calendar Interface
```typescript
// components/scheduling/custom-calendar/calendar-picker.tsx
interface CalendarPickerProps {
  eventTypeUri: string;
  onSelectSlot: (slot: TimeSlot) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function CalendarPicker({ 
  eventTypeUri, 
  onSelectSlot 
}: CalendarPickerProps) {
  // Custom calendar implementation
  // Fetches available slots via API
  // Displays in our design system
}
```

## Iframe Fix Investigation
```typescript
// Correct Calendly widget parameters to investigate:
// - embed_type=Inline
// - hide_landing_page_details=1
// - hide_gdpr_banner=1
// - primary_color=your_color
// - text_color=your_color
// - background_color=transparent
```

## Event Slug Synchronization
```typescript
// scripts/sync-calendly-event-slugs.js
// Script to match our DB slugs with actual Calendly event URLs
// May need to use Calendly API to fetch actual event types
```

# Implementation Notes
1. **Existing Components**: Thoroughly search for any existing calendar implementations before building new ones
2. **API vs Iframe**: Prefer API integration over iframe for better control and UX
3. **Design Consistency**: Ensure any custom calendar matches our design system
4. **Error Handling**: Implement comprehensive error handling for API failures
5. **Performance**: Consider caching available slots to reduce API calls
6. **Accessibility**: Ensure calendar is keyboard navigable and screen reader friendly

# Expected Outputs
- Documentation of existing calendar components found
- Working proof-of-concept for Calendly API integration
- Custom calendar interface if no suitable component exists
- Fixed iframe implementation as fallback option
- Synchronized event slugs between DB and Calendly
- Improved booking flow with better UX
- Updated documentation for future maintenance

# Investigation Starting Points
```bash
# Search for existing calendar components
grep -r "calendar" components/
grep -r "booking" components/
grep -r "date.*picker" components/

# Check for Calendly API references
grep -r "calendly.*api" lib/
grep -r "calendly.*token" .env*

# Look for custom booking interfaces
find components -name "*booking*.tsx" -o -name "*calendar*.tsx"
```

There MUST BE NO WORKAROUNDS at this critical stage - if you get stuck with anything, please stop and ask for guidance.