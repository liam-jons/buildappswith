# Linear Issue Templates for Application Startup Errors

The following issue templates are ready to be added to Linear to address the component loading and CSP errors in the application.

## Issue 1: Fix Component Import/Export Pattern in Marketing Page

**Title**: Fix Component Import/Export Pattern in Marketing Page

**Description**:
The application is experiencing a critical startup error due to a mismatch between how the `Particles` component is exported and imported. The component is exported as a named export in `components/magicui/particles.tsx` but imported as a default export in `app/(marketing)/page.tsx`.

This issue is blocking local development and needs immediate attention.

### Steps to Reproduce:
1. Run `pnpm dev` to start the development server
2. Navigate to the marketing page
3. Observe the console error about invalid element with path references to `/Users/liamj/src/...`

### Current Implementation:
```typescript
// In app/(marketing)/page.tsx
import Particles from "@/components/magicui/particles";

// In components/magicui/particles.tsx
export const Particles: React.FC<ParticlesProps> = ({ ... });
```

### Proposed Solution:
Update the import in `app/(marketing)/page.tsx` to use named import syntax:
```typescript
// Change to:
import { Particles } from "@/components/magicui/particles";
// Or use the barrel export:
import { Particles } from "@/components/magicui";
```

### Acceptance Criteria:
- [ ] Update the import in page.tsx to use named import syntax
- [ ] Verify component renders correctly without errors
- [ ] Ensure consistent import pattern across marketing components
- [ ] Add documentation about export patterns to component style guide

**Labels**: Bug, High Priority, Frontend, Architecture
**Estimate**: 1 point
**Impact**: Blocking local development

---

## Issue 2: Update CSP Configuration for Clerk Authentication

**Title**: Update CSP Configuration for Clerk Authentication

**Description**:
The application is experiencing Content Security Policy (CSP) violations for Clerk authentication images and possibly other resources. The CSP configuration in `next.config.mjs` is missing some Clerk domains that are required for avatar images.

### Steps to Reproduce:
1. Run `pnpm dev` to start the development server
2. Navigate to any page with Clerk authentication components
3. Observe CSP violation errors in the console for Clerk avatar images

### Current Implementation:
```javascript
// In next.config.mjs
img-src 'self' blob: data: https://*.stripe.com https://api.placeholder.org https://cdn.magicui.design https://randomuser.me https://placehold.co https://*.clerk.com https://img.clerk.com;
```

### Proposed Solution:
1. Update the CSP configuration in `next.config.mjs` to include all Clerk domains:
```javascript
img-src 'self' blob: data: https://*.stripe.com https://api.placeholder.org https://cdn.magicui.design https://randomuser.me https://placehold.co https://*.clerk.com https://img.clerk.com https://images.clerk.dev;
```

2. Add Clerk domains to the `remotePatterns` configuration:
```javascript
remotePatterns: [
  // existing patterns...
  {
    protocol: 'https',
    hostname: '**.clerk.com',
  },
  {
    protocol: 'https',
    hostname: 'img.clerk.com',
  },
  {
    protocol: 'https',
    hostname: 'images.clerk.dev',
  },
],
```

3. Ensure the middleware CSP configuration matches the Next.js config

### Acceptance Criteria:
- [ ] Add missing Clerk domains to CSP img-src directive
- [ ] Add Clerk domains to Next.js remotePatterns configuration
- [ ] Ensure CSP configuration in middleware matches next.config.mjs
- [ ] Verify no CSP violations for Clerk avatars in browser console
- [ ] Document Clerk image domain requirements in CSP documentation

**Labels**: Bug, High Priority, Security, Infrastructure
**Estimate**: 2 points
**Impact**: Affects avatar rendering and potentially other authentication UI elements

---

## Issue 3: Document Magicui Component Integration

**Title**: Document Magicui Component Integration

**Description**:
The `magicui` component category is a new addition to the codebase that is not yet documented in the folder structure guide. These components provide interactive and visual effects used by marketing and other components. Documentation is needed to ensure consistent implementation and usage patterns.

