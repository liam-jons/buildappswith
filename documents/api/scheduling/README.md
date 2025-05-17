# Scheduling API Documentation

*Version: 1.0.139*

This document provides comprehensive documentation for the Scheduling-related API endpoints in the Buildappswith platform.

## Overview

The Scheduling API provides a complete system for managing bookings, availability, and session types. These endpoints enable builders to define when they're available, what types of sessions they offer, and allow clients to book appointments.

## Authentication

All Scheduling API endpoints require authentication using Clerk. The user must be signed in and have appropriate permissions based on their role and relationship to the resources.

## Base URL

All Scheduling API requests are relative to:

```
/api/scheduling
```

## Common Types

```typescript
// Common scheduling status values
type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed';

// Time zone representation
type TimeZone = string; // IANA time zone format (e.g., 'America/New_York')

// Common booking structure
interface Booking {
  id: string;
  sessionTypeId: string;
  builderId: string;
  clientId: string;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  checkoutSessionId?: string;
  clientTimezone: TimeZone;
  builderTimezone: TimeZone;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Endpoints

### Bookings

#### Create Booking

Creates a new booking in the system.

**URL**: `/api/scheduling/bookings`  
**Method**: `POST`  
**Authentication Required**: Yes  
**Authorization**: User must be the client in the booking  

##### Request Body

```typescript
{
  sessionTypeId: string;   // Required - the type of session being booked
  builderId: string;       // Required - the builder ID
  clientId: string;        // Required - must match authenticated user
  startTime: string;       // Required - ISO datetime string
  endTime: string;         // Required - ISO datetime string
  status: BookingStatus;   // Required - typically 'pending'
  paymentStatus?: PaymentStatus; // Optional - defaults to 'unpaid'
  paymentId?: string;      // Optional - payment identifier
  checkoutSessionId?: string; // Optional - Stripe checkout session ID
  clientTimezone: string;  // Required - IANA timezone
  builderTimezone: string; // Required - IANA timezone
  notes?: string;          // Optional - additional booking notes
}
```

##### Success Response

**Code**: `200 OK`

```json
{
  "booking": {
    "id": "booking_123456",
    "sessionTypeId": "session_type_123",
    "builderId": "builder_456",
    "clientId": "client_789",
    "startTime": "2025-05-15T14:00:00Z",
    "endTime": "2025-05-15T15:00:00Z",
    "status": "pending",
    "paymentStatus": "unpaid",
    "clientTimezone": "Europe/London",
    "builderTimezone": "America/New_York",
    "notes": "Initial consultation",
    "createdAt": "2025-04-29T10:15:30Z",
    "updatedAt": "2025-04-29T10:15:30Z"
  }
}
```

##### Error Responses

**Unauthorized** (401)
```json
{
  "error": "You must be signed in to book a session"
}
```

**Bad Request** (400)
```json
{
  "error": "Invalid booking data",
  "details": {
    "formErrors": ["Invalid form submission"],
    "fieldErrors": {
      "sessionTypeId": ["Required"],
      "startTime": ["Must be a valid ISO datetime string"]
    }
  }
}
```

**Forbidden** (403)
```json
{
  "error": "Not authorized to create bookings for other users"
}
```

**Bad Request - Unavailable Slot** (400)
```json
{
  "error": "The selected time slot is not available"
}
```

##### Example Request

```bash
curl -X POST https://buildappswith.dev/api/scheduling/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "sessionTypeId": "session_type_123",
    "builderId": "builder_456",
    "clientId": "client_789",
    "startTime": "2025-05-15T14:00:00Z",
    "endTime": "2025-05-15T15:00:00Z",
    "status": "pending",
    "paymentStatus": "unpaid",
    "clientTimezone": "Europe/London",
    "builderTimezone": "America/New_York",
    "notes": "Initial consultation"
  }'
