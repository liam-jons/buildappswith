# Test Infrastructure Fixes

This document describes key fixes applied to the testing infrastructure to resolve issues with JSX transformation and mocking in Vitest.

## Issues Fixed

1. **JSX Transformation Errors**
   - Problem: The test runner was failing with errors like `Expected ">" but found "{"` when processing JSX in test setup files.
   - Root cause: JSX syntax in non-TSX files without proper React imports, and hoisting issues with vi.mock.

2. **Mocking Issues**
   - Problem: `vi.mocked(...).mockImplementation is not a function` errors when using dynamic mocks inside functions.
   - Root cause: vi.mock calls are hoisted to the top of the file, causing references to variables defined later to be undefined.

## Solutions Implemented

### 1. Proper React Import for JSX

All files using JSX syntax must import React:

```typescript
import React from 'react';
```

### 2. Using React.createElement Instead of JSX in Test Utilities

For better reliability in test files, we've replaced JSX syntax with explicit `React.createElement` calls:

```typescript
// Instead of
return <>{children}</>;

// Use
return React.createElement(React.Fragment, null, children);
```

### 3. Avoiding vi.mock Hoisting Issues

Modified the mocking approach to avoid hoisting problems:

1. Create mock implementations at the top level:
   ```typescript
   const mockAuth = vi.fn();
   const mockCurrentUser = vi.fn();
   // ... other mocks
   
   vi.mock('@clerk/nextjs', () => ({
     auth: mockAuth,
     currentUser: mockCurrentUser,
     // ... other exports
   }));
   ```

2. Update mock implementations inside functions:
   ```typescript
   function setupMockClerk(userType) {
     const mockUser = mockUsers[userType];
     
     // Update each mock with specific implementation
     mockAuth.mockReturnValue({
       userId: mockUser?.id || null,
       // ... other values
     });
     
     // ... other mock updates
   }
   ```

### 4. Proper Component Mocking

For component mocks, implement them using functions that return React elements:

```typescript
const mockClerkProvider = vi.fn(({ children }) => 
  React.createElement(React.Fragment, null, children)
);

const mockSignedIn = vi.fn(({ children }) => 
  userType !== 'unauthenticated' 
    ? React.createElement(React.Fragment, null, children)
    : null
);
```

## Best Practices for Future Test Development

1. **Imports and JSX**: Always import React in files using JSX syntax, even with the new JSX transform.

2. **Mocking Patterns**: 
   - Define mock functions at the top level
   - Use vi.mock with fixed references, not dynamic variables
   - Update mock implementations inside test functions using mockReturnValue/mockImplementation

3. **Testing Components with Auth**:
   - Use the `renderWithAuth` utility from `__tests__/utils/auth-test-utils.ts`
   - Specify the user type: `renderWithAuth(<Component />, { userType: 'client' })`

4. **Troubleshooting Techniques**:
   - If seeing JSX transform errors, check for React imports and JSX usage in non-TSX files
   - For "variable not defined" errors with vi.mock, check for hoisting issues
   - For middleware/API mocking issues, use the patterns demonstrated in the auth-test-utils.ts file

## Related Files

- `/vitest.setup.ts` - Global test setup and mocks
- `/__tests__/utils/auth-test-utils.ts` - Authentication testing utilities
- `/vitest.config.js`, `/vitest.config.ts`, `/vitest.config.mjs` - Test configuration

## Running Tests

```bash
# Run all tests
pnpm test

# Run a specific test file
pnpm test path/to/test.test.tsx

# Run tests with coverage
pnpm test:coverage
```