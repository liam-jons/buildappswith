# Calendly Integration Error Handling

*Version: 1.0.0*

This document outlines the comprehensive error handling strategies for the Calendly integration, ensuring robustness, resilience, and a good user experience even when failures occur.

## Overview

The error handling strategy covers multiple layers of the integration:

1. API Client Error Handling
2. Retry Mechanisms
3. Error Boundaries for UI Components
4. Webhook Error Handling
5. Graceful Degradation
6. Transaction Management
7. Circuit Breaker Pattern
8. Centralized Error Handling

## 1. API Client Error Handling

The API client implements structured error handling to categorize and process different types of errors:

```typescript
export class CalendlyApiClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(/* ... */);
      
      if (!response.ok) {
        // Handle different error scenarios based on status code
        switch (response.status) {
          case 400:
            throw new CalendlyError('INVALID_REQUEST', /* ... */);
          case 401:
            throw new CalendlyError('UNAUTHORIZED', /* ... */);
          case 403:
            throw new CalendlyError('FORBIDDEN', /* ... */);
          case 404:
            throw new CalendlyError('NOT_FOUND', /* ... */);
          case 429:
            throw new CalendlyError('RATE_LIMITED', /* ... */);
          default:
            throw new CalendlyError('API_ERROR', /* ... */);
        }
      }
      
      return response.json();
    } catch (error) {
      // Handle network errors and non-HTTP errors
      if (error instanceof CalendlyError) {
        throw error; // Re-throw our custom error
      }
      
      throw new CalendlyError(
        'NETWORK_ERROR',
        'Failed to connect to Calendly API',
        0,
        { originalError: error }
      );
    }
  }
}

/**
 * Custom error class for Calendly-specific errors
 */
export class CalendlyError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public data: any
  ) {
    super(message);
    this.name = 'CalendlyError';
  }
  
  /**
   * Determines if the error is likely temporary and worth retrying
   */
  isRetryable(): boolean {
    return (
      this.status >= 500 || // Server errors
      this.code === 'RATE_LIMITED' ||
      this.code === 'NETWORK_ERROR'
    );
  }
}
```

## 2. Retry Mechanism

The integration implements an exponential backoff retry strategy for recoverable errors:

```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry
      const isRetryable = 
        error instanceof CalendlyError && 
        error.isRetryable() &&
        attempt < retryConfig.maxRetries;
      
      if (!isRetryable) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delayMs = Math.min(
        retryConfig.initialDelayMs * Math.pow(retryConfig.backoffFactor, attempt),
        retryConfig.maxDelayMs
      );
      const jitteredDelay = delayMs * (0.8 + Math.random() * 0.4);
      
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  throw lastError;
}
```

## 3. Error Boundaries for UI Components

React error boundaries are used to prevent UI crashes from Calendly integration issues:

```tsx
export class CalendlyErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log the error to monitoring systems
    logger.error('Calendly component error', {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack
    });
    
    // Report to Sentry
    captureException(error, { extra: { componentStack: info.componentStack } });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-300 rounded bg-red-50">
          <h3 className="text-lg font-medium text-red-800">
            Something went wrong with the scheduling component
          </h3>
          <p className="mt-2 text-sm text-red-700">
            Our team has been notified. Please try again or contact support if the problem persists.
          </p>
          <button
            className="mt-3 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 4. Webhook Error Handling

Webhook processing includes robust error handling to prevent data loss:

```typescript
export async function recordWebhookFailure(
  webhookId: string,
  eventType: string,
  payload: any,
  error: Error
): Promise<void> {
  try {
    // Log detailed error information
    logger.error('Calendly webhook processing failure', {
      webhookId,
      eventType,
      error: error.message,
      stack: error.stack
    });
    
    // Report to monitoring system
    captureException(error, {
      tags: { webhookId, eventType },
      extra: { payload }
    });
    
    // Store the failed webhook for later inspection/retry
    await prisma.webhookFailure.create({
      data: {
        webhookId,
        eventType,
        payload: JSON.stringify(payload),
        errorMessage: error.message,
        errorStack: error.stack,
        createdAt: new Date()
      }
    });
  } catch (recordError) {
    // Last resort error logging
    logger.error('Failed to record webhook failure', {
      webhookId,
      recordError: recordError instanceof Error ? recordError.message : String(recordError),
      originalError: error.message
    });
  }
}

