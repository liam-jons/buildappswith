# Codebase Cleanup Guide

## Overview

This document outlines the process and best practices for removing unused components from the Buildappswith codebase. As the project has evolved, some components have become redundant or obsolete, creating technical debt that needs to be managed before launch.

## Current State (as of April 28, 2025)

- **Total Components**: 265
- **Potentially Unused Components**: 105 (40% of total)
- **Target After Cleanup**: <20% unused components

## Cleanup Categories

### 1. Page Components

These should be removed first as they are the highest-level components.

**Selection Criteria:**
- Not linked in navigation (site-header.tsx)
- No incoming references in the dependency graph
- Marked as unused in architectural analysis
- Not part of the MVP requirements defined in PRD

**Critical Pages to Preserve:**
- Home (/)
- How it works (/how-it-works)
- Marketplace (/marketplace)
- Toolkit (/toolkit)
- About (/about)
- Contact (/contact)
- Authentication (/login, /signup)
- User management (/profile)
- Booking (/book/[builderId])

### 2. UI Components

Remove components with no incoming references.

**Selection Criteria:**
- No incoming references in dependency graph
- Not used in critical pages
- Duplicates functionality available elsewhere

### 3. API Routes

Consolidate and remove redundant API functionality.

**Selection Criteria:**
- No client-side references
- Duplicates functionality available in other routes
- Not part of critical flows (authentication, booking)

### 4. Authentication Components

Clean up remnants from NextAuth to Clerk migration.

**Selection Criteria:**
- Related to NextAuth but not referenced since Clerk migration
- Duplicate functionality between auth systems

### 5. Utilities

Remove unused utilities and helpers.

**Selection Criteria:**
- No references throughout the codebase
- Functionality covered by newer utilities
- Not used in build process (be careful with config files)

## Cleanup Process

1. **Create Backup**
   ```
   git checkout -b backup/pre-cleanup-YYYY-MM-DD
   git push origin backup/pre-cleanup-YYYY-MM-DD
   ```

2. **Create Feature Branch**
   ```
   git checkout -b feature/codebase-cleanup
   ```

3. **Remove Components in Groups**
   - Start with a small group of clearly unused components
   - Run build and tests after each group
   - Check for unexpected errors or regressions

4. **Run Architecture Analysis**
   ```
   pnpm arch:extract:all && pnpm arch:report
   ```

5. **Update Documentation**
   - Update CHANGELOG.md with removed components
   - Document any decisions made during cleanup

6. **Create PR**
   ```
   git push origin feature/codebase-cleanup
   ```

## Best Practices

1. **Be Conservative**: When in doubt, don't remove it
2. **Check for Dynamic Imports**: Components might be loaded dynamically
3. **Consider Configuration Files**: Some may appear unused but are required for builds
4. **Test Thoroughly**: Run the full test suite after each removal group
5. **Document Everything**: Keep records of what was removed and why
6. **Back Up Before Removing**: Save copies in docs/cleanup-records

## Verification Checklist

After cleanup, verify:

- [ ] All pages in the navigation still work
- [ ] Authentication flow is intact
- [ ] Booking process functions correctly
- [ ] Admin functionality works as expected
- [ ] No console errors appear during normal operation
- [ ] Build process completes successfully
- [ ] All tests pass

## Remaining Technical Debt

Even after cleanup, certain areas will require further attention:

1. **Pattern Inconsistencies**: Folder structure variations should be standardized
2. **Component Consolidation**: Similar components should be unified
3. **Authentication Refactoring**: Complete Clerk integration
4. **API Route Organization**: Standardize API route patterns
5. **Test Coverage Gaps**: Add tests for critical components

## Progress Tracking

| Date | % Unused | Actions Taken |
|------|----------|---------------|
| 2025-04-26 | 45% | Initial analysis |
| 2025-04-28 | 36% | Removed initial UI components |

## Next Steps

1. Continue systematic removal using the identified component list
2. Address pattern inconsistencies outlined in the architectural complexity report
3. Improve test coverage for critical components
4. Standardize folder structures for better maintainability
