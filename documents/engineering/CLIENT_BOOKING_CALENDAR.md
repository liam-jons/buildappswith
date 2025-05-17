# Client Booking Calendar

This document provides an overview of the client-side booking calendar implementation, which enables clients to book sessions with builders based on their availability settings.

## Architecture Overview

The client booking calendar is designed to integrate with the existing availability management system, allowing clients to:

1. Select from available session types offered by a builder
2. Choose a date and time slot based on the builder's availability
3. Complete the booking with additional details
4. View their booked sessions

### Components

The booking system consists of four main components:

1. **BookingCalendar**: The main component that orchestrates the booking flow
2. **SessionTypeSelector**: Displays available session types for selection
3. **TimeSlotSelector**: Shows available time slots for a selected date
4. **BookingForm**: Collects booking details and handles submission

### Data Flow

The booking process follows this flow:

1. Client selects a session type (or the default is selected if only one exists)
2. System fetches available time slots based on:
   - Builder's weekly availability rules
   - Any exceptions (special hours or days off)
   - Existing bookings
   - Selected session type duration
3. Client selects a date and time slot
4. Client submits booking details
5. System verifies slot availability again (to prevent conflicts)
6. Booking is created and confirmation is displayed

## API Routes

The booking system uses the following API routes:

### `/api/scheduling/session-types`
- **GET**: Fetches session types offered by a builder
- Parameters: `builderId`
- Returns: List of session types with details

### `/api/scheduling/time-slots`
- **GET**: Generates available time slots for a date range
- Parameters: `builderId`, `startDate`, `endDate`, `sessionTypeId` (optional)
- Returns: List of time slots with availability status

### `/api/scheduling/bookings`
- **GET**: Fetches bookings for a builder or client
- Parameters: `builderId` or `clientId`, `startDate` (optional), `endDate` (optional), `status` (optional)
- Returns: List of bookings
- **POST**: Creates a new booking
- Request Body: Booking details including session type, time slot, and client information
- Returns: Created booking

## Component Details

### BookingCalendar

The main orchestration component that manages the booking flow state and integrates the other components.

```tsx
interface BookingCalendarProps {
  builderId: string;
}

// Features:
// - Multi-step booking flow (session type → date/time → booking details)
// - Progress tracking with step indicators
// - Session type selection
// - Date and time slot selection with calendar interface
// - Booking form submission
// - Error handling and validation
```

### SessionTypeSelector

Displays available session types with details like duration, price, and description.

```tsx
interface SessionTypeSelectorProps {
  sessionTypes: SessionType[];
  onSelect: (sessionType: SessionType) => void;
}

// Features:
// - Visual representation of session types with consistent styling
// - Color coding for different session types
// - Display of key details (duration, price, etc.)
// - Empty state handling for when no session types are available
```

### TimeSlotSelector

Shows available time slots for the selected date, grouped by time of day.

```tsx
interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[];
  isLoading: boolean;
  onSelect: (timeSlot: TimeSlot) => void;
  selectedDate?: Date;
}

// Features:
// - Grouping of time slots by morning, afternoon, and evening
// - Clear visual representation of available slots
// - Loading state while fetching time slots
// - Empty state when no slots are available
// - Proper time formatting with local timezone awareness
```

### BookingForm

Collects booking details and handles the submission process.

```tsx
interface BookingFormProps {
  sessionType: SessionType;
  timeSlot: TimeSlot;
  builderId: string;
  onComplete: () => void;
  onBack: () => void;
}

// Features:
// - Summary of selected session type and time slot
// - Notes field for additional information
// - Clear indication of session details (date, time, price)
// - Loading state during submission
// - Error handling and validation
```

## Timezone Handling

The booking system handles timezones in the following ways:

1. Builder's timezone is stored in their scheduling settings
2. Time slots are generated and served in UTC format
3. Client's timezone is detected and used for display purposes
4. Both timezones are stored with the booking for reference
5. All dates are formatted using the client's local timezone

## Accessibility Features

The booking calendar implementation adheres to WCAG 2.1 AA standards:

1. **Keyboard Navigation**: All interactive elements are properly focusable and operable
2. **ARIA Attributes**: Appropriate ARIA roles and attributes for complex UI elements
3. **Focus Management**: Clear focus indicators and logical tab order
4. **Screen Reader Support**: Semantic HTML and descriptive labels
5. **Color Contrast**: All text and interactive elements meet contrast requirements
6. **Loading States**: Clear indication of loading states
7. **Error Handling**: Accessible error messages and validation feedback

## Error Handling

The system includes comprehensive error handling:

1. **API Errors**: Structured error responses with clear messages
2. **Validation Errors**: Client-side and server-side validation
3. **Conflict Resolution**: Prevention of double-bookings
4. **Network Errors**: Graceful handling of connection issues
5. **User Feedback**: Clear toast notifications for success and error states

## Future Enhancements

Planned enhancements for the booking system:

1. **Calendar Integration**: Two-way sync with external calendars (Google, Outlook)
2. **Recurring Bookings**: Support for scheduling recurring sessions
3. **Notifications**: Email and SMS reminders for upcoming sessions
4. **Rescheduling**: Client-initiated rescheduling workflow
5. **Analytics**: Insights on booking patterns and availability optimization

## Testing Strategy

The booking system should be tested using:

1. **Unit Tests**: For individual component functionality
2. **Integration Tests**: For component interactions and API connectivity
3. **End-to-End Tests**: For complete booking flows
4. **Accessibility Tests**: Using automated tools and manual verification
5. **Time-Based Tests**: Scenarios involving timezone edge cases

## Conclusion

The client booking calendar implementation provides a user-friendly, accessible, and reliable way for clients to book sessions with builders. It integrates seamlessly with the availability management system to ensure accurate time slot generation and conflict prevention.