# Datadog APM Integration Architecture

## 1. Overview

This document outlines the comprehensive architecture for integrating Datadog Application Performance Monitoring (APM) into the Buildappswith platform. The architecture is designed to provide full observability across the platform, capturing metrics, traces, logs, and user experience data in a unified manner.

## 2. Integration Goals

- Implement full-stack monitoring across client, server, and edge functions
- Establish distributed tracing for critical user flows
- Create a unified logging strategy that integrates with existing error handling
- Implement Real User Monitoring (RUM) for client-side performance tracking
- Configure appropriate sampling and filtering for different environments
- Integrate with existing Sentry error monitoring
- Design dashboards for different stakeholder needs

## 3. Architecture Components

### 3.1 Core Components

```
┌───────────────────────────────────────────────────────────────┐
│                    Buildappswith Platform                     │
├───────────────┬───────────────────────┬─────────────────────┬─┘
│ Client Layer  │    Server Layer       │    Edge Layer      │
│ - Next.js     │  - API Routes         │  - Middleware      │
│ - React       │  - Server Components  │  - Edge Functions  │
└───────┬───────┴──────────┬────────────┴──────────┬──────────┘
        │                  │                       │
┌───────▼──────────────────▼───────────────────────▼──────────┐
│                   Datadog Integration Layer                  │
├────────────────┬─────────────────┬──────────────────────────┤
│ RUM            │ APM Tracing     │ Log Management           │
│ - User Journey │ - Distributed   │ - Structured Logging     │
│ - Session      │   Tracing       │ - Error Classification   │
│   Replay       │ - Custom Spans  │ - Correlation            │
├────────────────┼─────────────────┼──────────────────────────┤
│ Infrastructure │ Dashboards      │ Alerting & Monitoring    │
│ - Next.js      │ - Performance   │ - SLOs                   │
│   Metrics      │ - Errors        │ - Anomaly Detection      │
│ - Host Data    │ - Business      │ - Intelligent Alerts     │
└────────────────┴─────────────────┴──────────────────────────┘
```

### 3.2 Datadog Services Utilized

- **APM & Distributed Tracing**: For end-to-end transaction monitoring
- **RUM (Real User Monitoring)**: For client-side performance tracking
- **Log Management**: For structured logging with context
- **Infrastructure Monitoring**: For server and platform health metrics
- **Dashboards & Visualization**: For insights and analysis
- **Alerting & SLOs**: For proactive issue detection

## 4. Implementation Strategy

### 4.1 APM & Distributed Tracing

#### 4.1.1 Server-Side Tracing

We will use the Datadog Node.js tracer (`dd-trace`) to instrument the Next.js application with the following configuration:

```typescript
// instrumentation.ts
import * as Sentry from '@sentry/nextjs';
import { datadogRum } from '@datadog/browser-rum';
import { tracer, setLogger } from 'dd-trace';

export async function register() {
  // Only run in production/staging environments or when explicitly enabled
  if (shouldEnableDatadog()) {
    // Initialize dd-trace for server-side tracing
    tracer.init({
      service: 'buildappswith-platform',
      env: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      logInjection: true, // Enable log correlation
      profiling: true, // Enable code profiling
      runtimeMetrics: true, // Collect runtime metrics
      analytics: true, // Enable App Analytics
      // Sampling configuration
      sampleRate: getEnvironmentSampleRate(),
      // Optionally integrate with Sentry logger
      logger: getSentryLogger(),
    });
    
    // Enable integrations with core libraries
    tracer.use('next', {
      // Next.js specific configurations
      hooks: true, // Trace Next.js hooks
      router: true, // Trace Next.js router
      server: true, // Trace Next.js server
    });
    
    tracer.use('http', {
      // HTTP client tracing configuration
      client: true,
      server: true,
    });
    
    // Database integrations
    tracer.use('prisma', {
      // Prisma specific configurations
      service: 'buildappswith-db',
    });
    
    // Add other integrations as needed
  }
  
  // Continue with Sentry setup - integrate the two monitoring systems
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
```

#### 4.1.2 Critical User Flows Instrumentation

We will define and instrument critical user flows with custom tracing:

