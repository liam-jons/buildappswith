# Marketplace API Documentation

*Version: 1.0.139*

This document provides an overview of the Marketplace API endpoints in the Buildappswith platform. The Marketplace API handles builder profile management, discovery, and related functionality.

## Overview

The Marketplace API allows users to discover builders, view their profiles, and filter based on various criteria. It also enables builders to manage their own profiles.

## Authentication

All Marketplace API endpoints require authentication using Clerk unless otherwise specified. The user must be signed in and have appropriate permissions based on their role and relationship to the resources.

## Base URL

All Marketplace API requests are relative to:

```
/api/marketplace
```

## Endpoints

### Builders

#### Get Builders

Retrieves a list of builders, with optional filtering and pagination.

**URL**: `/api/marketplace/builders`  
**Method**: `GET`  
**Authentication Required**: No  

##### Query Parameters

- `page`: (optional) Page number for pagination, default: 1
- `limit`: (optional) Number of results per page, default: 10
- `category`: (optional) Filter by category
- `search`: (optional) Search term for builder name or description
- `sortBy`: (optional) Field to sort by, default: "createdAt"
- `sortDirection`: (optional) Sort direction: "asc" or "desc", default: "desc"

##### Success Response

**Code**: `200 OK`

```json
{
  "builders": [
    {
      "id": "builder_123",
      "name": "Jane Smith",
      "title": "AI Application Expert",
      "bio": "Helping businesses leverage AI effectively...",
      "avatarUrl": "https://example.com/avatars/jane.jpg",
      "categories": ["AI", "Productivity"],
      "rating": 4.8,
      "reviewCount": 24,
      "sessionCount": 156,
      "isVerified": true,
      "createdAt": "2024-12-01T10:00:00Z"
    },
    // Additional builders...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalItems": 42
  }
}
```

##### Example Request

```bash
curl "https://buildappswith.dev/api/marketplace/builders?category=AI&limit=20&page=1" \
  -H "Content-Type: application/json"
```

#### Get Builder by ID

Retrieves a specific builder by their ID.

**URL**: `/api/marketplace/builders/:id`  
**Method**: `GET`  
**Authentication Required**: No  

##### URL Parameters

- `id`: The builder ID

##### Success Response

**Code**: `200 OK`

```json
{
  "builder": {
    "id": "builder_123",
    "name": "Jane Smith",
    "title": "AI Application Expert",
    "bio": "Helping businesses leverage AI effectively...",
    "avatarUrl": "https://example.com/avatars/jane.jpg",
    "categories": ["AI", "Productivity"],
    "expertise": ["ChatGPT", "Prompt Engineering", "AI Integration"],
    "rating": 4.8,
    "reviewCount": 24,
    "sessionCount": 156,
    "isVerified": true,
    "socialLinks": {
      "twitter": "https://twitter.com/janesmith",
      "linkedin": "https://linkedin.com/in/janesmith",
      "github": "https://github.com/janesmith"
    },
    "sessionTypes": [
      {
        "id": "session_type_123",
        "title": "One-on-One Consultation",
        "description": "Personalized consulting session",
        "duration": 60,
        "price": 150.00,
        "currency": "usd"
      },
      // Additional session types...
    ],
    "availabilityOverview": {
      "nextAvailableSlot": "2025-05-10T14:00:00Z",
      "typicalResponseTime": "within 24 hours",
      "timezone": "America/New_York"
    },
    "createdAt": "2024-12-01T10:00:00Z"
  }
}
```

##### Error Responses

**Not Found** (404)
```json
{
  "error": "Builder not found"
}
```

##### Example Request

```bash
curl "https://buildappswith.dev/api/marketplace/builders/builder_123" \
  -H "Content-Type: application/json"
```

#### Update Builder Profile

Updates a builder's profile information.

**URL**: `/api/marketplace/builders/:id`  
**Method**: `PATCH`  
**Authentication Required**: Yes  
**Authorization**: User must be the builder or an admin  

##### URL Parameters

- `id`: The builder ID

##### Request Body

```typescript
{
  title?: string;
  bio?: string;
  categories?: string[];
  expertise?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  availabilityOverview?: {
    timezone?: string;
    typicalResponseTime?: string;
  };
}
```

##### Success Response

**Code**: `200 OK`

```json
{
  "builder": {
    "id": "builder_123",
    "name": "Jane Smith",
    "title": "AI Solutions Architect", // Updated field
    "bio": "Helping businesses leverage AI effectively...",
    "avatarUrl": "https://example.com/avatars/jane.jpg",
    "categories": ["AI", "Productivity", "Education"], // Updated field
    "expertise": ["ChatGPT", "Prompt Engineering", "AI Integration"],
    "rating": 4.8,
    "reviewCount": 24,
    "sessionCount": 156,
    "isVerified": true,
    "socialLinks": {
      "twitter": "https://twitter.com/janesmith",
      "linkedin": "https://linkedin.com/in/janesmith",
      "github": "https://github.com/janesmith",
      "website": "https://janesmith.dev" // New field
    },
    "availabilityOverview": {
      "nextAvailableSlot": "2025-05-10T14:00:00Z",
      "typicalResponseTime": "within 12 hours", // Updated field
      "timezone": "America/New_York"
    },
    "updatedAt": "2025-04-29T15:30:00Z"
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

**Forbidden** (403)
```json
{
  "error": "Not authorized to update this builder profile"
}
```

**Not Found** (404)
```json
{
  "error": "Builder not found"
}
```

**Bad Request** (400)
```json
{
  "error": "Invalid profile data",
  "details": {
    "formErrors": ["Invalid form submission"],
    "fieldErrors": {
      "title": ["Must be between 3 and 100 characters"]
    }
  }
}
```

##### Example Request

```bash
curl -X PATCH https://buildappswith.dev/api/marketplace/builders/builder_123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "title": "AI Solutions Architect",
    "categories": ["AI", "Productivity", "Education"],
    "socialLinks": {
      "website": "https://janesmith.dev"
    },
    "availabilityOverview": {
      "typicalResponseTime": "within 12 hours"
    }
  }'
