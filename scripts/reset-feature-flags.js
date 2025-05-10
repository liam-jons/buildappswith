#!/usr/bin/env node

/**
 * Reset Feature Flags
 * 
 * This script resets all feature flags to their default values,
 * removing any localStorage settings that may be causing issues.
 * 
 * Usage:
 *   node scripts/reset-feature-flags.js
 */

console.log('🚩 Resetting feature flags to default values...');

// Default flag values
const DEFAULT_FLAGS = {
  useBuilderImage: true,
  useViewingPreferences: true,
  useClerkAuth: true,
  useDynamicMarketplace: true,
};

// Execute in browser context
const script = `
  // Remove from localStorage
  try {
    localStorage.removeItem('feature-flags');
    console.log('✅ Successfully removed feature flags from localStorage');
  } catch (error) {
    console.error('❌ Error removing feature flags:', error);
  }

  // Set window.featureFlags if it exists (for browser console)
  if (typeof window !== 'undefined' && window.featureFlags) {
    try {
      window.featureFlags.reset();
      console.log('✅ Successfully reset feature flags via window.featureFlags API');
    } catch (error) {
      console.error('❌ Error resetting feature flags via API:', error);
    }
  }

  // Show current flags
  try {
    const currentFlags = localStorage.getItem('feature-flags');
    console.log('Current flags:', currentFlags ? JSON.parse(currentFlags) : 'None (using defaults)');
  } catch (error) {
    console.log('Unable to read current flags:', error);
  }
`;

// Print instructions for the user
console.log('\n🔍 To reset feature flags in the browser:');
console.log('\n1. Open your browser developer console on the application page');
console.log('2. Paste and run the following code:');
console.log('\n' + script.split('\n').map(line => '   ' + line).join('\n'));
console.log('\n3. Refresh the page');

// Print alternative reset method
console.log('\n🌐 Alternative browser console commands:');
console.log('   localStorage.removeItem("feature-flags")');
console.log('   // OR if using the API');
console.log('   window.featureFlags.reset()');

console.log('\n✨ Default flag values:');
console.log(DEFAULT_FLAGS);