```typescript
// lib/datadog/tracing.ts
import { tracer } from 'dd-trace';

export enum UserFlow {
  AUTHENTICATION = 'auth',
  BOOKING = 'booking',
  PAYMENT = 'payment',
  MARKETPLACE = 'marketplace',
  PROFILE = 'profile',
}

export interface TraceOptions {
  name: string;
  service?: string;
  resource?: string;
  type?: string;
  metadata?: Record<string, any>;
}

/**
 * Track a critical user flow with distributed tracing
 * @param flow The user flow to track
 * @param options Additional trace options
 * @returns A trace span that must be finished when the operation completes
 */
export function trackUserFlow(flow: UserFlow, options: TraceOptions) {
  const span = tracer.startSpan(`${flow}.${options.name}`, {
    service: options.service || 'buildappswith-platform',
    resource: options.resource || options.name,
    type: options.type || 'web',
  });
  
  // Add flow-specific metadata
  span.setTag('user_flow', flow);
  
  // Add custom metadata
  if (options.metadata) {
    Object.entries(options.metadata).forEach(([key, value]) => {
      span.setTag(key, value);
    });
  }
  
  return span;
}

/**
 * Monitor a critical async function with tracing
 * @param flow The user flow to track
 * @param name The operation name
 * @param fn The async function to monitor
 * @param metadata Additional context to add to the trace
 * @returns The result of the function
 */
export async function withUserFlowTracing<T>(
  flow: UserFlow,
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const span = trackUserFlow(flow, { name, metadata });
  
  try {
    const result = await fn();
    span.finish();
    return result;
  } catch (error) {
    span.setTag('error', true);
    span.setTag('error.message', error.message);
    span.setTag('error.type', error.name);
    span.setTag('error.stack', error.stack);
    span.finish();
    throw error;
  }
}
```

### 4.2 Real User Monitoring (RUM)

We will implement RUM to track client-side performance and user experience:

```typescript
// app/layout.tsx (using App Router) - client component
'use client';

import { useEffect } from 'react';
import { datadogRum } from '@datadog/browser-rum';

export function DatadogRumProvider({ children }) {
  useEffect(() => {
    // Only initialize in browser and in production/staging
    if (typeof window !== 'undefined' && shouldEnableDatadog()) {
      datadogRum.init({
        applicationId: process.env.NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID,
        clientToken: process.env.NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN,
        site: process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com',
        service: 'buildappswith-platform',
        env: process.env.NODE_ENV,
        version: process.env.NEXT_PUBLIC_APP_VERSION,
        sessionSampleRate: 100,
        sessionReplaySampleRate: 20,
        trackUserInteractions: true,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: 'mask-user-input',
      });
      
      // Add user identification if available
      if (isUserAuthenticated()) {
        datadogRum.setUser({
          id: getUserId(),
          name: getUserName(),
          email: getUserEmail(),
          plan: getUserPlan(),
          role: getUserRole(),
        });
      }
    }
  }, []);
  
  return children;
}
```

### 4.3 Enhanced Logging Integration

We will enhance the existing logger to integrate with Datadog:

```typescript
// lib/enhanced-logger.ts
import * as Sentry from '@sentry/nextjs';
import { ErrorSeverity, ErrorCategory, ErrorMetadata, handleError } from './sentry';
import { datadogLogs } from '@datadog/browser-logs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: any;
}

interface LogFunction {
  (message: string, metadata?: LogMetadata, error?: Error): void;
}

/**
 * Enhanced structured logger with Sentry and Datadog integration
 */
export class EnhancedLogger {
  // ... existing logger methods ...
  
  /**
   * Send log data to Datadog
   */
  private sendToDatadog(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
    // Skip if Datadog isn't configured or we're in development
    if (!process.env.DATADOG_API_KEY && process.env.NODE_ENV === 'development') {
      return;
    }
    
    try {
      // Prepare context for Datadog
      const context = {
        level,
        message,
        ...metadata,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : undefined,
        date: new Date().toISOString(),
      };
      
      // Send to Datadog based on environment
      if (typeof window !== 'undefined') {
        // Client-side logging
        if (datadogLogs) {
          datadogLogs.logger.log(message, {
            level,
            ...metadata,
          });
        }
      } else {
        // Server-side logging - use Node.js logging
        // Assume dd-trace is initialized and will handle log injection
        // The console logging will be captured and forwarded to Datadog
      }
    } catch (datadogError) {
      console.error('Failed to send to Datadog:', datadogError);
    }
  }
  
  /**
   * Internal logging implementation
   */
  private log(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
    // Existing logging logic...
    
    // Add Datadog integration
    this.sendToDatadog(level, message, metadata, error);
    
    // Existing Sentry integration and console logging...
  }
}
```

