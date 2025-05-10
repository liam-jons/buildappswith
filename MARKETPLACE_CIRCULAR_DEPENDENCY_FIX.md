# Marketplace React Infinite Loop Fix

## Overview

This document describes the fixes applied to resolve the infinite loop issues in the marketplace page. The primary issues were:

1. The BuilderImage component had a rendering loop issue
2. The ViewingPreferences component had redundant effects causing infinite updates
3. Potential circular import dependencies between components 

## Fixes Applied

### 1. BuilderImage Component Rewrite

The BuilderImage component was completely rewritten to:

- Use proper state management with `useState` and `useEffect`
- Fix the image source determination logic to only run when necessary
- Handle errors more gracefully without triggering re-renders
- Fall back to a default avatar SVG when needed

### 2. ViewingPreferences Component Fixes

The ViewingPreferences component had issues with its effects:

- Removed a redundant useEffect that was potentially causing re-renders
- Added a memoized handler in the child component
- Fixed the dyslexic mode state management to prevent circular updates

### 3. Import Structure Changes

To prevent circular dependencies in the import structure:

- Updated direct imports to avoid barrel file re-exports
- Modified the SiteHeader component to import ViewingPreferences directly
- Removed ViewingPreferences from the marketing/ui barrel exports

## Technical Detail

### Image Path Handling

The key issue in the BuilderImage component was related to how image paths were determined. The new implementation:

```typescript
// Use state to track image status
const [shouldShowImage, setShouldShowImage] = useState<boolean>(false);
const [imageSrc, setImageSrc] = useState<string>('/images/default-avatar.svg');

// Only process image path in useEffect, not during render
useEffect(() => {
  // Logic to determine image source...
  // ...
}, [src]);
```

### Default Avatar

Added a proper default avatar SVG for consistency:

```svg
<svg width="200px" height="200px" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="100" fill="#e2e8f0"/>
  <path d="M100,40..."></path>
</svg>
```

### ViewingPreferences Fixes

The problematic useEffect in ViewingPreferences that was causing updates:

```typescript
// This effect was removed to prevent update loops
useEffect(() => {
  if (!mounted || !initialLoadDoneRef.current || isUpdatingRef.current) return;
  
  // Effect that could cause update loops...
}, [dyslexicMode, mounted]);
```

## Testing

After applying these changes:

1. The BuilderImage component now renders properly without infinite loops
2. The marketplace page loads successfully with proper image handling
3. The ViewingPreferences button works without causing rendering issues

## Future Recommendations

1. **Component Architecture**: Consider restructuring components to avoid potential circular dependencies
2. **State Management**: Use more centralized state management for shared UI elements
3. **Effect Dependencies**: Carefully audit useEffect dependencies to prevent update loops
4. **Image Handling**: Implement a more robust image management system with proper fallbacks