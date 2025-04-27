/**
 * Logger utility for structured logging
 * @version 1.0.110
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: any;
}

interface LogFunction {
  (message: string, metadata?: LogMetadata): void;
}

/**
 * Structured logger with support for different log levels and metadata
 */
class Logger {
  /**
   * Log a debug message
   * @param message The message to log
   * @param metadata Optional metadata to include
   */
  debug: LogFunction = (message, metadata = {}) => {
    this.log('debug', message, metadata);
  };

  /**
   * Log an informational message
   * @param message The message to log
   * @param metadata Optional metadata to include
   */
  info: LogFunction = (message, metadata = {}) => {
    this.log('info', message, metadata);
  };

  /**
   * Log a warning message
   * @param message The message to log
   * @param metadata Optional metadata to include
   */
  warn: LogFunction = (message, metadata = {}) => {
    this.log('warn', message, metadata);
  };

  /**
   * Log an error message
   * @param message The message to log
   * @param metadata Optional metadata to include
   */
  error: LogFunction = (message, metadata = {}) => {
    this.log('error', message, metadata);
  };

  /**
   * Internal logging implementation
   * @param level The log level
   * @param message The message to log
   * @param metadata Optional metadata to include
   */
  private log(level: LogLevel, message: string, metadata: LogMetadata) {
    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level,
      message,
      ...metadata,
    };

    // In production, we would use a proper logging service
    // For now, we'll just use console
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
  }
}

export const logger = new Logger();
