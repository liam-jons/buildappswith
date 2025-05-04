# Booking System

This directory contains the booking functionality for the Buildappswith platform, allowing users to schedule sessions with builders.

## Directory Structure

```
/booking
├── [builderId]/             # Builder-specific booking pages
│   ├── page.tsx             # Main booking page
│   └── success/             # Booking success page
├── manage/                  # Booking management for users
│   ├── page.tsx             # Booking management dashboard
│   └── [bookingId]/         # Specific booking management
├── calendar/                # Calendar view for availability
│   └── page.tsx             # Calendar page
└── page.tsx                 # Booking entry point
```

## Core Components

### Main Booking Page

The main booking entry point that directs users to the appropriate builder's booking page or shows a list of builders to book with.

### Builder-Specific Booking

This section handles booking sessions with a specific builder:

- **Time slot selection** based on builder availability
- **Session type selection** from available options
- **Booking information** collection (purpose, notes, etc.)
- **Payment initiation** for the selected session

### Booking Management

This section allows users to manage their bookings:

- **Upcoming sessions** with status and details
- **Past sessions** with history and outcomes
- **Cancel or reschedule** functionality
- **Payment status** information

### Calendar View

Provides a comprehensive calendar view for:

- **Builder availability** visualization
- **Time slot selection** with timezone support
- **Session scheduling** directly from calendar

## Integration Points

The booking system integrates with:

- **Profile Domain**: Gets builder information and settings
- **Scheduling Domain**: Handles availability and booking creation
- **Payment Domain**: Processes payments for booked sessions

## How It Works

1. User navigates to a builder's profile
2. User selects "Book a Session" to enter the booking flow
3. User selects a session type from the builder's offerings
4. User chooses an available time slot from the calendar
5. User provides booking details (purpose, questions, etc.)
6. User confirms the booking and proceeds to payment
7. After successful payment, a confirmation is sent to both parties
8. The booking appears in both users' dashboards

## Key Features

- **Timezone Support**: Automatic timezone detection and conversion
- **Availability Rules**: Complex availability handling (recurring, exceptions)
- **Booking Limits**: Controls for maximum concurrent bookings
- **Cancellation Policies**: Configurable policies with deadline enforcement
- **Notifications**: Email and in-app notifications for booking events
