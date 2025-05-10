/**
 * Logger utility for structured logging with Sentry integration
 * @version 2.0.0
 */

import * as Sentry from '@sentry/nextjs';
import { ErrorSeverity, ErrorCategory, ErrorMetadata, handleError } from './sentry';

// Define log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Define local mapping for Sentry severity levels to avoid import dependencies
const SEVERITY_MAPPING = {
  debug: 'debug',
  info: 'info',
  warn: 'warning',
  error: 'error',
  critical: 'fatal'
} as const;

interface LogMetadata {
  [key: string]: any;
}

interface LogFunction {
  (message: string, metadata?: LogMetadata, error?: Error): void;
}

/**
 * Enhanced structured logger with Sentry integration
 */
class Logger {
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
   * Log an error message with Sentry integration
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
  protected log(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
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

    // In production or staging, we'd send to a centralized logging service
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
      this.sendToLoggingService(logObject);
    }
  }

  /**
   * Send log data to Sentry
   */
  protected sendToSentry(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
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
          source: metadata.source || (typeof window !== 'undefined' ? 'client' : 'server'),
          component: metadata.component || 'logger',
          userImpact: metadata.userImpact || 'minimal',
          affectedFeature: metadata.affectedFeature || 'unknown',
          isRecoverable: metadata.isRecoverable !== undefined ? metadata.isRecoverable : true,
          retryable: metadata.retryable !== undefined ? metadata.retryable : false,
        };
        
        // Use the error handling function from the classification system
        handleError(error, message, errorMetadata);
      } else {
        // Safe capture message implementation
        this.safeCaptureMessage(message, level, metadata);
      }
    } catch (sentryError) {
      // Fallback if Sentry logging fails
      console.debug('Failed to send to Sentry:', sentryError);
    }
  }
  
  /**
   * Safely capture a message with Sentry using capability detection
   */
  private safeCaptureMessage(message: string, level: LogLevel, metadata: LogMetadata) {
    // Only try if Sentry is available
    if (!Sentry) return;
    
    try {
      // Try to use withScope for richer context if available
      if (typeof Sentry.withScope === 'function') {
        Sentry.withScope((scope) => {
          // Add metadata as extra context if possible
          if (typeof scope.setExtra === 'function') {
            Object.entries(metadata).forEach(([key, value]) => {
              scope.setExtra(key, value);
            });
          }
          
          // Add log level as a tag if possible
          if (typeof scope.setTag === 'function') {
            scope.setTag('log_level', level);
          }
          
          // Set severity level if possible
          if (typeof scope.setLevel === 'function') {
            scope.setLevel(SEVERITY_MAPPING[level] as any);
          }
          
          // Finally capture the message
          if (typeof Sentry.captureMessage === 'function') {
            Sentry.captureMessage(message);
          }
        });
      } 
      // Fallback to direct captureMessage without context
      else if (typeof Sentry.captureMessage === 'function') {
        Sentry.captureMessage(message);
      }
    } catch (e) {
      console.debug('Error capturing message with Sentry:', e);
    }
  }

  /**
   * Send log data to centralized logging service
   * Implementation would depend on the selected logging service
   */
  protected sendToLoggingService(logData: any) {
    // Example implementation - can be expanded with actual service
    // This could be DataDog, CloudWatch, LogDNA, etc.
    if (process.env.DATADOG_API_KEY) {
      // Example: Send to DataDog
      // datadogLogs.logger.log(logData.message, {
      //   level: logData.level,
      //   ...logData,
      // });
    }
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
    const childLogger = new Logger();

    // Override log methods to include context
    const originalLog = childLogger.log;
    childLogger.log = (level, message, metadata, error) => {
      originalLog.call(childLogger, level, message, { ...context, ...metadata }, error);
    };

    return childLogger;
  }
}

// Export singleton instance for app-wide usage
export const logger = new Logger();

// Export utility for domain-specific loggers
export function createDomainLogger(domain: string, defaultMetadata: LogMetadata = {}) {
  return logger.child({
    domain,
    ...defaultMetadata,
  });
}