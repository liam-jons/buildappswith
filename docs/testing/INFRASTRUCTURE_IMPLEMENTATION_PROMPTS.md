# Infrastructure Implementation Prompts

*Version: 1.0.0*
*Date: 2025-05-11*
*Status: Draft*

This document contains implementation prompts for the infrastructure modernization components:
1. [Sentry Configuration Modernization](#sentry-configuration-modernization)
2. [Logger Implementation Migration](#logger-implementation-migration)
3. [Clerk Express SDK Migration](#clerk-express-sdk-migration)

---

## Sentry Configuration Modernization

### Session Context
- **Session Type**: Implementation
- **Component Focus**: Sentry Configuration Modernization
- **Current Branch**: feature/infrastructure-modernization
- **Related Documentation**: 
  - docs/engineering/infrastructure/monitoring/SENTRY_IMPLEMENTATION_GUIDE.md
  - docs/engineering/infrastructure/monitoring/SENTRY_CONFIGURATION_REFERENCE.md
  - docs/engineering/INFRASTRUCTURE_MODERNIZATION_TEST_STRATEGY.md
- **Project root directory**: /Users/liamj/Documents/development/buildappswith

### Implementation Objectives
1. Migrate from deprecated sentry.client/server.config.ts to the Next.js instrumentation pattern
2. Implement EU region data residency for all Sentry data
3. Ensure compatibility with Turbopack
4. Maintain Datadog RUM integration with Sentry
5. Enhance error context propagation

### Implementation Plan

#### 1. Current State Analysis
- Review current configuration in sentry.client.config.ts and sentry.server.config.ts
- Analyze existing instrumentation.ts setup
- Identify Datadog RUM integration points
- Review EU region settings in Sentry DSN and configuration

#### 2. Implementation Steps
- Create new instrumentation-client.ts for client-side Sentry initialization
- Update instrumentation.ts for server-side initialization
- Enhance EU region support in lib/sentry/config.ts
- Remove deprecated configuration files after testing
- Verify Datadog RUM integration remains functional

### Technical Specifications

#### instrumentation-client.ts
```typescript
// instrumentation-client.ts
import * as Sentry from "@sentry/nextjs";
import {
  getInitializationConfig,
  configureSentryDataFiltering,
  configureSentryPerformance
} from "./lib/sentry";

export function register() {
  try {
    // Only initialize on client
    if (typeof window === 'undefined') return;

    // Get base config with EU region explicit settings
    const baseConfig = getInitializationConfig();

    // Apply sensitive data filtering
    const configWithPrivacyFilters = configureSentryDataFiltering(baseConfig);

    // Apply browser-specific performance monitoring
    const finalConfig = configureSentryPerformance({
      ...configWithPrivacyFilters,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: [
            "localhost",
            "buildappswith.com",
            /^\//,  // All relative URLs
          ],
        }),
      ],

      // Maintain Datadog integration
      beforeSend: (event) => {
        try {
          // If there's a Datadog RUM global context with trace info, add it to Sentry
          if (
            window.__DD_RUM__ &&
            window.__DD_RUM__._getInternalContext
          ) {
            const rumContext = window.__DD_RUM__._getInternalContext();
            if (rumContext && rumContext.application.id) {
              event.contexts = {
                ...event.contexts,
                datadog_rum: {
                  application_id: rumContext.application.id,
                  session_id: rumContext.session.id,
                  view_id: rumContext.view.id,
                  rum_version: rumContext.version,
                }
              };
            }
          }
          return event;
        } catch (error) {
          console.error('Error in Sentry beforeSend:', error);
          return event;
        }
      },
    });

    // Initialize Sentry with defensive coding
    Sentry.init(finalConfig);
  } catch (e) {
    console.debug('Error initializing Sentry client', e);
  }
}

// Export necessary hooks for Next.js
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
```

#### instrumentation.ts
```typescript
// instrumentation.ts
import * as Sentry from '@sentry/nextjs';
import {
  getInitializationConfig,
  configureSentryDataFiltering,
  configureSentryPerformance
} from "./lib/sentry";

export async function register() {
  try {
    // Determine the runtime environment
    const isServer = typeof window === 'undefined';
    const isNodeRuntime = process.env.NEXT_RUNTIME === 'nodejs';
    const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';

    // Only initialize server-side monitoring on the server
    if (isServer) {
      // Get base config with EU region explicit settings
      const baseConfig = getInitializationConfig();

      // Apply sensitive data filtering
      const configWithPrivacyFilters = configureSentryDataFiltering(baseConfig);

      // Configure integrations based on runtime
      let serverIntegrations = [];

      // Node.js runtime integrations
      if (isNodeRuntime) {
        serverIntegrations = [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.OnUncaughtException(),
          new Sentry.Integrations.OnUnhandledRejection(),
        ];
      }

      // Apply performance monitoring config
      const finalConfig = configureSentryPerformance({
        ...configWithPrivacyFilters,
        integrations: serverIntegrations,
      });

      // Initialize Sentry
      Sentry.init(finalConfig);
    }
  } catch (error) {
    console.error('Error initializing monitoring:', error);
  }
}

// Capture server-side React component errors (Next.js 15+)
export const onRequestError = Sentry.captureRequestError;
```

#### lib/sentry/config.ts
```typescript
// Addition to lib/sentry/config.ts
export const sentryConfig = {
  // Existing code...

  // Explicit EU region configuration
  region: 'eu',

  // Update getInitializationConfig to include region
  getInitializationConfig() {
    return {
      dsn: this.dsn,
      environment: this.environment,
      release: this.release,
      tracesSampleRate: this.getSampleRate(),
      debug: this.getEnvironmentConfig().debug || false,
      attachStacktrace: this.getEnvironmentConfig().attachStacktrace || false,
      enabled: this.isEnabled(),
      region: this.region,

      // Configure sampling dynamically
      tracesSampler: (samplingContext) => {
        // Get transaction name if available
        const transactionName = samplingContext.transactionContext?.name;
        if (transactionName) {
          return this.shouldSampleTransaction(transactionName);
        }

        return this.getSampleRate();
      },
    };
  }
};
```

### Testing Strategy
1. **Unit Tests**: Verify configuration and initialization functions
2. **Integration Tests**: Test error capturing and context propagation
3. **Performance Tests**: Measure initialization times and trace performance
4. **Manual Verification**:
   - Verify error capture in development environment
   - Ensure Sentry receives server-side errors
   - Confirm EU region data storage in Sentry dashboard
   - Test integration with Datadog
   - Verify performance monitoring across environments

### Expected Outputs
1. **New Files**:
   - instrumentation-client.ts for client-side Sentry initialization
   - Updated instrumentation.ts for server-side initialization
   - Enhanced lib/sentry/config.ts with EU region support
2. **Removed Files**:
   - sentry.client.config.ts (after testing)
   - sentry.server.config.ts (after testing)
3. **Configuration Changes**:
   - EU region explicitly set in configuration
   - Enhanced error context propagation
   - Improved performance monitoring

### Implementation Notes
- **Performance Considerations**: Monitor performance before and after changes to ensure no degradation
- **Rollback Plan**: Maintain copies of original files for quick rollback if needed
- **Staged Deployment**: Implement changes in non-production environments first
- **Monitoring**: Set up additional monitoring during the transition period
- **EU Compliance**: Verify data residency settings after implementation

---

## Logger Implementation Migration

### Session Context
- **Session Type**: Implementation
- **Component Focus**: Logger Migration - Consolidating enhanced-logger and simplified logger
- **Current Branch**: feature/logger-consolidation
- **Related Documentation**: 
  - docs/engineering/infrastructure/monitoring/LOGGER_MIGRATION_GUIDE.md
  - docs/engineering/infrastructure/monitoring/LOGGER_USAGE_GUIDE.md
  - docs/engineering/ERROR_HANDLING_SYSTEM.md
- **Project root directory**: /Users/liamj/Documents/development/buildappswith

### Implementation Objectives
1. Consolidate logger implementation to resolve build errors across ~38 files
2. Implement EU region compliance for data protection
3. Maintain backward compatibility with existing logger API
4. Enhance error reporting capabilities with Sentry integration
5. Improve build efficiency and reduce bundle size
6. Ensure consistent logging patterns across the application

### Implementation Plan

#### 1. Enhanced Logger Analysis
- Review current enhanced-logger.ts implementation and its environment-specific imports
- Analyze usage patterns across the codebase
- Identify critical functionality that must be preserved
- Document error classification and domain logger usage

#### 2. Unified Logger Implementation
- Enhance the simplified logger.ts to include all necessary functionality
- Implement EU region compliance for data protection
- Add backward compatibility exports for seamless migration
- Ensure proper Sentry integration for error reporting
- Maintain domain-specific logger creation capability

#### 3. Automated Migration
- Create and run migration script to update import paths
- Identify and document complex usage patterns requiring manual intervention
- Update test files and mocks to use the new implementation
- Verify all critical functionality is maintained

#### 4. Manual Updates
- Address complex usage patterns in database integration files
- Update state machine logging implementations
- Ensure webhook handlers maintain proper logging
- Fix any remaining references to the enhanced logger

#### 5. Testing and Verification
- Test all logging levels in both client and server environments
- Verify Sentry error reporting integration
- Test EU compliance filtering with sensitive data
- Ensure build process completes without errors
- Performance test to confirm improved build efficiency

### Technical Specifications

#### Unified Logger Implementation (lib/logger.ts)
```typescript
/**
 * Unified logger utility for production build compatibility
 * Version: 1.0.0
 * 
 * This is a production-ready logger that works in both client and server environments
 * with integrated Sentry reporting and EU data compliance.
 */

import * as Sentry from '@sentry/nextjs';

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// EU region compliance configuration
const EU_COMPLIANCE = process.env.NEXT_PUBLIC_ENABLE_EU_COMPLIANCE === 'true';
const EU_REGION = process.env.NEXT_PUBLIC_DATA_REGION === 'eu';

// Re-export error classification from Sentry for backward compatibility
import { ErrorClassification } from './sentry/error-classification';
export const ErrorSeverity = ErrorClassification.Severity;
export const ErrorCategory = ErrorClassification.Category;

// Define common types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMetadata {
  [key: string]: any;
}

export interface LogFunction {
  (message: string, metadata?: LogMetadata, error?: Error): void;
}

// Private helper to sanitize PII data for EU compliance
function sanitizeForEUCompliance(data: any): any {
  if (!EU_COMPLIANCE || !data) return data;

  // Handle different data types
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeForEUCompliance);

  // Handle object type
  const result = {...data};
  const piiFields = ['email', 'name', 'fullName', 'phone', 'address', 'ip', 'userAgent'];

  // Sanitize known PII fields
  for (const key of Object.keys(result)) {
    // Check if field name suggests PII content
    if (piiFields.some(field => key.toLowerCase().includes(field))) {
      if (typeof result[key] === 'string') {
        result[key] = '[REDACTED]';
      }
    }

    // Recursively sanitize nested objects
    if (result[key] && typeof result[key] === 'object') {
      result[key] = sanitizeForEUCompliance(result[key]);
    }
  }

  return result;
}

/**
 * Enhanced logger class with unified functionality
 */
class Logger {
  // Context for this logger instance
  private context: LogMetadata = {};

  // Enabled state is determined by environment
  private static _enabled = process.env.NODE_ENV !== 'production' ||
                           process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true';

  constructor(context: LogMetadata = {}) {
    this.context = context;
  }

  /**
   * Log a debug message
   */
  debug: LogFunction = (message, metadata = {}, error) => {
    this.log('debug', message, metadata, error);
  };

  /**
   * Log an informational message
   */
  info: LogFunction = (message, metadata = {}, error) => {
    this.log('info', message, metadata, error);
  };

  /**
   * Log a warning message
   */
  warn: LogFunction = (message, metadata = {}, error) => {
    this.log('warn', message, metadata, error);
  };

  /**
   * Log an error message
   */
  error: LogFunction = (message, metadata = {}, error) => {
    this.log('error', message, metadata, error);
  };

  /**
   * Log an exception with context
   */
  exception = (error: Error, message?: string, metadata: LogMetadata = {}) => {
    this.error(message || error.message, {
      ...metadata,
      name: error.name,
    }, error);
  };

  /**
   * Log an error with a specific error code
   */
  logError = (code: string, message: string, metadata: LogMetadata = {}, error?: Error) => {
    this.error(message, {
      ...metadata,
      error_code: code,
      stack: error?.stack && process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    }, error);
  };

  /**
   * Create a child logger with additional context
   */
  child = (childContext: LogMetadata) => {
    return new Logger({
      ...this.context,
      ...childContext
    });
  };

  /**
   * Internal logging implementation
   */
  protected log(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
    if (!Logger._enabled) return;

    // Combine context with provided metadata
    const combinedMetadata = {
      ...this.context,
      ...metadata
    };

    // Apply EU compliance sanitization
    const sanitizedMetadata = sanitizeForEUCompliance(combinedMetadata);

    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level,
      message,
      environment: isBrowser ? 'client' : 'server',
      region: EU_REGION ? 'eu' : 'global',
      ...sanitizedMetadata,
    };

    // Send errors and warnings to Sentry
    if ((level === 'error' || level === 'warn') && error) {
      try {
        Sentry.captureException(error, {
          level: level === 'error' ? 'error' : 'warning',
          tags: {
            log_level: level,
            region: EU_REGION ? 'eu' : 'global',
          },
          extra: { ...sanitizedMetadata, message }
        });
      } catch (e) {
        console.error('Failed to send to Sentry:', e);
      }
    }

    // Console logging based on level
    switch (level) {
      case 'debug':
        console.debug(JSON.stringify(logObject));
        break;
      case 'info':
        console.info(JSON.stringify(logObject));
        break;
      case 'warn':
        console.warn(JSON.stringify(logObject));
        break;
      case 'error':
        console.error(JSON.stringify(logObject));
        if (error) {
          console.error(error);
        }
        break;
      default:
        console.log(JSON.stringify(logObject));
    }
  }

  /**
   * Enable or disable logging
   */
  static setEnabled(enabled: boolean) {
    Logger._enabled = enabled;
  }

  /**
   * Check if logging is enabled
   */
  static isEnabled() {
    return Logger._enabled;
  }
}

// Export singleton instance for app-wide usage
export const logger = new Logger();

// Export utility for domain-specific loggers with the same API as enhanced-logger
export function createDomainLogger(domain: string, defaultMetadata: LogMetadata = {}) {
  return logger.child({
    domain,
    ...defaultMetadata,
  });
}

// For backward compatibility with enhanced-logger
export const enhancedLogger = logger;
export class EnhancedLogger extends Logger {}
```

#### Migration Script (scripts/migrate-logger.js)
```javascript
// scripts/migrate-logger.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// List of files to process
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', '**/dist/**', '.next/**', '**/scripts/**', '**/enhanced-logger.*'],
});

// Count of updated files
let updatedFiles = 0;
let needsReviewFiles = [];

// Process each file
files.forEach(file => {
  const filePath = path.resolve(file);
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Check for enhanced-logger imports
  if (content.includes('@/lib/enhanced-logger') || content.includes('./enhanced-logger')) {
    console.log(`Processing ${file}...`);

    // Replace import paths
    let newContent = content.replace(/@\/lib\/enhanced-logger/g, '@/lib/logger');
    newContent = newContent.replace(/\.\/enhanced-logger/g, './logger');

    // If content changed, update the file
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      updated = true;
      updatedFiles++;
      console.log(`  Updated import in ${file}`);
    }

    // Check if file needs additional review
    if (content.includes('EnhancedLogger') ||
        content.includes('enhancedLogger.') ||
        content.includes('ErrorSeverity') ||
        content.includes('ErrorCategory')) {
      needsReviewFiles.push(file);
      console.log(`  ⚠️ File may need additional review: ${file}`);
    }
  }
});

// Write report file with files needing review
fs.writeFileSync(
  'logger-migration-report.md',
  `# Logger Migration Report\n\n` +
  `Updated ${updatedFiles} files to use the new logger implementation.\n\n` +
  `## Files Needing Additional Review\n\n` +
  needsReviewFiles.map(file => `- ${file}`).join('\n')
);

console.log(`\nUpdated imports in ${updatedFiles} files.`);
console.log(`${needsReviewFiles.length} files may need additional review.`);
console.log('Report written to logger-migration-report.md');
```

### Testing Strategy
1. **Unit Tests**:
   - Test all logger methods (debug, info, warn, error)
   - Test child logger creation and context passing
   - Test EU compliance data filtering
   - Test error reporting with Sentry
   - Test environment detection (client vs server)

2. **Integration Tests**:
   - Test logger in API route handlers
   - Test logger in server components
   - Test logger in client components
   - Test error boundary integration with logger

3. **Build Tests**:
   - Verify build completes without errors
   - Check bundle size for improvements
   - Test in production mode

4. **Manual Tests**:
   - Test EU compliance by logging PII data
   - Test Sentry integration by triggering errors
   - Test domain logger functionality across components

### Expected Outputs
1. **Enhanced logger.ts**:
   - Unified implementation with EU compliance
   - Backward compatibility with enhanced-logger API
   - Proper Sentry integration for error reporting

2. **Updated References**:
   - All ~38 files with enhanced-logger references updated
   - Complex cases manually migrated
   - Tests updated to use new implementation

3. **Documentation**:
   - Updated ERROR_HANDLING_SYSTEM.md with new logger information
   - LOGGER_MIGRATION_GUIDE.md with migration details
   - Updated code comments in logger.ts

4. **Cleanup**:
   - Removed legacy enhanced-logger files
   - Removed temporary compatibility layers
   - Consolidated implementation

### Implementation Notes
- **Backward Compatibility**: The implementation maintains exports from enhanced-logger for seamless migration
- **EU Compliance**: EU region detection and PII filtering are implemented
- **Error Handling**: Sentry integration is maintained and enhanced
- **Performance**: The unified implementation improves build efficiency and reduces bundle size
- **Migration Approach**: Combination of automated script and manual intervention for complex cases

---

## Clerk Express SDK Migration

### Session Context
- **Session Type**: Implementation
- **Component Focus**: Clerk Authentication - Migration to Express SDK
- **Current Branch**: feature/clerk-express-migration
- **Related Documentation**:
  - docs/engineering/infrastructure/authentication/CLERK_EXPRESS_MIGRATION_GUIDE.md
  - docs/engineering/infrastructure/authentication/CLERK_API_REFERENCE.md
  - docs/engineering/CLERK_AUTHENTICATION_FLOW.md
- **Project root directory**: /Users/liamj/Documents/development/buildappswith

### Implementation Objectives
1. Migrate from Clerk NextJS SDK to Clerk Express SDK for improved performance and security
2. Create adapter layer to ensure compatibility with Next.js middleware
3. Enhance server-side authentication capabilities
4. Improve error handling for authentication flows
5. Maintain backward compatibility with existing components
6. Ensure EU data residency compliance

### Implementation Plan

#### 1. Environment Setup and Analysis
- Install Clerk Express SDK alongside existing NextJS SDK
- Analyze current authentication flow and middleware implementation
- Identify key components that require migration
- Document dependencies between authentication components

#### 2. Express SDK Adapter Implementation
- Create adapter layer between Express SDK and Next.js middleware
- Implement compatibility functions for request/response objects
- Ensure authentication state is properly propagated
- Add enhanced error handling capabilities

#### 3. Server-Side Authentication
- Create server-side authentication utilities
- Implement role-based access control with Express SDK
- Enhance error handling for authentication failures
- Ensure proper handling of authentication tokens

#### 4. API Route Protection
- Implement route protection utilities with Express SDK
- Create role-based middleware for API routes
- Add permission-based access control
- Ensure proper error responses for authentication failures

#### 5. Client-Side Compatibility
- Create compatibility layer for client-side components
- Implement enhanced useAuth hook with role support
- Add permission-based hooks for UI components
- Ensure backward compatibility with existing components

#### 6. Testing and Verification
- Create test pages to verify authentication state
- Test authentication flows across the application
- Verify role-based access control functions correctly
- Test error handling and edge cases

### Technical Specifications

#### Express SDK Adapter Implementation
```typescript
// lib/auth/express/adapter.ts
import { clerkMiddleware as clerkExpressMiddleware, getAuth } from "@clerk/express";
import { NextRequest, NextResponse } from "next/server";

// Configuration from existing middleware
import { publicRoutes, ignoredRoutes } from "../clerk-middleware";

export function createClerkExpressMiddleware() {
  return async function clerkExpressAdapter(req: NextRequest) {
    // Initialize Express SDK middleware with Next.js adapter
    try {
      // Create Express-compatible request/response objects
      const expressReq = adaptNextRequestToExpress(req);
      const expressRes = createMockExpressResponse();
      let nextCalled = false;

      // Create Express-style next function
      const next = () => {
        nextCalled = true;
      };

      // Apply Clerk Express middleware
      await clerkExpressMiddleware({
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        secretKey: process.env.CLERK_SECRET_KEY,
        signInUrl: '/login',
      })(expressReq, expressRes, next);

      // Get auth state from request
      const auth = getAuth(expressReq);

      // Check if route is public
      const isPublicRoute = publicRoutes.some(pattern => {
        return new RegExp(`^${pattern}$`).test(req.nextUrl.pathname);
      });

      // Check if route should be ignored
      const shouldIgnore = ignoredRoutes.some(pattern => {
        return new RegExp(`^${pattern}$`).test(req.nextUrl.pathname);
      });

      // If route should be ignored, proceed
      if (shouldIgnore) {
        return NextResponse.next();
      }

      // Handle non-API routes that require auth
      if (!req.nextUrl.pathname.startsWith('/api/')) {
        // If not public and not authenticated, redirect to sign-in
        if (!isPublicRoute && !auth?.userId) {
          const signIn = new URL('/login', req.url);
          signIn.searchParams.set('redirect_url', req.url);
          return NextResponse.redirect(signIn);
        }

        // If user is authenticated but on auth pages, redirect to dashboard
        if (auth?.userId && (
          req.nextUrl.pathname.startsWith('/login') ||
          req.nextUrl.pathname.startsWith('/signup')
        )) {
          const dashboard = new URL('/dashboard', req.url);
          return NextResponse.redirect(dashboard);
        }
      }

      // Continue with auth object attached to request
      const response = NextResponse.next();

      // Attach auth information to response headers for server components
      if (auth?.userId) {
        response.headers.set('x-clerk-auth-user-id', auth.userId);
        response.headers.set('x-clerk-auth-session-id', auth.sessionId || '');
      }

      return response;
    } catch (error) {
      console.error('Clerk Express middleware error:', error);
      return NextResponse.next();
    }
  };
}

// Helper functions to adapt Next.js to Express
export function adaptNextRequestToExpress(req: NextRequest) {
  // Create a minimal Express-compatible request object
  const url = new URL(req.url);

  return {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
    cookies: Object.fromEntries(
      req.cookies.getAll().map(cookie => [cookie.name, cookie.value])
    ),
    query: Object.fromEntries(url.searchParams.entries()),
    body: null, // Not needed for auth middleware
    path: url.pathname,
    // Add other Express-specific properties needed by Clerk
  };
}

export function createMockExpressResponse() {
  // Create minimal Express-compatible response object
  return {
    setHeader: () => {},
    getHeader: () => null,
    status: (code) => ({ send: () => {}, json: () => {} }),
    // Add other necessary Express response methods
  };
}
```

#### Server Authentication Utilities
```typescript
// lib/auth/express/server-auth.ts
import { getAuth } from "@clerk/express";
import { headers } from "next/headers";

/**
 * Get auth state in server components and route handlers
 */
export function getServerAuth() {
  const headersList = headers();
  const userId = headersList.get('x-clerk-auth-user-id');
  const sessionId = headersList.get('x-clerk-auth-session-id');

  return {
    userId,
    sessionId,
    isAuthenticated: !!userId,
  };
}

/**
 * Create Express SDK-compatible request object from headers
 */
export function createAuthRequest() {
  const headersList = headers();
  const headersObj = {};

  // Convert headers to object for Clerk Express SDK
  headersList.forEach((value, key) => {
    headersObj[key] = value;
  });

  // Create minimal request object with necessary properties
  return {
    headers: headersObj,
    cookies: {},
  };
}

/**
 * Get full auth object from Express SDK in server context
 */
export function getFullServerAuth() {
  const req = createAuthRequest();
  return getAuth(req);
}

/**
 * Check if current user has role
 */
export function hasServerRole(role: string) {
  const auth = getFullServerAuth();
  if (!auth?.userId) return false;

  const userRoles = auth.sessionClaims?.roles || [];
  return Array.isArray(userRoles) && userRoles.includes(role);
}

/**
 * Check if current user has permission
 */
export function hasServerPermission(permission: string) {
  const auth = getFullServerAuth();
  return auth?.has({ permission }) || false;
}
```

#### API Route Protection
```typescript
// lib/auth/express/api-auth.ts
import { requireAuth, getAuth } from "@clerk/express";
import { NextRequest, NextResponse } from "next/server";
import { adaptNextRequestToExpress, createMockExpressResponse } from "./adapter";

/**
 * Protect a route handler with authentication requirement
 */
export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async function authProtectedHandler(req: NextRequest) {
    try {
      // Create Express-compatible request object
      const expressReq = adaptNextRequestToExpress(req);

      // Apply requireAuth middleware
      const authMiddleware = requireAuth({
        signInUrl: '/login',
      });

      // Mock Express response and next function
      const expressRes = createMockExpressResponse();
      let isAuthorized = false;
      const next = () => { isAuthorized = true; };

      // Run auth middleware
      await authMiddleware(expressReq, expressRes, next);

      // If authorized, proceed with handler
      if (isAuthorized) {
        // Attach auth to original request for convenience
        req.auth = getAuth(expressReq);
        return handler(req);
      }

      // If not authorized, return 401
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Protect a route handler with role requirement
 */
export function withRole(role: string, handler: (req: NextRequest) => Promise<NextResponse>) {
  return withAuth(async (req: NextRequest) => {
    // Check if user has required role
    const auth = req.auth;
    const userRoles = auth?.sessionClaims?.roles || [];

    if (!Array.isArray(userRoles) || !userRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req);
  });
}

/**
 * Protect a route handler with permission requirement
 */
export function withPermission(permission: string, handler: (req: NextRequest) => Promise<NextResponse>) {
  return withAuth(async (req: NextRequest) => {
    // Check if user has required permission
    const auth = req.auth;
    if (!auth?.has({ permission })) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req);
  });
}
```

#### Client-Side Auth Hooks
```typescript
// lib/auth/express/client-auth.ts
"use client";

import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";

/**
 * Enhanced auth hook compatible with Express SDK backend
 */
export function useAuth() {
  const clerkAuth = useClerkAuth();
  const [roles, setRoles] = useState<string[]>([]);

  // Sync roles from Clerk session claims
  useEffect(() => {
    async function syncRoles() {
      try {
        const session = await clerkAuth.getToken();
        // Parse JWT to get roles - in production would use a proper JWT decoder
        if (session) {
          const claims = JSON.parse(atob(session.split('.')[1]));
          setRoles(claims.roles || []);
        }
      } catch (error) {
        console.error('Error fetching auth roles:', error);
        setRoles([]);
      }
    }

    if (clerkAuth.isSignedIn) {
      syncRoles();
    } else {
      setRoles([]);
    }
  }, [clerkAuth.isSignedIn]);

  return {
    ...clerkAuth,
    roles,
    hasRole: (role: string) => roles.includes(role),
  };
}

/**
 * Check if user has specific permission (placeholder for Express SDK compatibility)
 */
export function usePermission(permission: string) {
  const { roles } = useAuth();

  // Map permissions to roles - this would be more sophisticated in production
  const permissionToRoleMap = {
    'org:admin': ['admin'],
    'profile:edit': ['admin', 'user'],
    // Add more mappings as needed
  };

  const requiredRoles = permissionToRoleMap[permission] || [];
  return roles.some(role => requiredRoles.includes(role));
}

/**
 * Check if user has specific role
 */
export function useRole(role: string) {
  const { roles } = useAuth();
  return roles.includes(role);
}
```

### Testing Strategy
1. **Unit Tests**:
   - Test adapter functions for Express compatibility
   - Test server authentication utilities
   - Test role and permission checks
   - Test error handling for authentication failures

2. **Integration Tests**:
   - Test middleware flow with protected/public routes
   - Test API protection with different roles
   - Test authentication state propagation
   - Test error responses for authentication failures

3. **End-to-End Tests**:
   - Test complete authentication flows
   - Test role-based access in application
   - Test session persistence across pages
   - Test error handling for edge cases

4. **Manual Tests**:
   - Test login/logout flows
   - Verify protected routes work as expected
   - Check role-based UI component visibility
   - Verify proper error messages for users

### Expected Outputs
1. **Express SDK Adapter**:
   - Successful integration with Next.js middleware
   - Proper handling of authentication state
   - Enhanced error handling

2. **Server Authentication**:
   - Reliable server-side authentication utilities
   - Role and permission-based access control
   - Improved performance compared to NextJS SDK

3. **API Protection**:
   - Secure route protection middleware
   - Fine-grained access control with roles
   - Consistent error responses

4. **Client Authentication**:
   - Enhanced authentication hooks with role support
   - Backward compatibility with existing components
   - Improved authentication state management

5. **Documentation**:
   - Updated authentication flow documentation
   - Migration guide for future reference
   - Updated API documentation

### Implementation Notes
- **Performance Considerations**: Monitor authentication performance before and after migration
- **Compatibility Concerns**: Maintain backward compatibility with existing components
- **Gradual Migration**: Implement changes incrementally to minimize disruption
- **Error Handling**: Enhance error handling throughout the authentication flow
- **Security Best Practices**: Follow security best practices for token handling