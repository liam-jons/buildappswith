#Sentry

Session Context

  - Session Type: Implementation
  - Component Focus: Sentr  
  - Current Branch: feature/infrastructure-modernization
  - Related Documentation: docs/engineering/SENTRY_IMPLEMENTATION_INDEX.md,
  docs/engineering/DATADOG_IMPLEMENTATION_GUIDE.md, docs/engineering/CLERK_AUTHENTICATION_FLOW.mermaid
  - Project root directory: /Users/liamj/Documents/development/buildappswith

  Implementation Objectives

  1. Modernize Sentry Configuration
    - Migrate from deprecated sentry.client/server.config.ts to the Next.js instrumentation pattern
    - Implement EU region data residency for all Sentry data
    - Ensure compatibility with Turbopack
    - Maintain Datadog RUM integration with Sentry

  Implementation Plan

  1. Sentry Configuration Modernization

  Current State Analysis

  - Review current configuration in sentry.client.config.ts and sentry.server.config.ts
  - Analyze existing instrumentation.ts setup
  - Identify Datadog RUM integration points
  - Review EU region settings in Sentry DSN and configuration

  Implementation Steps

  - Create new instrumentation-client.ts for client-side Sentry initialization
  - Update instrumentation.ts for server-side initialization
  - Enhance EU region support in lib/sentry/config.ts
  - Remove deprecated configuration files after testing
  - Verify Datadog RUM integration remains functional

  Technical Specifications

  instrumentation-client.ts:
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

  Updated instrumentation.ts:
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

  Updated lib/sentry/config.ts:
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
  



