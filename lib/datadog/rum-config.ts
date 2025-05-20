/**
 * Datadog RUM Configuration
 * 
 * Configuration for Real User Monitoring on the client side
 */

import { getDatadogConfig, DatadogEnvironment } from './config';

/**
 * RUM specific configuration
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
  replaySampleRate: number;
  trackInteractions: boolean;
  trackResources: boolean;
  trackLongTasks: boolean;
  defaultPrivacyLevel: 'allow' | 'mask' | 'mask-user-input' | 'forbid';
  actionNameAttribute: string;
}

/**
 * Get the RUM configuration for the current environment
 */
export function getRumConfiguration(): RumConfig {
  const config = getDatadogConfig();
  
  return {
    enabled: config.enabled,
    applicationId: process.env.NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID || '',
    clientToken: process.env.NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN || '',
    site: process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.eu',
    service: config.service,
    env: config.env,
    version: config.version,
    sessionSampleRate: config.rumSampleRate,
    replaySampleRate: config.rumSessionReplaySampleRate,
    trackInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
    actionNameAttribute: 'data-dd-action-name',
  };
}

/**
 * Validates that all required environment variables are set for RUM
 */
export function validateRumEnvironmentVariables(): boolean {
  const missing: string[] = [];
  
  if (!process.env.NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID) {
    missing.push('NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID');
  }
  
  if (!process.env.NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN) {
    missing.push('NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN');
  }
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables for Datadog RUM: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
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
 * Sanitizes user information for RUM to ensure privacy compliance
 */
export function sanitizeRumUserInfo(userInfo: RumUserInfo): RumUserInfo {
  return {
    id: userInfo.id, // Required
    name: userInfo.name,
    email: userInfo.email,
    role: userInfo.role,
    // Add only specific allowed custom properties
    ...(userInfo.plan ? { plan: userInfo.plan } : {}),
    ...(userInfo.accountType ? { accountType: userInfo.accountType } : {}),
  };
}