export async function safelyProcessWebhook<T>(
  webhookId: string,
  eventType: string,
  payload: any,
  processFn: (payload: any) => Promise<T>
): Promise<T | null> {
  try {
    return await processFn(payload);
  } catch (error) {
    const actualError = error instanceof Error ? error : new Error(String(error));
    await recordWebhookFailure(webhookId, eventType, payload, actualError);
    return null;
  }
}
```

## 5. Graceful Degradation

The system provides fallback options when Calendly service is degraded:

```typescript
export async function isCalendlyAvailable(): Promise<boolean> {
  try {
    const response = await fetch('https://api.calendly.com/ping', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    return response.ok;
  } catch (error) {
    logger.warn('Calendly availability check failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

export function getFallbackSessionTypes(builderId: string): SessionType[] {
  // Return cached or static session types when Calendly is down
  return [
    {
      id: 'fallback-session-1',
      builderId,
      name: 'Consultation (30 min)',
      description: 'Quick consultation session (fallback mode)',
      duration: 30,
      price: 5000, // $50.00
      isActive: true,
      isFallback: true
    },
    // More fallback session types...
  ];
}
```

## 6. Transaction Management

Database operations use transactions to ensure data consistency:

```typescript
export async function createBookingWithTransaction(
  bookingData: BookingCreateData
): Promise<Booking> {
  // Start a transaction to ensure data consistency
  return prisma.$transaction(async (tx) => {
    try {
      // Create the booking record
      const booking = await tx.booking.create({
        data: {
          ...bookingData,
          status: 'PENDING_SCHEDULING'
        }
      });
      
      // Create related records if needed
      if (bookingData.notes) {
        await tx.bookingNote.create({
          data: {
            bookingId: booking.id,
            content: bookingData.notes,
            createdById: bookingData.clientId
          }
        });
      }
      
      return booking;
    } catch (error) {
      // Log transaction failure
      logger.error('Booking transaction failed', {
        error: error instanceof Error ? error.message : String(error),
        bookingData: {
          builderId: bookingData.builderId,
          clientId: bookingData.clientId,
          sessionTypeId: bookingData.sessionTypeId
        }
      });
      
      // Rethrow to trigger transaction rollback
      throw error;
    }
  });
}
```

## 7. Circuit Breaker Pattern

The circuit breaker pattern prevents cascading failures:

```typescript
enum CircuitState {
  CLOSED,  // Normal operation
  OPEN,    // Failing, reject requests
  HALF_OPEN // Testing if service recovered
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      throw new Error(`Service ${this.serviceName} is unavailable`);
    }
    
    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  // Additional methods for state management...
}

export async function callCalendlyApi<T>(fn: () => Promise<T>): Promise<T> {
  const breaker = getCircuitBreaker('calendly');
  return breaker.execute(fn);
}
```

## 8. Centralized Error Handling

Errors are centrally processed for consistent user messaging:

```typescript
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  AVAILABILITY = 'availability',
  CONNECTION = 'connection',
  TIMEOUT = 'timeout',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

export function categorizeError(error: Error): ErrorCategory {
  if (error instanceof CalendlyError) {
    // Categorize based on error code
  }
  return ErrorCategory.UNKNOWN;
}

export function getUserFriendlyError(error: Error): string {
  const category = categorizeError(error);
  
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return 'Unable to authenticate with the scheduling service. Please try again later.';
    case ErrorCategory.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.';
    // Other categories...
    default:
      return 'An unexpected error occurred. Please try again or contact support.';
  }
}

export function handleCalendlyError(
  error: Error,
  context: Record<string, any> = {}
): { 
  message: string;
  category: ErrorCategory;
  shouldRetry: boolean;
} {
  // Log, report, categorize and get user message
  
  return { message, category, shouldRetry };
}
```

## Error Monitoring and Alerting

In addition to the error handling strategies, proper monitoring and alerting are set up:

1. **Structured Logging**: All errors are logged with context for debugging
2. **Error Aggregation**: Errors are aggregated in Sentry for analysis
3. **Alert Thresholds**: Critical error rates trigger alerts
4. **Error Dashboard**: Real-time monitoring of Calendly integration errors

## Recovery Procedures

For different error scenarios, we implement specific recovery procedures:

1. **API Token Expiration**: Automatic token refresh or failover to backup token
2. **Failed Webhooks**: Scheduled job to retry failed webhook processing
3. **Service Outage**: Automatic fallback to cached data
4. **Database Inconsistencies**: Reconciliation job to fix inconsistent states

## Related Documentation

- [Calendly Integration](./CALENDLY_INTEGRATION.md)
- [Calendly Authentication](./CALENDLY_AUTHENTICATION.md)
- [Calendly Webhook Implementation](./CALENDLY_WEBHOOK_IMPLEMENTATION.md)
- [Calendly Security Considerations](./CALENDLY_SECURITY_CONSIDERATIONS.md)