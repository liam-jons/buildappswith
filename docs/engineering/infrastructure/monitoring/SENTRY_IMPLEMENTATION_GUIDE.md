# Sentry Implementation Guide

*Version: 1.0.0*
*Date: 2025-05-11*
*Status: Draft*

## Overview
This document explains how Sentry error monitoring and performance tracking is implemented in the BuildAppsWith platform using Next.js App Router and instrumentation patterns.

## Architecture
The Sentry implementation follows Next.js best practices using the instrumentation API to handle both client and server-side error monitoring:

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
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://your-key@ingest.de.sentry.io/your-project
   SENTRY_ENVIRONMENT=development
   SENTRY_TRACES_SAMPLE_RATE=0.1
   ```

2. Integration with existing monitoring
   ```typescript
   // In instrumentation-client.ts
   export function register() {
     // Sentry initialization with integration
   }
   ```

3. Error boundary usage
   ```tsx
   // In component code
   import { ErrorBoundary } from '@sentry/nextjs';

   export default function Page() {
     return (
       <ErrorBoundary fallback={<ErrorFallback />}>
         <YourComponent />
       </ErrorBoundary>
     );
   }
   ```

## Usage Examples
```javascript
// Example of capturing an error
import * as Sentry from '@sentry/nextjs';

try {
  // Operation that might fail
  throw new Error('Example error');
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'example-component',
    },
    extra: {
      contextData: 'Additional information',
    },
  });
}
```

## Datadog Integration
Sentry integrates with Datadog RUM (Real User Monitoring) to provide a unified view of errors and performance metrics:

```typescript
// In instrumentation-client.ts
if (window.__DD_RUM__ && window.__DD_RUM__._getInternalContext) {
  const rumContext = window.__DD_RUM__._getInternalContext();
  if (rumContext) {
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
```

## Troubleshooting

### Common Issues

#### Missing Errors in Sentry Dashboard
- Check that the DSN is correctly configured
- Verify that instrumentation files are being executed
- Check that the environment is enabled in the Sentry project settings

#### Performance Issues
- Adjust the sampling rate for traces
- Check that browser performance integrations are configured correctly
- Verify source maps are being uploaded properly

## References
- [Next.js Instrumentation API](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [EU Data Residency](https://docs.sentry.io/product/accounts/data-privacy/)