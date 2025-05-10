# UI Component Import Path Fix

## Issue

After implementing the marketplace page routing fix, we encountered build errors due to incorrect import paths for UI components:

```
Module not found: Can't resolve '@/components/ui/card'
```

The issue is that UI components are located in the `/components/ui/core/` directory, but some components were being imported from `/components/ui/` (without the `core` segment).

## Solution

1. **Updated Import Paths**:
   - Changed all imports from `@/components/ui/component` to `@/components/ui/core/component`
   - Fixed imports in the following key components:
     - `/components/scheduling/client/booking-calendar.tsx`
     - `/components/scheduling/client/booking-form.tsx`
     - `/components/scheduling/client/time-slot-selector.tsx`
     - `/components/scheduling/client/session-type-selector.tsx`
     - `/components/scheduling/builder/availability/availability-exceptions.tsx`
     - `/components/scheduling/builder/availability/availability-management.tsx`
     - `/components/scheduling/builder/availability/weekly-availability.tsx`
     - `/components/scheduling/builder/session-type-editor.tsx`
     - `/components/scheduling/builder/weekly-schedule.tsx`

2. **Created Automated Fix Script**:
   - Implemented `/scripts/fix-ui-core-imports.js` to automate fixing import paths
   - This script scans all .tsx and .jsx files for incorrect import paths and updates them

3. **Restart Script**:
   - Created `/scripts/fix-imports-and-restart.sh` to run the fix script and restart the application
   - This script:
     - Runs the import path fixer
     - Cleans Next.js cache
     - Rebuilds Prisma client
     - Restarts the development server

## Root Cause

The codebase was inconsistent in how it imported UI components. Some imports used the direct path to the component file, while others used the barrel exports. This inconsistency created build errors when some files couldn't be found.

## Best Practices Going Forward

1. **Consistent Import Structure**:
   - Always use `/components/ui/core/{component}` paths for UI component imports
   - Consider setting up path aliases or barrel exports to avoid inconsistencies

2. **Automated Checks**:
   - Add a pre-commit hook or linting rule to prevent incorrect import paths
   - Consider using TypeScript's path mapping to ensure imports are consistent

3. **Documentation**:
   - Update component usage docs to clarify the correct import paths
   - Add notes to README about the UI component structure

## Future Recommendations

If UI component imports continue to be an issue, consider:

1. **Refactoring to Index-Based Exports**:
   - Create barrel export files (index.ts) in each component directory
   - Allow importing from `@/components/ui` with everything re-exported from subdirectories

2. **Path Aliases**:
   - Set up tsconfig path aliases to make imports more consistent
   - For example: `@ui/button` instead of `@/components/ui/core/button`

3. **Codemod Script**:
   - Keep the fixing script for future use if needed
   - Run it periodically to ensure consistency