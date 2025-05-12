# Datadog Initialization Guide

This document provides an overview of the Datadog SDK implementation in the buildappswith platform. The implementation is designed to properly separate client-side and server-side code while maintaining a consistent API.

## Directory Structure

The Datadog implementation follows a clean separation between interfaces, configurations, client-side code, and server-side code:

```
/lib/datadog/
  ├── interfaces/            # Shared interfaces and types
  │   ├── index.ts           # Re-exports all interfaces
  │   ├── rum.ts             # RUM interface types
  │   ├── logs.ts            # Logs interface types
  │   ├── tracer.ts          # Tracer interface types
  │   └── trace-context.ts   # Trace context interface types
  │
  ├── client/                # Client-side implementations
  │   ├── index.ts           # Client entry point
  │   ├── rum.client.ts      # RUM client implementation
  │   ├── logs.client.ts     # Logs client implementation
  │   ├── trace-context.client.ts # Client trace context utilities
  │   └── empty-tracer.client.ts  # Empty tracer for client
  │
  ├── server/                # Server-side implementations
  │   ├── index.ts           # Server entry point
  │   ├── tracer.server.ts   # Tracer server implementation
  │   ├── trace-context.server.ts # Server trace context utilities
  │   ├── empty-rum.server.ts # Empty RUM for server
  │   └── empty-logs.server.ts # Empty logs for server
  │
  ├── config/                # Shared configuration
  │   ├── index.ts           # Re-exports configuration
  │   ├── base-config.ts     # Base shared config
  │   ├── rum-config.ts      # RUM specific config
  │   ├── logs-config.ts     # Logs specific config
  │   └── tracer-config.ts   # Tracer specific config
  │
  └── index.ts               # Main entry point (runtime detection)
```

## Key Design Principles

This implementation follows several key design principles:

1. **Clean Separation of Concerns**: Clear separation between interfaces (what), configurations (setup), and implementations (how).

2. **Client/Server Code Separation**: Client and server code are completely separated to prevent Node.js modules from being included in client bundles.

3. **EU1 Region Compliance**: All configurations default to the EU1 region (`datadoghq.eu`) and include validation.

4. **Singleton Pattern**: All implementations protect against multiple initializations using singleton patterns.

5. **Consistent API**: The same API is available in both client and server environments, with no-op implementations where appropriate.

6. **Webpack-Friendly Entry Points**: The entry point uses static environment detection that webpack can properly tree-shake.

7. **Lazy Imports**: Client-side code uses dynamic imports to prevent server-side code from being bundled.

## Environment Detection

The main entry point uses environment detection to determine whether to export client or server implementations:

```typescript
// Export shared interfaces and configuration
export * from './interfaces';
export * from './config';

// Dynamic export based on environment
export * from typeof window === 'undefined' 
  ? './server'  // Server implementation
  : './client'; // Client implementation
```

This pattern ensures that webpack and other bundlers can properly tree-shake the code during build.

## Initialization Pattern

Each implementation follows a singleton pattern to prevent multiple initializations:

```typescript
// Example from rum.client.ts
let rumInitialized = false;
let datadogRum: any = null;

export const rum: RumInterface = {
  init(config: RumConfig): boolean {
    // Skip if already initialized
    if (rumInitialized) return false;
    
    // Initialization logic...
    rumInitialized = true;
    return true;
  },
  // ...
};
```

## Configuration with EU1 Region Default

All configurations default to the EU1 region (`datadoghq.eu`) and include validation:

```typescript
// From base-config.ts
export const datadogConfigBase = {
  // ...
  site: process.env.DATADOG_SITE || 'datadoghq.eu', // EU1 by default
  // ...
};

export function validateEURegion(site: string): boolean {
  if (site !== 'datadoghq.eu') {
    console.warn('Warning: Datadog not configured for EU region (datadoghq.eu)');
    return false;
  }
  return true;
}
```

## Dynamic Imports

Client-side implementations use dynamic imports to avoid bundling server-side modules:

```typescript
// Example from rum.client.ts
import('@datadog/browser-rum').then(module => {
  datadogRum = module.datadogRum;
  // Initialization logic...
});
```

## Integration Points

### In Components

The `DatadogRumProvider` component integrates with the client-side RUM implementation:

```tsx
// From components/providers/datadog-rum-provider.tsx
import { rum, traceContext, TraceContext } from "@/lib/datadog";
import { sanitizeRumUserInfo } from "@/lib/datadog/config";

export function DatadogRumProvider({ children, traceContext: initialTraceContext }: DatadogRumProviderProps) {
  // ...
  useEffect(() => {
    // Initialize RUM with default configuration
    import('@/lib/datadog/config').then(({ getRumConfiguration }) => {
      const config = getRumConfiguration();
      rum.init(config);
    });
    // ...
  }, []);
  // ...
}
```

### In Logger

The logger implementations use the appropriate Datadog services:

```typescript
// From lib/enhanced-logger.client.ts
import { logs, isBrowser } from './datadog';

// ...
private sendToDatadog(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
  // ...
  if (isBrowser) {
    logs.logger.log(message, {
      // ...
    });
  }
  // ...
}
```

### In Instrumentation

The instrumentation files initialize the appropriate services:

```typescript
// From instrumentation-client.ts
import { rum } from "./lib/datadog";
import { getRumConfiguration } from "./lib/datadog/config";

export function register() {
  // Only run in browser
  if (typeof window === 'undefined') return;

  try {
    // Initialize Datadog RUM for client-side monitoring
    setTimeout(() => {
      const config = getRumConfiguration();
      rum.init(config);
    }, 0);
  } catch (error) {
    console.error('Error initializing client monitoring:', error);
  }
}
```

## Testing and Validation

A test script (`scripts/test-datadog-init.js`) validates the implementation, checking for:

1. Proper directory structure
2. EU1 region default configuration
3. Absence of server-only imports in client code
4. Correct environment detection in the main entry point
5. Updated module imports in integration points
6. Singleton protection in implementations
7. Correct initialization methods in the loggers

## Best Practices

1. **Always Use Interface and Implementation Imports**: Import from the main module (`@/lib/datadog`) rather than directly from implementation files.

2. **Prefer Dynamic Imports for Configurations**: When initializing in client components, use dynamic imports for configuration to prevent bundling server-side code.

3. **Use Environment Detection Helpers**: Use the provided `isBrowser` and `isServer` constants for environment checks.

4. **Validate EU Region**: Always check that the site configuration is set to `datadoghq.eu` for EU1 region compliance.

5. **Singleton Initialization**: Don't call initialization functions more than once; they are idempotent but follow best practices.

6. **Error Handling**: Always wrap Datadog operations in try/catch blocks to prevent errors from affecting the user experience.