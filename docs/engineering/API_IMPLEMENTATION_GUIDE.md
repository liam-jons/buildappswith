# API Implementation Guide

*Version: 1.0.140*

This document provides guidance for implementing and working with the Buildappswith API. It is intended as a quick reference for developers making changes to existing API endpoints or creating new ones.

## API Documentation

Comprehensive API documentation is maintained in the `/docs/api/` directory:

- **[API Overview](/docs/api/API_OVERVIEW.md)**: General introduction to the API architecture, authentication, and design principles
- **[Stripe API](/docs/api/stripe/README.md)**: Payment processing endpoints
- **[Scheduling API](/docs/api/scheduling/README.md)**: Booking and availability management
- **[Marketplace API](/docs/api/marketplace/README.md)**: Builder discovery and profiles
- **[Webhooks API](/docs/api/webhooks/README.md)**: External service integration

## Core API Principles

When implementing API endpoints, follow these principles:

1. **Domain-Based Organization**: Place endpoints in the appropriate domain directory
2. **Standard Response Format**: Use the consistent response structure
3. **Authentication First**: Use the appropriate authentication middleware
4. **Comprehensive Error Handling**: Implement proper error classification
5. **API-First Design**: Define the interface before implementation
6. **Thorough Documentation**: Update the API documentation

## Standard Response Format

All API responses should follow this structure:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: string;
    detail: string;
  };
}
```

Example success response:

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking_123",
    "startTime": "2025-05-15T14:00:00Z",
    "endTime": "2025-05-15T15:00:00Z",
    "status": "pending"
  }
}
```

Example error response:

```json
{
  "success": false,
  "message": "Invalid booking data",
  "error": {
    "type": "VALIDATION_ERROR",
    "detail": "Start time must be before end time"
  }
}
```

## Authentication Implementation

Use Clerk's authentication middleware for protected routes:

```typescript
import { withAuth } from '@clerk/nextjs/api';

export const GET = withAuth(async (request: NextRequest, auth: any) => {
  // Check authentication
  if (!auth.userId) {
    return NextResponse.json(
      { 
        success: false,
        message: 'Authentication required',
        error: {
          type: 'AUTHENTICATION_ERROR',
          detail: 'You must be signed in to access this resource'
        }
      },
      { status: 401 }
    );
  }
  
  // Rest of handler implementation...
});
```

For role-based endpoints, use the role-specific helpers:

```typescript
import { withRole, UserRole } from '@/lib/auth/clerk/api-auth';

export const GET = withRole(
  async (request: NextRequest, user: AuthUser) => {
    // User is guaranteed to have the required role
    // Implementation...
  },
  UserRole.BUILDER // Required role for this endpoint
);
```

## Error Handling

Implement consistent error handling:

```typescript
try {
  // Implementation...
} catch (error) {
  logger.error('Error description', {
    userId: auth.userId,
    error: error.message || 'Unknown error'
  });
  
  return NextResponse.json(
    {
      success: false,
      message: 'Human-readable error message',
      error: {
        type: 'ERROR_TYPE',
        detail: 'Detailed error explanation'
      }
    },
    { status: getStatusCodeForError(error) }
  );
}
```

Common error types:

- `VALIDATION_ERROR`: Input validation failure
- `AUTHENTICATION_ERROR`: Authentication issues
- `AUTHORIZATION_ERROR`: Permission issues
- `RESOURCE_ERROR`: Resource not found or unavailable
- `INTERNAL_ERROR`: Unexpected server errors

## Input Validation

Use Zod for input validation:

```typescript
import { z } from 'zod';

// Define schema
const createBookingSchema = z.object({
  sessionTypeId: z.string(),
  builderId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  // Additional fields...
});

// Validate input
const body = await request.json();
const result = createBookingSchema.safeParse(body);

if (!result.success) {
  return NextResponse.json(
    { 
      success: false,
      message: 'Invalid input data',
      error: {
        type: 'VALIDATION_ERROR',
        detail: 'Validation failed',
        fields: result.error.format()
      }
    },
    { status: 400 }
  );
}

// Access validated data
const validatedData = result.data;
```

## Creating New API Endpoints

When adding new API routes:

1. **Place in the appropriate domain**: Decide which domain the endpoint belongs to
2. **Implement proper authentication**: Use the appropriate middleware
3. **Follow RESTful conventions**: Use proper HTTP methods and naming
4. **Implement input validation**: Validate all inputs before processing
5. **Apply proper error handling**: Use the standard error format
6. **Add detailed logging**: Include relevant context for troubleshooting
7. **Write comprehensive tests**: Include unit and integration tests
8. **Update API documentation**: Add the new endpoint to the documentation

## API Route File Structure

Follow this structure for new API route files:

```typescript
// Imports
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@clerk/nextjs/api';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { yourServiceFunction } from '@/lib/your-domain/service';

// Input validation schema (if applicable)
const inputSchema = z.object({
  // Schema definition...
});

// Handler implementation
export const HTTP_METHOD = withAuth(async (request: NextRequest, auth: any) => {
  try {
    // Authentication check
    if (!auth.userId) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Authentication required',
          error: {
            type: 'AUTHENTICATION_ERROR',
            detail: 'You must be signed in to access this resource'
          }
        },
        { status: 401 }
      );
    }
    
    // Input validation (for POST/PUT/PATCH)
    if (request.method !== 'GET') {
      const body = await request.json();
      const result = inputSchema.safeParse(body);
      
      if (!result.success) {
        // Return validation error...
      }
      
      // Use validated data...
    }
    
    // Authorization check
    // Business logic implementation
    // Return successful response
  } catch (error) {
    // Error handling
  }
});
```

## API Testing

Every API endpoint should have:

1. **Unit tests**: For validation logic and error handling
2. **Integration tests**: For testing the complete request flow
3. **Authentication tests**: To verify proper access control

See the [API Test Migration Guide](./API_TEST_MIGRATION_GUIDE.md) for detailed testing guidance.

## Related Documentation

- [API Architecture](/docs/architecture/documentation/API_ARCHITECTURE.md)
- [API Overview](/docs/api/API_OVERVIEW.md)
- [Stripe Server Implementation](./STRIPE_SERVER_IMPLEMENTATION.md)
- [Clerk Authentication Status](./CLERK_AUTHENTICATION_STATUS.md)
