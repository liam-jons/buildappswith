# Calendly Integration Migration

## Overview

This document details the migration from a custom booking calendar to the Calendly integration.

## Changes Made

1. **Removed Calendar Component Reference**:
   - Removed references to non-existent `@/components/ui/core/calendar` component
   - Updated imports in scheduling components to use Calendly

2. **Updated Booking Page**:
   - Changed `app/(platform)/book/[builderId]/page.tsx` to use CalendlyEmbed
   - Replaced BookingCalendar component with Calendly integration

3. **Documentation Updates**:
   - Added this migration document
   - Referenced existing Calendly integration documentation

## Rationale

The custom booking calendar was trying to use a Calendar component that doesn't exist in the project. The preferred solution is to use the Calendly integration that's already implemented and documented.

Benefits of this approach:
- Uses existing, well-documented Calendly integration
- Removes dependency on non-existent components
- Simplifies booking flow
- Leverages Calendly's mature scheduling platform

## Usage

To use the Calendly integration:

1. Import the CalendlyEmbed component:
```tsx
import { CalendlyEmbed } from '@/components/scheduling/calendly';
```

2. Use it in your component:
```tsx
<CalendlyEmbed 
  url="https://calendly.com/yourusername/30min"
  prefill={{
    name: "User Name",
    email: "user@example.com",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }}
  className="h-[700px] w-full"
/>
```

## Related Documentation

- [CALENDLY_IMPORT_STANDARD_README.md](/docs/engineering/CALENDLY_IMPORT_STANDARD_README.md) - Overview of Calendly integration
- [CALENDLY_MIGRATION_GUIDE.md](/docs/engineering/CALENDLY_MIGRATION_GUIDE.md) - Detailed migration guide
- [CALENDLY_STRIPE_INTEGRATION.md](/docs/engineering/CALENDLY_STRIPE_INTEGRATION.md) - Integration with Stripe