```

#### Get Bookings

Retrieves a list of bookings for a client or builder.

**URL**: `/api/scheduling/bookings`  
**Method**: `GET`  
**Authentication Required**: Yes  
**Authorization**: User must be the client or builder in the bookings  

##### Query Parameters

- `builderId`: (optional) Filter by builder ID
- `clientId`: (optional) Filter by client ID
- `startDate`: (optional) Filter by start date (YYYY-MM-DD)
- `endDate`: (optional) Filter by end date (YYYY-MM-DD)
- `status`: (optional) Filter by booking status

##### Success Response

**Code**: `200 OK`

```json
{
  "bookings": [
    {
      "id": "booking_123456",
      "sessionTypeId": "session_type_123",
      "builderId": "builder_456",
      "clientId": "client_789",
      "startTime": "2025-05-15T14:00:00Z",
      "endTime": "2025-05-15T15:00:00Z",
      "status": "pending",
      "paymentStatus": "unpaid",
      "clientTimezone": "Europe/London",
      "builderTimezone": "America/New_York",
      "notes": "Initial consultation",
      "createdAt": "2025-04-29T10:15:30Z",
      "updatedAt": "2025-04-29T10:15:30Z"
    },
    // Additional bookings...
  ]
}
```

##### Error Responses

**Unauthorized** (401)
```json
{
  "error": "You must be signed in to view bookings"
}
```

**Bad Request** (400)
```json
{
  "error": "Either builderId or clientId is required"
}
```

**Forbidden** (403)
```json
{
  "error": "You are not authorized to view these bookings"
}
```

##### Example Request

```bash
curl "https://buildappswith.dev/api/scheduling/bookings?clientId=client_789&startDate=2025-05-01&endDate=2025-05-31" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

#### Get Booking by ID

Retrieves a specific booking by its ID.

**URL**: `/api/scheduling/bookings/:id`  
**Method**: `GET`  
**Authentication Required**: Yes  
**Authorization**: User must be the client, builder, or admin related to the booking  

##### URL Parameters

- `id`: The booking ID

##### Success Response

**Code**: `200 OK`

```json
{
  "booking": {
    "id": "booking_123456",
    "sessionTypeId": "session_type_123",
    "builderId": "builder_456",
    "clientId": "client_789",
    "startTime": "2025-05-15T14:00:00Z",
    "endTime": "2025-05-15T15:00:00Z",
    "status": "pending",
    "paymentStatus": "unpaid",
    "clientTimezone": "Europe/London",
    "builderTimezone": "America/New_York",
    "notes": "Initial consultation",
    "createdAt": "2025-04-29T10:15:30Z",
    "updatedAt": "2025-04-29T10:15:30Z"
  }
}
```

##### Error Responses

**Unauthorized** (401)
```json
{
  "error": "Not authenticated"
}
```

**Not Found** (404)
```json
{
  "error": "Booking not found"
}
```

**Forbidden** (403)
```json
{
  "error": "Not authorized to access this booking"
}
```

##### Example Request

```bash
curl https://buildappswith.dev/api/scheduling/bookings/booking_123456 \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

#### Update Booking Status

Updates the status of a booking.

**URL**: `/api/scheduling/bookings/:id`  
**Method**: `PATCH`  
**Authentication Required**: Yes  
**Authorization**: 
- For status updates: Client can cancel, builder can confirm/cancel/complete
- For payment updates: Only builder or admin can update

##### URL Parameters

- `id`: The booking ID

##### Request Body for Status Update

```typescript
{
  status: "pending" | "confirmed" | "cancelled" | "completed"
}
```

##### Request Body for Payment Update

```typescript
{
  paymentStatus: "unpaid" | "pending" | "paid" | "failed",
  paymentId?: string
}
```

##### Success Response

**Code**: `200 OK`

```json
{
  "booking": {
    "id": "booking_123456",
    "sessionTypeId": "session_type_123",
    "builderId": "builder_456",
    "clientId": "client_789",
    "startTime": "2025-05-15T14:00:00Z",
    "endTime": "2025-05-15T15:00:00Z",
    "status": "confirmed", // Updated status
    "paymentStatus": "unpaid",
    "clientTimezone": "Europe/London",
    "builderTimezone": "America/New_York",
    "notes": "Initial consultation",
    "createdAt": "2025-04-29T10:15:30Z",
    "updatedAt": "2025-04-29T11:20:45Z" // Updated timestamp
  }
}
```

##### Error Responses

**Unauthorized** (401)
```json
{
  "error": "Not authenticated"
}
```

**Not Found** (404)
```json
{
  "error": "Booking not found"
}
```

**Forbidden** (403)
```json
{
  "error": "Only builders can confirm bookings"
}
```

**Bad Request** (400)
```json
{
  "error": "Invalid status data",
  "details": {
    "formErrors": ["Invalid form submission"],
    "fieldErrors": {
      "status": ["Must be one of: pending, confirmed, cancelled, completed"]
    }
  }
}
```

##### Example Request

```bash
curl -X PATCH https://buildappswith.dev/api/scheduling/bookings/booking_123456 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "status": "confirmed"
  }'
