/**
 * Unified logger utility for production build compatibility
 * Version: 1.0.0
 * 
 * This is a production-ready logger that works in both client and server environments
 * with integrated Sentry reporting and EU data compliance.
 */

import * as Sentry from '@sentry/nextjs';

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// EU region compliance configuration
const EU_COMPLIANCE = process.env.NEXT_PUBLIC_ENABLE_EU_COMPLIANCE === 'true';
const EU_REGION = process.env.NEXT_PUBLIC_DATA_REGION === 'eu';

// Re-export error classification from Sentry for backward compatibility
import { ErrorSeverity, ErrorCategory } from './sentry/error-classification';
export { ErrorSeverity, ErrorCategory };

// Define common types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMetadata {
  [key: string]: any;
}

export interface LogFunction {
  (message: string, metadata?: LogMetadata, error?: Error): void;
}

// Private helper to sanitize PII data for EU compliance
function sanitizeForEUCompliance(data: any): any {
  if (!EU_COMPLIANCE || !data) return data;

  // Handle different data types
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeForEUCompliance);

  // Handle object type
  const result = {...data};
  const piiFields = ['email', 'name', 'fullName', 'phone', 'address', 'ip', 'userAgent'];

  // Sanitize known PII fields
  for (const key of Object.keys(result)) {
    // Check if field name suggests PII content
    if (piiFields.some(field => key.toLowerCase().includes(field))) {
      if (typeof result[key] === 'string') {
        result[key] = '[REDACTED]';
      }
    }

    // Recursively sanitize nested objects
    if (result[key] && typeof result[key] === 'object') {
      result[key] = sanitizeForEUCompliance(result[key]);
    }
  }

  return result;
}

// Initialize Datadog if available
let datadogLogs: any;
try {
  if (isBrowser && typeof window !== 'undefined') {
    // We're using dynamic import for Datadog to prevent build issues
    import('@datadog/browser-logs').then((module) => {
      datadogLogs = module.datadogLogs;
      // Datadog initialization will be handled by the RUM provider
    }).catch(() => {
      // Silently fail if Datadog is not available
    });
  }
} catch (e) {
  // Ignore errors in Datadog import
}

/**
 * Enhanced logger class with unified functionality
 */
export class Logger {
  // Context for this logger instance
  private context: LogMetadata = {};

  // Enabled state is determined by environment
  private static _enabled = process.env.NODE_ENV !== 'production' ||
                           process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true';

  constructor(context: LogMetadata = {}) {
    this.context = context;
  }

  /**
   * Log a debug message
   */
  debug: LogFunction = (message, metadata = {}, error) => {
    this.log('debug', message, metadata, error);
  };

  /**
   * Log an informational message
   */
  info: LogFunction = (message, metadata = {}, error) => {
    this.log('info', message, metadata, error);
  };

  /**
   * Log a warning message
   */
  warn: LogFunction = (message, metadata = {}, error) => {
    this.log('warn', message, metadata, error);
  };

  /**
   * Log an error message
   */
  error: LogFunction = (message, metadata = {}, error) => {
    this.log('error', message, metadata, error);
  };

  /**
   * Log an exception with context
   */
  exception = (error: Error, message?: string, metadata: LogMetadata = {}) => {
    this.error(message || error.message, {
      ...metadata,
      name: error.name,
    }, error);
  };

  /**
   * Log an error with a specific error code
   */
  logError = (code: string, message: string, metadata: LogMetadata = {}, error?: Error) => {
    this.error(message, {
      ...metadata,
      error_code: code,
      stack: error?.stack && process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    }, error);
  };

  /**
   * Create a child logger with additional context
   */
  child = (childContext: LogMetadata) => {
    const childLogger = new Logger({
      ...this.context,
      ...childContext
    });
    return childLogger;
  };

  /**
   * Internal logging implementation
   */
  protected log(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
    if (!Logger._enabled) return;

    // Combine context with provided metadata
    const combinedMetadata = {
      ...this.context,
      ...metadata
    };

    // Apply EU compliance sanitization
    const sanitizedMetadata = sanitizeForEUCompliance(combinedMetadata);

    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level,
      message,
      environment: isBrowser ? 'client' : 'server',
      region: EU_REGION ? 'eu' : 'global',
      ...sanitizedMetadata,
    };

    // Send errors and warnings to Sentry
    if ((level === 'error' || level === 'warn') && error) {
      try {
        Sentry.captureException(error, {
          level: level === 'error' ? 'error' : 'warning',
          tags: {
            log_level: level,
            region: EU_REGION ? 'eu' : 'global',
          },
          extra: { ...sanitizedMetadata, message }
        });
      } catch (e) {
        console.error('Failed to send to Sentry:', e);
      }
    }

    // Send to Datadog if available
    this.sendToDatadog(level, message, sanitizedMetadata, error);

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
        if (error) {
          console.error(error);
        }
        break;
      default:
        console.log(JSON.stringify(logObject));
    }
  }

  /**
   * Send log data to Datadog
   */
  private sendToDatadog(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
    // Client-side logging with Datadog browser logs
    if (isBrowser && datadogLogs && typeof window !== 'undefined' && window.__DD_LOGS_INITIALIZED__) {
      try {
        datadogLogs.logger.log(message, {
          level,
          ...metadata,
          error: error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          } : undefined,
        });
      } catch (e) {
        // Silently fail if Datadog logging fails
      }
    }

    // Server-side logging via dd-trace is handled automatically via console methods
  }

  /**
   * Enable or disable logging
   */
  static setEnabled(enabled: boolean) {
    Logger._enabled = enabled;
  }

  /**
   * Check if logging is enabled
   */
  static isEnabled() {
    return Logger._enabled;
  }
}

// Add typings for window
declare global {
  interface Window {
    __DD_LOGS_INITIALIZED__?: boolean;
  }
}

// Export singleton instance for app-wide usage
export const logger = new Logger();

// Export utility for domain-specific loggers with the same API as enhanced-logger
export function createDomainLogger(domain: string, defaultMetadata: LogMetadata = {}) {
  return logger.child({
    domain,
    ...defaultMetadata,
  });
}

// For backward compatibility with enhanced-logger
export const enhancedLogger = logger;
export class EnhancedLogger extends Logger {}