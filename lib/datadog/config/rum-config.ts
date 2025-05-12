/**
 * Datadog RUM Configuration
 * 
 * Configuration for Real User Monitoring on the client side
 */

import { getDatadogConfig, DatadogEnvironment, validateEURegion } from './base-config';
import { RumConfig, RumUserInfo } from '../interfaces/rum';

/**
 * Get the RUM configuration for the current environment
 */
export function getRumConfiguration(): RumConfig {
  const config = getDatadogConfig();
  
  const site = process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.eu';
  
  // Validate EU region
  validateEURegion(site);
  
  return {
    enabled: config.enabled,
    applicationId: process.env.NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID || '',
    clientToken: process.env.NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN || '',
    site,
    service: config.service,
    env: config.env,
    version: config.version,
    sessionSampleRate: config.rumSampleRate,
    sessionReplaySampleRate: config.rumSessionReplaySampleRate,
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