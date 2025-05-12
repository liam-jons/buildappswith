/**
 * Datadog Interfaces
 * 
 * This file exports all the interface definitions for Datadog services.
 * These interfaces are safe to use in both client and server environments.
 */

export * from './rum';
export * from './logs';
export * from './tracer';
export * from './trace-context';

// Common interface for environment detection
export interface EnvironmentInfo {
  isBrowser: boolean;
  isServer: boolean;
  nodeEnv: string;
}

// Common interface for service information
export interface ServiceInfo {
  service: string;
  version: string;
  env: string;
}