/**
 * Feature Flag Utilities for E2E Tests
 * 
 * Provides utilities to control feature flag states during tests
 */
import { Page } from '@playwright/test';

/**
 * Default values for feature flags
 */
const defaultFeatureFlagValues: Record<string, boolean> = {
  UseBuilderImage: true,
  UseViewingPreferences: true,
  UseClerkAuth: true,
  UseDynamicMarketplace: true
};

/**
 * Set a feature flag value in localStorage
 * 
 * @param page - Playwright page
 * @param flag - Feature flag name
 * @param value - Flag value (true/false)
 */
export async function setFeatureFlag(
  page: Page,
  flag: string,
  value: boolean
): Promise<void> {
  await page.evaluate(
    ([flagName, flagValue]) => {
      localStorage.setItem(`ff_${flagName}`, flagValue ? 'true' : 'false');
    },
    [flag, value]
  );
}

/**
 * Get current value of a feature flag
 * 
 * @param page - Playwright page
 * @param flag - Feature flag name
 * @returns Current flag value
 */
export async function getFeatureFlag(
  page: Page,
  flag: string
): Promise<boolean> {
  return await page.evaluate((flagName) => {
    const value = localStorage.getItem(`ff_${flagName}`);
    return value === 'true';
  }, flag);
}

/**
 * Set multiple feature flags at once
 * 
 * @param page - Playwright page
 * @param flags - Object with flag names as keys and values as booleans
 */
export async function setFeatureFlags(
  page: Page,
  flags: Record<string, boolean>
): Promise<void> {
  await page.evaluate((flagsObj) => {
    for (const [flagName, flagValue] of Object.entries(flagsObj)) {
      localStorage.setItem(`ff_${flagName}`, flagValue ? 'true' : 'false');
    }
  }, flags);
}

/**
 * Reset a feature flag to its default value
 * 
 * @param page - Playwright page
 * @param flag - Feature flag name
 */
export async function resetFeatureFlag(
  page: Page,
  flag: string
): Promise<void> {
  const defaultValue = defaultFeatureFlagValues[flag];
  
  if (defaultValue !== undefined) {
    await setFeatureFlag(page, flag, defaultValue);
  } else {
    await page.evaluate((flagName) => {
      localStorage.removeItem(`ff_${flagName}`);
    }, flag);
  }
}

/**
 * Reset all feature flags to defaults
 * 
 * @param page - Playwright page
 */
export async function resetAllFeatureFlags(page: Page): Promise<void> {
  await setFeatureFlags(page, defaultFeatureFlagValues);
}

/**
 * Execute a callback with a specific feature flag value
 * and reset it afterwards
 * 
 * @param page - Playwright page
 * @param flag - Feature flag name
 * @param value - Temporary flag value
 * @param callback - Function to execute with feature flag set
 * @returns Result of the callback
 */
export async function withFeatureFlag<T>(
  page: Page,
  flag: string,
  value: boolean,
  callback: () => Promise<T>
): Promise<T> {
  // Store original value
  const originalValue = await getFeatureFlag(page, flag);
  
  try {
    // Set temporary value
    await setFeatureFlag(page, flag, value);
    
    // Execute callback
    return await callback();
  } finally {
    // Restore original value
    await setFeatureFlag(page, flag, originalValue);
  }
}

/**
 * Execute a callback with specific feature flag values
 * and reset them afterwards
 * 
 * @param page - Playwright page
 * @param flags - Object with flag names as keys and values as booleans
 * @param callback - Function to execute with feature flags set
 * @returns Result of the callback
 */
export async function withFeatureFlags<T>(
  page: Page,
  flags: Record<string, boolean>,
  callback: () => Promise<T>
): Promise<T> {
  // Store original values
  const originalValues: Record<string, boolean> = {};
  
  for (const flagName of Object.keys(flags)) {
    originalValues[flagName] = await getFeatureFlag(page, flagName);
  }
  
  try {
    // Set temporary values
    await setFeatureFlags(page, flags);
    
    // Execute callback
    return await callback();
  } finally {
    // Restore original values
    await setFeatureFlags(page, originalValues);
  }
}

/**
 * Usage example:
 * 
 * ```typescript
 * test('test with dynamic marketplace enabled', async ({ page }) => {
 *   await withFeatureFlag(page, 'UseDynamicMarketplace', true, async () => {
 *     // Test code with dynamic marketplace enabled
 *     await page.goto('/marketplace');
 *     // Assertions...
 *   });
 * });
 * 
 * test('test with multiple feature flags', async ({ page }) => {
 *   await withFeatureFlags(page, {
 *     UseDynamicMarketplace: true,
 *     UseBuilderImage: false
 *   }, async () => {
 *     // Test code with specific feature flag configuration
 *   });
 * });
 * ```
 */