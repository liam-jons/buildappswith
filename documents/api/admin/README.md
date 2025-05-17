# Admin API Documentation

*Version: 1.0.141*

This document provides comprehensive documentation for the Admin API endpoints in the Buildappswith platform.

## Overview

The Admin API routes handle administrative functionality that is restricted to users with the ADMIN role. These endpoints include managing builders, session types, and other system-wide settings.

## Authentication

All Admin API endpoints require authentication using Clerk. Users must have the ADMIN role to access these endpoints, which is enforced by the `withAdmin` middleware.

## Base URL

All Admin API requests are relative to:

```
/api/admin
```

## Common Types

```typescript
// Common response structure
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: string;
    detail: string;
  };
}

// Builder profile data
interface BuilderProfileData {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  headline: string | null;
  hourlyRate: number | null;
  featuredBuilder: boolean;
  adhd_focus: boolean;
  availableForHire: boolean;
  validationTier: number;
}

// Session type data
interface SessionTypeData {
  id: string;
  builderId: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
  color: string | null;
  maxParticipants: number | null;
  createdAt: string;
  updatedAt: string;
}
```

## Endpoints

### Get All Builders

Retrieves a list of all builder profiles on the platform.

**URL**: `/api/admin/builders`  
**Method**: `GET`  
**Authentication Required**: Yes  
**Authorization**: Admin role required

#### Success Response

**Code**: `200 OK`

```json
{
  "data": [
    {
      "id": "builder_123",
      "userId": "user_456",
      "name": "John Smith",
      "email": "john@example.com",
      "image": "https://example.com/avatar.jpg",
      "headline": "AI App Builder",
      "hourlyRate": 150,
      "featuredBuilder": true,
      "adhd_focus": false,
      "availableForHire": true,
      "validationTier": 2
    }
  ],
  "count": 1
}
```

#### Error Responses

**Unauthorized** (401)
```json
{
  "error": "Authentication required"
}
```

**Forbidden** (403)
```json
{
  "error": "Insufficient permissions: Admin role required"
}
```

**Internal Server Error** (500)
```json
{
  "error": "Failed to fetch builders"
}
```

#### Example Request