```

### Time Slots

#### Get Available Time Slots

Retrieves available time slots for a builder.

**URL**: `/api/scheduling/time-slots`  
**Method**: `GET`  
**Authentication Required**: Yes  

##### Query Parameters

- `builderId`: (required) The builder ID
- `startDate`: (required) Start date for the range (YYYY-MM-DD)
- `endDate`: (required) End date for the range (YYYY-MM-DD)
- `sessionTypeId`: (optional) Filter by session type

##### Success Response

**Code**: `200 OK`

```json
{
  "timeSlots": [
    {
      "startTime": "2025-05-15T14:00:00Z",
      "endTime": "2025-05-15T15:00:00Z",
      "builderId": "builder_456",
      "isBooked": false,
      "sessionTypeId": "session_type_123"
    },
    {
      "startTime": "2025-05-15T16:00:00Z",
      "endTime": "2025-05-15T17:00:00Z",
      "builderId": "builder_456",
      "isBooked": true,
      "sessionTypeId": "session_type_123"
    },
    // Additional time slots...
  ]
}
```

##### Error Responses

**Bad Request** (400)
```json
{
  "error": "Missing required parameters",
  "details": "builderId, startDate, and endDate are required"
}
```

**Not Found** (404)
```json
{
  "error": "Builder not found"
}
```

##### Example Request

```bash
curl "https://buildappswith.dev/api/scheduling/time-slots?builderId=builder_456&startDate=2025-05-01&endDate=2025-05-31&sessionTypeId=session_type_123" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Session Types

#### Get Session Types

Retrieves session types for a builder.

**URL**: `/api/scheduling/session-types`  
**Method**: `GET`  
**Authentication Required**: Yes  

##### Query Parameters

- `builderId`: (required) The builder ID

##### Success Response

**Code**: `200 OK`

```json
{
  "sessionTypes": [
    {
      "id": "session_type_123",
      "builderId": "builder_456",
      "title": "One-on-One Consultation",
      "description": "Personalized consulting session",
      "duration": 60, // in minutes
      "price": 150.00,
      "currency": "usd",
      "isActive": true,
      "maxParticipants": 1,
      "color": "#4a90e2"
    },
    {
      "id": "session_type_456",
      "builderId": "builder_456",
      "title": "Group Workshop",
      "description": "Interactive group learning session",
      "duration": 120, // in minutes
      "price": 50.00,
      "currency": "usd",
      "isActive": true,
      "maxParticipants": 10,
      "color": "#50e3c2"
    },
    // Additional session types...
  ]
}
```

##### Error Responses

**Bad Request** (400)
```json
{
  "error": "builderId is required"
}
```

**Not Found** (404)
```json
{
  "error": "Builder not found"
}
```

##### Example Request

```bash
curl "https://buildappswith.dev/api/scheduling/session-types?builderId=builder_456" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

#### Get Session Type by ID

Retrieves a specific session type by its ID.

**URL**: `/api/scheduling/session-types/:id`  
**Method**: `GET`  
**Authentication Required**: Yes  

##### URL Parameters

- `id`: The session type ID

##### Success Response

**Code**: `200 OK`

```json
{
  "sessionType": {
    "id": "session_type_123",
    "builderId": "builder_456",
    "title": "One-on-One Consultation",
    "description": "Personalized consulting session",
    "duration": 60,
    "price": 150.00,
    "currency": "usd",
    "isActive": true,
    "maxParticipants": 1,
    "color": "#4a90e2"
  }
}
```

##### Error Responses

**Not Found** (404)
```json
{
  "error": "Session type not found"
}
```

##### Example Request

```bash
curl https://buildappswith.dev/api/scheduling/session-types/session_type_123 \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Availability Rules

