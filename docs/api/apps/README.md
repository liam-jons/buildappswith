# Apps API Documentation

*Version: 1.0.141*

This document provides comprehensive documentation for the Apps API endpoints in the Buildappswith platform.

## Overview

The Apps API routes handle the creation, retrieval, updating, and deletion of application portfolios for builders. These endpoints allow builders to showcase their work and manage their portfolio of applications.

## Authentication

Most Apps API endpoints require authentication using Clerk. Specific endpoints also verify that the authenticated user owns the builder profile or has the appropriate permissions to make changes.

## Base URL

All Apps API requests are relative to:

```
/api/apps
```

## Common Types

```typescript
// App status options
type AppStatus = "LIVE" | "DEMO" | "CONCEPT";

// App data structure
interface AppData {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  technologies: string[];
  status: AppStatus;
  appUrl: string | null;
  adhd_focused: boolean;
  builderId: string;
  createdAt: string;
  updatedAt: string;
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

### Get Builder Apps

Retrieves all applications for a specific builder.

**URL**: `/api/apps/:builderId`  
**Method**: `GET`  
**Authentication Required**: No  

#### URL Parameters

- `builderId`: The builder profile ID

#### Success Response

**Code**: `200 OK`

```json
[
  {
    "id": "app_123",
    "title": "AI Task Manager",
    "description": "Task management app with AI prioritization",
    "imageUrl": "https://example.com/app-screenshot.jpg",
    "technologies": ["React", "Next.js", "OpenAI"],
    "status": "LIVE",
    "appUrl": "https://aitaskmanager.com",
    "adhd_focused": true,
    "builderId": "builder_456",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

#### Error Responses

**Bad Request** (400)
```json
{
  "error": "Builder ID is required"
}
```

**Not Found** (404)
```json
{
  "error": "Builder profile not found"
}
```

**Internal Server Error** (500)
```json
{
  "error": "Internal server error"
}
```

#### Example Request

```bash
curl https://buildappswith.dev/api/apps/builder_456
```

#### Notes

- Apps are ordered by status (LIVE first, then DEMO, then CONCEPT) and then by creation date (newest first)
- This endpoint does not require authentication as it's used for public portfolio viewing
- The endpoint will return an empty array if the builder has no apps

---

### Create App

Creates a new application for a builder's portfolio.

**URL**: `/api/apps/:builderId`  
**Method**: `POST`  
**Authentication Required**: Yes  
**Authorization**: User must own the builder profile

#### URL Parameters

- `builderId`: The builder profile ID

#### Request Body

```typescript
{
  title: string;             // Required - app title
  description: string;       // Required - app description
  imageUrl?: string;         // Optional - screenshot or thumbnail URL
  technologies?: string[];   // Optional - array of technology tags
  status?: "LIVE" | "DEMO" | "CONCEPT"; // Optional - defaults to "CONCEPT"
  appUrl?: string;           // Optional - link to live app
  adhd_focused?: boolean;    // Optional - whether app is ADHD-focused
}
```

#### Success Response

**Code**: `201 Created`

```json
{
  "id": "app_123",
  "title": "AI Task Manager",
  "description": "Task management app with AI prioritization",
  "imageUrl": "https://example.com/app-screenshot.jpg",
  "technologies": ["React", "Next.js", "OpenAI"],
  "status": "CONCEPT",
  "appUrl": null,
  "adhd_focused": true,
  "builderId": "builder_456",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
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
  "error": "You don't have permission to add apps to this profile"
}
```

**Bad Request** (400)
```json
{
  "error": "Title and description are required"
}
```

**Not Found** (404)
```json
{
  "error": "Builder profile not found"
}
```

**Internal Server Error** (500)
```json
{
  "error": "Internal server error"
}
```

#### Example Request

```bash
curl -X POST https://buildappswith.dev/api/apps/builder_456 \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Task Manager",
    "description": "Task management app with AI prioritization",
    "imageUrl": "https://example.com/app-screenshot.jpg",
    "technologies": ["React", "Next.js", "OpenAI"],
    "adhd_focused": true
  }'
```

#### Notes

- The authenticated user must be the owner of the builder profile
- At minimum, title and description are required fields
- The status defaults to "CONCEPT" if not specified

---

### Update App

Updates an existing application.

**URL**: `/api/apps/edit/:id`  
**Method**: `PATCH`  
**Authentication Required**: Yes  
**Authorization**: User must own the builder profile or have ADMIN role

#### URL Parameters

- `id`: The app ID

#### Request Body

```typescript
{
  title?: string;            // Optional - app title
  description?: string;      // Optional - app description
  imageUrl?: string | null;  // Optional - screenshot or thumbnail URL
  technologies?: string[];   // Optional - array of technology tags
  status?: "LIVE" | "DEMO" | "CONCEPT"; // Optional - app status
  appUrl?: string | null;    // Optional - link to live app
  adhd_focused?: boolean;    // Optional - whether app is ADHD-focused
}
```

#### Success Response

**Code**: `200 OK`

```json
{
  "id": "app_123",
  "title": "Updated AI Task Manager",
  "description": "Updated description",
  "imageUrl": "https://example.com/app-screenshot.jpg",
  "technologies": ["React", "Next.js", "OpenAI"],
  "status": "LIVE",
  "appUrl": "https://aitaskmanager.com",
  "adhd_focused": true,
  "builderId": "builder_456",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-02T00:00:00Z"
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
  "error": "You don't have permission to edit this app"
}
```

**Not Found** (404)
```json
{
  "error": "App not found"
}
```

**Internal Server Error** (500)
```json
{
  "error": "Internal server error"
}
```

#### Example Request

```bash
curl -X PATCH https://buildappswith.dev/api/apps/edit/app_123 \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated AI Task Manager",
    "description": "Updated description",
    "status": "LIVE",
    "appUrl": "https://aitaskmanager.com"
  }'
```

#### Notes

- Only fields included in the request body will be updated
- The endpoint checks if the authenticated user owns the builder profile associated with the app
- Admin users can edit any app regardless of ownership

---

### Delete App

Deletes an application.

**URL**: `/api/apps/edit/:id`  
**Method**: `DELETE`  
**Authentication Required**: Yes  
**Authorization**: User must own the builder profile or have ADMIN role

#### URL Parameters

- `id`: The app ID

#### Success Response

**Code**: `200 OK`

```json
{
  "success": true
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
  "error": "You don't have permission to delete this app"
}
```

**Not Found** (404)
```json
{
  "error": "App not found"
}
```

**Internal Server Error** (500)
```json
{
  "error": "Internal server error"
}
```

#### Example Request

```bash
curl -X DELETE https://buildappswith.dev/api/apps/edit/app_123 \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

#### Notes

- This operation is permanent and cannot be undone
- The endpoint checks if the authenticated user owns the builder profile associated with the app
- Admin users can delete any app regardless of ownership

## Error Handling

The Apps API implements consistent error handling with these types:

| Error Type | Description | HTTP Status Code |
|------------|-------------|------------------|
| `AUTHENTICATION_ERROR` | Authentication issues or missing token | 401 |
| `AUTHORIZATION_ERROR` | Permission issues | 403 |
| `VALIDATION_ERROR` | Input validation failure | 400 |
| `RESOURCE_ERROR` | Resource not found or unavailable | 404 |
| `INTERNAL_ERROR` | Unexpected server errors | 500 |

## Related Documentation

- [API Overview](../API_OVERVIEW.md)
- [Builder Profiles API](../marketplace/README.md)
- [Authentication Implementation](/docs/engineering/CLERK_AUTHENTICATION_STATUS.md)