### 4.4 Infrastructure Monitoring

Configure the Datadog agent for infrastructure monitoring in different environments:

#### Development

Developer local configuration for testing:

```yaml
# datadog-agent-dev.yaml
apm_config:
  enabled: true
logs_config:
  container_collect_all: true
process_config:
  enabled: true
```

#### Production (Vercel)

Integration with Vercel and environment-specific configurations.

### 4.5 Environment Configuration

Centralized configuration module for Datadog across environments:

```typescript
// lib/datadog/config.ts
export enum DatadogEnvironment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging', 
  PRODUCTION = 'production',
}

interface EnvironmentConfig {
  enabled: boolean;
  sampleRate: number;
  logSampleRate: number;
  rumSampleRate: number;
  rumSessionReplaySampleRate: number;
  profiling: boolean;
  debugging: boolean;
}

export const datadogConfig = {
  service: 'buildappswith-platform',
  site: process.env.DATADOG_SITE || 'datadoghq.com',
  
  // Critical transactions to always trace
  criticalTransactions: [
    'auth.signup',
    'auth.login',
    'payment.process',
    'booking.create',
    'marketplace.search',
  ],
  
  // Environment-specific configurations
  environments: {
    [DatadogEnvironment.DEVELOPMENT]: {
      enabled: process.env.DATADOG_ENABLE_DEV === 'true',
      sampleRate: 1.0, // 100% sampling in development
      logSampleRate: 1.0,
      rumSampleRate: 1.0,
      rumSessionReplaySampleRate: 1.0,
      profiling: true, 
      debugging: true,
    },
    [DatadogEnvironment.TESTING]: {
      enabled: process.env.DATADOG_ENABLE_TEST === 'true',
      sampleRate: 1.0,
      logSampleRate: 1.0, 
      rumSampleRate: 1.0,
      rumSessionReplaySampleRate: 0.0, // No session replay in testing
      profiling: false,
      debugging: true,
    },
    [DatadogEnvironment.STAGING]: {
      enabled: true,
      sampleRate: 0.5, // 50% sampling in staging
      logSampleRate: 0.5,
      rumSampleRate: 0.5,
      rumSessionReplaySampleRate: 0.3, // 30% session replay
      profiling: true,
      debugging: true,
    },
    [DatadogEnvironment.PRODUCTION]: {
      enabled: true,
      sampleRate: 0.1, // 10% sampling in production
      logSampleRate: 0.2,
      rumSampleRate: 0.1,
      rumSessionReplaySampleRate: 0.05, // 5% session replay
      profiling: true,
      debugging: false,
    },
  },
  
  // Get current environment
  getCurrentEnvironment(): DatadogEnvironment {
    return process.env.NODE_ENV as DatadogEnvironment || DatadogEnvironment.DEVELOPMENT;
  },
  
  // Get configuration for current environment
  getEnvironmentConfig(): EnvironmentConfig {
    const env = this.getCurrentEnvironment();
    return this.environments[env] || this.environments[DatadogEnvironment.DEVELOPMENT];
  },
  
  // Helper to check if Datadog should be enabled
  isEnabled(): boolean {
    return this.getEnvironmentConfig().enabled;
  },
  
  // Helper to get sample rate for current environment
  getSampleRate(): number {
    return this.getEnvironmentConfig().sampleRate;
  },
  
  // Helper for critical transaction sampling
  isCriticalTransaction(name: string): boolean {
    return this.criticalTransactions.includes(name);
  },
  
  // Helper to determine final sample rate (always sample critical transactions)
  getTransactionSampleRate(name: string): number {
    if (this.isCriticalTransaction(name)) {
      return 1.0; // Always sample critical transactions
    }
    return this.getSampleRate();
  }
};
```

### 4.6 Sentry Integration

Integration between Datadog and Sentry for unified error monitoring:

