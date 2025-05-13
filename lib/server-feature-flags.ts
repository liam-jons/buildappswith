/**
 * Server-side feature flag configuration
 * 
 * This module provides environment-based default settings for 
 * feature flags when accessed from server components.
 */

import { FeatureFlag } from './feature-flags';

// Environment-specific feature flag defaults
const ENVIRONMENT_DEFAULTS: Record<string, Record<FeatureFlag, boolean>> = {
  production: {
    [FeatureFlag.UseBuilderImage]: true, // Enable fixed builder image in production
    [FeatureFlag.UseViewingPreferences]: false,
    [FeatureFlag.UseClerkAuth]: true,
    [FeatureFlag.UseDynamicMarketplace]: true, // Ensure marketplace is enabled in production
  },
  preview: {
    [FeatureFlag.UseBuilderImage]: true,
    [FeatureFlag.UseViewingPreferences]: false,
    [FeatureFlag.UseClerkAuth]: true,
    [FeatureFlag.UseDynamicMarketplace]: true,
  },
  development: {
    [FeatureFlag.UseBuilderImage]: true,
    [FeatureFlag.UseViewingPreferences]: false,
    [FeatureFlag.UseClerkAuth]: true,
    [FeatureFlag.UseDynamicMarketplace]: true,
  },
};

// Default feature flag configuration (if environment not matched)
const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.UseBuilderImage]: true,
  [FeatureFlag.UseViewingPreferences]: false,
  [FeatureFlag.UseClerkAuth]: true,
  [FeatureFlag.UseDynamicMarketplace]: true,
};

/**
 * Get the feature flag defaults for the current environment
 */
export function getServerFeatureFlags(): Record<FeatureFlag, boolean> {
  const env = process.env.NODE_ENV || 'development';
  return ENVIRONMENT_DEFAULTS[env] || DEFAULT_FLAGS;
}

/**
 * Get a specific feature flag value for server-side code
 */
export function getServerFeatureFlag(flag: FeatureFlag): boolean {
  const flags = getServerFeatureFlags();
  return flags[flag];
}