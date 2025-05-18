# Marketplace Routes Restructuring

## Problem Summary

The issue was related to Next.js routing conflicts between:
- The main marketplace page (`/marketplace`)
- Dynamic builder profile pages (`/marketplace/[id]`)
- Our test pages (`/marketplace/step1-basic-fetch`, etc.)

Next.js was interpreting our test page URLs as matching the dynamic `[id]` route, causing them to attempt to load a builder profile instead of our test pages.

## Best Practice Solution

The recommended approach is to use more specific patterns for dynamic routes and ensure proper route organization:

### 1. Move Builder Profiles to a Specific Subdirectory

```
/marketplace              → Main marketplace listing page
/marketplace/builders/[id] → Individual builder profiles
/marketplace/filters      → Filter configuration (if needed)
/marketplace/categories   → Category pages (if needed)
```

This approach:
- Makes routes more semantic and RESTful
- Prevents accidental route matches
- Provides clearer separation of concerns
- Allows for easier future expansion

## Implementation Steps

1. Create the new directory structure:
   ```
   app/(platform)/marketplace/
   ├── page.tsx               (main marketplace page)
   ├── builders/
   │   └── [id]/
   │       └── page.tsx       (builder profile page)
   ```

2. Move the existing builder profile page:
   - Move `/app/(platform)/marketplace/[id]/page.tsx` to `/app/(platform)/marketplace/builders/[id]/page.tsx`
   - Move `/app/(platform)/marketplace/[id]/BuilderProfileClient.tsx` to `/app/(platform)/marketplace/builders/[id]/BuilderProfileClient.tsx`

3. Update any links or references to builder profiles:
   - Change `/marketplace/{id}` to `/marketplace/builders/{id}` in all link components
   - Update any API endpoints or data fetching logic as needed

4. Verify that routing works correctly:
   - Main marketplace: `/marketplace`
   - Builder profiles: `/marketplace/builders/{id}`
   - No conflicts with other routes

## API Updates (Optional)

For consistency, consider updating API routes to match this structure:

```
/api/marketplace/builders         → List all builders
/api/marketplace/builders/[id]    → Get builder by ID
```

This maintains consistency between frontend routes and API endpoints.