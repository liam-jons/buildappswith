Documentation Update Plan

  1. Updated Documentation Structure

  docs/
  └── engineering/
      ├── infrastructure/
      │   ├── monitoring/
      │   │   ├── SENTRY_IMPLEMENTATION_GUIDE.md       (New)
      │   │   ├── SENTRY_CONFIGURATION_REFERENCE.md    (New)
      │   │   ├── LOGGER_MIGRATION_GUIDE.md           (New)
      │   │   ├── LOGGER_USAGE_GUIDE.md               (New)
      │   │   └── DATADOG_SENTRY_INTEGRATION.md       (Update)
      │   ├── authentication/
      │   │   ├── CLERK_EXPRESS_MIGRATION_GUIDE.md    (New)
      │   │   ├── CLERK_AUTHENTICATION_FLOW.md        (Update)
      │   │   ├── CLERK_API_REFERENCE.md              (New)
      │   │   └── AUTH_BEST_PRACTICES.md              (New)
      │   └── EU_COMPLIANCE.md                        (New)
      └── INFRASTRUCTURE_CHANGELOG.md                 (New)

  2. Sentry Documentation Updates

  New Documents

  SENTRY_IMPLEMENTATION_GUIDE.md

  # Sentry Implementation Guide

  ## Overview
  This document explains how Sentry error monitoring and performance tracking is implemented in the BuildAppsWith
  platform using Next.js App Router and instrumentation patterns.

  ## Architecture
  The Sentry implementation follows Next.js best practices using the instrumentation API to handle both client and
  server-side error monitoring:

  - **Client-side:** Initialized via `instrumentation-client.ts`
  - **Server-side:** Initialized via `instrumentation.ts`
  - **Configuration:** Centralized in `lib/sentry/config.ts`

  ## Key Components
  - **Error Classification:** `lib/sentry/error-classification.ts`
  - **Data Filtering:** `lib/sentry/sensitive-data-filter.ts`
  - **Performance Monitoring:** `lib/sentry/performance.ts`

  ## EU Region Compliance
  All Sentry data is stored in the EU region by default. This is configured through:
  - EU-specific DSN
  - Region parameter in configuration
  - PII data filtering

  ## Setup Instructions
  1. Environment variables configuration
  2. Integration with existing monitoring
  3. Error boundary usage

  ## Usage Examples
  ```javascript
  // Example of capturing an error
  import * as Sentry from '@sentry/nextjs';

  try {
    // Operation that might fail
  } catch (error) {
    Sentry.captureException(error);
  }

  Troubleshooting

  - Common issues and solutions
  - Debugging Sentry integration

  #### SENTRY_CONFIGURATION_REFERENCE.md
  ```markdown
  # Sentry Configuration Reference

  ## Configuration Options
  Complete reference of all Sentry configuration options and their usage.

  ## Environment Variables
  | Variable | Description | Default | Required |
  |----------|-------------|---------|----------|
  | NEXT_PUBLIC_SENTRY_DSN | Sentry Data Source Name | - | Yes |
  | SENTRY_ENVIRONMENT | Environment name | NODE_ENV | No |
  | SENTRY_TRACES_SAMPLE_RATE | Transaction sampling rate | 0.1 | No |

  ## Integration with Next.js App Router
  Details on how Sentry integrates with Next.js App Router components.

  ## Instrumentation API Usage
  How we leverage the Next.js instrumentation API for Sentry.

  ## Source Maps Configuration
  How source maps are generated and uploaded to Sentry.

  Updated Documents

  Update SENTRY_IMPLEMENTATION_INDEX.md

  # Sentry Implementation Documentation Index

  *Version: 2.0.0*
  *Date: May 15, 2025*
  *Status: Active*

  ## Overview
  This document serves as a central index for all documentation related to the Sentry error monitoring and
  performance tracking implementation in the BuildAppsWith platform.

  ## Implementation Documentation
  | Document | Description | Location |
  |----------|-------------|----------|
  | Sentry Implementation Guide | Comprehensive guide to Sentry implementation |
  [/docs/engineering/infrastructure/monitoring/SENTRY_IMPLEMENTATION_GUIDE.md](/docs/engineering/infrastructure/mon
  itoring/SENTRY_IMPLEMENTATION_GUIDE.md) |
  | Sentry Configuration Reference | Detailed configuration options | [/docs/engineering/infrastructure/monitoring/
  SENTRY_CONFIGURATION_REFERENCE.md](/docs/engineering/infrastructure/monitoring/SENTRY_CONFIGURATION_REFERENCE.md)
   |
  | Sentry Test Plan | Detailed test scenarios |
  [/docs/testing/SENTRY_TEST_PLAN.md](/docs/testing/SENTRY_TEST_PLAN.md) |
  | Error Handling System | Comprehensive error handling guide |
  [/docs/engineering/ERROR_HANDLING_SYSTEM.md](/docs/engineering/ERROR_HANDLING_SYSTEM.md) |

  ## Core Implementation Components
  | Component | Description | Location |
  |-----------|-------------|----------|
  | Instrumentation Client | Client-side initialization | [/instrumentation-client.ts](/instrumentation-client.ts)
  |
  | Instrumentation Server | Server-side initialization | [/instrumentation.ts](/instrumentation.ts) |
  | Sentry Configuration | Centralized configuration | [/lib/sentry/config.ts](/lib/sentry/config.ts) |
  | Error Classification | Error categorization |
  [/lib/sentry/error-classification.ts](/lib/sentry/error-classification.ts) |
  | Logger Integration | Logger with Sentry integration | [/lib/logger.ts](/lib/logger.ts) |

  ## Integration with Other Systems
  | System | Description |
  |--------|-------------|
  | Datadog | Bidirectional integration with Datadog RUM |
  | Logger | Error reporting through unified logger |
  | Clerk Authentication | User context enrichment |

  3. Logger Documentation Updates

  New Documents

  LOGGER_MIGRATION_GUIDE.md

  # Logger Migration Guide

  ## Overview
  This document outlines the migration from the `enhanced-logger` to the consolidated `logger` implementation. The
  migration improves build compatibility and adds EU compliance features.

  ## Migration Benefits
  - Improved build performance and compatibility
  - Enhanced EU region data compliance
  - Unified implementation for client and server
  - Better error reporting and Sentry integration

  ## Migration Steps
  1. Update import paths:
     ```typescript
     // Before
     import { enhancedLogger, createDomainLogger } from '@/lib/enhanced-logger';

     // After
     import { logger, createDomainLogger } from '@/lib/logger';

  2. Update any error severity references:
  // Before
  import { ErrorSeverity } from '@/lib/enhanced-logger';

  // After
  import { ErrorSeverity } from '@/lib/logger';

  Compatibility APIs

  The new logger maintains backward compatibility with the enhanced-logger API:

  Manual Migration Cases

  Some cases require special attention during migration:

  1. State Machine Logging: Update state machine files to use the new logger
  2. Database Integration: Update database logging with the unified logger
  3. Webhook Handlers: Ensure proper context is maintained

  Automated Migration

  The migration script at scripts/migrate-logger.js can automatically update import paths:

  node scripts/migrate-logger.js

  Potential Issues and Solutions

  Common issues encountered during migration and their solutions.

  #### LOGGER_USAGE_GUIDE.md
  ```markdown
  # Logger Usage Guide

  ## Overview
  The unified logger provides structured logging capabilities for both client and server-side code with EU
  compliance and Sentry integration.

  ## Basic Usage

  ```typescript
  import { logger } from '@/lib/logger';

  // Simple logging
  logger.debug('Debug message');
  logger.info('Information message');
  logger.warn('Warning message');
  logger.error('Error message');

  // Logging with metadata
  logger.info('User signed in', {
    userId: '123',
    method: 'email'
  });

  // Error logging
  try {
    // Operation that might fail
  } catch (error) {
    logger.error('Operation failed', {
      operation: 'process-payment'
    }, error);
  }

  Domain-Specific Logging

  import { createDomainLogger } from '@/lib/logger';

  // Create a domain-specific logger
  const paymentLogger = createDomainLogger('payment', {
    service: 'stripe',
  });

  // Use domain logger
  paymentLogger.info('Payment processed', {
    amount: 99.99,
    currency: 'USD',
  });

  EU Compliance Features

  The logger automatically handles EU compliance when the feature is enabled:

  // With EU compliance enabled, PII is automatically redacted
  logger.info('User profile updated', {
    userId: '123',
    email: 'user@example.com', // Will be redacted: [REDACTED]
    name: 'John Doe',          // Will be redacted: [REDACTED]
    preferences: {
      theme: 'dark'            // Not redacted (not PII)
    }
  });

  Sentry Integration

  Errors and warnings are automatically reported to Sentry:

  // This will log to console AND send to Sentry
  logger.error('Payment failed', {
    transactionId: 'tx-123',
    amount: 99.99
  }, new Error('Payment gateway error'));

  Performance Considerations

  - Tips for efficient logging
  - When to use different log levels
  - Best practices for metadata

  ### Updated Documents

  #### Update ERROR_HANDLING_SYSTEM.md
  ```markdown
  # Error Handling System

  *Updated: May 15, 2025*

  ## Logger Implementation

  The error handling system now uses the unified logger implementation with enhanced EU compliance and Sentry
  integration. The logger is implemented in `lib/logger.ts` and provides:

  - Structured logging with metadata
  - Domain-specific logging contexts
  - Automatic PII redaction for EU compliance
  - Seamless Sentry integration
  - Consistent error reporting across client and server

  [See the Logger Usage Guide for detailed
  examples](/docs/engineering/infrastructure/monitoring/LOGGER_USAGE_GUIDE.md)

  ## Error Classification

  [... rest of existing document with updated references ...]

  4. Clerk Authentication Documentation Updates

  New Documents

  CLERK_EXPRESS_MIGRATION_GUIDE.md

  # Clerk Express SDK Migration Guide

  ## Overview
  This document outlines the migration from Clerk NextJS SDK to Clerk Express SDK for improved performance,
  security, and flexibility.

  ## Migration Benefits
  - Improved performance with Express SDK
  - Enhanced middleware capabilities
  - Better error handling
  - More flexible authentication flows

  ## Architecture Changes
  The migration involves several architectural changes:

  1. **Middleware Pattern**: Using Express SDK adapter with Next.js middleware
  2. **Server Authentication**: Enhanced server-side authentication utilities
  3. **API Protection**: Improved route protection with better error handling
  4. **Client Compatibility**: Backward compatible client hooks

  ## Migration Steps

  ### 1. Update Dependencies
  ```bash
  # Install Clerk Express SDK
  pnpm add @clerk/express

  2. Update Middleware

  // Before
  import { authMiddleware } from "@clerk/nextjs";

  // After
  import { createClerkExpressMiddleware } from "@/lib/auth/express/adapter";
  const clerkExpressMiddleware = createClerkExpressMiddleware();

  3. Update Server Components

  // Before
  import { auth } from "@clerk/nextjs";
  const { userId } = auth();

  // After
  import { getServerAuth } from "@/lib/auth/express/server-auth";
  const { userId } = getServerAuth();

  4. Update API Routes

  // Before
  import { auth } from "@clerk/nextjs";

  // After
  import { withAuth, withRole } from "@/lib/auth/express/api-auth";

  // Protected route handler
  export const GET = withAuth(async (req) => {
    // Handler implementation
  });

  5. Update Client Components

  // Before
  import { useAuth } from "@clerk/nextjs";

  // After
  import { useAuth } from "@/lib/auth/client-auth";

  Common Issues and Solutions

  [List of common issues and their solutions]

  #### CLERK_API_REFERENCE.md
  ```markdown
  # Clerk Express API Reference

  ## Server Authentication

  ### getServerAuth()
  Gets the current authentication state in server components.

  ```typescript
  import { getServerAuth } from '@/lib/auth/express/server-auth';

  const { userId, isAuthenticated } = getServerAuth();

  hasServerRole(role)

  Checks if the current user has a specific role.

  import { hasServerRole } from '@/lib/auth/express/server-auth';

  if (hasServerRole('admin')) {
    // Admin-only operations
  }

  API Route Protection

  withAuth(handler)

  Protects a route handler with authentication requirements.

  import { withAuth } from '@/lib/auth/express/api-auth';

  export const GET = withAuth(async (req) => {
    // Protected route handler
  });

  withRole(role, handler)

  Protects a route handler with role requirements.

  import { withRole } from '@/lib/auth/express/api-auth';

  export const POST = withRole('admin', async (req) => {
    // Admin-only route handler
  });

  Client Hooks

  useAuth()

  Enhanced authentication hook with role support.

  import { useAuth } from '@/lib/auth/client-auth';

  const { userId, isSignedIn, roles, hasRole } = useAuth();

  usePermission(permission)

  Check if user has a specific permission.

  import { usePermission } from '@/lib/auth/client-auth';

  const canEditProfile = usePermission('profile:edit');

  #### AUTH_BEST_PRACTICES.md
  ```markdown
  # Authentication Best Practices

  ## Security Considerations
  - Token handling best practices
  - CSRF protection
  - Authentication rate limiting
  - Session management

  ## Performance Optimization
  - Middleware performance considerations
  - Caching authentication state
  - Minimizing authentication overhead

  ## Role-Based Access Control
  - Setting up roles and permissions
  - Role hierarchy
  - Permission inheritance

  ## Error Handling
  - User-friendly authentication errors
  - Security implications of error messages
  - Error logging and monitoring

  ## Development Workflow
  - Testing authentication flows
  - Mocking authentication in tests
  - Local development setup

  Updated Documents

  Update CLERK_AUTHENTICATION_FLOW.md

  # Clerk Authentication Flow

  *Updated: May 15, 2025*

  ## Overview
  This document describes the authentication flow using the Clerk Express SDK integration.

  ## Architecture Diagram
  [Updated diagram showing Express SDK integration]

  ## Authentication Components
  The authentication system consists of the following components:

  1. **Express SDK Adapter**: Bridges Clerk Express SDK with Next.js middleware
  2. **Server Authentication**: Utilities for server components and API routes
  3. **Client Hooks**: Enhanced hooks for client components
  4. **Role Management**: Role-based access control system

  ## Authentication Flow
  1. Request enters the application
  2. Clerk Express middleware processes authentication state
  3. For protected routes, authentication is verified
  4. Auth context is propagated to components and API routes

  [... rest of the document updated to reflect Express SDK ...]

  5. Cross-Component Documentation

  New Documents

  EU_COMPLIANCE.md

  # EU Compliance Guide

  ## Overview
  This document outlines how the BuildAppsWith platform ensures compliance with EU data regulations across all
  infrastructure components.

  ## Data Residency
  All infrastructure components are configured to store data in EU regions:

  - **Sentry**: Uses EU-specific DSN and region configuration
  - **Logger**: Implements PII redaction for EU compliance
  - **Authentication**: Ensures user data is handled in accordance with EU regulations

  ## PII Handling

  ### Automatic PII Redaction
  The logger automatically redacts potentially sensitive information:

  ```typescript
  // With EU compliance enabled (NEXT_PUBLIC_ENABLE_EU_COMPLIANCE=true)
  logger.info('User updated', {
    userId: '123',       // Not redacted (identifier only)
    email: 'user@example.com', // Redacted to [REDACTED]
    name: 'John Doe',    // Redacted to [REDACTED]
    preferences: { theme: 'dark' } // Not redacted (not PII)
  });

  Sentry Data Filtering

  Sentry is configured to filter sensitive data:

  // In lib/sentry/sensitive-data-filter.ts
  export function configureSentryDataFiltering(config) {
    return {
      ...config,
      beforeSend: (event) => {
        // PII filtering logic
      }
    };
  }

  Enabling EU Compliance

  Enable EU compliance features with the following environment variables:

  NEXT_PUBLIC_ENABLE_EU_COMPLIANCE=true
  NEXT_PUBLIC_DATA_REGION=eu

  Compliance Testing

  How to test EU compliance features are working correctly.

  Regulatory References

  Links to relevant EU regulations and how our implementation addresses them.

  #### INFRASTRUCTURE_CHANGELOG.md
  ```markdown
  # Infrastructure Changelog

  ## May 2025: Infrastructure Modernization

  ### Sentry Configuration
  - Migrated from deprecated sentry.client/server.config.ts to Next.js instrumentation pattern
  - Implemented explicit EU region support for data residency
  - Enhanced error capturing with improved context
  - Added compatibility with Turbopack

  ### Logger Implementation
  - Consolidated enhanced-logger and simplified logger implementations
  - Added EU compliance features for PII redaction
  - Improved build compatibility and reduced bundle size
  - Enhanced Sentry integration for error reporting

  ### Clerk Authentication
  - Migrated from Clerk NextJS SDK to Clerk Express SDK
  - Implemented adapter pattern for Next.js middleware
  - Enhanced server-side authentication utilities
  - Improved error handling for authentication flows
  - Added role-based access control improvements

  ## Previous Changes
  [... previous changelog entries ...]

  6. Documentation Implementation Steps

  1. Create Documentation Structure
  mkdir -p docs/engineering/infrastructure/monitoring
  mkdir -p docs/engineering/infrastructure/authentication
  2. Create New Documents
  # Sentry documents
  touch docs/engineering/infrastructure/monitoring/SENTRY_IMPLEMENTATION_GUIDE.md
  touch docs/engineering/infrastructure/monitoring/SENTRY_CONFIGURATION_REFERENCE.md

  # Logger documents
  touch docs/engineering/infrastructure/monitoring/LOGGER_MIGRATION_GUIDE.md
  touch docs/engineering/infrastructure/monitoring/LOGGER_USAGE_GUIDE.md

  # Clerk documents
  touch docs/engineering/infrastructure/authentication/CLERK_EXPRESS_MIGRATION_GUIDE.md
  touch docs/engineering/infrastructure/authentication/CLERK_API_REFERENCE.md
  touch docs/engineering/infrastructure/authentication/AUTH_BEST_PRACTICES.md

  # Cross-component documents
  touch docs/engineering/infrastructure/EU_COMPLIANCE.md
  touch docs/engineering/INFRASTRUCTURE_CHANGELOG.md
  3. Update Existing Documents
  # Sentry updates
  vi docs/engineering/SENTRY_IMPLEMENTATION_INDEX.md

  # Logger updates
  vi docs/engineering/ERROR_HANDLING_SYSTEM.md

  # Clerk updates
  vi docs/engineering/CLERK_AUTHENTICATION_FLOW.md
  4. Document Verification
  # Create verification script
  cat > scripts/verify-documentation.js << EOL
  const fs = require('fs');
  const path = require('path');

  // Check for missing documentation
  const requiredDocs = [
    'docs/engineering/infrastructure/monitoring/SENTRY_IMPLEMENTATION_GUIDE.md',
    'docs/engineering/infrastructure/monitoring/LOGGER_MIGRATION_GUIDE.md',
    'docs/engineering/infrastructure/authentication/CLERK_EXPRESS_MIGRATION_GUIDE.md',
    // Add other required docs
  ];

  let missingDocs = [];
  for (const doc of requiredDocs) {
    if (!fs.existsSync(path.resolve(doc))) {
      missingDocs.push(doc);
    }
  }

  if (missingDocs.length > 0) {
    console.error('Missing documentation files:');
    missingDocs.forEach(doc => console.error(`- ${doc}`));
    process.exit(1);
  }

  console.log('Documentation verification complete!');
  EOL

  # Run verification
  node scripts/verify-documentation.js
  5. Documentation Index Updates
  # Update main README.md to include new documentation
  vi README.md

  7. Documentation Review Process

  1. Technical Accuracy Review
    - Have team members review documentation for accuracy
    - Ensure code examples are correct and follow best practices
    - Verify all steps can be followed without errors
  2. Usability Review
    - Ensure documentation is clear and accessible
    - Check for consistent terminology across documents
    - Verify links between documents work correctly
  3. Compliance Review
    - Verify EU compliance documentation is accurate
    - Ensure security best practices are correctly documented
    - Check for any sensitive information in examples
  4. Final Publishing
    - Merge documentation changes to main branch
    - Announce documentation updates to the team
    - Schedule periodic reviews to keep documentation current
