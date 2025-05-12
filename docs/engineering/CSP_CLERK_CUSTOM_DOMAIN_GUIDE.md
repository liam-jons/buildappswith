# CSP Configuration for Clerk Custom Domain Integration

## Overview

This guide documents the solution for integrating Clerk's custom domain functionality with Content Security Policy (CSP) in the buildappswith platform. It addresses critical authentication errors that occurred when using Clerk with a custom domain (`clerk.buildappswith.com`), and provides a comprehensive approach to configuring CSP for secure and functional authentication.

## Problem Context

Following the implementation of dynamic imports for Sentry with Clerk's catch-all authentication routes, we encountered the following CSP-related issues in production:

1. **Critical Authentication Error**: Clerk's scripts from the custom domain (`clerk.buildappswith.com`) were being blocked by the CSP, preventing authentication from working correctly.

   ```
   Loading failed for the <script> with source "https://clerk.buildappswith.com/npm/@clerk/clerk-js@4/dist/clerk.browser.js".
   
   Content-Security-Policy: The page's settings blocked a script (script-src-elem) at https://clerk.buildappswith.com/npm/@clerk/clerk-js@4/dist/clerk.browser.js from being executed
   ```

2. **Image Resource Errors**: Several image resources from third-party domains (`i.pravatar.cc` and `images.unsplash.com`) were being blocked, affecting the display of placeholder content.

   ```
   Content-Security-Policy: The page's settings blocked the loading of a resource (img-src) at https://i.pravatar.cc/150?img=3
   ```

## Root Cause Analysis

The root cause of the authentication failure was that the application is using Clerk's custom domain feature, which points to `clerk.buildappswith.com` instead of the standard Clerk domains. This custom domain was configured in the Clerk dashboard but wasn't included in the CSP configuration in `next.config.mjs`.

Custom domains in Clerk provide branded authentication experiences and improved user trust, making them a valuable feature for production applications. However, they require specific CSP configurations to work properly.

## Solution Implementation

### 1. Updated CSP Configuration

We updated the Content Security Policy directives in `next.config.mjs` to include the necessary domains:

```javascript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdnjs.cloudflare.com https://*.clerk.accounts.dev https://clerk.io https://*.clerk.com https://npm.clerk.dev https://npm/@clerk https://*.calendly.com https://assets.calendly.com https://clerk.buildappswith.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev https://*.calendly.com;
  img-src 'self' blob: data: https://*.stripe.com https://api.placeholder.org https://cdn.magicui.design https://randomuser.me https://placehold.co https://*.clerk.com https://img.clerk.com https://images.clerk.dev https://*.calendly.com https://i.pravatar.cc https://images.unsplash.com;
  font-src 'self' data: https://fonts.gstatic.com https://*.calendly.com;
  frame-src 'self' https://js.stripe.com https://*.stripe.com https://*.clerk.accounts.dev https://*.calendly.com;
  connect-src 'self' https://api.stripe.com https://*.vercel-insights.com http://localhost:* https://localhost:* https://*.clerk.accounts.dev https://clerk.io https://*.clerk.com https://*.sentry.io https://*.ingest.sentry.io https://ingest.sentry.io https://*.calendly.com https://clerk.buildappswith.com;
  worker-src 'self' blob:;
  object-src 'none';
`;
```

Key changes:
1. Added `https://clerk.buildappswith.com` to the `script-src` directive
2. Added `https://clerk.buildappswith.com` to the `connect-src` directive
3. Added `https://i.pravatar.cc` and `https://images.unsplash.com` to the `img-src` directive

### 2. Next.js Image Configuration

We also updated the remotePatterns configuration in `next.config.mjs` to ensure image optimization works correctly with the new domains:

```javascript
remotePatterns: [
  // Existing patterns...
  {
    protocol: 'https',
    hostname: 'i.pravatar.cc',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'clerk.buildappswith.com',
  }
],
```

## Clerk Custom Domain Configuration

Clerk's custom domain feature allows you to serve Clerk's authentication components from your own domain instead of Clerk's default domains. This provides several benefits:

1. **Brand Consistency**: Authentication screens appear to be hosted on your own domain
2. **User Trust**: Reduces confusion for users by keeping them on a consistent domain
3. **Enhanced Security**: Reduces phishing risks by keeping users on your domain

To set up a custom domain for Clerk:

1. In the Clerk Dashboard, navigate to "Domains"
2. Add a custom domain (e.g., `clerk.buildappswith.com`)
3. Configure DNS settings according to Clerk's instructions
4. Verify the domain
5. Update your application's CSP configuration to allow this domain

## Best Practices for CSP with Custom Authentication Domains

When configuring CSP for applications with custom authentication domains:

1. **Be Specific**: Only allow the specific domains needed, rather than using broad wildcards
2. **Document All Domains**: Keep documentation updated with all third-party domains used by your application
3. **Test Thoroughly**: Test authentication flows in all environments after CSP changes
4. **Monitor Errors**: Watch for CSP violation reports in production to catch any missed resources
5. **Security Balance**: Balance security restrictions with functionality requirements

## Testing Process

To verify that the CSP changes resolve the authentication issues:

1. **Development Testing**:
   - Deploy the changes to a development environment
   - Test the complete authentication flow (sign-up, sign-in, sign-out)
   - Verify that Clerk scripts load properly from the custom domain
   - Check browser console for any remaining CSP errors

2. **Production Verification**:
   - Deploy changes to production
   - Monitor error rates in Sentry/logging systems
   - Test authentication flows with multiple user accounts
   - Verify that image resources display correctly

3. **Browser Compatibility**:
   - Test in multiple browsers (Chrome, Firefox, Safari)
   - Verify mobile browser functionality

## Cross-Environment Configuration

For consistent behavior across environments:

1. **Development**: Development environments should match production CSP settings to catch issues early
2. **Staging/Preview**: All preview deployments should include the same CSP configuration
3. **Production**: Monitor CSP violations in production to identify any missed resources

## Future Recommendations

1. **CSP Reporting**: Implement CSP reporting to collect violation reports
2. **Custom Domain Documentation**: Document the Clerk custom domain setup process
3. **Regular Audits**: Periodically audit CSP configurations as third-party dependencies evolve
4. **Feature Tests**: Add automated tests for authentication with Clerk's custom domain

## Related Documentation

- [Clerk Custom Domain Documentation](https://clerk.com/docs/customization/domains)
- [Content Security Policy MDN Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Security Headers Documentation](https://nextjs.org/docs/advanced-features/security-headers)
- `/docs/engineering/SENTRY_CLERK_INTEGRATION_GUIDE.md`
- `/docs/engineering/CSP_CLERK_ERRORS_ANALYSIS.md`