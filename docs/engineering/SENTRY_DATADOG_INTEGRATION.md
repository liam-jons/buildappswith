# Sentry and Datadog Integration Strategy

## 1. Overview

This document outlines the integration strategy between Sentry (error monitoring) and Datadog (performance monitoring) for the Buildappswith platform. The goal is to create a unified observability approach that leverages the strengths of both platforms while avoiding duplication and ensuring seamless correlation between errors and performance data.

## 2. Integration Goals

- Create bidirectional links between Sentry errors and Datadog traces
- Establish consistent context across both platforms
- Optimize sampling strategies to balance coverage and cost
- Provide a unified view of both error and performance data
- Maintain the specialized benefits of each platform

## 3. Current State Assessment

### Sentry Implementation

- **Purpose**: Error monitoring, crash reporting, and error context
- **Strengths**: Rich error context, source maps integration, error grouping
- **Current Architecture**: Client, server, and edge instrumentation via Next.js SDK
- **Integration Points**: Enhanced logger, error boundaries, API error handlers

### Datadog Implementation

- **Purpose**: Performance monitoring, infrastructure metrics, user experience
- **Strengths**: Full-stack observability, APM, infrastructure metrics, RUM
- **Current Architecture**: Test visualization, limited application monitoring
- **Integration Points**: Logger (commented out), test reporting

## 4. Integration Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                 Buildappswith Application                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌───────────────────────┐           ┌────────────────────┐    │
│  │     Error Events      │◄──────────┤  Performance Data  │    │
│  └─────────┬─────────────┘           └──────────┬─────────┘    │
│            │                                    │              │
└────────────┼────────────────────────────────────┼──────────────┘
             │                                    │
┌────────────▼─────────────┐        ┌─────────────▼──────────────┐
│                          │        │                            │
│    Sentry Platform       │        │     Datadog Platform       │
│    (Error Monitoring)    │        │     (APM & Metrics)        │
│                          │        │                            │
└───────────┬──────────────┘        └────────────┬───────────────┘
            │                                    │
            │           ┌────────────────┐       │
            └──────────►│  Correlation   │◄──────┘
                        │    Layer       │
                        └────────────────┘
```

## 5. Integration Strategy

### 5.1 Unified Context Propagation

Create a shared context interface that ensures both systems receive consistent information:

```typescript
// lib/monitoring/shared-context.ts
import * as Sentry from '@sentry/nextjs';
import { datadogRum } from '@datadog/browser-rum';
import { tracer } from 'dd-trace';

interface UserContext {
  id: string;
  email?: string;
  username?: string;
  role?: string;
}

interface AppContext {
  version: string;
  environment: string;
  releaseStage: string;
}

/**
 * Set consistent user context across monitoring platforms
 */
export function setMonitoringUserContext(user: UserContext): void {
  // Set user context in Sentry
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
  
  // Set user context in Datadog APM (server-side)
  if (tracer && typeof window === 'undefined') {
    tracer.setUser({
      id: user.id,
      email: user.email, 
      name: user.username,
      role: user.role,
    });
  }
  
  // Set user context in Datadog RUM (client-side)
  if (datadogRum && typeof window !== 'undefined') {
    datadogRum.setUser({
      id: user.id,
      email: user.email,
      name: user.username,
      role: user.role,
    });
  }
}

/**
 * Set consistent application context across monitoring platforms
 */
export function setMonitoringAppContext(context: AppContext): void {
  // Set tags in Sentry
  Sentry.setTags({
    'app.version': context.version,
    'app.environment': context.environment,
    'app.releaseStage': context.releaseStage,
  });
  
  // Set global context in Datadog
  if (tracer) {
    tracer.setTags({
      'version': context.version,
      'env': context.environment,
      'release_stage': context.releaseStage,
    });
  }
  
  // Set global context in Datadog RUM
  if (datadogRum && typeof window !== 'undefined') {
    datadogRum.addRumGlobalContext('app', {
      version: context.version,
      environment: context.environment,
      releaseStage: context.releaseStage,
    });
  }
}

