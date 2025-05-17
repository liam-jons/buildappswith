# Content Security Policy and Clerk Integration Investigation

## Session Context

  - **Session Type**: Investigation (CSP Configuration and Clerk Integration)
  - **Focus Area**: Content Security Policy blocking Clerk custom domain and resource loading
  - **Current Branch**: feature/mvp-flow-booking
  - **Related Documentation**: 
    - `/docs/engineering/SENTRY_CLERK_INTEGRATION_GUIDE.md`
    - `/docs/engineering/CSP_CLERK_ERRORS_ANALYSIS.md`
    - `/docs/engineering/CLERK_AUTH_ROUTES_INVESTIGATION.md`
    - `/docs/testing/AUTH_ROUTES_STANDARDIZATION.md`
  - **Project root directory**: /Users/liamj/Documents/development/buildappswith

## Investigation Background

Following the implementation of dynamic imports for Sentry with Clerk's catch-all authentication routes, we've resolved the build-time errors but encountered runtime CSP issues in production. The most critical issue is that Clerk's script from a custom domain (`clerk.buildappswith.com`) is being blocked by the CSP, preventing authentication from working correctly.

Additionally, several image resources from third-party domains (`i.pravatar.cc` and `images.unsplash.com`) are being blocked, affecting the display of placeholder content. While the Sentry integration appears to be functioning correctly, the Clerk authentication is broken due to the CSP configuration.

## Primary Investigation Objectives

1. Identify why Clerk is attempting to load scripts from `clerk.buildappswith.com` instead of standard Clerk domains
2. Determine the correct CSP configuration to allow Clerk scripts from the custom domain
3. Develop a solution that maintains security while enabling authentication functionality
4. Test the solution to ensure both Clerk authentication and Sentry error tracking work correctly
5. Update CSP configuration for image resources to eliminate non-critical warnings

## Specific Errors to Investigate

### Critical Authentication Error
```
Loading failed for the <script> with source "https://clerk.buildappswith.com/npm/@clerk/clerk-js@4/dist/clerk.browser.js".

Content-Security-Policy: The page's settings blocked a script (script-src-elem) at https://clerk.buildappswith.com/npm/@clerk/clerk-js@4/dist/clerk.browser.js from being executed because it violates the following directive: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdnjs.cloudflare.com https://*.clerk.accounts.dev https://clerk.io https://*.clerk.com https://npm.clerk.dev https://npm/@clerk https://*.calendly.com https://assets.calendly.com"
```

### Image Resource Errors
```
Content-Security-Policy: The page's settings blocked the loading of a resource (img-src) at https://i.pravatar.cc/150?img=3 because it violates the following directive: "img-src 'self' blob: data: https://*.stripe.com https://api.placeholder.org https://cdn.magicui.design https://randomuser.me https://placehold.co https://*.clerk.com https://img.clerk.com https://images.clerk.dev https://*.calendly.com"

Content-Security-Policy: The page's settings blocked the loading of a resource (img-src) at https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1470&auto=format&fit=crop because it violates the following directive: "img-src 'self' blob: data: https://*.stripe.com https://api.placeholder.org https://cdn.magicui.design https://randomuser.me https://placehold.co https://*.clerk.com https://img.clerk.com https://images.clerk.dev https://*.calendly.com"
```

## Available Reference Material

- `next.config.mjs` - Contains CSP configuration
- `ContentSecurityPolicy` variable in `next.config.mjs` - Current CSP directives
- Clerk documentation on custom domains and CSP integration
- Environment variables related to Clerk configuration
- `/components/providers/enhanced-clerk-provider.tsx` - Clerk provider implementation

## Expected Investigation Outputs

1. Root cause analysis of why Clerk is using a custom domain
2. Updated CSP configuration that allows both security and functionality
3. Implementation plan for CSP updates across environments
4. Test plan to verify Clerk authentication with updated CSP
5. Assessment of image resource CSP violations and suggested fixes
6. Documentation updates for CSP configuration best practices

## Implementation Plan Template

1. **CSP Configuration Update**
   - Identify required domains for Clerk to function correctly
   - Update script-src and img-src directives in CSP configuration
   - Implement changes in a testing environment first

2. **Clerk Configuration Assessment**
   - Investigate custom domain setup in Clerk dashboard
   - Review environment variables for Clerk configuration
   - Determine if changes to Clerk configuration are needed

3. **Testing Approach**
   - Test authentication flow with updated CSP
   - Verify Sentry error tracking still works
   - Ensure both development and production environments function correctly

4. **Documentation Updates**
   - Update CSP configuration documentation
   - Document Clerk custom domain configuration
   - Maintain security best practices while enabling necessary functionality

## Research Focus Areas

- Clerk custom domain implementation and requirements
- Content Security Policy best practices for authentication providers
- Dynamic resource loading with proper CSP configuration
- Next.js security headers with third-party integrations
- Balance between security and functionality in CSP design

## Implementation Considerations

- Security implications of CSP modifications
- Performance impact of CSP changes
- Cross-environment consistency (development, staging, production)
- Forward compatibility with future Clerk and Sentry updates
- Error recovery mechanisms if primary authentication fails