```bash
curl https://buildappswith.dev/api/admin/builders \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

#### Notes

- This endpoint returns all builder profiles, including inactive ones
- The `count` field provides the total number of builders returned
- The hourly rate is converted from Decimal to Number for JSON serialization

---

### Get All Session Types

Retrieves all session types on the platform, with optional filtering by builder ID.

**URL**: `/api/admin/session-types`  
**Method**: `GET`  
**Authentication Required**: Yes  
**Authorization**: Admin role required

#### Query Parameters

- `builderId` (optional): Filter session types by builder ID

#### Success Response

**Code**: `200 OK`

```json
{
  "data": [
    {
      "id": "session_123",
      "builderId": "builder_456",
      "title": "One-on-One Consultation",
      "description": "Personal consultation session",
      "durationMinutes": 60,
      "price": 150,
      "currency": "USD",
      "isActive": true,
      "color": "#4a90e2",
      "maxParticipants": null,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### Error Responses

**Unauthorized** (401)
```json
{
  "error": "Authentication required"
}
```

**Forbidden** (403)
```json
{
  "error": "Insufficient permissions: Admin role required"
}
```

**Internal Server Error** (500)
```json
{
  "error": "Failed to fetch session types"
}
```

#### Example Request

```bash
# Get all session types
curl https://buildappswith.dev/api/admin/session-types \
  -H "Authorization: Bearer ${AUTH_TOKEN}"

# Get session types for a specific builder
curl https://buildappswith.dev/api/admin/session-types?builderId=builder_456 \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

#### Notes

- The price is converted from Decimal to Number for JSON serialization
- Results are ordered by creation date (ascending)

---

### Create Session Type

Creates a new session type for a builder.

**URL**: `/api/admin/session-types`  
**Method**: `POST`  
**Authentication Required**: Yes  
**Authorization**: Admin role required

#### Request Body

```typescript
{
  builderId: string;              // Required - the builder ID
  title: string;                  // Required - minimum 3 characters
  description: string;            // Required - minimum 10 characters
  durationMinutes: number;        // Required - minimum 15 minutes
  price: number;                  // Required - minimum 0
  currency: string;               // Required - 3 characters (e.g., "USD")
  isActive: boolean;              // Optional - defaults to true
  color: string | null;           // Optional - color code (e.g., "#4a90e2")
  maxParticipants: number | null; // Optional - for group sessions
}
```

#### Success Response

**Code**: `201 Created`

```json
{
  "message": "Session type created successfully",
  "data": {
    "id": "session_123",
    "builderId": "builder_456",
    "title": "One-on-One Consultation",
    "description": "Personal consultation session",
    "durationMinutes": 60,
    "price": 150,
    "currency": "USD",
    "isActive": true,
    "color": "#4a90e2",
    "maxParticipants": null,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

#### Error Responses

**Unauthorized** (401)
```json
{
  "error": "Authentication required"
}
```

**Forbidden** (403)
```json
{
  "error": "Insufficient permissions: Admin role required"
}
```

**Bad Request** (400)
```json
{
  "error": "Invalid session type data",
  "details": {
    "title": ["Title must be at least 3 characters"],
    "price": ["Price must be a positive number"]
  }
}
```

**Internal Server Error** (500)
```json
{
  "error": "Failed to create session type"
}
```

#### Example Request

```bash
curl -X POST https://buildappswith.dev/api/admin/session-types \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "builderId": "builder_456",
    "title": "One-on-One Consultation",
    "description": "Personal consultation session",
    "durationMinutes": 60,
    "price": 150,
    "currency": "USD",
    "isActive": true,
    "color": "#4a90e2"
  }'
```

#### Notes

- Input validation is performed using Zod schema
- The price is stored as Decimal in the database but converted to Number in the response

---

### Get Session Type by ID

Retrieves a specific session type by ID.

**URL**: `/api/admin/session-types/:id`  
**Method**: `GET`  
**Authentication Required**: Yes  
**Authorization**: Admin role required

#### URL Parameters

- `id`: The session type ID

#### Success Response

**Code**: `200 OK`

```json
{
  "data": {
    "id": "session_123",
    "builderId": "builder_456",
    "title": "One-on-One Consultation",
    "description": "Personal consultation session",
    "durationMinutes": 60,
    "price": 150,
    "currency": "USD",
    "isActive": true,
    "color": "#4a90e2",
    "maxParticipants": null,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

#### Error Responses

**Unauthorized** (401)
```json
{
  "error": "Authentication required"
}
```

**Forbidden** (403)
```json
{
  "error": "Insufficient permissions: Admin role required"
}
```

**Not Found** (404)
```json
{
  "error": "Session type not found"
}
```

**Internal Server Error** (500)
```json
{
  "error": "Failed to fetch session type"
}
```

#### Example Request

```bash
curl https://buildappswith.dev/api/admin/session-types/session_123 \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

#### Notes

- The price is converted from Decimal to Number for JSON serialization

---

### Update Session Type

Updates an existing session type.

**URL**: `/api/admin/session-types/:id`  
**Method**: `PUT`  
**Authentication Required**: Yes  
**Authorization**: Admin role required

#### URL Parameters

- `id`: The session type ID

#### Request Body

```typescript
{
  title?: string;                  // Optional - minimum 3 characters
  description?: string;            // Optional - minimum 10 characters
  durationMinutes?: number;        // Optional - minimum 15 minutes
  price?: number;                  // Optional - minimum 0
  currency?: string;               // Optional - 3 characters (e.g., "USD")
  isActive?: boolean;              // Optional
  color?: string | null;           // Optional - color code (e.g., "#4a90e2")
  maxParticipants?: number | null; // Optional - for group sessions
}
```

#### Success Response

**Code**: `200 OK`

```json
{
  "message": "Session type updated successfully",
  "data": {
    "id": "session_123",
    "builderId": "builder_456",
    "title": "Updated Consultation",
    "description": "Updated consultation session",
    "durationMinutes": 90,
    "price": 200,
    "currency": "USD",
    "isActive": true,
    "color": "#4a90e2",
    "maxParticipants": null,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-02T00:00:00Z"
  }
}
```

#### Error Responses

**Unauthorized** (401)
```json
{
  "error": "Authentication required"
}
```

**Forbidden** (403)
```json
{
  "error": "Insufficient permissions: Admin role required"
}
```

**Bad Request** (400)
```json
{
  "error": "Invalid session type data",
  "details": {
    "title": ["Title must be at least 3 characters"],
    "price": ["Price must be a positive number"]
  }
}
```

**Not Found** (404)
```json
{
  "error": "Session type not found"
}
```

**Internal Server Error** (500)
```json
{
  "error": "Failed to update session type"
}
```

#### Example Request

```bash
curl -X PUT https://buildappswith.dev/api/admin/session-types/session_123 \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Consultation",
    "description": "Updated consultation session",
    "durationMinutes": 90,
    "price": 200
  }'
```

#### Notes

- Only fields included in the request body will be updated
- Input validation is performed using Zod schema
- The price is stored as Decimal in the database but converted to Number in the response

---

### Delete Session Type

Deletes a session type.

**URL**: `/api/admin/session-types/:id`  
**Method**: `DELETE`  
**Authentication Required**: Yes  
**Authorization**: Admin role required

#### URL Parameters

- `id`: The session type ID

#### Success Response

**Code**: `200 OK`

```json
{
  "message": "Session type deleted successfully"
}
```

#### Error Responses

**Unauthorized** (401)
```json
{
  "error": "Authentication required"
}
```

**Forbidden** (403)
```json
{
  "error": "Insufficient permissions: Admin role required"
}
```

**Not Found** (404)
```json
{
  "error": "Session type not found"
}
```

**Bad Request** (400)
```json
{
  "error": "Cannot delete session type with existing bookings"
}
```

**Internal Server Error** (500)
```json
{
  "error": "Failed to delete session type"
}
```

#### Example Request

```bash
curl -X DELETE https://buildappswith.dev/api/admin/session-types/session_123 \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

#### Notes

- Session types with existing bookings cannot be deleted
- This operation is permanent and cannot be undone

## Error Handling

The Admin API implements consistent error handling with these types:

| Error Type | Description | HTTP Status Code |
|------------|-------------|------------------|
| `AUTHENTICATION_ERROR` | Authentication issues or missing token | 401 |
| `AUTHORIZATION_ERROR` | Permission issues (missing Admin role) | 403 |
| `VALIDATION_ERROR` | Input validation failure | 400 |
| `RESOURCE_ERROR` | Resource not found or unavailable | 404 |
| `INTERNAL_ERROR` | Unexpected server errors | 500 |

## Testing

### Test Environment

For testing the Admin API:

1. Use test users with the ADMIN role
2. All endpoints can be accessed at `http://localhost:3000/api/admin/` in development
3. Role-based authorization can be tested using accounts with different roles

## Related Documentation

- [API Overview](../API_OVERVIEW.md)
- [Middleware Documentation](/docs/engineering/CLERK_AUTHENTICATION_STATUS.md)
- [Builder Profile Schema](/docs/engineering/DATABASE_SCHEMA.md#builder-profiles)
