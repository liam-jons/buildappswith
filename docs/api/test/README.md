# Test API Documentation

*Version: 1.0.141*

This document provides comprehensive documentation for the Test API endpoints in the Buildappswith platform.

## Overview

The Test API routes are designed for development and testing purposes. These endpoints provide a way to test various platform functionalities, including authentication, authorization, and data retrieval without impacting production data.

## Authentication

Most Test API endpoints require authentication using Clerk, as they are primarily used to verify authentication and authorization functionality.

## Base URL

All Test API requests are relative to:

```
/api/test
```

## Common Types

```typescript
// Auth user structure
interface AuthUser {
  id: string;
  clerkId: string;
  name: string | null;
  email: string;
  image: string | null;
  roles: string[];
  verified: boolean;
  stripeCustomerId: string | null;
}

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
```

## Endpoints

### Authentication Test

Tests the current user's authentication status and returns authenticated user data.

**URL**: `/api/test/auth`  
**Method**: `GET`  
**Authentication Required**: Yes  

#### Success Response

**Code**: `200 OK`

```json
{
  "message": "Authentication successful",
  "user": {
    "id": "user_123",
    "clerkId": "clerk_456",
    "name": "John Smith",
    "email": "john@example.com",
    "image": "https://example.com/avatar.jpg",
    "roles": ["CLIENT", "BUILDER"],
    "verified": true,
    "stripeCustomerId": "cus_789"
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

**Internal Server Error** (500)
```json
{
  "error": "Failed to get authenticated user data"
}
```

#### Example Request

```bash
curl https://buildappswith.dev/api/test/auth \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

#### Notes

- This endpoint is useful for debugging authentication issues
- The authenticated user data is logged to the console for debugging
- This endpoint uses the `withAuth` middleware from Clerk
- All user details including roles are returned, making it valuable for checking role assignments

## Error Handling

The Test API implements consistent error handling with these types:

| Error Type | Description | HTTP Status Code |
|------------|-------------|------------------|
| `AUTHENTICATION_ERROR` | Authentication issues or missing token | 401 |
| `AUTHORIZATION_ERROR` | Permission issues | 403 |
| `INTERNAL_ERROR` | Unexpected server errors | 500 |

## Usage Guidelines

The Test API endpoints should only be used for:

1. Development and testing purposes
2. Debugging authentication and authorization issues
3. Verifying role-based access control
4. Testing middleware functionality

These endpoints should not be used in production code or relied upon for application functionality, as they may change without notice and are not intended for production use.

## Security Considerations

While Test API endpoints are designed for testing purposes:

1. They still enforce proper authentication
2. They should not expose sensitive data
3. Access should be restricted in production environments
4. Logging from these endpoints should be carefully managed

## Related Documentation

- [API Overview](../API_OVERVIEW.md)
- [Authentication Implementation](/docs/engineering/CLERK_AUTHENTICATION_STATUS.md)
- [Middleware Documentation](/docs/engineering/API_IMPLEMENTATION_GUIDE.md)
