# Structured Logging in Buildappswith

*Version: 1.0.110*

This document provides an overview of the structured logging implementation in the Buildappswith platform.

## Introduction

Structured logging is a critical part of our observability strategy, enabling us to effectively monitor application behavior, troubleshoot issues, and analyze usage patterns. The platform uses a centralized logging utility with standardized formats and severity levels.

## Logging Utility

The core logging functionality is provided by `lib/logger.ts`, which implements:

- Multiple severity levels (debug, info, warn, error)
- Structured JSON output with consistent fields
- Metadata support for context-rich logging
- Timestamp inclusion in ISO 8601 format

## Logging Levels

The logging utility supports the following levels:

1. **DEBUG**: Detailed information for debugging purposes
2. **INFO**: General information about system operation
3. **WARN**: Warning conditions that don't affect normal operation
4. **ERROR**: Error conditions that require attention

## Logging Format

All log entries follow a consistent JSON format:

```json
{
  "timestamp": "2025-04-26T15:30:45.123Z",
  "level": "info",
  "message": "The main log message",
  "additionalField1": "Additional context",
  "additionalField2": "More context"
}
```

## Usage Guidelines

### Basic Usage

```typescript
import { logger } from '@/lib/logger';

// Simple log
logger.info('User logged in');

// Log with context metadata
logger.info('Payment received', { 
  userId: '123', 
  amount: 99.99,
  currency: 'USD' 
});

// Error logging
try {
  // Some operation
} catch (error) {
  logger.error('Operation failed', { 
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
}
```

### Standard Metadata Fields

When logging, include these standard fields where applicable:

- **userId**: For user-related actions
- **sessionId**: For tracking related operations
- **requestId**: For HTTP request tracking
- **path**: For file/route-related logs
- **duration**: For performance-related logs (in ms)

### Production vs Development

In production, logs are formatted as JSON for machine parsing. In development, logs are formatted for human readability but maintain the same structure.

## Sensitive Information

Never log:

- Passwords or authentication tokens
- Full credit card numbers
- Personal identification information
- Raw webhook signatures
- API keys or secrets

## Domain-Specific Logging

### API Routes

API routes should log:

- Request receipt (INFO level)
- Request validation results (DEBUG level)
- Successful responses (INFO level)
- Client errors (WARN level)
- Server errors (ERROR level)

### Authentication

Authentication events should log:

- Login attempts (INFO level)
- Authentication failures (WARN level)
- Permission denials (WARN level)
- Token validation issues (WARN level)

### Payment Processing

Payment events should log:

- Checkout initiation (INFO level)
- Session creation (INFO level)
- Webhook receipt (INFO level)
- Payment success (INFO level)
- Payment failure (WARN level)
- Processing errors (ERROR level)

## Integration with Monitoring

In production, logs are collected and sent to our monitoring system for:

- Alerting on error conditions
- Dashboard visualization
- Pattern analysis
- Anomaly detection

## Future Enhancements

Planned enhancements to the logging system include:

1. Log sampling for high-volume events
2. Correlation IDs for tracing requests across services
3. Enhanced PII detection and redaction
4. Performance optimization for high-throughput scenarios
5. Integration with APM tools for deeper insights

## Implementation Example

The implementation in `lib/logger.ts` provides a clean, type-safe interface:

```typescript
// Interface for log metadata
interface LogMetadata {
  [key: string]: any;
}

// Interface for log functions
interface LogFunction {
  (message: string, metadata?: LogMetadata): void;
}

// Structured logger class
class Logger {
  debug: LogFunction = (message, metadata = {}) => {
    this.log('debug', message, metadata);
  };
  
  info: LogFunction = (message, metadata = {}) => {
    this.log('info', message, metadata);
  };
  
  warn: LogFunction = (message, metadata = {}) => {
    this.log('warn', message, metadata);
  };
  
  error: LogFunction = (message, metadata = {}) => {
    this.log('error', message, metadata);
  };
  
  private log(level: string, message: string, metadata: LogMetadata) {
    // Log implementation
  }
}
```

## Best Practices

1. **Be Specific**: Include enough detail to understand what happened
2. **Be Concise**: Avoid overly verbose messages that add noise
3. **Be Consistent**: Use standardized message formats and metadata fields
4. **Be Mindful**: Consider log volume and performance impact
5. **Be Secure**: Never log sensitive information