#### Get Builder Availability Rules

Retrieves availability rules for a builder.

**URL**: `/api/scheduling/availability-rules`  
**Method**: `GET`  
**Authentication Required**: Yes  
**Authorization**: User must be the builder or an admin  

##### Query Parameters

- `builderId`: (required) The builder ID

##### Success Response

**Code**: `200 OK`

```json
{
  "availabilityRules": [
    {
      "id": "rule_123",
      "builderId": "builder_456",
      "dayOfWeek": 1, // Monday
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "isAvailable": true
    },
    {
      "id": "rule_124",
      "builderId": "builder_456",
      "dayOfWeek": 2, // Tuesday
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "isAvailable": true
    },
    // Additional rules...
  ]
}
```

##### Error Responses

**Unauthorized** (401)
```json
{
  "error": "Not authenticated"
}
```

**Forbidden** (403)
```json
{
  "error": "Not authorized to view these availability rules"
}
```

**Bad Request** (400)
```json
{
  "error": "builderId is required"
}
```

##### Example Request

```bash
curl "https://buildappswith.dev/api/scheduling/availability-rules?builderId=builder_456" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Availability Exceptions

#### Get Availability Exceptions

Retrieves availability exceptions for a builder.

**URL**: `/api/scheduling/availability-exceptions`  
**Method**: `GET`  
**Authentication Required**: Yes  
**Authorization**: User must be the builder or an admin  

##### Query Parameters

- `builderId`: (required) The builder ID
- `startDate`: (optional) Start date for the range (YYYY-MM-DD)
- `endDate`: (optional) End date for the range (YYYY-MM-DD)

##### Success Response

**Code**: `200 OK`

```json
{
  "availabilityExceptions": [
    {
      "id": "exception_123",
      "builderId": "builder_456",
      "startDateTime": "2025-05-01T00:00:00Z",
      "endDateTime": "2025-05-02T23:59:59Z",
      "isAvailable": false,
      "title": "Holiday"
    },
    {
      "id": "exception_124",
      "builderId": "builder_456",
      "startDateTime": "2025-05-15T12:00:00Z",
      "endDateTime": "2025-05-15T14:00:00Z",
      "isAvailable": false,
      "title": "Lunch meeting"
    },
    // Additional exceptions...
  ]
}
```

##### Error Responses

**Unauthorized** (401)
```json
{
  "error": "Not authenticated"
}
```

**Forbidden** (403)
```json
{
  "error": "Not authorized to view these availability exceptions"
}
```

**Bad Request** (400)
```json
{
  "error": "builderId is required"
}
```

##### Example Request

```bash
curl "https://buildappswith.dev/api/scheduling/availability-exceptions?builderId=builder_456&startDate=2025-05-01&endDate=2025-05-31" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

## Error Handling

The Scheduling API implements consistent error handling:

- Input validation errors return HTTP 400 with details about validation failures
- Authentication failures return HTTP 401
- Authorization failures return HTTP 403
- Resource not found errors return HTTP 404
- Server errors return HTTP 500

## Testing

To test the Scheduling API:

1. Create a builder account with availability rules
2. Set up session types for the builder
3. Test booking creation and modification
4. Test the various query endpoints

## Integrations

The Scheduling API integrates with:

- **Stripe API**: For handling payments related to bookings
- **Clerk Authentication**: For user identity and role-based access control
- **External Calendar Systems**: For synchronizing bookings (future enhancement)

## Related Documentation

- [API Overview](../API_OVERVIEW.md)
- [Stripe API](../stripe/README.md)
- [Marketplace API](../marketplace/README.md)
