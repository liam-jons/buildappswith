# Technical Decisions Log

This document records key technical decisions made during the development of the Buildappswith platform. It serves as a reference for understanding why certain approaches were taken and the context behind technical choices.

## Authentication Migration (v1.0.61) - 2025-04-24

### Decision: Standardized API Protection with Role-Based Middleware

**Context:**
During the migration from NextAuth.js to Clerk, we needed to establish a consistent pattern for protecting API routes based on authentication status and user roles.

**Decision:**
We implemented a tiered middleware approach with specialized helpers:
- `withAuth`: Basic authentication requiring any authenticated user
- `withAdmin`: Restricted to users with the ADMIN role
- `withBuilder`: Restricted to users with the BUILDER role
- `withRole`: Generic helper for routes requiring specific roles

**Rationale:**
1. This approach simplifies route handlers by removing repetitive authentication code
2. Creates a clear, consistent pattern across the codebase
3. Centralizes authentication logic for easier maintenance
4. Provides appropriate abstractions for different authorization needs

**Implementation Details:**
- All middleware helpers include Sentry error tracking
- Development mode contains special handling to aid testing
- Consistent error response format across all protected routes
- Admin routes automatically reject non-admin users without additional checks

### Decision: Unified Error Handling with Sentry Integration

**Context:**
Previous error handling was inconsistent across API routes, making tracking and resolving issues challenging.

**Decision:**
We standardized error handling across all routes with:
- Try/catch blocks around all route logic
- Sentry exception tracking for all errors
- Consistent error response format

**Rationale:**
1. Improves error visibility and tracking
2. Creates a consistent user experience for API errors
3. Simplifies debugging by centralizing error capture
4. Follows best practices for production API development

### Decision: Development Mode Special Handling

**Context:**
During development, strict authentication requirements can hinder testing and iteration.

**Decision:**
We implemented conditional authentication behavior for development:
- Production environments enforce strict role checks
- Development environments log authentication events but may bypass certain checks
- Clear logging indicates when development mode permissions are being applied

**Rationale:**
1. Improves developer experience during local testing
2. Prevents accidental security holes by being explicit about bypasses
3. Maintains strict security in production environments
4. Creates clear separation between development and production behavior