/**
 * Clear user context from all monitoring platforms
 */
export function clearMonitoringUserContext(): void {
  Sentry.setUser(null);
  
  if (tracer) {
    tracer.setUser(null);
  }
  
  if (datadogRum && typeof window !== 'undefined') {
    datadogRum.removeUser();
  }
}
```

### 5.2 Error-Trace Correlation

Create bidirectional links between Sentry errors and Datadog traces:

```typescript
// lib/monitoring/correlation.ts
import * as Sentry from '@sentry/nextjs';
import { tracer } from 'dd-trace';

/**
 * Link Datadog trace information to Sentry errors
 * This creates a connection between an error in Sentry and its
 * corresponding performance trace in Datadog
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
        // Create a URL to the trace in Datadog
        const datadogUrl = createDatadogTraceUrl(traceId);
        
        // Add the trace context to Sentry error
        Sentry.withScope((scope) => {
          // Add trace IDs as tags
          scope.setTag('datadog.trace_id', traceId);
          scope.setTag('datadog.span_id', spanId);
          
          // Add direct link to Datadog trace as context
          scope.setContext('datadog', {
            trace_id: traceId,
            span_id: spanId,
            trace_url: datadogUrl,
          });
          
          // Capture the exception with this enriched context
          Sentry.captureException(error);
        });
        
        return; // Successfully linked
      }
    }
    
    // Fallback if we couldn't get trace context
    Sentry.captureException(error);
  } catch (integrationError) {
    console.error('Failed to link Sentry error to Datadog trace:', integrationError);
    // Ensure the original error is still captured
    Sentry.captureException(error);
  }
}

/**
 * Create a URL to the Datadog trace for direct linking
 */
function createDatadogTraceUrl(traceId: string): string {
  const env = process.env.NODE_ENV || 'development';
  const baseUrl = 'https://app.datadoghq.com/apm/trace';
  
  return `${baseUrl}/${traceId}?env=${env}`;
}

/**
 * Add Sentry error information to Datadog spans
 * This creates a connection from a Datadog trace to the 
 * corresponding error in Sentry
 */
export function linkDatadogTraceToSentryError(
  error: Error, 
  sentryEventId: string
): void {
  try {
    // Get the current active span from dd-trace
    const span = tracer.scope().active();
    
    if (span && sentryEventId) {
      // Create a URL to the error in Sentry
      const sentryUrl = createSentryErrorUrl(sentryEventId);
      
      // Tag the current span with Sentry error information
      span.setTag('error', true);
      span.setTag('error.type', error.name);
      span.setTag('error.msg', error.message);
      span.setTag('sentry.event_id', sentryEventId);
      span.setTag('sentry.url', sentryUrl);
    }
  } catch (integrationError) {
    console.error('Failed to link Datadog trace to Sentry error:', integrationError);
  }
}

/**
 * Create a URL to the Sentry error for direct linking
 */
function createSentryErrorUrl(eventId: string): string {
  const env = process.env.NODE_ENV || 'development';
  const orgSlug = process.env.SENTRY_ORG || 'build-apps-with';
  const projectSlug = process.env.SENTRY_PROJECT || 'javascript-nextjs';
  
  return `https://sentry.io/organizations/${orgSlug}/issues/?project=${projectSlug}&query=${eventId}&statsPeriod=14d`;
}
```

### 5.3 Enhanced Error Handler

Update the error handling to work with both platforms:

```typescript
// lib/monitoring/error-handler.ts
import * as Sentry from '@sentry/nextjs';
import { linkSentryErrorToDatadogTrace, linkDatadogTraceToSentryError } from './correlation';

// Import existing error classification system
import { ErrorSeverity, ErrorCategory, ErrorMetadata } from '../sentry';