### Current State:
- The `magicui` directory exists with multiple components and a barrel export file
- Components are being used by marketing components
- No formal documentation exists for this component category
- Import/export patterns are inconsistent in some places

### Proposed Documentation:
1. Add a section to the folder structure guide for `magicui` components
2. Document the intended usage patterns, including export/import conventions
3. Update the component reference guide with details on each component
4. Provide usage examples for key components

### Acceptance Criteria:
- [ ] Add magicui section to folder structure guide
- [ ] Document export/import patterns for magicui components
- [ ] Update component reference guide with magicui components
- [ ] Create usage examples for key components like Particles and Marquee
- [ ] Ensure consistent naming and export conventions across all magicui components

**Labels**: Documentation, Medium Priority, Frontend, Architecture
**Estimate**: 3 points
**Impact**: Improves developer experience and prevents future import/export issues

---

## Issue 4: Create a Unified CSP Configuration Utility

**Title**: Create a Unified CSP Configuration Utility

**Description**:
The Content Security Policy (CSP) configuration is currently duplicated between `next.config.mjs` and middleware configuration, leading to inconsistencies and maintenance challenges. This issue proposes creating a unified CSP configuration utility that can be used in both places.

### Current State:
- CSP configuration in `next.config.mjs` is separate from middleware configuration
- Different domains are included in each place
- No central source of truth for required domains
- Updating CSP requires changes in multiple files

### Proposed Solution:
1. Create a shared CSP configuration utility:
```javascript
// In lib/security/csp-config.js
export const getCSPDirectives = (isDev = false) => {
  const clerkDomains = [
    'https://*.clerk.accounts.dev',
    'https://clerk.io',
    'https://*.clerk.com',
    'https://img.clerk.com',
    'https://images.clerk.dev',
  ];
  
  return {
    'default-src': ["'self'"],
    'script-src': [
      "'self'", 
      isDev ? "'unsafe-eval'" : "", 
      "'unsafe-inline'", 
      "https://js.stripe.com",
      // Other domains...
    ],
    // Other directives...
  };
};

export const getCSPString = (isDev = false) => {
  const directives = getCSPDirectives(isDev);
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.filter(Boolean).join(' ')}`)
    .join('; ');
};
```

2. Update `next.config.mjs` and middleware to use this utility

### Acceptance Criteria:
- [ ] Create a shared CSP configuration utility
- [ ] Update Next.js config and middleware to use this utility
- [ ] Add comprehensive tests to verify CSP behavior
- [ ] Document the process for updating CSP in the future
- [ ] Verify no CSP violations in browser console

**Labels**: Enhancement, Medium Priority, Security, Infrastructure
**Estimate**: 5 points
**Impact**: Improves security consistency and reduces maintenance overhead

---

## Issue 5: Audit Component Import Patterns for Consistency

**Title**: Audit Component Import Patterns for Consistency

**Description**:
Following the identified import/export mismatch with the Particles component, we need to audit all component imports across the application to ensure consistent patterns are used. This will prevent similar issues from occurring with other components.

### Current Issue:
- Import/export mismatch found with Particles component
- Potential for similar issues with other components
- Inconsistency between documented patterns and implementation

### Proposed Approach:
1. Scan the codebase for all component imports
2. Verify that named exports are imported using named import syntax
3. Ensure barrel exports are used according to the documented guidelines
4. Fix any inconsistencies found
5. Add linting rules to prevent future inconsistencies

### Acceptance Criteria:
- [ ] Create a script to scan for component import patterns
- [ ] Audit all imports for marketing components
- [ ] Audit all imports for magicui components
- [ ] Fix any inconsistencies found
- [ ] Add ESLint rule to enforce consistent import patterns
- [ ] Document findings and fixes in the component style guide

**Labels**: Enhancement, Medium Priority, Frontend, Architecture
**Estimate**: 5 points
**Impact**: Prevents future import/export issues and improves code consistency