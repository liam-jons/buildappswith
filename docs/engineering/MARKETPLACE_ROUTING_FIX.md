# Marketplace Routing Fix

## Issue Summary

The marketplace page was failing to load with a "Maximum update depth exceeded" error. While initial investigations focused on potential React component rendering issues (specifically with `BuilderImage` and `ViewingPreferences` components), the root cause was identified as a Next.js routing conflict.

## Root Cause

1. **Next.js Dynamic Route Conflict**: 
   - The marketplace directory contained both a main page (`/marketplace/page.tsx`) and a dynamic route for builder profiles (`/marketplace/[id]/page.tsx`).
   - When trying to access the main marketplace page, Next.js was incorrectly routing to the dynamic [id] route handler.
   - This caused the marketplace page to load builder profile logic which created an infinite rendering loop when no valid profile was found.

2. **Next.js Routing Precedence**:
   - In Next.js app router, dynamic segments (`[id]`) can sometimes take precedence over pages when there's ambiguity.
   - This was causing our test pages and possibly the main marketplace page to be treated as attempts to access a builder profile.
   
3. **Test Files Conflict**:
   - When we created test pages like `/marketplace/emergency-page.tsx` for debugging, they were being interpreted as builder profile IDs (eg. "emergency-page" was treated as an ID).
   - This made debugging difficult because our test pages were never actually rendering.

## Solution Implemented

We restructured the routes to provide clearer separation between different marketplace features:

1. **Moved Builder Profiles to a Subdirectory**:
   - Changed: `/marketplace/[id]` → `/marketplace/builders/[id]`
   - This creates a clearer semantic structure and prevents route conflicts

2. **Updated References**:
   - Updated `builder-card.tsx` to use the new URL structure for linking to builder profiles
   - Changed: `href={/marketplace/${builder.id}}` → `href={/marketplace/builders/${builder.id}}`

3. **Documentation**:
   - Created comprehensive documentation of the issue and fix
   - Provided a cleanup plan for temporary files created during diagnosis

## Benefits of This Approach

1. **More Semantic Routes**: The URL structure now better reflects the resource hierarchy
2. **Eliminated Ambiguity**: Clear separation between listing and detail pages
3. **Future-Proof Structure**: Allows for easy addition of other marketplace features without conflict
4. **Better SEO**: URLs like `/marketplace/builders/123` are more descriptive for search engines

## Lessons Learned

1. **Route Structure Matters**: Be careful with dynamic routes in Next.js. Consider using more specific patterns.
2. **Test in Isolation**: When diagnosing React rendering issues, create test pages outside the problematic route structure.
3. **Consider the Router**: When seeing unexpected behavior, don't just focus on components - routing issues can manifest in ways that look like component problems.
4. **RESTful Structure**: Using RESTful-like URL structures (`/marketplace/builders/[id]`) helps prevent routing conflicts.

## Future Recommendations

1. **Follow RESTful Patterns**: Structure routes to follow RESTful patterns for clarity:
   - Collection: `/marketplace/builders` (list of builders)
   - Resource: `/marketplace/builders/[id]` (specific builder)

2. **Use Specific Dynamic Routes**: Always make dynamic routes more specific:
   - Instead of: `/[id]`
   - Prefer: `/resource-type/[id]`

3. **Consider Testing Impact**: When adding test files or pages, be mindful of potential routing conflicts.

4. **Keep Feature Flags**: The feature flag system implemented during diagnosis can be useful for future development and gradual feature rollouts.