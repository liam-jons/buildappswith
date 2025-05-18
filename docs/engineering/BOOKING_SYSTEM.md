# Booking System Architecture

This document outlines the architecture, patterns, and implementation details of the Buildappswith booking system. The system allows builders to configure session types, set availability, and enables clients to book sessions.

## Component Overview

The booking system comprises several interconnected components:

### Frontend Components

1. **Booking Overview** (`components/scheduling/builder/booking-overview.tsx`)
   - Displays bookings for builders
   - Allows filtering by upcoming/past/all bookings
   - Provides actions for managing bookings (reschedule/cancel)

2. **Session Type Editor** (`components/scheduling/builder/session-type-editor.tsx`)
   - Interface for builders to create and manage session types
   - Handles CRUD operations for session types
   - Provides real-time feedback on operations

3. **Calendar Component** (to be implemented)
   - Will display available time slots
   - Handle date selection and time slot booking

### Backend Services

1. **Scheduling Service** (`lib/scheduling/real-data/scheduling-service.ts`)
   - Core data access layer for all scheduling operations
   - Handles data transformation between database and application models
   - Contains implementations for session types, availability rules, bookings

2. **API Routes**
   - Session Types (`app/api/scheduling/session-types/route.ts`)
   - Bookings (to be implemented)
   - Availability (to be implemented)

### Data Models

Defined in `lib/scheduling/types.ts`:

1. **SessionType**: Definition of bookable session types
2. **Booking**: Record of scheduled sessions
3. **AvailabilityRule**: Recurring weekly availability
4. **AvailabilityException**: Special availability or blocked days
5. **TimeSlot**: Specific bookable time periods

## Authentication and Authorization

The booking system uses Clerk for authentication and implements role-based access control:

- **Client Role**: Can view and book available sessions
- **Builder Role**: Can manage their session types and availability
- **Admin Role**: Can manage all aspects of the scheduling system

Authentication is implemented using:
- `withAuth` middleware for API routes
- `useUser` hook for client components
- Authorization checks to ensure resources are only accessed by appropriate users

## Implementation Patterns

### API Pattern

All booking system API routes follow a consistent pattern:

1. **Request Validation**: Using Zod schemas to validate input
2. **Authentication**: Using Clerk `withAuth` middleware
3. **Authorization**: Checking if the user has permission to access the resource
4. **Service Layer**: Calling the appropriate service function
5. **Response Structure**: Consistent format for success and error responses

Example:
```typescript
// Route protected with withAuth middleware
export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    // 1. Parse and validate request
    const body = await request.json();
    const result = validationSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.format() }, 
        { status: 400 }
      );
    }
    
    // 2. Check authorization
    if (!hasPermission(user, result.data.builderId)) {
      return NextResponse.json(
        { error: 'Not authorized' }, 
        { status: 403 }
      );
    }
    
    // 3. Call service function
    const { result: data, warning } = await serviceFunction(result.data);
    
    // 4. Return consistent response
    return NextResponse.json({ 
      data,
      ...(warning ? { warning } : {})
    });
    
  } catch (error) {
    // 5. Error handling
    console.error('Error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
});
```

### Service Layer Pattern

The scheduling service implements transformers for consistent data handling:

```typescript
// Transform database model to application model
function transformBooking(booking: any): Booking {
  try {
    return {
      id: booking.id,
      // ... transform properties
    };
  } catch (error) {
    // Error handling with fallback
    console.error('Error transforming booking:', error);
    Sentry.captureException(error);
    
    // Return minimal valid object to prevent cascading failures
    return {
      id: booking.id || 'unknown',
      // ... minimal properties
    };
  }
}
```

### Component Patterns

Client components follow these patterns:

1. **Authentication Integration**:
   ```typescript
   const { user, isLoaded } = useUser();
   ```

2. **State Management**:
   ```typescript
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   ```

3. **API Interaction**:
   ```typescript
   const fetchData = useCallback(async () => {
     setIsLoading(true);
     try {
       const response = await apiFunction();
       // Handle response
     } catch (error) {
       // Handle error
     } finally {
       setIsLoading(false);
     }
   }, [dependencies]);
   ```

4. **Optimistic Updates**:
   ```typescript
   // Update local state immediately
   const updatedItems = items.map(item => 
     item.id === itemId ? { ...item, ...updates } : item
   );
   setItems(updatedItems);
   
   // Then update on server
   try {
     await updateItem(itemId, updates);
   } catch (error) {
     // Revert on error
     setItems(originalItems);
     // Show error
   }
   ```

## Error Handling Strategy

The booking system implements a comprehensive error handling strategy:

1. **Component Level**: Using try/catch with toast notifications
   ```typescript
   try {
     await operation();
     toast.success('Operation successful');
   } catch (error) {
     console.error('Error:', error);
     toast.error('Operation failed');
   }
   ```

2. **Service Level**: Try/catch with error logging and Sentry
   ```typescript
   try {
     // Service operation
   } catch (error) {
     console.error('Error in service:', error);
     Sentry.captureException(error);
     throw new Error('Service operation failed');
   }
   ```

3. **API Level**: Structured error responses
   ```typescript
   return NextResponse.json(
     { error: 'Error message', details: detailedInfo }, 
     { status: statusCode }
   );
   ```

## Mock Data Handling

For unimplemented features, the system uses a consistent mock data approach:

1. **Service Layer**: Throws specific errors for unimplemented features
   ```typescript
   throw new Error('FeatureName database implementation required');
   ```

