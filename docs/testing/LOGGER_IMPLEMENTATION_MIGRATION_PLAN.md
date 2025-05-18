⏺ Logger Implementation Migration Plan

  Current State Analysis

  I've analyzed the current logger implementation and found:

  1. Enhanced Logger Architecture:
    - The current enhanced-logger.ts acts as a cross-environment entry point
    - It dynamically imports either enhanced-logger.client.ts or enhanced-logger.server.ts based on environment
    - Contains fallback logic when environment-specific loggers fail to load
    - Re-exports error classification types from Sentry
  2. Simplified Logger Architecture:
    - logger.ts is a simplified version designed for production build compatibility
    - Has universal implementation for both client and server without dynamic imports
    - Integrates with Sentry for error tracking
    - Has basic child logger functionality but fewer advanced features
  3. Key Differences:
    - Enhanced logger uses environment-specific implementations
    - Simplified logger uses runtime detection (isBrowser check)
    - Enhanced logger has more sophisticated error handling capabilities
    - Simplified logger has better build compatibility
    - Enhanced logger has explicit domain-specific logger creation
  4. File References:
    - Found ~38 files referencing enhanced-logger through grep search
    - Main import patterns include:
        - import { enhancedLogger } from '@/lib/enhanced-logger'
      - import { createDomainLogger } from '@/lib/enhanced-logger'
      - import { ErrorSeverity, ErrorCategory } from '@/lib/enhanced-logger'
  5. Current Issues:
    - Enhanced logger relies on dynamic imports that cause build errors
    - The implementation split across multiple files increases complexity
    - No explicit EU region compliance handling for data protection
    - Some type inconsistencies between the two implementations

  Migration Strategy

  1. Enhance the Simplified Logger

  First, we need to enhance logger.ts to provide all necessary functionality from enhanced-logger:

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

  2. Create Migration Script

  Next, we'll create a script to automate the migration of references:

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
    }

    // Record files that still need manual review
    if (updated && (
      content.includes('EnhancedLogger') ||
      content.includes('enhancedLogger.') ||
      content.includes('ErrorSeverity') ||
      content.includes('ErrorCategory')
    )) {
      console.log(`  ⚠️ File may need additional review: ${file}`);
    }
  });

  console.log(`\nUpdated imports in ${updatedFiles} files.`);
  console.log('Please manually review files with usage patterns that may need adjustment.');

  3. Manual Update Strategy for Complex Cases

  For files with more complex usage patterns:

  1. DB Integration Files:
    - Files in lib/db.ts, lib/db-utils.ts, and lib/db-monitoring.ts need special attention
    - These likely use domain loggers with DB-specific context
    - Update while maintaining transaction context
  2. State Machine Logic:
    - Files in lib/scheduling/state-machine/ use the logger for state transition logging
    - Ensure error classification and error codes are preserved
  3. Webhook Handlers:
    - API route handlers in /app/api/webhooks/ use logger for sensitive operations
    - Verify EU compliance filtering works correctly here
  4. Test Files:
    - Update test files that mock or test the logger functionality
    - Particularly __tests__/unit/lib/enhanced-logger.test.ts

  4. Testing Strategy

  After performing the migration:

  1. Functional Testing:
    - Test all log levels in both client and server environments
    - Verify error reporting to Sentry works correctly
    - Check that domain loggers maintain their context
    - Test EU compliance filtering with PII data
  2. Build Testing:
    - Verify the application builds without errors
    - Check bundle size to confirm improved build efficiency
    - Test in production mode to ensure logs are properly controlled
  3. Integration Testing:
    - Test integration with Sentry error reporting
    - Test transaction logging for critical operations
    - Verify error context maintains consistency
  4. Regression Testing:
    - Ensure no functionality is lost from enhanced-logger
    - Check that error classifications are maintained
    - Verify all log levels continue to work

  5. Implementation Steps

  1. Preparation:
    - Create a feature branch for the migration
    - Update the logger.ts file with enhanced implementation
    - Create temporary re-export file for transition period
  2. Migration Execution:
    - Run the migration script to update import paths
    - Manually review and update complex usage patterns
    - Update test files to use the new logger
  3. Testing:
    - Execute all tests to verify functionality
    - Test in development and production modes
    - Verify Sentry integration works correctly
  4. Cleanup:
    - Remove enhanced-logger.ts, enhanced-logger.client.ts, and enhanced-logger.server.ts
    - Update documentation to reflect the new logger usage
    - Perform final review of the codebase

  6. Rollback Strategy

  If issues arise during migration:

  1. Keep a backup of all original files
  2. Create a script to revert import paths if needed
  3. Maintain the old enhanced-logger files until full verification is complete

  Implementation Timeline

  1. Day 1: Enhance logger.ts implementation and test in isolation
  2. Day 2: Run migration script and update most common usage patterns
  3. Day 3: Manual review and update of complex cases
  4. Day 4: Comprehensive testing and verification
  5. Day 5: Cleanup and documentation

  Summary of Changes

  This migration will:
  1. Consolidate logging into a single implementation
  2. Add explicit EU region compliance
  3. Maintain backward compatibility with enhanced-logger API
  4. Improve build efficiency and reduce bundle size
  5. Preserve all existing functionality while reducing complexity