```

### Categories

#### Get Categories

Retrieves all available builder categories.

**URL**: `/api/marketplace/categories`  
**Method**: `GET`  
**Authentication Required**: No  

##### Success Response

**Code**: `200 OK`

```json
{
  "categories": [
    {
      "id": "category_123",
      "name": "AI",
      "description": "Artificial Intelligence specialists",
      "iconUrl": "https://example.com/icons/ai.svg",
      "builderCount": 42
    },
    {
      "id": "category_124",
      "name": "Productivity",
      "description": "Tools and systems for improved workflow",
      "iconUrl": "https://example.com/icons/productivity.svg",
      "builderCount": 28
    },
    // Additional categories...
  ]
}
```

##### Example Request

```bash
curl "https://buildappswith.dev/api/marketplace/categories" \
  -H "Content-Type: application/json"
```

### Reviews

#### Get Builder Reviews

Retrieves reviews for a specific builder.

**URL**: `/api/marketplace/builders/:id/reviews`  
**Method**: `GET`  
**Authentication Required**: No  

##### URL Parameters

- `id`: The builder ID

##### Query Parameters

- `page`: (optional) Page number for pagination, default: 1
- `limit`: (optional) Number of results per page, default: 10
- `sortBy`: (optional) Field to sort by: "createdAt" or "rating", default: "createdAt"
- `sortDirection`: (optional) Sort direction: "asc" or "desc", default: "desc"

##### Success Response

**Code**: `200 OK`

```json
{
  "reviews": [
    {
      "id": "review_123",
      "builderId": "builder_123",
      "clientId": "client_456",
      "clientName": "John Doe",
      "clientAvatarUrl": "https://example.com/avatars/john.jpg",
      "rating": 5,
      "title": "Excellent guidance!",
      "content": "Jane provided incredibly helpful advice for my project...",
      "sessionType": "One-on-One Consultation",
      "createdAt": "2025-03-15T16:30:00Z"
    },
    // Additional reviews...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "totalItems": 24
  },
  "summary": {
    "averageRating": 4.8,
    "ratingDistribution": {
      "5": 18,
      "4": 5,
      "3": 1,
      "2": 0,
      "1": 0
    }
  }
}
```

##### Error Responses

**Not Found** (404)
```json
{
  "error": "Builder not found"
}
```

##### Example Request

```bash
curl "https://buildappswith.dev/api/marketplace/builders/builder_123/reviews?limit=5&sortBy=rating&sortDirection=desc" \
  -H "Content-Type: application/json"
```

#### Create Review

Creates a new review for a builder.

**URL**: `/api/marketplace/builders/:id/reviews`  
**Method**: `POST`  
**Authentication Required**: Yes  
**Authorization**: User must have completed a session with the builder  

##### URL Parameters

- `id`: The builder ID

##### Request Body

```typescript
{
  bookingId: string;    // Required - must be a completed booking
  rating: number;       // Required - 1 to 5
  title: string;        // Required - review title
  content: string;      // Required - review content
}
```

##### Success Response

**Code**: `201 Created`

```json
{
  "review": {
    "id": "review_124",
    "builderId": "builder_123",
    "clientId": "client_456",
    "clientName": "John Doe",
    "bookingId": "booking_789",
    "rating": 5,
    "title": "Excellent guidance!",
    "content": "Jane provided incredibly helpful advice for my project...",
    "sessionType": "One-on-One Consultation",
    "createdAt": "2025-04-29T16:45:00Z"
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

**Forbidden** (403)
```json
{
  "error": "You can only review builders you've had sessions with"
}
```

**Not Found** (404)
```json
{
  "error": "Builder not found"
}
```

**Bad Request** (400)
```json
{
  "error": "Invalid review data",
  "details": {
    "formErrors": ["Invalid form submission"],
    "fieldErrors": {
      "rating": ["Must be between 1 and 5"]
    }
  }
}
```

##### Example Request

```bash
curl -X POST https://buildappswith.dev/api/marketplace/builders/builder_123/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "bookingId": "booking_789",
    "rating": 5,
    "title": "Excellent guidance!",
    "content": "Jane provided incredibly helpful advice for my project..."
  }'
```

## Error Handling

The Marketplace API implements consistent error handling:

- Input validation errors return HTTP 400 with details about validation failures
- Authentication failures return HTTP 401
- Authorization failures return HTTP 403
- Resource not found errors return HTTP 404
- Server errors return HTTP 500

## Related Documentation

- [API Overview](../API_OVERVIEW.md)
- [Scheduling API](../scheduling/README.md)
- [Stripe API](../stripe/README.md)
