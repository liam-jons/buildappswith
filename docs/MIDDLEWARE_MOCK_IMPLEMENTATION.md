# Middleware Mocking Implementation

## Version: 1.0.80

This document explains the implementation details of our middleware mocking approach for the Buildappswith platform.

## Problem

The middleware tests were failing with a type error:

```
vi.mocked(...).mockImplementationOnce is not a function
```

This was happening because the mock implementations of Clerk's authentication functions were defined using the `vi.fn().mockImplementation()` pattern, which doesn't correctly support method chaining in TypeScript.

## Root Cause

The root cause of this issue was that when using `vi.fn().mockImplementation()` directly, TypeScript type information may not be preserved correctly, particularly when the mocked function has complex types.

With this pattern:

```typescript
export const authMiddleware = vi.fn().mockImplementation((options) => {
  // Implementation...
});
```

TypeScript loses some type information, especially for chained methods like `mockImplementationOnce()`.

## Solution

We addressed this issue by separating the mock implementation from the `vi.fn()` wrapper:

```typescript
// Define mock implementation separately
const authMiddlewareMock = (options: any) => {
  // Implementation...
};

// Create vi.fn() wrapper with the implementation
export const authMiddleware = vi.fn(authMiddlewareMock);
```

This approach preserves TypeScript type information and ensures that all mock methods (like `mockImplementationOnce`, `mockReturnValue`, etc.) are available and properly typed.

## Implementation Details

1. Created separate mock implementation functions for each mocked export
2. Used `vi.fn()` to wrap these implementations
3. Added proper TypeScript type annotations
4. Created a type guard function to help with TypeScript type checking

```typescript
// Type guard for mock functions
export const isMockFunction = <T extends (...args: any[]) => any>(fn: any): fn is ReturnType<typeof vi.fn<T>> => {
  return typeof fn === 'function' && typeof fn.mockImplementation === 'function';
};
```

## Benefits

This approach provides several benefits:

1. **Full Type Safety**: TypeScript correctly identifies all available mock methods
2. **Method Chaining**: Support for `mockImplementationOnce`, `mockReturnValue`, and other chained methods
3. **Separation of Concerns**: Clear distinction between mock implementation and mock function
4. **Improved Maintainability**: Easier to update mock implementations without breaking tests
5. **Consistent Pattern**: Establishes a reliable pattern for all future mocks

## Usage Example

In test files, the mocks can now be used with any Vitest mock method:

```typescript
import { authMiddleware } from '@clerk/nextjs';

// Override for a single test
authMiddleware.mockImplementationOnce((options) => {
  return async (req) => {
    return options.afterAuth(customState, req, { nextUrl: req.nextUrl });
  };
});

// Reset between tests
beforeEach(() => {
  vi.resetAllMocks();
});

// Assert on calls
expect(authMiddleware).toHaveBeenCalledWith(expect.objectContaining({
  publicRoutes: expect.arrayContaining(['/'])
}));
```

## Future Considerations

1. Consider creating a utility function to make mock creation more consistent
2. Add stronger typing to the mock implementations
3. Create test helper functions for common mock patterns

This document should be updated as our mocking approach evolves.
