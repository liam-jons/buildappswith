/**
 * Enhanced logger utility with environment detection
 * @version 3.1.0
 * 
 * This file is a cross-environment entry point that dynamically imports
 * the appropriate logger implementation based on the current environment.
 */

// Re-export error classification types for convenience
export { ErrorSeverity, ErrorCategory } from './sentry';

// Define common types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMetadata {
  [key: string]: any;
}

export interface LogFunction {
  (message: string, metadata?: LogMetadata, error?: Error): void;
}

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Import the appropriate implementation
let implementationModule;
try {
  // Dynamic import will be handled at build time
  implementationModule = isBrowser 
    ? require('./enhanced-logger.client')
    : require('./enhanced-logger.server');
} catch (err) {
  console.warn(`Failed to load logger implementation for ${isBrowser ? 'client' : 'server'}: ${err}`);
  // Fallback implementation will be used
}

/**
 * Fallback logger implementation when the environment-specific one fails to load
 */
class FallbackLogger {
  debug(message: string, metadata = {}) {
    console.debug(JSON.stringify({ level: 'debug', message, ...metadata }));
  }

  info(message: string, metadata = {}) {
    console.info(JSON.stringify({ level: 'info', message, ...metadata }));
  }

  warn(message: string, metadata = {}) {
    console.warn(JSON.stringify({ level: 'warn', message, ...metadata }));
  }

  error(message: string, metadata = {}, error?: Error) {
    console.error(JSON.stringify({ 
      level: 'error', 
      message, 
      ...metadata,
      error: error ? { name: error.name, message: error.message } : undefined,
    }));
  }

  logError(code: string, message: string, metadata = {}, error?: Error) {
    this.error(message, { ...metadata, error_code: code }, error);
  }

  exception(error: Error, message?: string, metadata = {}) {
    this.error(message || error.message, metadata, error);
  }

  child(context: LogMetadata) {
    return new FallbackLogger();
  }
}

// Export the appropriate implementation or fallback
export const enhancedLogger = implementationModule?.enhancedLogger || new FallbackLogger();
export const createDomainLogger = implementationModule?.createDomainLogger || 
  ((domain: string, defaultMetadata = {}) => new FallbackLogger());
export const EnhancedLogger = implementationModule?.EnhancedLogger || FallbackLogger;