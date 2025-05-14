# Header Component Unification

## Date
May 14, 2025

## Status
Accepted

## Context

The BuildAppsWith platform previously had two separate header implementations:
- `SiteHeader`: Main site header used across the platform
- `MarketingHeader`: Marketing-specific header used for marketing pages

This separation created several issues:
1. **Code duplication**: Both headers contained very similar functionality  
2. **Maintenance overhead**: Changes needed to be made in two places
3. **Inconsistent user experience**: Users experienced different navigation patterns across the site
4. **Confusion for developers**: Unclear which header to use in different contexts

Previous efforts (as documented in the Landing Page Refactoring Summary) had attempted to further separate these components by domain, but this increased complexity without sufficient benefit.

## Decision

We have decided to unify all header implementations into a single `SiteHeader` component that:
1. Serves all pages across the platform (marketing, application, and platform areas)
2. Adapts its content based on the current route and user authentication state
3. Shares common navigation patterns and branding
4. Simplifies the component structure

The unified `SiteHeader` will:
- Use conditional rendering to show appropriate navigation items based on context
- Maintain a consistent brand experience across all pages
- Reduce code duplication and maintenance overhead
- Provide a single source of truth for header functionality

## Implementation

The unification involved:
1. Removing the `MarketingHeader` component
2. Updating all references from `MarketingHeader` to `SiteHeader`
3. Modifying the marketing layout to use the unified header
4. Ensuring the unified header adapts to different contexts appropriately

## Consequences

### Positive
- **Reduced complexity**: Single component to maintain instead of multiple variations
- **Consistent UX**: Users get the same navigation experience across the platform
- **Easier maintenance**: Changes only need to be made in one place
- **Clearer architecture**: No confusion about which header to use
- **Better performance**: Less code duplication means smaller bundle size

### Negative
- **Less domain separation**: Marketing-specific customizations now live in the main header
- **Potential complexity**: Single component may become more complex over time
- **Migration effort**: Existing documentation and code needs to be updated

### Mitigation
To address the potential complexity issue, we will:
- Keep the conditional logic simple and well-documented
- Consider using composition patterns if the component grows too complex
- Regularly review the header structure to ensure it remains maintainable

## References
- [Landing Page Refactoring Summary](../../../docs/engineering/LANDING_PAGE_REFACTORING_SUMMARY.md)
- [Domain Organization Guidelines](../../../docs/engineering/DOMAIN_ORGANIZATION.md)
- [Component Style Guide](../../../docs/engineering/COMPONENT_STYLE_GUIDE.md)