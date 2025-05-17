# Logger Migration Guide

*Version: 1.1.0*
*Date: 2025-05-11*
*Status: Implementation*

## Overview
This document outlines the migration from the `enhanced-logger` to the consolidated `logger` implementation. The migration improves build compatibility, adds EU compliance features, and resolves multiple build errors related to client-side Datadog integration.

## Migration Benefits
- Improved build performance and compatibility
- Enhanced EU region data compliance
- Unified implementation for client and server
- Better error reporting and Sentry integration
- Properly isolated server-side dependencies (Datadog)
- Reduced bundle size through optimized imports

## Migration Steps
1. Update import paths:
   ```typescript
   // Before
   import { enhancedLogger, createDomainLogger } from '@/lib/enhanced-logger';

   // After
   import { logger, createDomainLogger } from '@/lib/logger';
   ```

2. Update any error severity references:
   ```typescript
   // Before
   import { ErrorSeverity } from '@/lib/enhanced-logger';

   // After
   import { ErrorSeverity } from '@/lib/logger';
   ```

## Compatibility APIs
The new logger maintains backward compatibility with the enhanced-logger API:

```typescript
// These are all exported from the new logger
import { 
  logger,               // Main logger instance
  enhancedLogger,       // Alias for the main logger (backward compatibility)
  createDomainLogger,   // Create domain-specific loggers
  ErrorSeverity,        // Error severity constants
  ErrorCategory         // Error category constants
} from '@/lib/logger';
```

## Manual Migration Cases

Some cases require special attention during migration:

### 1. State Machine Logging
Update state machine files to use the new logger:

```typescript
// Before
import { enhancedLogger, ErrorSeverity } from '@/lib/enhanced-logger';
const stateLogger = createDomainLogger('state-machine', { component: 'booking' });

// After
import { logger, ErrorSeverity } from '@/lib/logger';
const stateLogger = createDomainLogger('state-machine', { component: 'booking' });
```

### 2. Database Integration
Update database logging with the unified logger:

```typescript
// Before
import { createDomainLogger } from '@/lib/enhanced-logger';
const dbLogger = createDomainLogger('database', { service: 'postgres' });

// After
import { createDomainLogger } from '@/lib/logger';
const dbLogger = createDomainLogger('database', { service: 'postgres' });
```

### 3. Webhook Handlers
Ensure proper context is maintained in webhook handlers:

```typescript
// Before
import { createDomainLogger } from '@/lib/enhanced-logger';
const webhookLogger = createDomainLogger('webhook', { service: 'stripe' });

// After
import { createDomainLogger } from '@/lib/logger';
const webhookLogger = createDomainLogger('webhook', { service: 'stripe' });
```

## Automated Migration

The migration script at `scripts/migrate-logger.js` can automatically update import paths:

```bash
node scripts/migrate-logger.js
```

This script will:
1. Find all files with enhanced-logger imports
2. Update the import paths to use the new logger
3. Generate a report of files that may need additional review

## Potential Issues and Solutions

### Build Errors with Datadog
If you encounter build errors related to Datadog dependencies:

**Problem**: Client-side bundling of server-only dependencies
**Solution**: Ensure Datadog imports are properly isolated in server-only code

```typescript
// Bad practice - will cause build errors
import * as ddTrace from 'dd-trace';

// Good practice - server-side only imports
const isServer = typeof window === 'undefined';
let tracer = null;
if (isServer) {
  try {
    const ddTrace = require('dd-trace');
    tracer = ddTrace.tracer;
  } catch (error) {
    console.warn('dd-trace only available on server side');
  }
}
```

### TypeScript Errors
If you encounter TypeScript errors after migration:

**Problem**: TypeScript errors with logger methods
**Solution**: Check that you're using the correct method signatures

```typescript
// Correct usage
logger.error('Error message', { context: 'data' }, error);
```

### Missing Context
If you notice missing context in logs:

**Problem**: Domain logger not preserving context
**Solution**: Ensure domain loggers are created with proper context

```typescript
// Create with full context
const domainLogger = createDomainLogger('domain', {
  component: 'component-name',
  service: 'service-name'
});
```

### PII Filtering Issues
If PII data is not being properly filtered:

**Problem**: EU compliance filtering not working
**Solution**: Verify environment variables are set correctly

```bash
NEXT_PUBLIC_ENABLE_EU_COMPLIANCE=true
NEXT_PUBLIC_DATA_REGION=eu
```

## Verification Steps

After migration, verify:

1. All log levels function correctly:
   ```typescript
   logger.debug('Debug message');
   logger.info('Info message');
   logger.warn('Warning message');
   logger.error('Error message', {}, new Error('Test error'));
   ```

2. EU compliance filtering works:
   ```typescript
   logger.info('User profile', {
     userId: '123',
     email: 'test@example.com', // Should be redacted
     preferences: { theme: 'dark' } // Should not be redacted
   });
   ```

3. Sentry integration functions:
   ```typescript
   try {
     throw new Error('Test error');
   } catch (error) {
     logger.error('Operation failed', { context: 'test' }, error);
     // Check Sentry dashboard for the error
   }
   ```

4. Run the provided unit tests:
   ```bash
   pnpm test __tests__/unit/lib/logger.test.ts
   ```

## Implementation Details

### EU Data Compliance

The unified logger automatically sanitizes PII data in EU regions when the appropriate environment variables are set:

```typescript
// Private helper to sanitize PII data for EU compliance
function sanitizeForEUCompliance(data: any): any {
  if (!EU_COMPLIANCE || !data) return data;

  // Known PII fields that will be redacted
  const piiFields = [
    'email', 'name', 'fullName', 'phone',
    'address', 'ip', 'userAgent'
  ];

  // Recursively sanitize nested objects
  // ...
}
```

### Build Compatibility

The unified logger properly handles Node.js-specific imports to prevent client-side bundling issues:

```typescript
// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize Datadog if available (server-side only)
let datadogLogs: any;
if (!isBrowser) {
  try {
    // Only import in server environment
    // Using require instead of import to prevent bundling issues
    const ddTrace = require('dd-trace');
    // ... additional setup
  } catch (err) {
    // Silently continue without Datadog
  }
}
```

## Further Reading
- [Error Handling System](/docs/engineering/ERROR_HANDLING_SYSTEM.md)
- [Datadog APM Architecture](/docs/engineering/DATADOG_APM_ARCHITECTURE.md)
- [Sentry Implementation Guide](/docs/engineering/infrastructure/monitoring/SENTRY_IMPLEMENTATION_GUIDE.md)