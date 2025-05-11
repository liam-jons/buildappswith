# Logger Implementation Migration Plan

*Version: 1.0.0*
*Date: 2025-05-11*
*Status: Draft*

## Overview

This document outlines the implementation plan for consolidating the logger implementation, resolving build issues across the codebase, and improving EU data compliance.

## Current State Analysis

1. **Enhanced Logger Architecture**:
   - The current `enhanced-logger.ts` acts as a cross-environment entry point
   - Dynamically imports either `enhanced-logger.client.ts` or `enhanced-logger.server.ts` based on environment
   - Contains fallback logic when environment-specific loggers fail to load
   - Re-exports error classification types from Sentry

2. **Simplified Logger Architecture**:
   - `logger.ts` is a simplified version designed for production build compatibility
   - Has universal implementation for both client and server without dynamic imports
   - Integrates with Sentry for error tracking
   - Has basic child logger functionality but fewer advanced features

3. **Key Differences**:
   - Enhanced logger uses environment-specific implementations
   - Simplified logger uses runtime detection (isBrowser check)
   - Enhanced logger has more sophisticated error handling capabilities
   - Simplified logger has better build compatibility
   - Enhanced logger has explicit domain-specific logger creation

4. **File References**:
   - Found ~38 files referencing enhanced-logger through grep search
   - Main import patterns include:
     - `import { enhancedLogger } from '@/lib/enhanced-logger'`
     - `import { createDomainLogger } from '@/lib/enhanced-logger'`
     - `import { ErrorSeverity, ErrorCategory } from '@/lib/enhanced-logger'`

5. **Current Issues**:
   - Enhanced logger relies on dynamic imports that cause build errors
   - The implementation split across multiple files increases complexity
   - No explicit EU region compliance handling for data protection
   - Some type inconsistencies between the two implementations

## Implementation Plan

### 1. Enhance the Simplified Logger

First, enhance `logger.ts` to provide all necessary functionality from enhanced-logger:

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

### 2. Create Migration Script

Create a script to automate the migration of references:

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

### 3. Manual Update Strategy for Complex Cases

For files with more complex usage patterns:

1. **DB Integration Files**:
   - Files in `lib/db.ts`, `lib/db-utils.ts`, and `lib/db-monitoring.ts` need special attention
   - These likely use domain loggers with DB-specific context
   - Update while maintaining transaction context

2. **State Machine Logic**:
   - Files in `lib/scheduling/state-machine/` use the logger for state transition logging
   - Ensure error classification and error codes are preserved

3. **Webhook Handlers**:
   - API route handlers in `/app/api/webhooks/` use logger for sensitive operations
   - Verify EU compliance filtering works correctly here

4. **Test Files**:
   - Update test files that mock or test the logger functionality
   - Particularly `__tests__/unit/lib/enhanced-logger.test.ts`

## Implementation Sequence

### Phase 1: Preparation (Day 1)

1. Create a feature branch for the migration
   ```bash
   git checkout -b feature/logger-consolidation
   ```

2. Create the enhanced version of logger.ts
   ```bash
   # Backup existing logger.ts
   cp lib/logger.ts lib/logger.ts.backup
   # Create new implementation
   vi lib/logger.ts # Edit with new implementation
   ```

3. Create temporary compatibility file
   ```bash
   # Create a temporary file for transition period
   cat > lib/enhanced-logger-compat.ts << EOL
   // Temporary compatibility file for migration
   // This file will be removed after migration is complete
   export * from './logger';
   EOL
   ```

### Phase 2: Automated Migration (Day 2)

1. Create and run the migration script
   ```bash
   mkdir -p scripts/logger-migration
   vi scripts/logger-migration/migrate-logger.js # Create migration script
   node scripts/logger-migration/migrate-logger.js
   ```

2. Review the generated report
   ```bash
   cat logger-migration-report.md
   ```

3. Run tests to check for immediate issues
   ```bash
   pnpm test
   ```

### Phase 3: Manual Updates (Day 3)

1. Update complex cases identified in the report
   ```bash
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
   ```

2. Update tests
   ```bash
   mv __tests__/unit/lib/enhanced-logger.test.ts __tests__/unit/lib/logger.test.ts
   vi __tests__/unit/lib/logger.test.ts # Update test references
   ```

### Phase 4: Testing and Verification (Day 4)

1. Run linting to check for issues
   ```bash
   pnpm lint
   ```

2. Run type checking
   ```bash
   pnpm type-check
   ```

3. Run tests
   ```bash
   pnpm test
   ```

4. Build the application
   ```bash
   pnpm build
   ```

5. Manual test in development
   ```bash
   pnpm dev
   # Test logging in browser and server
   ```

### Phase 5: Cleanup (Day 5)

1. Remove old files once migration is verified
   ```bash
   rm lib/enhanced-logger.ts
   rm lib/enhanced-logger.client.ts
   rm lib/enhanced-logger.server.ts
   rm lib/enhanced-logger-compat.ts # If created
   ```

2. Document changes
   ```bash
   vi docs/engineering/ERROR_HANDLING_SYSTEM.md # Update documentation
   vi docs/engineering/LOGGER_MIGRATION_SUMMARY.md # Create summary
   ```

## Testing Strategy

### Unit Tests

- Test all logger methods (debug, info, warn, error)
- Test child logger creation and context passing
- Test EU compliance data filtering
- Test error reporting with Sentry
- Test environment detection (client vs server)

### Integration Tests

- Test logger in API route handlers
- Test logger in server components
- Test logger in client components
- Test error boundary integration with logger

### Build Tests

- Verify build completes without errors
- Check bundle size for improvements
- Test in production mode

### Manual Tests

- Test EU compliance by logging PII data
- Test Sentry integration by triggering errors
- Test domain logger functionality across components

## Expected Outcomes

1. **Enhanced logger.ts**
   - Unified implementation with EU compliance
   - Backward compatibility with enhanced-logger API
   - Proper Sentry integration for error reporting

2. **Updated References**
   - All ~38 files with enhanced-logger references updated
   - Complex cases manually migrated
   - Tests updated to use new implementation

3. **Documentation**
   - Updated ERROR_HANDLING_SYSTEM.md with new logger information
   - LOGGER_MIGRATION_SUMMARY.md with migration details
   - Updated code comments in logger.ts

4. **Cleanup**
   - Removed legacy enhanced-logger files
   - Removed temporary compatibility layers
   - Consolidated implementation

## Migration Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing logging code | High | Maintain backward compatibility with all exports |
| Performance regression | Medium | Performance test before/after implementation |
| Data leakage | High | Test EU compliance functionality with various data types |
| Build errors | High | Verify build in CI before merging |
| Missing imports | Medium | Automated migration script with report |