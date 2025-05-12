# Sentry Integration with Clerk Catch-All Routes

## Overview

This guide documents the implementation approach for integrating Sentry error tracking with Clerk's catch-all authentication routes in a Next.js App Router application. The solution resolves build-time module resolution errors that occur specifically with the combination of:

1. Clerk's recommended catch-all authentication routes (`[[...sign-in]]` pattern)
2. Next.js App Router client/server component boundaries
3. Sentry error monitoring integration

## Problem Context

When implementing Clerk's recommended authentication route pattern with catch-all routes, the Next.js production build process encounters module resolution errors specifically related to Sentry integration. The primary errors are:

```
Error: Cannot find module './vendor-chunks/@sentry+core@9.14.0.js'
Require stack:
- /.next/server/webpack-runtime.js
- /.next/server/app/sign-up/[[...sign-up]]/page.js
```

These errors occur because:

1. Clerk's catch-all routes create complex module dependencies
2. Static imports of Sentry in client components cause webpack to attempt bundling server-only code
3. The standard Sentry initialization conflicts with Next.js App Router's client/server component boundaries
4. Webpack struggles to correctly resolve these dependencies during production builds

## Solution Architecture

Our solution implements a dynamic import pattern for Sentry across the application:

### 1. Client Components: Dynamic Import with State Management

For client components (like error boundaries and authentication components), we:

- Remove static imports of Sentry (`import * as Sentry from '@sentry/nextjs'`)
- Add state to hold the dynamically imported Sentry client
- Use useEffect to dynamically import Sentry after component mount
- Conditionally use Sentry functions based on successful loading

Example pattern:

```jsx
'use client';

import { useState, useEffect } from 'react';
// Remove static import
// import * as Sentry from '@sentry/nextjs';

export function AuthComponent() {
  const [sentryClient, setSentryClient] = useState(null);
  
  // Dynamically load Sentry
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadSentry = async () => {
        try {
          const SentryModule = await import('@sentry/nextjs');
          setSentryClient(SentryModule);
        } catch (err) {
          console.warn('Sentry client failed to load:', err);
        }
      };
      
      loadSentry();
    }
  }, []);
  
  // Use Sentry conditionally
  const reportError = (error) => {
    if (sentryClient) {
      sentryClient.captureException(error);
    } else {
      console.error('Error occurred, Sentry not available:', error);
    }
  };
  
  // Component implementation
}
```

### 2. Server Components & Instrumentation: Async Dynamic Imports

For server-side code and instrumentation:

- Add environment and context checks before Sentry operations
- Use async/await pattern for dynamic imports
- Implement proper error handling for import failures
- Only initialize in production environments when DSN is configured

Example pattern:

```js
// Server-side instrumentation
export async function register() {
  // Guard clause: Only run in server environment
  if (typeof window !== 'undefined') return;

  try {
    // Dynamic import Sentry only in production with DSN
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      const Sentry = await import('@sentry/nextjs');
      
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        // Configuration options
      });
    }
  } catch (error) {
    console.error('Error initializing server monitoring:', error);
  }
}
```

### 3. Sentry Configuration in next.config.mjs

The Sentry webpack configuration in `next.config.mjs` requires special settings:

```js
export default withSentryConfig(nextConfig, {
  // Standard Sentry options
  org: "your-org",
  project: "your-project",
  
  // Critical for catch-all routes
  transpileClientSDK: true,
  hideSourceMaps: false,
  
  // Optimize webpack configuration
  webpack: {
    devtool: 'source-map',
    parallel: 2 // Reduce parallel compilation to avoid memory pressure
  }
}, {
  // Runtime configuration
  silent: true,
  memoryLimit: 2048
});
```

## Implementation Details

### 1. AuthErrorBoundary Component

The `auth-error-boundary.tsx` component was modified to:
- Remove static Sentry import
- Add state management for Sentry client
- Dynamically load Sentry in useEffect
- Conditionally report errors if Sentry is loaded
- Provide fallback error logging when Sentry is unavailable

### 2. Instrumentation Files

Both instrumentation files were updated:

**instrumentation.ts (Server):**
- Uses async/await pattern for dynamic imports
- Only initializes Sentry in production with valid DSN
- Implements robust error handling

**instrumentation-client.ts (Client):**
- Uses setTimeout to defer Sentry initialization off the critical path
- Splits initialization and integration loading
- Implements environment checks before any Sentry operations
- Provides graceful fallbacks for all operations

### 3. Content Security Policy

The Content-Security-Policy in `next.config.mjs` was updated to include all necessary Sentry domains:

```
connect-src 'self' ... https://*.sentry.io https://*.ingest.sentry.io https://ingest.sentry.io;
```

## Best Practices

When working with Sentry and Clerk's catch-all routes:

1. **Never use static imports** of Sentry in client components
2. **Always check environment** before importing or using Sentry
3. **Provide fallbacks** for cases where Sentry fails to load
4. **Use state management** to track Sentry availability in client components 
5. **Keep Sentry initialization off the critical path** with setTimeout or dynamic imports
6. **Optimize webpack configuration** to reduce memory pressure during builds
7. **Configure CSP headers** to include all Sentry domains
8. **Apply transpileClientSDK option** in Sentry webpack configuration

## Testing Considerations

When testing this integration:

1. Verify error reporting works in development environment
2. Confirm production builds complete without module resolution errors
3. Test error reporting in production environment
4. Ensure Clerk authentication continues to function correctly
5. Verify that route transitions properly report to Sentry
6. Check that CSP headers allow Sentry to report errors

## Troubleshooting

If you encounter issues:

1. **Module resolution errors**: Ensure dynamic imports are used consistently
2. **Missing error reports**: Check CSP headers and verify Sentry DSN configuration
3. **Build failures**: Adjust webpack memory settings and reduce parallelism
4. **Runtime errors**: Verify client/server boundaries are respected

## References

- [Sentry Next.js SDK Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Clerk Catch-All Routes Documentation](https://clerk.com/docs/nextjs/app-router)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- `/docs/testing/AUTH_ROUTES_STANDARDIZATION.md`
- `/docs/testing/AUTH_ROUTES_BUILD_INVESTIGATION.md`
- `/docs/engineering/CLERK_AUTH_ROUTES_INVESTIGATION.md`