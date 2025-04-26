# Middleware Mock TypeScript Error Solution

## Issue

The middleware tests were encountering TypeScript errors with the error message:

```
TypeError: authMiddleware.mockImplementationOnce is not a function
```

This error occurred when trying to use method chaining (specifically `mockImplementationOnce`) with mocked functions from our manual mock implementation in `__mocks__/@clerk/nextjs.ts`.

## Root Cause

The issue stems from TypeScript type definitions and how Vitest handles function mocking. The primary causes were:

1. **Incorrect TypeScript Types**: The mock functions created with `vi.fn()` did not have the proper TypeScript types to support method chaining.

2. **Mock Implementation Structure**: The way we defined and implemented the mocks didn't properly propagate TypeScript type information.

3. **Manual Mocking Limitations**: When using the `__mocks__` directory approach, TypeScript type information is sometimes lost during the mocking process.

## Solution

We've developed a two-part solution that resolves the TypeScript errors while maintaining clean tests:

### 1. Improved Mock Implementation

Update the `__mocks__/@clerk/nextjs.ts` file to use proper TypeScript type casting:

```typescript
// Type definitions matching Clerk's API
type AuthMiddlewareOptions = {
  publicRoutes?: (string | RegExp)[];
  ignoredRoutes?: (string | RegExp)[];
  afterAuth: (
    auth: { userId: string | null; isPublicRoute: boolean },
    req: NextRequest,
    evt: { nextUrl: URL }
  ) => NextResponse | Promise<NextResponse> | null | undefined | void;
};

type AuthMiddlewareFunction = (
  options: AuthMiddlewareOptions
) => (
  req: NextRequest
) => Promise<NextResponse | null | undefined | void>;

// Create properly typed mock functions
export const authMiddleware = vi.fn() as unknown as ReturnType<typeof vi.fn<AuthMiddlewareFunction>>;
```

This ensures the mock functions have the correct TypeScript types including all expected methods.

### 2. Type Assertion in Test Files

In test files, use a helper type to enable method chaining:

```typescript
// Special TypeScript workaround for method chaining on mocks
type MockWithImplementationOnce<T> = T & {
  mockImplementationOnce: (...args: any[]) => MockWithImplementationOnce<T>;
};

const typedAuthMiddleware = authMiddleware as unknown as MockWithImplementationOnce<typeof authMiddleware>;
```

Then use the properly typed variable in tests:

```typescript
typedAuthMiddleware.mockImplementationOnce((options: any) => {
  return async (req: NextRequest) => {
    return options.afterAuth(unauthorizedState, req, { nextUrl: req.nextUrl });
  };
});
```

## Implementation Steps

1. Replace the contents of `__mocks__/@clerk/nextjs.ts` with the improved implementation from `nextjs-mock-solution.ts`.

2. Update the test files to use the type assertion pattern as shown in `factory-test-solution.ts`.

3. Add a helper function in the test utilities to simplify the typing pattern:

```typescript
// Add to lib/middleware/test-utils.ts
export function typedMock<T>(mock: T): MockWithImplementationOnce<T> {
  return mock as unknown as MockWithImplementationOnce<T>;
}
```

4. Update the version number in package.json to 1.0.84.

## Alternative Approaches Considered

1. **Using vi.mocked()**: This approach didn't fully resolve the issue because it didn't maintain the method chaining types.

2. **Inline Mocking**: Moving away from manual mocking with `__mocks__` was considered, but it would introduce hoisting issues and reduce consistency.

3. **Simplified Mock Methods**: Eliminating method chaining was considered, but this would require significant test refactoring.

## Benefits of the Solution

1. **Type Safety**: Provides proper TypeScript type checking for mock functions.

2. **Method Chaining**: Preserves the ability to use method chaining in tests.

3. **Minimal Changes**: Requires minimal changes to existing test files.

4. **Consistency**: Maintains our manual mocking pattern with `__mocks__` directory.

## Future Improvements

1. **Typed Testing Library**: Consider creating a more comprehensive typed testing library to handle these scenarios consistently.

2. **Auto-Type Generation**: Explore tools to automatically generate TypeScript types for mock functions based on the original implementations.

3. **Mock Isolation**: Further isolate mocks to prevent test contamination across files.
