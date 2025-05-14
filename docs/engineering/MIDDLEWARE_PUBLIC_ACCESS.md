# Middleware Public Access Configuration

## Overview

This document outlines the middleware configuration patterns for ensuring public resources are accessible without authentication in the BuildAppsWith.ai platform.

## Problem Statement

Static resources (images, logos, fonts) and public pages were being blocked by authentication middleware, resulting in 401 errors for unauthenticated users.

## Solution

The middleware configuration was updated to explicitly list all public resources and patterns that should be accessible without authentication.

## Configuration Details

### Public Routes

The `publicRoutes` array in `/middleware.ts` includes:

1. **Static Resources**:
   - `/hero-light.png`, `/hero-dark.png` - Hero images
   - `/favicon.ico` - Site favicon
   - `/robots.txt`, `/sitemap.xml` - SEO files

2. **Pattern-based Routes**:
   - `/logos/(.*)` - All logo files
   - `/images/(.*)` - All image files
   - `/fonts/(.*)` - All font files
   - `/public/(.*)` - All public assets
   - `/assets/(.*)` - All asset files
   - `/static/(.*)` - Static resources

3. **Next.js Resources**:
   - `/_next/static/(.*)` - Next.js static files
   - `/_next/image/(.*)` - Next.js optimized images

4. **Public Pages**:
   - Marketplace routes
   - Marketing pages (about, contact, etc.)
   - Auth pages

### Matcher Configuration

```typescript
export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
```

This configuration:
- Excludes files with extensions (`.*\\..*`)
- Excludes Next.js internal routes (`_next`)
- Includes root path and API routes

## Testing Public Access

Use the test script to verify public resource access:

```bash
node scripts/test-public-access.js
```

Or visit `/test/public-resources` in an incognito window to visually verify resources load.

## Common Issues and Solutions

### Issue: Images not loading for unauthenticated users
**Solution**: Ensure the image path pattern is in `publicRoutes`

### Issue: Fonts not applying correctly
**Solution**: Add font directory to `publicRoutes` and verify font file paths

### Issue: API endpoints returning 401
**Solution**: Add specific API patterns to `publicRoutes`

## Best Practices

1. **Be Specific**: List exact paths for critical resources
2. **Use Patterns**: Use `(.*)` wildcards for directory-based resources
3. **Test Thoroughly**: Always test in incognito/private browsing
4. **Document Changes**: Update this document when adding new public routes
5. **Order Matters**: Place more specific routes before wildcards

## Troubleshooting

1. **Check Browser Console**: Look for 401 errors or CORS issues
2. **Verify Paths**: Ensure resource paths match exactly
3. **Restart Server**: Always restart after middleware changes
4. **Clear Cache**: Try hard refresh (Ctrl+Shift+R) if resources don't update

## References

- [Clerk Middleware Documentation](https://clerk.com/docs/references/nextjs/auth-middleware)
- [Next.js Middleware Guide](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- `/scripts/test-public-access.js` - Public access test script
- `/app/test/public-resources/page.tsx` - Visual test page