/**
 * Datadog Logs Client Implementation
 * 
 * Client-side implementation of the Logs interface for browsers.
 */

import { LogsInterface, LogsConfig } from '../interfaces/logs';
import { validateLogsEnvironmentVariables } from '../config/logs-config';

// Singleton state
let logsInitialized = false;
let datadogLogs: any = null;

/**
 * Client-side implementation of the Logs interface
 */
export const logs: LogsInterface = {
  /**
   * Initialize Logs for client-side monitoring
   */
  init(config: LogsConfig): boolean {
    // Skip if already initialized
    if (logsInitialized) return false;

    try {
      // Validate EU region
      if (config.site !== 'datadoghq.eu') {
        console.warn('Warning: Datadog Logs not configured for EU region (datadoghq.eu)');
      }

      // Skip if disabled or missing required environment variables
      if (!config.enabled || !validateLogsEnvironmentVariables()) {
        return false;
      }

      // Lazily import Logs SDK to avoid server-side inclusion
      import('@datadog/browser-logs').then(module => {
        datadogLogs = module.datadogLogs;
        
        try {
          // Initialize Logs
          datadogLogs.init({
            clientToken: config.clientToken,
            site: config.site,
            service: config.service,
            env: config.env,
            version: config.version,
            forwardErrorsToLogs: config.forwardErrorsToLogs,
            sampleRate: config.sampleRate,
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
          logsInitialized = true;
          console.log(`Datadog logs initialized for ${config.env} environment`);
        } catch (error) {
          console.error('Failed to initialize Datadog logs:', error);
        }
      }).catch(err => {
        console.warn('Failed to import Datadog browser logs:', err);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Datadog logs:', error);
      return false;
    }
  },

  /**
   * Logger methods
   */
  logger: {
    log(message: string, context?: Record<string, any>): void {
      if (!logsInitialized || !datadogLogs) return;
      try {
        datadogLogs.logger.log(message, context);
      } catch (error) {
        console.error('Failed to log to Datadog:', error);
      }
    },

    debug(message: string, context?: Record<string, any>): void {
      if (!logsInitialized || !datadogLogs) return;
      try {
        datadogLogs.logger.debug(message, context);
      } catch (error) {
        console.error('Failed to log debug to Datadog:', error);
      }
    },

    info(message: string, context?: Record<string, any>): void {
      if (!logsInitialized || !datadogLogs) return;
      try {
        datadogLogs.logger.info(message, context);
      } catch (error) {
        console.error('Failed to log info to Datadog:', error);
      }
    },

    warn(message: string, context?: Record<string, any>): void {
      if (!logsInitialized || !datadogLogs) return;
      try {
        datadogLogs.logger.warn(message, context);
      } catch (error) {
        console.error('Failed to log warning to Datadog:', error);
      }
    },

    error(message: string, context?: Record<string, any>): void {
      if (!logsInitialized || !datadogLogs) return;
      try {
        datadogLogs.logger.error(message, context);
      } catch (error) {
        console.error('Failed to log error to Datadog:', error);
      }
    }
  },

  /**
   * Set global context for logs
   */
  setGlobalContext(context: Record<string, any>): void {
    if (!logsInitialized || !datadogLogs) return;
    
    try {
      datadogLogs.setGlobalContext(context);
    } catch (error) {
      console.error('Failed to set logs global context:', error);
    }
  },

  /**
   * Get the underlying logs instance if available
   */
  getInstance(): any {
    return datadogLogs;
  }
};