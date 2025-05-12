/**
 * Datadog Real User Monitoring (RUM) Interface
 * 
 * This file defines the interface for interacting with Datadog RUM
 * in a platform-agnostic way. Implementations for different environments
 * are provided separately.
 */

import { DatadogEnvironment } from '../config/base-config';

/**
 * Configuration for Real User Monitoring
 */
export interface RumConfig {
  enabled: boolean;
  applicationId: string;
  clientToken: string;
  site: string;
  service: string;
  env: DatadogEnvironment;
  version: string;
  sessionSampleRate: number;
  sessionReplaySampleRate: number;
  trackInteractions: boolean;
  trackResources: boolean;
  trackLongTasks: boolean;
  defaultPrivacyLevel: 'allow' | 'mask' | 'mask-user-input' | 'forbid';
  actionNameAttribute: string;
}

/**
 * User information to associate with RUM sessions
 */
export interface RumUserInfo {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any; // Additional custom user properties
}

/**
 * Interface for Datadog RUM operations
 */
export interface RumInterface {
  /**
   * Initialize the RUM service
   * @param config Configuration for RUM
   * @returns Boolean indicating if initialization was successful
   */
  init(config: RumConfig): boolean;

  /**
   * Set user information for RUM
   * @param user User information or null to clear
   */
  setUser(user: RumUserInfo | null): void;

  /**
   * Set global context for RUM
   * @param context Context object
   */
  setGlobalContext(context: Record<string, any>): void;

  /**
   * Add a user action
   * @param name Action name
   * @param context Additional context
   */
  addAction(name: string, context?: Record<string, any>): void;

  /**
   * Add an error to the current session
   * @param error Error object or message
   * @param context Additional context
   */
  addError(error: Error | string, context?: Record<string, any>): void;

  /**
   * Start tracking a user session
   */
  startSession(): void;

  /**
   * Stop tracking the current user session
   */
  stopSession(): void;

  /**
   * Get the underlying RUM instance if available
   */
  getInstance(): any;
}