Sentry Implementation Testing

  1. Verify error capture in development environment:
    - Trigger client-side errors and confirm they appear in Sentry dashboard
    - Trigger server-side errors and verify capture
    - Check transaction tracking for key user flows
  2. Validate EU region configuration:
    - Confirm all data is stored in EU region
    - Verify DSN is properly configured
    - Ensure no data residency violations
  3. Test Datadog integration:
    - Verify correlation between Sentry errors and Datadog RUM
    - Ensure trace context is properly propagated
    - Confirm consistent transaction naming

  
  Expected Outputs

  1. Sentry Configuration
    - New instrumentation-client.ts with EU region support
    - Updated instrumentation.ts for server-side initialization
    - Enhanced error capturing with proper context
    - Datadog RUM integration maintained
  2. Documentation Updates
    - Updated Sentry implementation documentation
    - Testing strategy documentation

  Implementation Notes

  - Performance Considerations: Monitor performance before and after changes to ensure no degradation
  - Rollback Plan: Maintain copies of original files for quick rollback if needed
  - Staged Deployment: Consider implementing changes in phases starting with non-production environments
  - Monitoring: Set up additional monitoring during the transition period to catch any issues
  - User Impact: These changes should be transparent to end users with no UI/UX changes

  There MUST BE NO WORKAROUNDS at this critical stage - if implementation gets stuck at any point, stop and request
   guidance before proceeding.
   
   # Logger
   
   Session Context

  - Session Type: Implementation
  - Component Focus: Logger Migration - Consolidating enhanced-logger and simplified logger
  - Current Branch: feature/logger-consolidation
  - Related Documentation: docs/engineering/ERROR_HANDLING_SYSTEM.md,
  docs/engineering/DATADOG_IMPLEMENTATION_GUIDE.md
  - Project root directory: /Users/liamj/Documents/development/buildappswith

  Implementation Objectives

  - Consolidate logger implementation to resolve build errors across ~38 files
  - Implement EU region compliance for data protection
  - Maintain backward compatibility with existing logger API
  - Enhance error reporting capabilities with Sentry integration
  - Improve build efficiency and reduce bundle size
  - Ensure consistent logging patterns across the application

  Implementation Plan

  1. Enhanced Logger Analysis

  - Review current enhanced-logger.ts implementation and its environment-specific imports
  - Analyze usage patterns across the codebase
  - Identify critical functionality that must be preserved
  - Document error classification and domain logger usage

  2. Unified Logger Implementation

  - Enhance the simplified logger.ts to include all necessary functionality
  - Implement EU region compliance for data protection
  - Add backward compatibility exports for seamless migration
  - Ensure proper Sentry integration for error reporting
  - Maintain domain-specific logger creation capability

  3. Automated Migration

  - Create and run migration script to update import paths
  - Identify and document complex usage patterns requiring manual intervention
  - Update test files and mocks to use the new implementation
  - Verify all critical functionality is maintained

  4. Manual Updates

  - Address complex usage patterns in database integration files
  - Update state machine logging implementations
  - Ensure webhook handlers maintain proper logging
  - Fix any remaining references to the enhanced logger

  5. Testing and Verification

  - Test all logging levels in both client and server environments
  - Verify Sentry error reporting integration
  - Test EU compliance filtering with sensitive data
  - Ensure build process completes without errors
  - Performance test to confirm improved build efficiency

  Technical Specifications

  Enhanced Logger Implementation

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

  Migration Script

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

  Manual Update Cases

  Database Integration (lib/db.ts)

  // Before
  import { enhancedLogger, createDomainLogger } from '@/lib/enhanced-logger';
  const dbLogger = createDomainLogger('database');

  // After
  import { logger, createDomainLogger } from '@/lib/logger';
  const dbLogger = createDomainLogger('database');

  State Machine (lib/scheduling/state-machine/service.ts)

  // Before
  import { enhancedLogger, ErrorSeverity } from '@/lib/enhanced-logger';

  // After
  import { logger, ErrorSeverity } from '@/lib/logger';

  Webhook Handler (app/api/webhooks/stripe/route.ts)

  // Before
  import { createDomainLogger, ErrorCategory } from '@/lib/enhanced-logger';
  const webhookLogger = createDomainLogger('webhook', { service: 'stripe' });

  // After
  import { createDomainLogger, ErrorCategory } from '@/lib/logger';
  const webhookLogger = createDomainLogger('webhook', { service: 'stripe' });

  Test Updates

  Logger Test (tests/unit/lib/enhanced-logger.test.ts)

  Rename to __tests__/unit/lib/logger.test.ts and update imports:

  // Before
  import { enhancedLogger, createDomainLogger, ErrorSeverity } from '@/lib/enhanced-logger';

  // After
  import { logger, createDomainLogger, ErrorSeverity } from '@/lib/logger';

  // Replace test references
  test('enhancedLogger exposes debug, info, warn, and error methods', () => {
    expect(enhancedLogger.debug).toBeDefined();
    // ...
  });

  // With
  test('logger exposes debug, info, warn, and error methods', () => {
    expect(logger.debug).toBeDefined();
    // ...
  });

  Implementation Sequence

  Phase 1: Preparation

  1. Create feature branch for the migration
  git checkout -b feature/logger-consolidation
  2. Create the enhanced version of logger.ts
  # Backup existing logger.ts
  cp lib/logger.ts lib/logger.ts.backup
  # Create new implementation
  vi lib/logger.ts # Edit with new implementation
  3. Create temporary compatibility file
  # Create a temporary file for transition period
  cat > lib/enhanced-logger-compat.ts << EOL
  // Temporary compatibility file for migration
  // This file will be removed after migration is complete
  export * from './logger';
  EOL

  Phase 2: Automated Migration

  1. Create and run the migration script
  mkdir -p scripts/logger-migration
  vi scripts/logger-migration/migrate-logger.js # Create migration script
  node scripts/logger-migration/migrate-logger.js
  2. Review the generated report
  cat logger-migration-report.md
  3. Run tests to check for immediate issues
  pnpm test

  Phase 3: Manual Updates

  1. Update complex cases identified in the report
  # Example: Database files
  vi lib/db.ts
  vi lib/db-utils.ts
  vi lib/db-monitoring.ts

  # Example: State machine files
  vi lib/scheduling/state-machine/service.ts
  vi lib/scheduling/state-machine/error-handling.ts

  # Example: Webhook handlers
  vi app/api/webhooks/stripe/route.ts
  vi app/api/webhooks/calendly/route.ts
  2. Update tests
  mv __tests__/unit/lib/enhanced-logger.test.ts __tests__/unit/lib/logger.test.ts
  vi __tests__/unit/lib/logger.test.ts # Update test references

  Phase 4: Testing and Verification

  1. Run linting to check for issues
  pnpm lint
  2. Run type checking
  pnpm type-check
  3. Run tests
  pnpm test
  4. Build the application
  pnpm build
  5. Manual test in development
  pnpm dev
  # Test logging in browser and server

  Phase 5: Cleanup

  1. Remove old files once migration is verified
  rm lib/enhanced-logger.ts
  rm lib/enhanced-logger.client.ts
  rm lib/enhanced-logger.server.ts
  rm lib/enhanced-logger-compat.ts # If created
  2. Document changes
  vi docs/engineering/ERROR_HANDLING_SYSTEM.md # Update documentation
  3. Create migration summary
  vi docs/engineering/LOGGER_MIGRATION_SUMMARY.md # Create summary

  Testing Strategy

  Unit Tests

  - Test all logger methods (debug, info, warn, error)
  - Test child logger creation and context passing
  - Test EU compliance data filtering
  - Test error reporting with Sentry
  - Test environment detection (client vs server)

  Integration Tests

  - Test logger in API route handlers
  - Test logger in server components
  - Test logger in client components
  - Test error boundary integration with logger

  Build Tests

  - Verify build completes without errors
  - Check bundle size for improvements
  - Test in production mode

  Manual Tests

  - Test EU compliance by logging PII data
  - Test Sentry integration by triggering errors
  - Test domain logger functionality across components

  Expected Outputs

  1. Enhanced logger.ts
    - Unified implementation with EU compliance
    - Backward compatibility with enhanced-logger API
    - Proper Sentry integration for error reporting
  2. Updated References
    - All ~38 files with enhanced-logger references updated
    - Complex cases manually migrated
    - Tests updated to use new implementation
  3. Documentation
    - Updated ERROR_HANDLING_SYSTEM.md with new logger information
    - LOGGER_MIGRATION_SUMMARY.md with migration details
    - Updated code comments in logger.ts
  4. Cleanup
    - Removed legacy enhanced-logger files
    - Removed temporary compatibility layers
    - Consolidated implementation

  Implementation Notes

  - Backward Compatibility: The implementation maintains exports from enhanced-logger for seamless migration
  - EU Compliance: EU region detection and PII filtering are implemented
  - Error Handling: Sentry integration is maintained and enhanced
  - Performance: The unified implementation improves build efficiency and reduces bundle size
  - Migration Approach: Combination of automated script and manual intervention for complex cases

  There MUST BE NO WORKAROUNDS at this critical stage - if implementation gets stuck at any point, stop and request
   guidance before proceeding.


