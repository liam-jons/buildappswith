# Image Field Migration Report

## Summary

This report documents the migration from `image` to `imageUrl` field in the database schema and the resulting React rendering issues that were addressed.

## Background

The application code was using `imageUrl` while the database schema had an `image` field, requiring a runtime field mapper to handle the discrepancy. This created overhead and potential for bugs, so we decided to align the database schema with the application code.

## Migration Approach

1. **Database Migration**
   - Created SQL migration to rename `image` to `imageUrl` in the User table
   - Updated Prisma schema to reflect the change
   - Updated queries in marketplace service to use `imageUrl` directly

2. **Component Fixes**
   - Rewrote `BuilderImage` component to fix infinite render loops
   - Created default avatar SVG for fallback
   - Fixed `ViewingPreferences` component to prevent unnecessary re-renders

3. **Debugging Tooling**
   - Implemented feature flag system for component isolation
   - Added debug panel in marketplace page
   - Created reset script for Next.js cache

## Issues Encountered

1. **React Rendering Issues**
   - After the database migration, we encountered "Maximum update depth exceeded" errors
   - The `BuilderImage` component had problems with its effect dependencies
   - Circular dependencies were detected in component imports
   - The `ViewingPreferences` component had redundant effects

2. **AuthN/Z Issues**
   - Some users reported authentication problems after the migration
   - These might be related to the field mapper removal

## Feature Flag System

To isolate and debug the rendering issues, we implemented a feature flag system that allows:

- Toggling components on/off at runtime
- Using simplified fallback components
- Controlling flags via UI and console

This approach helped identify that the `BuilderImage` component was causing most of the rendering issues due to improper effect dependencies and state management.

## Current Status

- Database migration was successful
- Feature flag system is in place
- Components have been updated with improved rendering patterns
- Simplified fallback components are available for problematic areas
- Debug panel helps isolate issues in development

## Next Steps

1. Test the marketplace page with various components disabled
2. When all components function correctly:
   - Clean up the field mapper utility code
   - Update any remaining code that might reference the old field name
   - Document the new schema for developers

3. Consider keeping the feature flag system for future debugging

## Lessons Learned

1. **Schema Changes**: Even minor schema changes can have cascading effects in React components
2. **Component Design**: Be cautious with effect dependencies and state updates
3. **Debugging Strategy**: Feature flags provide an excellent way to isolate problematic components
4. **Fallbacks**: Having simple fallback components improves debugging experience

## Appendix: Files Changed

1. Database Migration:
   - `/prisma/schema.prisma`
   - `/prisma/migrations/rename_image_to_imageurl.sql`
   - `/lib/marketplace/data/marketplace-service.ts`

2. Component Fixes:
   - `/components/marketplace/builder-image.tsx`
   - `/components/marketing/ui/viewing-preferences.tsx`
   - `/components/site-header.tsx`
   - `/public/images/default-avatar.svg`

3. Debug Tooling:
   - `/lib/feature-flags.ts`
   - `/components/feature-flag-wrapper.tsx`
   - `/app/(platform)/marketplace/page.tsx`
   - `/components/marketplace/builder-card.tsx`
   - `/scripts/reset-next.sh`