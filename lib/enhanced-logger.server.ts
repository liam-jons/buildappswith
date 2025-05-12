/**
 * Enhanced logger utility for server-side environments
 * @version 4.0.0 (Server-only)
 * 
 * NOTE: Datadog integration temporarily disabled to resolve build issues
 */

import * as Sentry from '@sentry/nextjs';
import { ErrorSeverity, ErrorCategory, ErrorMetadata, handleError } from './sentry';

// NOTE: Datadog imports temporarily disabled
// import { getDatadogConfig } from './datadog/config';
// import { tracer, isServer } from './datadog';

// Define isServer for local use
const isServer = typeof window === 'undefined';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: any;
}

interface LogFunction {
  (message: string, metadata?: LogMetadata, error?: Error): void;
}

/**
 * Enhanced structured logger with Sentry and server-side Datadog integration
 */
export class EnhancedLogger {
  /**
   * Log a debug message
   * @param message The message to log
   * @param metadata Optional metadata to include
   * @param error Optional error object
   */
  debug: LogFunction = (message, metadata = {}, error) => {
    this.log('debug', message, metadata, error);
  };

  /**
   * Log an informational message
   * @param message The message to log
   * @param metadata Optional metadata to include
   * @param error Optional error object
   */
  info: LogFunction = (message, metadata = {}, error) => {
    this.log('info', message, metadata, error);
  };

  /**
   * Log a warning message
   * @param message The message to log
   * @param metadata Optional metadata to include
   * @param error Optional error object
   */
  warn: LogFunction = (message, metadata = {}, error) => {
    this.log('warn', message, metadata, error);
  };

  /**
   * Log an error message with Sentry and Datadog integration
   * @param message The message to log
   * @param metadata Optional metadata to include
   * @param error Optional error object
   */
  error: LogFunction = (message, metadata = {}, error) => {
    this.log('error', message, metadata, error);
  };

  /**
   * Internal logging implementation
   * @param level The log level
   * @param message The message to log
   * @param metadata Optional metadata to include
   * @param error Optional error object
   */
  private log(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level,
      message,
      ...metadata,
    };

    // Send to Sentry for errors and warnings
    if (level === 'error' || level === 'warn') {
      this.sendToSentry(level, message, metadata, error);
    }

    // Console logging based on level
    switch (level) {
      case 'debug':
        console.debug(JSON.stringify(logObject));
        break;
      case 'info':
        console.info(JSON.stringify(logObject));
        break;
      case 'warn':
        console.warn(JSON.stringify(logObject));
        break;
      case 'error':
        console.error(JSON.stringify(logObject));
        break;
      default:
        console.log(JSON.stringify(logObject));
    }

    // Datadog logging temporarily disabled
    // if (isServer) {
    //   this.sendToDatadog(level, message, metadata, error);
    // }
  }

  /**
   * Send log data to Sentry
   */
  private sendToSentry(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
    try {
      if (error) {
        // Map log level to error severity
        const severity = level === 'error'
          ? ErrorSeverity.HIGH
          : ErrorSeverity.MEDIUM;

        // Map log level to error category
        const category = level === 'error'
          ? ErrorCategory.SYSTEM
          : ErrorCategory.SYSTEM;

        // Create a partial error metadata object
        const errorMetadata: Partial<ErrorMetadata> = {
          severity,
          category,
          source: 'server',
          component: metadata.component || 'logger',
          userImpact: metadata.userImpact || 'minimal',
          affectedFeature: metadata.affectedFeature || 'unknown',
          isRecoverable: metadata.isRecoverable !== undefined ? metadata.isRecoverable : true,
          retryable: metadata.retryable !== undefined ? metadata.retryable : false,
        };

        // Add Datadog trace info - temporarily disabled
        /*
        if (isServer) {
          try {
            const span = tracer.scope().active();
            if (span) {
              const context = span.context();
              errorMetadata.datadogTraceId = context.toTraceId();
              errorMetadata.datadogSpanId = context.toSpanId();
            }
          } catch (traceError) {
            console.error('Failed to get Datadog trace info:', traceError);
          }
        }
        */

        // Use the error handling function from the classification system
        handleError(error, message, errorMetadata);
      } else {
        // Log message as event with metadata
        Sentry.withScope((scope) => {
          // Add metadata as extra context
          Object.entries(metadata).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });

          // Add log level as tag
          scope.setTag('log_level', level);

          // Add Datadog trace info - temporarily disabled
          /*
          if (isServer) {
            try {
              const span = tracer.scope().active();
              if (span) {
                const context = span.context();
                scope.setTag('datadog.trace_id', context.toTraceId());
                scope.setTag('datadog.span_id', context.toSpanId());
              }
            } catch (traceError) {
              console.error('Failed to get Datadog trace info:', traceError);
            }
          }
          */

          // Capture message with safe severity mapping
          const severityMap = {
            'error': 'error',
            'warn': 'warning',
            'info': 'info',
            'debug': 'debug'
          };

          // Use safer approach to set severity
          Sentry.captureMessage(
            message,
            {
              level: severityMap[level] || 'info'
            }
          );
        });
      }
    } catch (sentryError) {
      // Fallback if Sentry logging fails
      console.error('Failed to send to Sentry:', sentryError);
    }
  }

  /**
   * Send log data to Datadog (server-side)
   * NOTE: Temporarily disabled to resolve build issues
   */
  private sendToDatadog(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
    // Temporarily disabled
    // Implementation will be restored once build issues are resolved
  }

  /**
   * Log error with code-specific metadata
   * Specialized method for handling coded errors
   */
  logError(code: string, message: string, metadata: LogMetadata = {}, error?: Error) {
    this.error(message, {
      ...metadata,
      error_code: code,
      // Include stack if available and we're not in production
      stack: error?.stack && process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    }, error);
  }

  /**
   * Log and track exceptions (convenience method)
   */
  exception(error: Error, message?: string, metadata: LogMetadata = {}) {
    this.error(message || error.message, {
      ...metadata,
      name: error.name,
    }, error);
  }

  /**
   * Create a child logger with preset context
   * @param context Context to be added to all log entries
   */
  child(context: LogMetadata) {
    const childLogger = new EnhancedLogger();

    // Override log methods to include context
    childLogger.log = (level, message, metadata, error) => {
      this.log(level, message, { ...context, ...metadata }, error);
    };

    return childLogger;
  }
}

// Export singleton instance for app-wide usage
export const enhancedLogger = new EnhancedLogger();

// Export utility for domain-specific loggers
export function createDomainLogger(domain: string, defaultMetadata: LogMetadata = {}) {
  return enhancedLogger.child({
    domain,
    ...defaultMetadata,
  });
}