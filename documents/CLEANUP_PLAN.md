# Marketplace Issue Cleanup Plan

## Files to Delete (Test Files)

These files were created for diagnostic purposes and should be removed:

1. `/Users/liamj/Documents/development/buildappswith/app/(platform)/marketplace/emergency-page.tsx`
2. `/Users/liamj/Documents/development/buildappswith/app/(platform)/marketplace/simplified-page.tsx`
3. `/Users/liamj/Documents/development/buildappswith/app/(platform)/marketplace/step1-basic-fetch.tsx`
4. `/Users/liamj/Documents/development/buildappswith/app/(platform)/marketplace/step2-ui-components.tsx`
5. `/Users/liamj/Documents/development/buildappswith/app/(platform)/marketplace/step3-validation-badge.tsx`
6. `/Users/liamj/Documents/development/buildappswith/app/(platform)/marketplace/step4-api-layer.tsx`
7. `/Users/liamj/Documents/development/buildappswith/app/(platform)/marketplace/step5-filters.tsx`
8. `/Users/liamj/Documents/development/buildappswith/app/marketplace-test/page.tsx` (after implementing new routes)

## Feature Flag System (Keep or Clean Up)

We implemented a feature flag system as a potential solution, which you may want to keep for future use or clean up:

1. `/Users/liamj/Documents/development/buildappswith/lib/feature-flags.ts`
2. `/Users/liamj/Documents/development/buildappswith/components/feature-flag-wrapper.tsx`
3. `/Users/liamj/Documents/development/buildappswith/components/marketplace/simplified-builder-image.tsx`

**Recommendation:** Keep the feature flag system as it can be useful for:
- Gradual rollout of features
- A/B testing
- Debugging complex components
- Disabling problematic features in production without a full rollback

## Documentation Files (Keep)

These documentation files explain what happened and should be kept for future reference:

1. `/Users/liamj/Documents/development/buildappswith/docs/engineering/FEATURE_FLAG_DEBUGGING.md`
2. `/Users/liamj/Documents/development/buildappswith/docs/engineering/IMAGE_FIELD_MIGRATION_REPORT.md`
3. `/Users/liamj/Documents/development/buildappswith/docs/MARKETPLACE_ROUTES_RESTRUCTURING.md`

## Scripts (Keep)

These utility scripts can be helpful for future debugging:

1. `/Users/liamj/Documents/development/buildappswith/scripts/reset-next.sh`
2. `/Users/liamj/Documents/development/buildappswith/scripts/reset-feature-flags.js`
3. `/Users/liamj/Documents/development/buildappswith/scripts/restart-with-simplified-components.sh`
4. `/Users/liamj/Documents/development/buildappswith/scripts/clear-browser-storage.js`

## Component Modifications to Revert (If Desired)

If you want to restore the original components:

1. `/Users/liamj/Documents/development/buildappswith/components/marketplace/builder-card.tsx`
   - Restore original imports and implementation

2. `/Users/liamj/Documents/development/buildappswith/components/site-header.tsx`
   - Restore original ViewingPreferences implementation

## Database Migrations (No Changes Needed)

The database migration from `image` to `imageUrl` was successful and doesn't need to be reverted.

## Git Repository Cleanup

To clean up these changes in your git repository:

1. For files to keep, commit them normally
2. For test files that should be removed:
   ```bash
   git rm app/"(platform)"/marketplace/emergency-page.tsx
   git rm app/"(platform)"/marketplace/simplified-page.tsx
   git rm app/"(platform)"/marketplace/step*.tsx
   git rm app/marketplace-test/page.tsx
   ```
3. Commit your changes with a clear message:
   ```bash
   git commit -m "Fix marketplace routing issues and clean up diagnostic files"
   ```

## Final Validation Steps

After implementing the route structure changes and cleaning up:

1. Clear the Next.js cache:
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   ```

2. Restart the development server:
   ```bash
   pnpm dev
   ```

3. Verify that the following routes work correctly:
   - `/marketplace` (main page)
   - `/marketplace/builders/[id]` (builder profiles)

4. If you encounter any issues, revisit the implementation and make necessary adjustments.