# Clerk Express

Session Context

  - Session Type: Implementation
  - Component Focus: Clerk Authentication - Migration to Express SDK
  - Current Branch: feature/clerk-express-migration
  - Related Documentation: docs/engineering/CLERK_AUTHENTICATION_FLOW.mermaid,
  docs/engineering/CLERK_AUTHENTICATION_STATUS.md
  - Project root directory: /Users/liamj/Documents/development/buildappswith

  Implementation Objectives

  - Migrate from Clerk NextJS SDK to Clerk Express SDK for improved performance and security
  - Create adapter layer to ensure compatibility with Next.js middleware
  - Enhance server-side authentication capabilities
  - Improve error handling for authentication flows
  - Maintain backward compatibility with existing components
  - Ensure EU data residency compliance

  Implementation Plan

  1. Environment Setup and Analysis

  - Install Clerk Express SDK alongside existing NextJS SDK
  - Analyze current authentication flow and middleware implementation
  - Identify key components that require migration
  - Document dependencies between authentication components

  2. Express SDK Adapter Implementation

  - Create adapter layer between Express SDK and Next.js middleware
  - Implement compatibility functions for request/response objects
  - Ensure authentication state is properly propagated
  - Add enhanced error handling capabilities

  3. Server-Side Authentication

  - Create server-side authentication utilities
  - Implement role-based access control with Express SDK
  - Enhance error handling for authentication failures
  - Ensure proper handling of authentication tokens

  4. API Route Protection

  - Implement route protection utilities with Express SDK
  - Create role-based middleware for API routes
  - Add permission-based access control
  - Ensure proper error responses for authentication failures

  5. Client-Side Compatibility

  - Create compatibility layer for client-side components
  - Implement enhanced useAuth hook with role support
  - Add permission-based hooks for UI components
  - Ensure backward compatibility with existing components

  6. Testing and Verification

  - Create test pages to verify authentication state
  - Test authentication flows across the application
  - Verify role-based access control functions correctly
  - Test error handling and edge cases

  Technical Specifications

  Express SDK Adapter Implementation

  // lib/auth/clerk-express-adapter.ts
  import { clerkMiddleware as clerkExpressMiddleware, getAuth } from "@clerk/express";
  import { NextRequest, NextResponse } from "next/server";

  /**
   * Creates an adapter for Clerk Express SDK to work with Next.js middleware
   */
  export function createClerkExpressMiddleware() {
    return async function clerkExpressAdapter(req: NextRequest) {
      // Implement adapter logic here
    };
  }

  /**
   * Adapts Next.js request to Express-compatible format
   */
  function adaptNextRequestToExpress(req: NextRequest) {
    // Implementation details
  }

  /**
   * Creates a mock Express response object
   */
  function createMockExpressResponse() {
    // Implementation details
  }

  Updated Middleware Implementation

  // lib/auth/clerk-middleware.ts
  import { createClerkExpressMiddleware } from "./clerk-express-adapter";

  // Public routes that don't require authentication
  export const publicRoutes = [
    // List of public routes
  ];

  // Routes that should be ignored by the middleware
  export const ignoredRoutes = [
    // List of ignored routes
  ];

  // Create middleware using Express SDK adapter
  const clerkExpressMiddleware = createClerkExpressMiddleware();

  /**
   * Clerk auth middleware with Express SDK integration
   */
  export async function clerkMiddleware(req) {
    return clerkExpressMiddleware(req);
  }

  /**
   * Export the middleware config
   */
  export const config = {
    matcher: [
      // Apply to all non-api paths
      "/((?!api/|_next/|.*\\..*$).*)",
    ],
  };

  Server Authentication Utilities

  // lib/auth/server-auth.ts
  import { getAuth } from "@clerk/express";
  import { headers } from "next/headers";

  /**
   * Get authentication state in server components
   */
  export function getServerAuth() {
    // Implementation details
  }

  /**
   * Create Express SDK-compatible request object
   */
  export function createAuthRequest() {
    // Implementation details
  }

  /**
   * Get full auth object with Express SDK
   */
  export function getFullServerAuth() {
    // Implementation details
  }

  /**
   * Check if user has specific role
   */
  export function hasServerRole(role: string) {
    // Implementation details
  }

  /**
   * Check if user has specific permission
   */
  export function hasServerPermission(permission: string) {
    // Implementation details
  }

  API Route Protection

  // lib/auth/api-auth.ts
  import { requireAuth, getAuth } from "@clerk/express";
  import { NextRequest, NextResponse } from "next/server";

  /**
   * Protect route handler with authentication
   */
  export function withAuth(handler) {
    // Implementation details
  }

  /**
   * Protect route handler with role requirement
   */
  export function withRole(role: string, handler) {
    // Implementation details
  }

  /**
   * Protect route handler with permission requirement
   */
  export function withPermission(permission: string, handler) {
    // Implementation details
  }

  Client-Side Authentication Hooks

  // lib/auth/client-auth.ts
  "use client";

  import { useAuth as useClerkAuth } from "@clerk/nextjs";

  /**
   * Enhanced authentication hook with role support
   */
  export function useAuth() {
    // Implementation details
  }

  /**
   * Check if user has specific permission
   */
  export function usePermission(permission: string) {
    // Implementation details
  }

  /**
   * Check if user has specific role
   */
  export function useRole(role: string) {
    // Implementation details
  }

  Authentication Error Types

  // lib/auth/errors.ts
  /**
   * Authentication error for unauthorized access
   */
  export class AuthenticationError extends Error {
    // Implementation details
  }

  /**
   * Authorization error for insufficient permissions
   */
  export class AuthorizationError extends Error {
    // Implementation details
  }

  /**
   * Configuration error for auth setup issues
   */
  export class AuthConfigurationError extends Error {
    // Implementation details
  }

  Test Components

  // app/auth-test/page.tsx
  import { getServerAuth, hasServerRole } from "@/lib/auth/server-auth";

  /**
   * Test page for authentication verification
   */
  export default function AuthTestPage() {
    // Implementation details
  }

  /**
   * Client component to test client-side auth
   */
  function ClientAuthTest() {
    // Implementation details
  }

  Implementation Sequence

  Phase 1: Express SDK Setup (Day 1)

  1. Install Clerk Express SDK:
  cd /Users/liamj/Documents/development/buildappswith
  git checkout -b feature/clerk-express-migration
  pnpm add @clerk/express

  2. Create adapter implementation files:
  mkdir -p lib/auth/express
  touch lib/auth/express/adapter.ts
  touch lib/auth/express/server-auth.ts
  touch lib/auth/express/api-auth.ts
  touch lib/auth/express/client-auth.ts
  touch lib/auth/express/errors.ts

  3. Implement the adapter layer:
  vi lib/auth/express/adapter.ts  # Implement Express SDK adapter
  vi lib/auth/express/errors.ts   # Implement authentication error types

  Phase 2: Server Authentication (Day 2)

  1. Implement server-side authentication utilities:
  vi lib/auth/express/server-auth.ts  # Implement server auth utilities

  2. Create test middleware implementation (alongside existing):
  vi lib/auth/express/middleware.ts  # Create test middleware implementation

  3. Test middleware with existing routes:
  mkdir -p app/auth-test
  vi app/auth-test/page.tsx  # Create test page

  Phase 3: API Route Protection (Day 3)

  1. Implement API route protection utilities:
  vi lib/auth/express/api-auth.ts  # Implement API route protection

  2. Create test API routes:
  mkdir -p app/api/auth-test
  vi app/api/auth-test/route.ts  # Create test API route with protection

  3. Test API routes with authentication:
  curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth-test

  Phase 4: Client Authentication (Day 4)

  1. Implement client-side authentication hooks:
  vi lib/auth/express/client-auth.ts  # Implement client auth hooks

  2. Create client components for testing:
  vi app/auth-test/client.tsx  # Create client test components

  3. Test client authentication in browser:
  pnpm dev  # Start development server
  # Visit http://localhost:3000/auth-test in browser

  Phase 5: Full Migration and Testing (Day 5-7)

  1. Implement the main middleware:
  vi middleware.ts  # Update with Express SDK adapter

  2. Update existing components:
  vi components/auth/auth-status.tsx  # Update auth components
  vi components/auth/protected-route.tsx  # Update protection wrapper

  3. Comprehensive testing:
  pnpm test  # Run test suite
  pnpm build  # Verify build completes successfully

  4. Documentation and cleanup:
  vi docs/engineering/CLERK_EXPRESS_MIGRATION.md  # Create migration documentation

  Testing Strategy

  Unit Tests

  1. Test adapter functions:
  // __tests__/unit/auth/express-adapter.test.ts
  import { adaptNextRequestToExpress } from "@/lib/auth/express/adapter";

  describe("Express Adapter", () => {
    test("should convert Next.js request to Express-compatible format", () => {
      // Test implementation
    });
  });

  2. Test server authentication utilities:
  // __tests__/unit/auth/server-auth.test.ts
  import { getServerAuth, hasServerRole } from "@/lib/auth/express/server-auth";

  describe("Server Authentication", () => {
    test("should get authentication state from headers", () => {
      // Test implementation
    });

    test("should check roles correctly", () => {
      // Test implementation
    });
  });

  Integration Tests

  1. Test middleware flow:
  // __tests__/integration/auth/middleware-flow.test.ts
  import { createClerkExpressMiddleware } from "@/lib/auth/express/adapter";

  describe("Authentication Middleware", () => {
    test("should allow access to public routes", async () => {
      // Test implementation
    });

    test("should redirect unauthenticated users from protected routes", async () => {
      // Test implementation
    });
  });

  2. Test API protection:
  // __tests__/integration/auth/api-protection.test.ts
  import { withAuth, withRole } from "@/lib/auth/express/api-auth";

  describe("API Authentication", () => {
    test("should protect routes with authentication", async () => {
      // Test implementation
    });

    test("should enforce role requirements", async () => {
      // Test implementation
    });
  });

  End-to-End Tests

  1. Test authentication flows:
  // __tests__/e2e/auth/auth-flow.test.ts
  describe("Authentication Flow", () => {
    test("should sign in user and maintain session", async () => {
      // Test implementation
    });

    test("should protect routes based on roles", async () => {
      // Test implementation
    });
  });

  Expected Outputs

  1. Express SDK Adapter:
    - Successful integration with Next.js middleware
    - Proper handling of authentication state
    - Enhanced error handling
  2. Server Authentication:
    - Reliable server-side authentication utilities
    - Role and permission-based access control
    - Improved performance compared to NextJS SDK
  3. API Protection:
    - Secure route protection middleware
    - Fine-grained access control with roles
    - Consistent error responses
  4. Client Authentication:
    - Enhanced authentication hooks with role support
    - Backward compatibility with existing components
    - Improved authentication state management
  5. Documentation:
    - Updated authentication flow documentation
    - Migration guide for future reference
    - Updated API documentation

  Implementation Notes

  - Performance Considerations: Monitor authentication performance before and after migration
  - Compatibility Concerns: Maintain backward compatibility with existing components
  - Gradual Migration: Implement changes incrementally to minimize disruption
  - Error Handling: Enhance error handling throughout the authentication flow
  - Security Best Practices: Follow security best practices for token handling

  There MUST BE NO WORKAROUNDS at this critical stage - if implementation gets stuck at any point, stop and request
   guidance before proceeding.
