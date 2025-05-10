# Datadog Implementation Guide

This document provides an overview of the Datadog implementation in the BuildAppsWith platform.

## Overview

The BuildAppsWith platform uses Datadog for comprehensive monitoring across:

1. **APM (Application Performance Monitoring)** - Server-side tracing
2. **RUM (Real User Monitoring)** - Client-side performance tracking
3. **Logs** - Unified logging with trace correlation
4. **Dashboards** - Visualizations for application metrics

The implementation is designed to be environment-aware, with different sampling rates and settings for development, staging, and production environments.

## Architecture

### Component Structure

- **Configuration**: Centralized configuration in `lib/datadog/config.ts`
- **Server-side Tracing**: APM instrumentation in `lib/datadog/tracer.ts`
- **Client-side Monitoring**: RUM provider in `components/providers/datadog-rum-provider.tsx`
- **Distributed Tracing**: Context propagation in `lib/datadog/context-propagation.ts`
- **Logging Integration**: Enhanced logger in `lib/enhanced-logger.ts`
- **Sentry Integration**: Bidirectional integration in `lib/datadog/sentry-integration.ts`
- **Dashboards**: Dashboard templates in `lib/datadog/dashboards/`

### Initialization Flow

1. **Server-side** initialization happens in `instrumentation.ts`:
   - Datadog APM tracer is initialized first
   - Sentry server monitoring is initialized afterward
   - Integrations are configured for Next.js, HTTP, and Prisma

2. **Client-side** initialization happens in React provider components:
   - `DatadogRumProvider` initializes RUM for performance tracking
   - Browser logs are initialized for client-side logging
   - User context is updated on auth state changes

## Usage Guide

### Tracing Custom Operations

To create custom spans for business logic:

```typescript
import { createSpan, withSpan } from '@/lib/datadog/tracer';

// Manual span creation
function performOperation() {
  const span = createSpan('business.operation', {
    service: 'booking-service',
    resource: 'create-booking',
    tags: { 
      customer_tier: 'premium',
      operation_type: 'create'
    }
  });
  
  try {
    // Business logic here
    return result;
  } catch (error) {
    span.setTag('error', error);
    throw error;
  } finally {
    span.finish();
  }
}

// Using the wrapper function
const processPayment = withSpan(
  'payment.process',
  async (paymentData) => {
    // Payment processing logic
    return result;
  },
  { 
    resource: 'process-payment',
    tags: { payment_type: 'stripe' }
  }
);

// Use the wrapped function
const result = await processPayment(data);
```

### Adding Structured Logging

Use the enhanced logger for structured logging with trace correlation:

```typescript
import { enhancedLogger, createDomainLogger } from '@/lib/enhanced-logger';

// Using the global logger
enhancedLogger.info('User logged in successfully', {
  userId: 'user-123',
  method: 'email',
});

// Creating a domain-specific logger
const paymentLogger = createDomainLogger('payment', {
  service: 'payment-processor',
});

paymentLogger.info('Payment initiated', {
  amount: 99.99,
  currency: 'USD',
  provider: 'stripe',
});

// Logging errors
try {
  // Operation that might fail
} catch (error) {
  enhancedLogger.error('Payment processing failed', {
    transactionId: 'tx-123',
    amount: 99.99,
  }, error);
}
```

### Propagating Trace Context

To propagate trace context across API boundaries:

```typescript
import { injectTraceContextIntoHeaders, extractTraceContextFromHeaders } from '@/lib/datadog/context-propagation';

// Client-side: When making a fetch request
async function fetchWithTracing(url, options = {}) {
  const headers = injectTraceContextIntoHeaders(options.headers || {});
  
  return fetch(url, {
    ...options,
    headers,
  });
}

// Server-side: When receiving a request in API route
export async function POST(request) {
  const headers = request.headers;
  const span = extractTraceContextFromHeaders(headers, 'api.endpoint');
  
  try {
    // API logic here
    return Response.json({ success: true });
  } finally {
    if (span) span.finish();
  }
}
```

### User Identification for RUM

User identification is automatically handled by the `DatadogRumProvider` component, which uses Clerk authentication to set user information in Datadog RUM sessions.

If needed, you can manually set user information:

```typescript
import { datadogRum } from '@datadog/browser-rum';
import { sanitizeRumUserInfo } from '@/lib/datadog/rum-config';

// Set user information
datadogRum.setUser(sanitizeRumUserInfo({
  id: user.id,
  name: user.fullName,
  email: user.email,
  role: user.role,
}));

// Clear user information
datadogRum.removeUser();
```

## Configuration Options

The Datadog configuration in `lib/datadog/config.ts` provides the following options:

- **Environment-specific settings**:
  - `enabled`: Whether Datadog is enabled in this environment
  - `sampleRate`: Percentage of traces to sample (0-1)
  - `logSampleRate`: Percentage of logs to send (0-1)
  - `rumSampleRate`: Percentage of RUM sessions to track (0-1)
  - `rumSessionReplaySampleRate`: Percentage of sessions to record (0-1)
  - `profiling`: Whether to enable profiling
  - `debugging`: Whether to enable debug mode

- **Critical Transactions**:
  - Transactions listed in `criticalTransactions` are always traced (100% sampling)
  - Currently includes: auth.signup, auth.login, payment.process, booking.create, marketplace.search

## Environment Variables

The following environment variables are used:

```
# Required
DD_API_KEY=your_datadog_api_key
NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID=your_rum_application_id
NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN=your_rum_client_token

# Optional
DATADOG_SITE=datadoghq.eu  # Defaults to datadoghq.com
NEXT_PUBLIC_DATADOG_SITE=datadoghq.eu  # Client-side site
DATADOG_ENABLE_DEV=true  # Enable in development
DATADOG_ENABLE_TEST=true  # Enable in test
NEXT_PUBLIC_APP_VERSION=1.0.0  # App version
```

## Dashboards

A default dashboard template is provided in `lib/datadog/dashboards/main-dashboard.json`. This dashboard includes:

- APM Overview (Request Volume, Response Time, Error Rate)
- User Experience (Page Load Time, JavaScript Errors, Long Tasks)
- Critical User Flows (Auth Flow, Booking Flow, Payment Processing)
- Infrastructure (Memory Usage, CPU Usage)
- Database Performance (Query Time, Query Volume)

To create this dashboard in Datadog:
1. Navigate to Dashboards in the Datadog UI
2. Click "New Dashboard"
3. Click "Import Dashboard JSON"
4. Paste the contents of the dashboard JSON file

## Troubleshooting

### Common Issues

1. **No data appearing in Datadog**:
   - Verify API keys are correct
   - Check environment variables are properly set
   - Ensure the application is running with the monitoring enabled
   - Verify the service name in the Datadog UI matches the configured service name

2. **Missing RUM data**:
   - Check browser console for errors related to RUM initialization
   - Verify the RUM application ID and client token are correct
   - Ensure the DatadogRumProvider is properly included in the provider tree

3. **Trace correlation issues**:
   - Verify that logs have the correct trace and span IDs
   - Check that context propagation is working between client and server
   - Ensure that all services use the same Datadog environment and service naming

### Debugging

- Enable debug mode in the configuration for more verbose logging
- Check browser console and server logs for initialization messages
- Use the Datadog debug mode by setting `debug: true` in the tracer and RUM initialization