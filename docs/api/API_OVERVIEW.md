# Buildappswith API Overview

*Version: 1.0.141*

This document provides a comprehensive overview of the Buildappswith API architecture, authentication mechanisms, and design principles. It serves as the starting point for understanding how our API works and how to interact with it.

## API Architecture

### Structure

The Buildappswith API follows a RESTful architecture organized around domain-specific resources. The primary domains include:

1. **Stripe**: Payment processing for sessions and subscriptions
2. **Scheduling**: Booking sessions, managing availability, and calendar integration
3. **Marketplace**: Builder discovery, filtering, and profile management
4. **Webhooks**: External service integration (Clerk, Stripe)
5. **Admin**: Administrative functions for platform management
6. **Apps**: Application portfolio management for builders
7. **Test**: Testing endpoints for development and debugging

Each domain has its own dedicated set of endpoints with consistent patterns for resource management.

### Base URL

All API requests are relative to the application's base URL:

```
https://buildappswith.dev/api
```

### Request Format

API requests should use the appropriate HTTP method based on the operation:

- **GET**: Retrieve resources
- **POST**: Create new resources
- **PATCH**: Update existing resources
- **DELETE**: Remove resources

Request bodies should be formatted as JSON with appropriate Content-Type headers.

### Response Format

All API responses follow a consistent structure:

```json
{
  "success": boolean,
  "message": string,
  "data"?: any,
  "error"?: {
    "type": string,
    "detail": string
  }
}
```

Where:

- `success`: Boolean indicating whether the operation was successful
- `message`: Human-readable description of the result
- `data`: Optional object containing the requested data or operation result
- `error`: Optional error information, present only when `success` is false
  - `type`: Categorized error type for programmatic handling
  - `detail`: Detailed error message

### Error Handling

The API uses HTTP status codes in combination with detailed error information in the response body:

- **400 Bad Request**: Invalid input parameters or validation failure
- **401 Unauthorized**: Authentication required or authentication failed
- **403 Forbidden**: Authentication succeeded but user lacks permission
- **404 Not Found**: Requested resource does not exist
- **500 Internal Server Error**: Server-side error during processing

Detailed error information is included in the response body to help with troubleshooting.

## Authentication

### Authentication Mechanism

The Buildappswith API uses Clerk for authentication. Each request to a protected endpoint must include a valid Clerk session token.

### Authentication Headers

For client-side requests, authentication is handled automatically by Clerk's client library. For direct API access, you must include the proper headers:

```
Authorization: Bearer {token}
```

### Authentication Middleware

Protected routes use the `withAuth` middleware from Clerk, which:

1. Validates the authentication token
2. Extracts user information and roles
3. Provides this information to the API route handler
4. Returns a 401 response if authentication fails

### Role-Based Authorization

Beyond authentication, certain endpoints require specific user roles:

- **Client Role**: Required for booking sessions and accessing personal data
- **Builder Role**: Required for managing availability and session types
- **Admin Role**: Required for system-wide operations

Role authorization is handled through the `withRole`, `withAdmin`, or `withBuilder` middleware functions built on top of the core Clerk authentication.

## API Design Principles

### 1. Consistency

All endpoints follow consistent naming conventions, URL structures, and response formats to make the API predictable and easy to use.

### 2. Security First

Security is implemented at multiple levels:

- Authentication and authorization for access control
- Input validation to prevent injection attacks
- CSRF protection for form submissions
- Rate limiting to prevent abuse

### 3. Performance Optimization

The API is designed with performance in mind:

- Efficient database queries
- Selective field inclusion
- Pagination for large result sets
- Caching where appropriate

### 4. Comprehensive Error Handling

All endpoints include:

- Input validation with detailed error messages
- Structured error responses for easy client-side handling
- Appropriate HTTP status codes
- Logging and monitoring for troubleshooting

### 5. Documentation

All API components include:

- Clear documentation of purpose and usage
- Type definitions for request and response objects
- Example requests and responses
- Error scenarios and handling guidelines

## API Domains

### Stripe API

The Stripe API handles all payment processing functions:

- Creating checkout sessions for bookings
- Processing webhook events from Stripe
- Retrieving payment status information
- Managing refunds when needed

Detailed documentation: [Stripe API Documentation](./stripe/README.md)

### Scheduling API

The Scheduling API manages all aspects of appointment booking:

- Booking creation and management
- Availability rules and exceptions
- Session type configuration
- Time slot discovery

Detailed documentation: [Scheduling API Documentation](./scheduling/README.md)

### Marketplace API

The Marketplace API provides builder discovery and management:

- Builder profile information
- Search and filtering
- Ratings and reviews
- Category management

Detailed documentation: [Marketplace API Documentation](./marketplace/README.md)

### Admin API

The Admin API provides administrative functions for platform management:

- Builder profile management
- Session type administration
- System-wide settings
- Administrative operations

Detailed documentation: [Admin API Documentation](./admin/README.md)

### Apps API

The Apps API handles portfolio management for builders:

- App creation and management
- Portfolio display
- Technology showcasing
- Project status tracking

Detailed documentation: [Apps API Documentation](./apps/README.md)

### Webhook Handlers

The webhook handlers process events from external services:

- Clerk authentication events
- Stripe payment events
- Calendar integration events

Detailed documentation: [Webhook API Documentation](./webhooks/README.md)

### Test API

The Test API provides endpoints for development and testing:

- Authentication testing
- Middleware verification
- Role-based access control testing

Detailed documentation: [Test API Documentation](./test/README.md)

## Testing the API

### Development Environment

For development and testing purposes, you can use the local development environment:

```
http://localhost:3000/api
```

### Test Mode

Stripe integrations have test mode support:

- Test mode is automatically enabled in development environments
- Test API keys are used in non-production environments
- Test events can be triggered through the Stripe dashboard

### Postman Collection

A Postman collection is available for testing the API endpoints. Request access from the development team.

## Security Considerations

1. **API Keys**: Never expose API keys in client-side code
2. **Webhook Secrets**: Protect webhook endpoint secrets
3. **HTTPS**: Always use HTTPS for API requests
4. **Minimal Permissions**: Request only the permissions you need
5. **Input Validation**: Validate all user inputs server-side

## Rate Limits

The API implements the following rate limits:

- General endpoints: 100 requests per minute per IP
- Authentication endpoints: 20 requests per minute per IP
- Webhook endpoints: 200 requests per minute

Exceeding these limits will result in a 429 Too Many Requests response.

## Versioning

The API is currently at version 1. Future versions will be announced with appropriate migration paths.

## Related Documentation

- [Stripe Documentation](./stripe/README.md)
- [Scheduling Documentation](./scheduling/README.md)
- [Marketplace Documentation](./marketplace/README.md)
- [Admin Documentation](./admin/README.md)
- [Apps Documentation](./apps/README.md)
- [Webhook Documentation](./webhooks/README.md)
- [Test Documentation](./test/README.md)