/**
 * Unified error handler for both Sentry and Datadog
 * @param error The error object
 * @param message Optional error message
 * @param metadata Optional error metadata
 */
export function handleMonitoringError(
  error: Error,
  message?: string,
  metadata?: Partial<ErrorMetadata>
): string {
  try {
    // Process error with standard classification
    const normalizedMetadata = normalizeErrorMetadata(metadata);
    
    // Step 1: Capture in Sentry with the correlation to Datadog
    const sentryEventId = captureWithSentry(error, message, normalizedMetadata);
    
    // Step 2: Link the Datadog trace to the Sentry error
    if (sentryEventId) {
      linkDatadogTraceToSentryError(error, sentryEventId);
    }
    
    return sentryEventId;
  } catch (handlerError) {
    console.error('Error in unified monitoring error handler:', handlerError);
    
    // Fallback to direct Sentry capture
    return Sentry.captureException(error);
  }
}

/**
 * Capture error with Sentry including Datadog correlation
 */
function captureWithSentry(
  error: Error,
  message?: string,
  metadata?: ErrorMetadata
): string {
  const eventId = Sentry.withScope((scope) => {
    // Add error metadata to scope
    if (metadata) {
      // Add standard metadata
      if (metadata.severity) {
        scope.setLevel(convertSeverityToSentryLevel(metadata.severity));
      }
      
      // Add category as a tag
      if (metadata.category) {
        scope.setTag('error.category', metadata.category);
      }
      
      // Add component information
      if (metadata.component) {
        scope.setTag('component', metadata.component);
      }
      
      // Add general tags
      if (metadata.tags) {
        Object.entries(metadata.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      
      // Add all metadata as context
      scope.setContext('error_metadata', metadata);
    }
    
    // Set fingerprint if provided (for error grouping)
    if (metadata?.fingerprint) {
      scope.setFingerprint(metadata.fingerprint);
    }
    
    // Add error message as breadcrumb if provided
    if (message) {
      scope.addBreadcrumb({
        type: 'error',
        level: 'error',
        message: message,
        data: { handled: true },
      });
    }
    
    // Capture the exception and return the event ID
    return Sentry.captureException(error);
  });
  
  return eventId;
}

/**
 * Convert internal severity to Sentry level
 */
function convertSeverityToSentryLevel(severity: ErrorSeverity): Sentry.SeverityLevel {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return 'fatal';
    case ErrorSeverity.HIGH:
      return 'error';
    case ErrorSeverity.MEDIUM:
      return 'warning';
    case ErrorSeverity.LOW:
      return 'info';
    default:
      return 'error';
  }
}

/**
 * Normalize and validate error metadata
 */
function normalizeErrorMetadata(metadata?: Partial<ErrorMetadata>): ErrorMetadata {
  return {
    severity: metadata?.severity || ErrorSeverity.MEDIUM,
    category: metadata?.category || ErrorCategory.SYSTEM,
    source: metadata?.source || (typeof window !== 'undefined' ? 'client' : 'server'),
    component: metadata?.component || 'unknown',
    userImpact: metadata?.userImpact || 'minimal',
    affectedFeature: metadata?.affectedFeature || 'unknown',
    isRecoverable: metadata?.isRecoverable !== undefined ? metadata?.isRecoverable : true,
    retryable: metadata?.retryable !== undefined ? metadata?.retryable : false,
    tags: metadata?.tags || {},
    fingerprint: metadata?.fingerprint,
  };
}
```

### 5.4 Integrated Logger

Update the enhanced logger to properly integrate with both platforms:

```typescript
// lib/monitoring/logger.ts
import * as Sentry from '@sentry/nextjs';
import { datadogLogs } from '@datadog/browser-logs';
import { LogLevel, LogMetadata } from '../enhanced-logger';
import { handleMonitoringError } from './error-handler';

/**
 * Add Datadog log integration to the existing enhanced logger
 */
export function enhanceLoggerWithDatadog(logger) {
  const originalLog = logger.log;
  
  // Override the log method to include Datadog
  logger.log = function(level: LogLevel, message: string, metadata: LogMetadata = {}, error?: Error) {
    // First, call the original logger
    originalLog.call(this, level, message, metadata, error);
    
    // Then, send to Datadog if appropriate
    if (shouldSendToDatadog(level)) {
      sendToDatadog(level, message, metadata, error);
    }
  };
  
  return logger;
}

/**
 * Determine if a log should be sent to Datadog based on level and environment
 */
function shouldSendToDatadog(level: LogLevel): boolean {
  // Skip if Datadog isn't configured
  if (!process.env.DATADOG_API_KEY) {
    return false;
  }
  
  // In development, only send errors and warnings
  if (process.env.NODE_ENV === 'development') {
    return level === 'error' || level === 'warn';
  }
  
  // In test, don't send logs unless explicitly enabled
  if (process.env.NODE_ENV === 'test' && !process.env.DATADOG_ENABLE_TEST) {
    return false;
  }
  
  // In other environments, send all except debug
  return level !== 'debug';
}

/**
 * Send log to Datadog
 */
function sendToDatadog(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
  try {
    // Prepare context for Datadog
    const context = {
      message,
      level,
      ...metadata,
      timestamp: new Date().toISOString(),
    };
    
    // Browser logging (RUM)
    if (typeof window !== 'undefined' && datadogLogs) {
      datadogLogs.logger.log(message, {
        level: level,
        ...metadata,
      });
    } 
    // Server-side logging
    else {
      // Server logs handled by dd-trace integration
      // The console logging from the original logger will be captured
      // No further action needed here
    }
    
    // For errors, ensure we're tracking in both systems
    if (level === 'error' && error) {
      handleMonitoringError(error, message, {
        severity: level === 'error' ? 'high' : 'medium',
        component: metadata.component || 'logger',
        userImpact: metadata.userImpact || 'minimal',
        source: typeof window !== 'undefined' ? 'client' : 'server',
      });
    }
  } catch (datadogError) {
    console.error('Failed to send to Datadog:', datadogError);
  }
}
```

### 5.5 Sampling Strategy

Implement a coordinated sampling strategy to balance coverage and cost:

```typescript
// lib/monitoring/sampling.ts
import { datadogConfig, DatadogEnvironment } from '../datadog/config';
import { sentryConfig } from '../sentry/config';

/**
 * Determine the sampling rate for a particular transaction or operation
 * @param name The transaction name
 * @param type The operation type
 */
export function getCoordinatedSamplingRate(name: string, type: string): number {
  // Get base sampling rates from configuration
  const datadogRate = getDatadogSampleRate(name);
  const sentryRate = getSentrySampleRate(name);
  
  // Critical transactions and errors should always be sampled in both systems
  if (isCriticalTransaction(name) || type === 'error') {
    return 1.0;
  }
  
  // For common transactions, coordinate sampling to avoid duplication
  // Use the higher rate to ensure adequate coverage
  return Math.max(datadogRate, sentryRate);
}

/**
 * Get the Datadog sample rate for a transaction
 */
function getDatadogSampleRate(name: string): number {
  // Use the Datadog configuration to determine sampling
  if (datadogConfig.isCriticalTransaction(name)) {
    return 1.0;
  }
  
  return datadogConfig.getSampleRate();
}

/**
 * Get the Sentry sample rate for a transaction
 */
function getSentrySampleRate(name: string): number {
  // Use the Sentry configuration to determine sampling
  return sentryConfig.shouldSampleTransaction(name);
}

/**
 * Determine if a transaction is considered critical
 */
function isCriticalTransaction(name: string): boolean {
  // Combine critical transaction lists from both systems
  const criticalTransactions = [
    // Datadog critical transactions
    ...datadogConfig.criticalTransactions,
    // Sentry critical transactions
    ...sentryConfig.tracingConfigurations.alwaysSample,
  ];
  
  return criticalTransactions.includes(name);
}
```

## 6. Implementation Guidelines

### 6.1 Initialization Order

The monitoring systems should be initialized in the correct order:

1. First, initialize Datadog APM tracer (server-side)
2. Next, initialize Sentry with correlation capabilities
3. Finally, initialize Datadog RUM (client-side)

```typescript
// instrumentation.ts
export async function register() {
  // Step 1: Initialize Datadog APM (server-side)
  if (process.env.NEXT_RUNTIME === 'nodejs' && shouldEnableDatadog()) {
    await initializeDatadogTracer();
  }
  
  // Step 2: Initialize Sentry with correlation capabilities
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// RUM initialization happens in client components
```

### 6.2 Error Handling Hierarchy

Follow this hierarchy for error handling:

1. Operational errors (API failures, timeouts): Both Sentry and Datadog
2. Exception errors (crashes, unhandled exceptions): Primarily Sentry with Datadog correlation
3. Behavioral errors (abnormal user flows): Primarily Datadog with Sentry for critical issues

### 6.3 Performance Overhead Considerations

1. **Minimize initialization impact**:
   - Use deferred initialization for non-critical monitoring
   - Use environment-based feature flags for granular control

2. **Optimize client-side performance**:
   - Load RUM asynchronously
   - Use session sampling for RUM session replay

3. **Manage server-side overhead**:
   - Use appropriate sampling rates by environment
   - Filter noise and high-cardinality data

## 7. Configuration Management

### 7.1 Environment Variables

| Variable | Required | Default | Description | Used By |
|----------|----------|---------|-------------|---------|
| `DATADOG_API_KEY` | Yes | - | Datadog API key | Datadog APM |
| `DATADOG_APP_KEY` | Yes | - | Datadog application key | Datadog APM |
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | - | Sentry DSN | Sentry |
| `SENTRY_AUTH_TOKEN` | Yes | - | Sentry auth token for source maps | Sentry |
| `ENABLE_MONITORING_INTEGRATION` | No | "true" | Toggle for Sentry-Datadog integration | Both |
| `MONITORING_SAMPLING_RATE` | No | "0.1" | Base sampling rate for both systems | Both |
| `MONITORING_LOG_LEVEL` | No | "error" | Minimum log level for monitoring | Both |

### 7.2 Feature Flags

Implement feature flags for granular control over integration features:

```typescript
// lib/monitoring/flags.ts
export const monitoringFlags = {
  enableIntegration: process.env.ENABLE_MONITORING_INTEGRATION !== 'false',
  enableRumIntegration: process.env.ENABLE_RUM_INTEGRATION !== 'false',
  enableErrorCorrelation: process.env.ENABLE_ERROR_CORRELATION !== 'false',
  enableLogForwarding: process.env.ENABLE_LOG_FORWARDING !== 'false',
};
```

## 8. Implementation Plan

### 8.1 Phase 1: Unified Context (Week 1)
- Implement shared context mechanism
- Update user identification across both platforms
- Test consistent tagging and context propagation

### 8.2 Phase 2: Error-Trace Correlation (Week 2)
- Implement bidirectional linking between errors and traces
- Update error handler to coordinate between platforms
- Test correlation in development environment

### 8.3 Phase 3: Logging Integration (Week 3)
- Enhance existing logger with Datadog integration
- Implement optimized sampling strategy
- Test log correlation with traces and errors

### 8.4 Phase 4: Testing and Verification (Week 4)
- Verify integration in staging environment
- Create documentation and dashboards
- Enable full integration in production

## 9. Conclusion

This integration strategy provides a comprehensive approach to connecting Sentry error monitoring with Datadog performance monitoring. By implementing bidirectional links, consistent context, and optimized sampling, we'll achieve a unified observability platform while maintaining the specialized benefits of each system.

The result will be a more holistic view of application health, enabling faster issue resolution and better understanding of the relationship between performance and errors.