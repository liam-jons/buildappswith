/**
 * Simple Logger Module
 * 
 * Provides a consistent logging interface with different log levels.
 * In production, this could be extended to integrate with services like
 * Sentry, Datadog, or Logflare for better observability.
 * 
 * @version 1.0.64
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  [key: string]: any;
}

/**
 * Log a message with the specified level and optional payload data
 */
function log(level: LogLevel, message: string, payload?: LogPayload) {
  // Get current timestamp in ISO format
  const timestamp = new Date().toISOString();
  
  // Format the log message
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  // Log to console with appropriate method
  switch (level) {
    case 'debug':
      if (process.env.NODE_ENV !== 'production') {
        console.debug(formattedMessage, payload || '');
      }
      break;
    case 'info':
      console.info(formattedMessage, payload || '');
      break;
    case 'warn':
      console.warn(formattedMessage, payload || '');
      break;
    case 'error':
      console.error(formattedMessage, payload || '');
      break;
  }
  
  // In a production implementation, you could add additional logic:
  // - Send logs to a service like Sentry, Datadog, or Logflare
  // - Filter logs based on environment
  // - Add request ID for request tracking
  // - Add user ID for user-specific issues
}

/**
 * Logger object with methods for different log levels
 */
export const logger = {
  debug: (message: string, payload?: LogPayload) => log('debug', message, payload),
  info: (message: string, payload?: LogPayload) => log('info', message, payload),
  warn: (message: string, payload?: LogPayload) => log('warn', message, payload),
  error: (message: string, payload?: LogPayload) => log('error', message, payload),
};
