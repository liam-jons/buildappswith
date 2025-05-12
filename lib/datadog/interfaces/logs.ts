/**
 * Datadog Logs Interface
 * 
 * This file defines the interface for interacting with Datadog Logs
 * in a platform-agnostic way. Implementations for different environments
 * are provided separately.
 */

import { DatadogEnvironment } from '../config/base-config';

/**
 * Configuration for Datadog Logs
 */
export interface LogsConfig {
  enabled: boolean;
  clientToken: string;
  site: string;
  service: string;
  env: DatadogEnvironment;
  version: string;
  sampleRate: number;
  forwardErrorsToLogs: boolean;
}

/**
 * Interface for Datadog Logs operations
 */
export interface LogsInterface {
  /**
   * Initialize the logs service
   * @param config Configuration for logs
   * @returns Boolean indicating if initialization was successful
   */
  init(config: LogsConfig): boolean;

  /**
   * Log methods
   */
  logger: {
    /**
     * Log a message at any level
     * @param message The message to log
     * @param context Additional context
     */
    log(message: string, context?: Record<string, any>): void;

    /**
     * Log a debug message
     * @param message The message to log
     * @param context Additional context
     */
    debug(message: string, context?: Record<string, any>): void;

    /**
     * Log an info message
     * @param message The message to log
     * @param context Additional context
     */
    info(message: string, context?: Record<string, any>): void;

    /**
     * Log a warning message
     * @param message The message to log
     * @param context Additional context
     */
    warn(message: string, context?: Record<string, any>): void;

    /**
     * Log an error message
     * @param message The message to log
     * @param context Additional context
     */
    error(message: string, context?: Record<string, any>): void;
  };

  /**
   * Set global context for logs
   * @param context Context object
   */
  setGlobalContext(context: Record<string, any>): void;

  /**
   * Get the underlying logs instance if available
   */
  getInstance(): any;
}