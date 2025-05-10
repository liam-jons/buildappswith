# Feature Flag Debugging System

This document describes the feature flag system implemented to help debug React rendering issues in the BuildAppsWith platform.

## Overview

After migrating the database schema from `image` to `imageUrl`, we encountered React rendering issues with certain components,
particularly the `BuilderImage` and `ViewingPreferences` components. To isolate and debug these issues, we've implemented
a feature flag system that allows toggling components on/off during runtime.

## Implementation

The feature flag system consists of the following components:

1. **Feature Flag Utility** (`/lib/feature-flags.ts`)
   - Manages feature flag state in localStorage
   - Provides APIs for getting/setting flags
   - Exposes flags to browser console for easy debugging

2. **Feature Flag Wrapper** (`/components/feature-flag-wrapper.tsx`)
   - React component that conditionally renders based on feature flags
   - Provides simplified fallback components for disabled features

3. **Debug Panel** (in Marketplace page)
   - Visual interface for toggling feature flags
   - Only visible in development mode

## Using Feature Flags

### Via Debug Panel

1. Navigate to the Marketplace page
2. Click "Show Debug Panel" button in top-right
3. Use the checkboxes to enable/disable specific components

### Via Console

You can also toggle feature flags directly from the browser console:

```javascript
// Check current flags
window.featureFlags.getAll()

// Disable BuilderImage component
window.featureFlags.set('useBuilderImage', false)

// Enable BuilderImage component
window.featureFlags.set('useBuilderImage', true)

// Reset all flags to defaults
window.featureFlags.reset()
```

## Available Feature Flags

| Flag | Component | Description |
|------|-----------|-------------|
| `useBuilderImage` | BuilderImage | Controls the image component in builder cards/profiles |
| `useViewingPreferences` | ViewingPreferences | Controls the theme/preferences selector in header |
| `useClerkAuth` | ClerkAuth | Controls authentication components |
| `useDynamicMarketplace` | MarketplaceDynamic | Controls dynamic loading in marketplace |

## Debugging Process

To debug rendering issues:

1. If the application crashes, use the feature flags via console to disable the problematic component
2. Refresh the page and re-enable components one by one to isolate the issue
3. Once the problematic component is identified, examine its implementation for:
   - Infinite re-render loops
   - Improper effect dependencies
   - Circular dependencies
   - State management issues

## Implementation Notes

The feature flag system is designed to be temporary and should not be used for production feature toggling. It is specifically 
implemented to help debug and fix the rendering issues related to the database schema migration.

The simplified fallback components provide basic functionality while the full components are disabled.

## Reset Script

A `reset-next.sh` script has been created in the `scripts` directory to help restart the Next.js development server with a clean cache:

```bash
# From project root
./scripts/reset-next.sh
```

This script:
1. Cleans Next.js cache directories
2. Cleans npm cache
3. Reinstalls dependencies
4. Rebuilds the Prisma client
5. Restarts the dev server

## Future Work

Once the rendering issues are resolved, this feature flag system can be:

1. Kept for developer debugging purposes
2. Enhanced into a proper feature flag system for gradual rollouts
3. Removed if no longer needed