```typescript
// lib/monitoring/integrations.ts
import * as Sentry from '@sentry/nextjs';
import { tracer } from 'dd-trace';

/**
 * Link a Sentry error to the current Datadog trace
 * Ensures that errors reported in Sentry can be correlated with
 * performance traces in Datadog
 */
export function linkSentryErrorToDatadogTrace(error: Error): void {
  try {
    // Get the current active span from dd-trace
    const span = tracer.scope().active();
    
    if (span) {
      // Extract trace and span IDs
      const traceId = span.context().toTraceId();
      const spanId = span.context().toSpanId();
      
      if (traceId && spanId) {
        // Add the trace context to Sentry error
        Sentry.withScope((scope) => {
          scope.setTag('datadog.trace_id', traceId);
          scope.setTag('datadog.span_id', spanId);
          Sentry.captureException(error);
        });
      }
    }
  } catch (integrationError) {
    console.error('Failed to link Sentry error to Datadog trace:', integrationError);
    Sentry.captureException(error); // Fallback to normal capture
  }
}

/**
 * Create a Sentry-compatible logger for Datadog tracer
 * This allows Datadog to use Sentry for error reporting
 */
export function getSentryLogger() {
  return {
    debug: (message: string) => console.debug(message),
    info: (message: string) => console.info(message),
    warn: (message: string) => console.warn(message),
    error: (message: string, ...args) => {
      console.error(message, ...args);
      const errorObj = args[0] instanceof Error ? args[0] : new Error(message);
      Sentry.captureException(errorObj);
    }
  };
}
```

## 5. Dashboard Strategy

### 5.1 Platform Performance Dashboard

Primary dashboard showing overall platform health and performance:

- Request volume, latency, and error rates
- Top API endpoints by volume and latency
- Client-side performance metrics (LCP, FID, CLS)
- User journey completion rates
- Resource utilization metrics

### 5.2 Development Dashboard

Dashboard focused on helping developers track and improve performance:

- Slow transactions and endpoints
- Error hotspots and rates
- Database query performance
- External API call performance
- Code-level performance metrics

### 5.3 Business Dashboard

Dashboard for business stakeholders showing key metrics:

- User engagement metrics
- Funnel completion rates
- Conversion metrics for key user journeys
- Regional performance and usage
- Error impact on business metrics

## 6. Alerting Strategy

### 6.1 SLOs (Service Level Objectives)

Define SLOs for critical user flows:

- Authentication: 99.9% success rate, p95 latency < 1s
- Booking Flow: 99.5% success rate, p95 latency < 2s
- Payment Processing: 99.95% success rate, p95 latency < 3s
- Search/Browse: 99.5% availability, p95 latency < 1.5s

### 6.2 Alert Policies

- **High Urgency**: Critical path failures, payment issues, authentication failures
- **Medium Urgency**: Performance degradation, increasing error rates, warning thresholds
- **Low Urgency**: Minor anomalies, non-critical service degradation

## A: Environment Variables

| Variable | Required | Default | Description | Environments |
|----------|----------|---------|-------------|-------------|
| `DATADOG_API_KEY` | Yes | - | Datadog API key | All |
| `DATADOG_APP_KEY` | Yes | - | Datadog application key | All |
| `DATADOG_SITE` | No | 'datadoghq.com' | Datadog site (US/EU) | All |
| `DATADOG_SERVICE_NAME` | No | 'buildappswith-platform' | Service name for Datadog | All |
| `DATADOG_ENV` | No | NODE_ENV | Environment tag | All |
| `DATADOG_VERSION` | No | NEXT_PUBLIC_APP_VERSION | Application version | All |
| `DATADOG_ENABLE_DEV` | No | 'false' | Enable Datadog in development | Development |
| `DATADOG_ENABLE_TEST` | No | 'false' | Enable Datadog in test | Testing |
| `DATADOG_LOG_LEVEL` | No | 'error' | Minimum log level to report | All |
| `NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID` | Yes (for RUM) | - | RUM Application ID | All |
| `NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN` | Yes (for RUM) | - | RUM Client Token | All |

## 7. Implementation Plan

### 7.1 Phase 1: Core APM Integration (2 weeks)
- Implement server-side tracing
- Configure APM for critical API routes
- Integrate with existing logger

### 7.2 Phase 2: RUM and Client Integration (2 weeks)
- Implement RUM for frontend monitoring
- Set up session replay for critical flows
- Implement error tracking

### 7.3 Phase 3: Distributed Tracing Enhancement (2 weeks)
- Implement custom spans for business transactions
- Add context propagation across services
- Complete critical user flow tracking

### 7.4 Phase 4: Dashboard & Alerting (2 weeks)
- Create customized dashboards
- Configure SLOs and alerting
- Fine-tune sampling and filtering
- Knowledge transfer and documentation

## 8. Conclusion

This architecture provides a comprehensive approach to integrating Datadog APM into the Buildappswith platform. By implementing distributed tracing, RUM, log aggregation, and infrastructure monitoring, we'll achieve complete observability across the platform and enable proactive issue detection and resolution.