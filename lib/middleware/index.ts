/**
 * Middleware Module Index
 * Version: 1.1.0
 * 
 * Exports middleware components and configuration
 */

// Core configuration
export * from './config';
export * from './factory';

// Middleware components
export * from './api-protection';
export * from './validation';
export * from './performance';
export * from './error-handling';
export * from './logging';
export * from './profile-auth';
export * from './rbac';

// Re-export with version tracking
export const MIDDLEWARE_VERSION = '1.1.0';
