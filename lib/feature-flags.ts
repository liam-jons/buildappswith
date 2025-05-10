"use client";

/**
 * Feature Flag Utility
 * 
 * A simple feature flag system to enable/disable components or features
 * for debugging and testing purposes.
 */

// Define available feature flags
export enum FeatureFlag {
  UseBuilderImage = 'useBuilderImage',
  UseViewingPreferences = 'useViewingPreferences',
  UseClerkAuth = 'useClerkAuth',
  UseDynamicMarketplace = 'useDynamicMarketplace',
}

// Default flags state (problematic components disabled by default)
const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.UseBuilderImage]: false, // Disabled by default
  [FeatureFlag.UseViewingPreferences]: false, // Disabled by default
  [FeatureFlag.UseClerkAuth]: true,
  [FeatureFlag.UseDynamicMarketplace]: true,
};

// Check for stored flags or use defaults
const getInitialFlags = (): Record<FeatureFlag, boolean> => {
  if (typeof window === 'undefined') {
    return DEFAULT_FLAGS;
  }

  try {
    // Force reset feature flags to default (temporarily commented out to use defaults)
    // localStorage.removeItem('feature-flags');

    const storedFlags = localStorage.getItem('feature-flags');
    // Use DEFAULT_FLAGS to ensure problematic components are disabled
    return DEFAULT_FLAGS;
  } catch (error) {
    console.error('Error reading feature flags:', error);
    return DEFAULT_FLAGS;
  }
};

// Current flags state
let currentFlags = getInitialFlags();

// Get a specific flag value
export function getFeatureFlag(flag: FeatureFlag): boolean {
  return currentFlags[flag];
}

// Set a specific flag value
export function setFeatureFlag(flag: FeatureFlag, value: boolean): void {
  currentFlags = {
    ...currentFlags,
    [flag]: value,
  };
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('feature-flags', JSON.stringify(currentFlags));
    } catch (error) {
      console.error('Error saving feature flags:', error);
    }
  }
}

// Reset all flags to default values
export function resetFeatureFlags(): void {
  currentFlags = DEFAULT_FLAGS;
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('feature-flags', JSON.stringify(DEFAULT_FLAGS));
    } catch (error) {
      console.error('Error resetting feature flags:', error);
    }
  }
}

// Get all current flag values
export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  return { ...currentFlags };
}

// Debug utility to toggle flags in console
if (typeof window !== 'undefined') {
  (window as any).featureFlags = {
    get: getFeatureFlag,
    set: setFeatureFlag,
    reset: resetFeatureFlags,
    getAll: getAllFeatureFlags,
  };
  
  console.info(
    'Feature flags available in console via: window.featureFlags.get/set/reset/getAll'
  );
}