2. **API Layer**: Handles these errors with mock data
   ```typescript
   try {
     const result = await serviceFunction();
     return { result };
   } catch (error) {
     if (error.message.includes('database implementation required')) {
       return { 
         result: mockData,
         warning: 'Using mock data - database implementation pending'
       };
     }
     throw error;
   }
   ```

## Accessibility Guidelines

All booking system components follow these accessibility guidelines:

1. **ARIA Attributes**: Proper attributes for interactive elements
   ```tsx
   <button
     aria-label="Cancel booking"
     aria-disabled={isDisabled}
   >
     Cancel
   </button>
   ```

2. **Keyboard Navigation**: Support for keyboard-only users
   ```tsx
   <div 
     tabIndex={0}
     onKeyDown={(e) => e.key === 'Enter' && handleAction()}
   >
     Content
   </div>
   ```

3. **Loading States**: Clear indication of loading states
   ```tsx
   {isLoading ? (
     <Loader className="animate-spin" />
   ) : (
     <Content />
   )}
   ```

4. **Error Messaging**: Clear error messages with suggestions
   ```tsx
   {error && (
     <div role="alert" className="text-red-500">
       {error}. Please try again or contact support.
     </div>
   )}
   ```

## Availability Management

The booking system includes a comprehensive availability management system for builders to control when clients can book sessions with them.

### Components

1. **Availability Management** (`components/scheduling/builder/availability/availability-management.tsx`)
   - Main component for managing all aspects of availability
   - Includes settings configuration for scheduling preferences
   - Provides a tabbed interface for weekly availability and exceptions

2. **Weekly Availability** (`components/scheduling/builder/availability/weekly-availability.tsx`)
   - Allows builders to set recurring weekly availability
   - Supports adding multiple time slots per day
   - Displays availability grouped by day of the week

3. **Availability Exceptions** (`components/scheduling/builder/availability/availability-exceptions.tsx`)
   - Enables setting exceptions to regular schedule
   - Supports days off (blocked dates)
   - Allows special hours for specific dates
   - Includes time slot management for available days

### Data Models

1. **AvailabilityRule**:
   - Represents recurring weekly availability
   - Includes day of week, start time, and end time
   - Can be set for each day of the week

2. **AvailabilityException**:
   - Represents exceptions to regular availability
   - Can be either blocked days or special hours
   - Contains time slots for available days

3. **ExceptionTimeSlot**:
   - Specific time slots within availability exceptions
   - Includes start time, end time, and booking status

### API Routes

1. **Availability Rules** (`app/api/scheduling/availability-rules/route.ts`)
   - GET: Fetch all availability rules for a builder
   - POST: Create a new availability rule
   - PUT: Update an existing rule
   - DELETE: Remove a rule

2. **Availability Exceptions** (`app/api/scheduling/availability-exceptions/route.ts`)
   - GET: Fetch all exceptions for a builder within a date range
   - POST: Create a new exception
   - PUT: Update an existing exception
   - DELETE: Remove an exception

3. **Time Slots** (`app/api/scheduling/time-slots/route.ts`)
   - GET: Generate available time slots based on rules, exceptions, and bookings

4. **Builder Settings** (`app/api/scheduling/builder-settings/route.ts`)
   - GET: Fetch builder scheduling profile and settings
   - PUT: Update builder scheduling settings

### Time Slot Generation Algorithm

The system generates available time slots using the following logic:

1. For each day in the requested range:
   - Check if there's an exception for that day
   - If the day is blocked, skip it
   - If the day has special hours, use those time slots
   - Otherwise, use the regular weekly availability for that day of the week
   - Generate slots based on session duration and buffer times
   - Filter out slots that overlap with existing bookings
   - Apply minimum notice and maximum advance booking constraints

### Builder Scheduling Settings

Builders can configure the following scheduling settings:

- **Timezone**: IANA timezone name for consistent time display
- **Minimum Notice**: Minimum time before a session can be booked (minutes)
- **Buffer Between Sessions**: Gap between consecutive sessions (minutes)
- **Maximum Advance Booking**: How far in advance clients can book (days)
- **Accepting Bookings**: Toggle to enable/disable booking

## Future Improvements

1. **Calendar Integration**:
   - Implement two-way sync with external calendars (Google, Outlook)
   - Add calendar export functionality for bookings
   - Create iCalendar format support for event sharing

2. **Notification System**:
   - Email notifications for booking confirmations/changes
   - SMS reminders before sessions
   - Integration with notification preferences

3. **Recurring Bookings**:
   - Support for scheduling recurring sessions
   - Intelligent conflict resolution
   - Bulk management of recurring bookings

4. **Analytics Dashboard**:
   - Booking trends and patterns visualization
   - Revenue and utilization reports
   - Client acquisition and retention metrics
   - Performance optimization recommendations

## Testing Strategy

### Unit Tests

Focus on testing individual components and functions:

- Service functions with mocked database calls
- Component rendering with various props and states
- Utility functions for data transformation and validation

### Integration Tests

Test interactions between components:

- API routes with authenticated requests
- Service layer with actual database (test environment)
- Component interactions with mocked API calls

### End-to-End Tests

Full-flow tests of the booking process:

- Builder creates session types and sets availability
- Client views available sessions and makes a booking
- Builder receives and manages the booking

## Conclusion

The booking system follows a consistent architecture with clear patterns for authentication, data handling, error management, and user experience. The modular design allows for progressive enhancement and future expansion while maintaining a consistent user experience.

The system is designed with accessibility as a core principle, ensuring that all users can interact with the booking functionality regardless of abilities or assistive technologies.
