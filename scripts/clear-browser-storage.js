/**
 * Clear Browser Storage Script
 * 
 * This script provides browser console commands to clear all storage
 * and reset the application state. This helps resolve issues related
 * to cached data and feature flags.
 */

console.log(`
=========================================
BROWSER STORAGE RESET COMMANDS
=========================================

Paste the following commands into your browser console to clear all storage:

// Clear localStorage
localStorage.clear();

// Clear sessionStorage
sessionStorage.clear();

// Set feature flags to disabled state
localStorage.setItem('feature-flags', JSON.stringify({
  useBuilderImage: false,
  useViewingPreferences: false,
  useClerkAuth: true,
  useDynamicMarketplace: true
}));

// Optional: Clear cookies (may log you out)
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(
    /=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"
  ); 
});

// Hard refresh the page (bypass cache)
location.reload(true);

=========================================
`);

console.log('After running these commands, the application should restart with problematic components disabled.');
console.log('If you still experience issues, run "./scripts/reset-next.sh" to completely reset the development server.');