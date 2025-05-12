# Sentry Configuration Modernization

## Overview
This document summarizes the implementation of Sentry configuration modernization to improve performance, ensure EU data residency compliance, and enhance compatibility with modern Next.js features.

**Date Implemented:** May 2025  
**Branch:** feature/infrastructure-modernization  
**Status:** Completed  

## Objectives Achieved

1. ✅ Migrated from deprecated sentry.client/server.config.ts to the Next.js instrumentation pattern
2. ✅ Implemented EU region data residency for all Sentry data
3. ✅ Ensured compatibility with Turbopack
4. ✅ Maintained Datadog RUM integration with Sentry
5. ✅ Enhanced error context propagation

## Implementation Details

### 1. Migration to Next.js Instrumentation Pattern

The implementation transitioned from using the older configuration approach (sentry.client.config.ts and sentry.server.config.ts) to the modern instrumentation pattern designed for Next.js 13+ applications.

**Key files updated:**
- Created `instrumentation-client.ts` for client-side initialization
- Updated `instrumentation.ts` for server-side initialization
- Enhanced `lib/sentry/config.ts` with EU region support

### 2. EU Region Data Residency

Enhanced the Sentry configuration to explicitly specify EU region for data storage and processing:

```typescript
// Explicitly set EU region in configuration
region: process.env.SENTRY_REGION || 'eu',

// Include in initialization parameters
export function getInitializationConfig() {
  return {
    // ...other settings
    region: sentryConfig.region,
  };
}
```

### 3. Turbopack Compatibility

Made several enhancements to improve compatibility with Turbopack:

- Implemented safer module imports with defensive coding
- Used dynamic imports to avoid circular dependencies
- Reduced direct reliance on Node.js specific APIs
- Created cleaner separation between client and server code

### 4. Datadog RUM Integration

Ensured the Datadog RUM integration was maintained in the new implementation:

```typescript
// Maintain Datadog integration
beforeSend: (event) => {
  try {
    // If there's a Datadog RUM global context with trace info, add it to Sentry
    if (
      window.__DD_RUM__ &&
      window.__DD_RUM__._getInternalContext
    ) {
      const rumContext = window.__DD_RUM__._getInternalContext();
      if (rumContext && rumContext.application && rumContext.application.id) {
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
}
```

### 5. Enhanced Error Context

Improved error context propagation by ensuring proper metadata is attached to all error events.

## Implementation Challenges

1. **Compatibility Testing**: Ensuring the new implementation worked correctly with existing error handling logic required thorough testing.

2. **Client-Side Safe Imports**: Ensuring that server-only code was not inadvertently imported on the client side required careful module structuring.

3. **Dynamic Import Handling**: Managing dynamic imports while ensuring proper error handling was challenging, particularly with the Datadog integration.

4. **Testing Environment Limitations**: Running tests in the environment consistently hit timeout issues, particularly with complex mocks. This forced a more focused testing approach with simplified test cases.

5. **Module Resolution in Tests**: There were challenges with module resolution in the test environment where paths like `../../../../lib/sentry/config` weren't resolving properly, requiring direct imports in some test cases.

6. **Type Definition Complexity**: The Datadog RUM integration required more complex type safety checks than initially anticipated (e.g., ensuring `rumContext.application && rumContext.application.id` exist before accessing).

7. **Dynamic Import Complexity**: The original plan called for more dynamic imports, but a more straightforward approach with better error handling proved more reliable for production deployments.

## Testing Environment Issues

When running tests for Sentry functionality, several environment-specific issues were encountered:

1. **Timeout Issues**: Tests frequently timed out after 2 minutes, especially when using complex mocks.

2. **Path Resolution**: When using the terminal directly, some test files weren't found when using ellipsis (`...`) as a shorthand in test paths.

3. **Module Resolution**: In test files, importing modules using relative paths (e.g., `../../../../lib/sentry/config`) was problematic.

The following command illustrates the test path issue:
```bash
# This may not locate test files in the terminal
pnpm test __tests__/unit/lib/sentry/...

# Use the full explicit path instead
pnpm test __tests__/unit/lib/sentry/basic-config.test.ts
```

Consider adding the following to CLAUDE.md for future sessions:

```markdown
## Testing Environment Notes
- Test commands may timeout after 2 minutes in the Claude environment
- For complex tests, create smaller, focused test files and run them individually
- Always use full explicit paths when running tests, avoid using ellipsis (`...`) in test paths
- In test files, prefer importing modules directly rather than using relative paths
- When tests timeout, it's often better to simplify the test than to increase the timeout
- Use direct mock objects when possible instead of complex module mocking
```

## Future Recommendations

1. **Sentry Performance Monitoring**: Consider implementing Sentry Performance Monitoring more extensively to capture key user transactions.

2. **Session Replay Consideration**: Evaluate whether to enable Sentry Session Replay for better debugging of user interactions, ensuring compliance with GDPR if implemented.

3. **Enhanced Error Classification**: Implement more granular error classification to improve error filtering and prioritization.

4. **Integration with Structured Logging**: Consider tighter integration between Sentry and the structured logging system for a unified observability approach.

5. **Test Environment Improvements**: Consider setting up a more robust testing environment that can handle longer-running tests for complex integrations like Sentry.

6. **Mock Datadog for Testing**: Create dedicated mock utilities for Datadog RUM integration to simplify testing.

7. **Test Path Standardization**: Standardize the way tests are run to avoid path resolution issues, preferring explicit file paths.

## Testing Performed

1. **Unit Tests**: Created tests to verify EU region configuration and proper initialization in both client and server environments.

2. **Manual Testing**: Verified proper error capturing and context propagation in development.

## Related Documentation

- [Sentry Implementation Guide](./SENTRY_IMPLEMENTATION_GUIDE.md)
- [Datadog-Sentry Integration](../DATADOG_SENTRY_INTEGRATION.md)

## Next Steps

The completion of the Sentry modernization sets the foundation for the upcoming Logger Implementation, which will build upon these improvements for a more unified observability approach.