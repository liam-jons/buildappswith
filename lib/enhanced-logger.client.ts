/**
 * Enhanced logger utility for client-side environments
 * @version 3.0.0 (Client-only)
 */

import * as Sentry from '@sentry/nextjs';
import { ErrorSeverity, ErrorCategory, ErrorMetadata, handleError } from './sentry';
import { getDatadogConfig } from './datadog/config';

// Import Datadog logging for client-side
let datadogLogs: any;
if (typeof window !== 'undefined') {
  // Only import in browser environment
  import('@datadog/browser-logs').then((module) => {
    datadogLogs = module.datadogLogs;
    initializeDatadogLogs();
  }).catch(err => {
    console.warn('Failed to import Datadog browser logs:', err);
  });
}

/**
 * Initialize Datadog logs for client-side
 */
function initializeDatadogLogs() {
  if (!datadogLogs || typeof window === 'undefined') return;
  
  try {
    const config = getDatadogConfig();
    
    // Skip if disabled
    if (!config.enabled) return;
    
    // Skip if already initialized
    if (window.__DD_LOGS_INITIALIZED__) return;
    
    if (!process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) {
      console.warn('Missing Datadog client token - logs will not be sent');
      return;
    }

    datadogLogs.init({
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
      site: config.site,
      service: config.service,
      env: config.env,
      version: config.version,
      forwardErrorsToLogs: true,
      sampleRate: config.logSampleRate,
      beforeSend: (log: any) => {
        // Filter sensitive data
        if (log.http?.url) {
          // Redact potentially sensitive URL parameters
          log.http.url = log.http.url.replace(/([?&](password|token|key|secret|auth)=)[^&]+/gi, '$1[REDACTED]');
        }
        return log;
      },
    });

    // Mark as initialized
    window.__DD_LOGS_INITIALIZED__ = true;
    console.log(`Datadog logs initialized for ${config.env} environment`);
  } catch (error) {
    console.error('Failed to initialize Datadog logs:', error);
  }
}

// Add typings for window
declare global {
  interface Window {
    __DD_LOGS_INITIALIZED__?: boolean;
  }
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: any;
}

interface LogFunction {
  (message: string, metadata?: LogMetadata, error?: Error): void;
}

/**
 * Enhanced structured logger with Sentry integration for client-side
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

    // Send to Datadog (client-side)
    this.sendToDatadog(level, message, metadata, error);
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
          source: 'client',
          component: metadata.component || 'logger',
          userImpact: metadata.userImpact || 'minimal',
          affectedFeature: metadata.affectedFeature || 'unknown',
          isRecoverable: metadata.isRecoverable !== undefined ? metadata.isRecoverable : true,
          retryable: metadata.retryable !== undefined ? metadata.retryable : false,
        };
        
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
   * Send log data to Datadog (client-side)
   */
  private sendToDatadog(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
    const config = getDatadogConfig();
    if (!config.enabled) return;

    try {
      if (typeof window !== 'undefined') {
        // Client-side logging with @datadog/browser-logs
        if (datadogLogs && window.__DD_LOGS_INITIALIZED__) {
          datadogLogs.logger.log(message, {
            level,
            ...metadata,
            error: error ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            } : undefined,
          });
        }
      }
    } catch (datadogError) {
      console.error('Failed to send to Datadog:', datadogError);
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