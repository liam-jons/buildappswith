# LLM-Optimized Test Documentation Structure

## Overview

This document defines a structured approach to creating test documentation that is optimized for both human developers and large language models (LLMs). The goal is to make test documentation machine-parsable, searchable, and useful for automated test generation.

**Date**: May 8, 2025  
**Branch**: feature/testing-enhancement  
**Status**: Approved

## Documentation Structure

The documentation follows a structured format with explicit metadata, code patterns, and contextual tags:

```markdown
# BuildAppsWith Testing Documentation

<llm:metadata>
{
  "framework": "Playwright",
  "version": "1.36.0",
  "testTypes": ["e2e", "visual", "component", "api"],
  "primaryLanguage": "TypeScript",
  "lastUpdated": "2025-05-10",
  "repositoryStructure": {
    "e2eTests": "__tests__/e2e",
    "componentTests": "__tests__/components",
    "apiTests": "__tests__/api",
    "testUtils": "__tests__/utils",
    "mocks": "__tests__/mocks"
  }
}
</llm:metadata>

## Table of Contents

1. [Test Patterns](#test-patterns)
2. [Component Testing](#component-testing)
3. [API Testing](#api-testing) 
4. [E2E Testing](#e2e-testing)
5. [Visual Testing](#visual-testing)
6. [Error Testing](#error-testing)
7. [Test Data](#test-data)
8. [Authentication Testing](#authentication-testing)
9. [Mocking](#mocking)
10. [Test Utilities](#test-utilities)
```

## Pattern Documentation

Test patterns are documented with a structured format and machine-parsable tags:

```markdown
## User Authentication Test Pattern

<llm:pattern id="auth-signin-test" category="authentication" complexity="basic">
  
### Pattern Description

Tests the user sign-in flow, verifying successful authentication, error handling, and redirect behavior.

### Use Cases

- Verify users can sign in with valid credentials
- Test error handling for invalid credentials
- Verify appropriate redirects after successful authentication
- Test session persistence
- Verify role-based redirects

### Pattern Structure

```typescript
import { test, expect } from '@playwright/test';
import { AuthUtils } from '../../utils/e2e-auth-utils';

test.describe('Sign-in Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('/');
  });

  test('completes sign-in with valid credentials', async ({ page }) => {
    // Navigate to sign-in page
    await page.getByRole('link', { name: /sign in|log in/i }).click();
    
    // Fill valid credentials
    await page.getByLabel(/email/i).fill('valid-email@example.com');
    await page.getByLabel(/password/i).fill('ValidPassword123!');
    
    // Submit form
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    
    // Verify successful sign-in (dashboard redirect)
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Verify authenticated state elements
    await expect(page.getByTestId('user-menu')).toBeVisible();
  });

  test('displays error message with invalid credentials', async ({ page }) => {
    // Navigate to sign-in page
    await page.getByRole('link', { name: /sign in|log in/i }).click();
    
    // Fill invalid credentials
    await page.getByLabel(/email/i).fill('user@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    
    // Submit form
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    
    // Verify error message
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    
    // Verify still on login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('redirects authenticated user based on role', async ({ page }) => {
    // Direct test for different roles
    const testCases = [
      { role: 'client', expectedPath: /dashboard/ },
      { role: 'builder', expectedPath: /builder/ },
      { role: 'admin', expectedPath: /admin/ }
    ];
    
    for (const { role, expectedPath } of testCases) {
      // Navigate to login page
      await page.goto('/login');
      
      // Login with role-specific user
      await AuthUtils.loginUser(page, role as any);
      
      // Verify correct redirect path
      await expect(page).toHaveURL(expectedPath);
      
      // Logout for next test
      await AuthUtils.logoutUser(page);
    }
  });
});
```

### Key Components

- **Page Navigation**: `page.goto()`, `page.getByRole('link').click()`
- **Form Interaction**: `page.getByLabel().fill()`, `page.getByRole('button').click()`
- **State Verification**: `expect(page).toHaveURL()`, `expect(element).toBeVisible()`
- **Auth Utilities**: `AuthUtils.loginUser()`, `AuthUtils.logoutUser()`

### Common Variations

1. **Social Auth Variation**:
   ```typescript
   test('signs in with social provider', async ({ page }) => {
     await page.goto('/login');
     await page.getByRole('button', { name: /continue with google/i }).click();
     // Social auth flow handling...
   });
   ```

2. **Remember Me Variation**:
   ```typescript
   test('persists session with remember me', async ({ page }) => {
     await page.goto('/login');
     await page.getByLabel(/email/i).fill('user@example.com');
     await page.getByLabel(/password/i).fill('Password123!');
     await page.getByLabel(/remember me/i).check();
     await page.getByRole('button', { name: /sign in/i }).click();
     // Session persistence checks...
   });
   ```

### Dependencies

- Auth utilities: `__tests__/utils/e2e-auth-utils.ts`
- Test fixtures: `__tests__/fixtures/users.ts`
- Mock handlers: `__tests__/mocks/auth/auth-handlers.ts`

### Best Practices

1. Always reset authentication state between tests
2. Test all error conditions (invalid credentials, locked accounts, etc.)
3. Verify security aspects like redirect handling and session management
4. Test with different user roles for role-based redirects
5. Include accessibility testing for authentication forms

### Common Pitfalls

1. Not handling async redirects properly
2. Missing login state verification beyond URL checks
3. Insufficient error case coverage
4. Not testing credential validation requirements

</llm:pattern>
```

## Data Model Documentation

Data models are documented with explicit types and examples:

```markdown
## Test Data Models

<llm:data-model id="user-models" category="auth">

### User Model Types

```typescript
/**
 * Test user model representing application users
 */
export interface TestUser {
  /** Unique user identifier */
  id: string;
  /** User's email address - must be unique */
  email: string;
  /** User's display name */
  name: string;
  /** User's role in the system */
  role: 'CLIENT' | 'BUILDER' | 'ADMIN';
  /** Optional Clerk ID for authentication */
  clerkId?: string;
  /** Whether user's email is verified */
  verified: boolean;
}

/**
 * Builder profile model extending user
 */
export interface TestBuilderProfile {
  /** Profile ID */
  id: string;
  /** ID of associated user */
  userId: string;
  /** Professional biography */
  bio: string;
  /** Professional headline */
  headline: string;
  /** Hourly rate in USD */
  hourlyRate: number;
  /** Areas of expertise */
  domains: string[];
  /** Achievement badges */
  badges: string[];
  /** Validation/trust tier (1-3) */
  validationTier: number;
  /** Whether builder is featured */
  featuredBuilder: boolean;
  /** Whether builder is accepting projects */
  availableForHire: boolean;
  /** Portfolio projects */
  portfolioItems: TestPortfolioItem[];
  /** Available session types */
  sessionTypes: TestSessionType[];
  /** Technical skills */
  skills: TestBuilderSkill[];
}
```

### Example Data

```typescript
// Example test user
const testClient: TestUser = {
  id: 'test-client-id',
  email: 'test-client@buildappswith.com',
  name: 'Test Client',
  role: 'CLIENT',
  clerkId: 'clerk_test_client',
  verified: true
};

// Example builder profile
const testBuilder: TestBuilderProfile = {
  id: 'test-builder-profile-id',
  userId: 'test-builder-id',
  bio: 'Professional developer with 5+ years experience.',
  headline: 'Full-stack Developer',
  hourlyRate: 120,
  domains: ['Web Development', 'AI Integration'],
  badges: ['Top Rated', 'Quick Response'],
  validationTier: 2,
  featuredBuilder: true,
  availableForHire: true,
  portfolioItems: [
    {
      id: 'portfolio-1',
      title: 'E-Commerce Platform',
      description: 'Full-featured online store with payment processing',
      imageUrl: 'https://example.com/image1.jpg',
      tags: ['React', 'Node.js', 'Stripe'],
      createdAt: new Date('2025-01-15')
    }
  ],
  sessionTypes: [
    {
      id: 'session-type-1',
      builderId: 'test-builder-profile-id',
      title: 'Initial Consultation',
      description: 'Discuss project requirements and feasibility',
      durationMinutes: 60,
      price: 100,
      currency: 'USD',
      isActive: true
    }
  ],
  skills: [
    {
      id: 'builder-skill-1',
      skillId: 'skill-react-id',
      builderId: 'test-builder-profile-id',
      proficiency: 5,
      verified: true
    }
  ]
};
```

### Relationships

- **User** → **ClientProfile**: One-to-one relationship
- **User** → **BuilderProfile**: One-to-one relationship
- **BuilderProfile** → **PortfolioItem**: One-to-many relationship
- **BuilderProfile** → **SessionType**: One-to-many relationship
- **BuilderProfile** → **BuilderSkill**: One-to-many relationship
- **BuilderSkill** → **Skill**: Many-to-one relationship

### Factory Functions

```typescript
/**
 * Creates test user with default values
 */
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: `user-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    role: 'CLIENT',
    verified: true,
    ...overrides
  };
}

/**
 * Creates test builder profile
 */
export function createTestBuilderProfile(
  userId: string,
  overrides: Partial<TestBuilderProfile> = {}
): TestBuilderProfile {
  return {
    id: `profile-${Date.now()}`,
    userId,
    bio: 'Test biography content',
    headline: 'Test Headline',
    hourlyRate: 100,
    domains: ['Web Development'],
    badges: [],
    validationTier: 1,
    featuredBuilder: false,
    availableForHire: true,
    portfolioItems: [],
    sessionTypes: [],
    skills: [],
    ...overrides
  };
}
```

</llm:data-model>
```

## Component Test Pattern Documentation

Component tests are documented with a similar structured format:

```markdown
## Component Testing Patterns

<llm:pattern id="component-form-test" category="components" complexity="intermediate">

### Pattern Description

Tests React components that include forms, focusing on input handling, validation, submission, and error states.

### Use Cases

- Test form input validation
- Verify form submission behavior
- Test form error state rendering
- Verify form accessibility

### Pattern Structure

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from '@/components/profile/profile-form';
import { mockProfileData } from '../../mocks/profile/mock-profiles';
import { checkA11y } from '../../utils/a11y-utils';

describe('ProfileForm', () => {
  const mockSubmit = vi.fn();
  const mockFormData = mockProfileData.builderBasic;
  
  beforeEach(() => {
    mockSubmit.mockClear();
  });
  
  it('renders form with initial values', () => {
    render(<ProfileForm initialData={mockFormData} onSubmit={mockSubmit} />);
    
    // Check form fields are populated with initial data
    expect(screen.getByLabelText(/name/i)).toHaveValue(mockFormData.name);
    expect(screen.getByLabelText(/headline/i)).toHaveValue(mockFormData.headline);
    expect(screen.getByLabelText(/bio/i)).toHaveValue(mockFormData.bio);
    
    // Check form structure
    expect(screen.getByRole('button', { name: /save|update|submit/i })).toBeInTheDocument();
  });
  
  it('validates form fields correctly', async () => {
    const user = userEvent.setup();
    render(<ProfileForm initialData={mockFormData} onSubmit={mockSubmit} />);
    
    // Clear required field and submit to trigger validation
    await user.clear(screen.getByLabelText(/name/i));
    await user.click(screen.getByRole('button', { name: /save|update|submit/i }));
    
    // Check validation error appears
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    
    // Form should not be submitted with validation errors
    expect(mockSubmit).not.toHaveBeenCalled();
    
    // Fix validation error
    await user.type(screen.getByLabelText(/name/i), 'New Test Name');
    await user.click(screen.getByRole('button', { name: /save|update|submit/i }));
    
    // Now form should submit
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Test Name'
      }));
    });
  });
  
  it('shows loading state during submission', async () => {
    // Setup mock to delay resolution
    mockSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    const user = userEvent.setup();
    
    render(<ProfileForm initialData={mockFormData} onSubmit={mockSubmit} />);
    await user.click(screen.getByRole('button', { name: /save|update|submit/i }));
    
    // Check loading state
    expect(screen.getByRole('button', { name: /save|update|submit/i })).toBeDisabled();
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save|update|submit/i })).not.toBeDisabled();
    });
  });
  
  it('displays server-side errors', async () => {
    // Setup mock to reject with error
    const errorMessage = 'Server validation failed';
    mockSubmit.mockRejectedValue(new Error(errorMessage));
    
    const user = userEvent.setup();
    render(<ProfileForm initialData={mockFormData} onSubmit={mockSubmit} />);
    
    await user.click(screen.getByRole('button', { name: /save|update|submit/i }));
    
    // Check error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
  
  it('passes accessibility checks', async () => {
    const { container } = render(
      <ProfileForm initialData={mockFormData} onSubmit={mockSubmit} />
    );
    
    await checkA11y(container);
  });
});
```

### Key Components

- **Rendering**: `render(<Component />)`
- **User Interaction**: `userEvent.type()`, `userEvent.click()`
- **Assertions**: `expect(element).toHaveValue()`, `expect(mockFn).toHaveBeenCalled()`
- **Async Testing**: `waitFor(() => ...)`, `async/await`
- **Accessibility**: `checkA11y(container)`

### Common Variations

1. **Dynamic Form Fields**:
   ```typescript
   it('dynamically adds/removes form fields', async () => {
     const user = userEvent.setup();
     render(<DynamicForm initialData={mockData} onSubmit={mockSubmit} />);
     
     // Add new field
     await user.click(screen.getByRole('button', { name: /add field/i }));
     expect(screen.getAllByTestId('form-field')).toHaveLength(initialFieldCount + 1);
     
     // Remove field
     await user.click(screen.getAllByRole('button', { name: /remove/i })[0]);
     expect(screen.getAllByTestId('form-field')).toHaveLength(initialFieldCount);
   });
   ```

2. **Form with File Upload**:
   ```typescript
   it('handles file uploads', async () => {
     const user = userEvent.setup();
     render(<UploadForm onSubmit={mockSubmit} />);
     
     const file = new File(['file content'], 'test.png', { type: 'image/png' });
     const input = screen.getByLabelText(/upload file/i);
     
     await user.upload(input, file);
     
     expect(input.files[0]).toBe(file);
     expect(screen.getByText('test.png')).toBeInTheDocument();
   });
   ```

### Dependencies

- React Testing Library: `@testing-library/react`
- User Event: `@testing-library/user-event`
- Accessibility Testing: `__tests__/utils/a11y-utils.ts`
- Mock Data: `__tests__/mocks/profile/mock-profiles.ts`

### Best Practices

1. Test all validation rules, both client and server-side
2. Check loading states and disabled controls during submission
3. Verify form accessibility (labels, control associations, error announcements)
4. Test error handling for both field validation and submission errors
5. Use realistic mock data that represents production scenarios

### Common Pitfalls

1. Not waiting for asynchronous validation/submission
2. Missing tests for error scenarios
3. Hardcoding expected values instead of referencing mock data
4. Not testing form reset functionality
5. Ignoring keyboard navigation testing

</llm:pattern>
```

## Error Testing Documentation

Error scenarios are documented specifically:

```markdown
## Error Testing Patterns

<llm:pattern id="error-testing" category="error-handling" complexity="advanced">

### Pattern Description

Tests application error handling under various failure scenarios including network errors, API failures, validation errors, and authorization issues.

### Use Cases

- Test graceful handling of API failures
- Verify informative error messages for users
- Test recovery mechanisms after errors
- Verify error boundaries contain failures

### Pattern Structure

```typescript
import { test, expect } from '@playwright/test';
import { ErrorTestingUtils } from '../utils/error-testing';

test.describe('Error Handling in Booking Flow', () => {
  test('displays error message when session type API fails', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/book/established-builder');
    
    // Intercept and simulate API error for session types
    await ErrorTestingUtils.simulateApiError(
      page,
      /\/api\/scheduling\/session-types/,
      500,
      { error: 'Internal Server Error' }
    );
    
    // Check error message is displayed
    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByText(/unable to load session types|something went wrong/i)).toBeVisible();
    
    // Verify retry functionality exists
    await expect(page.getByRole('button', { name: /retry|try again/i })).toBeVisible();
    
    // Test retry functionality
    await page.route(/\/api\/scheduling\/session-types/, route => route.continue());
    await page.getByRole('button', { name: /retry|try again/i }).click();
    
    // Verify recovery after retry
    await expect(page.getByTestId('session-type-card')).toBeVisible();
  });
  
  // Additional test examples...
});
```

### Key Components

- **Error Simulation**: `ErrorTestingUtils.simulateApiError()`, `ErrorTestingUtils.simulateNetworkError()`
- **Route Interception**: `page.route()`, `page.unroute()`
- **Recovery Testing**: Test flow after error resolution
- **State Verification**: Assertions for error messages, loading states

### Common Variations

1. **Error Boundary Testing**:
   ```typescript
   test('error boundary contains component errors', async ({ page }) => {
     // Navigate to page with error boundary
     await page.goto('/marketplace');
     
     // Inject script to cause React error in component
     await page.evaluate(() => {
       const element = document.querySelector('[data-testid="builder-card"]');
       if (element) {
         const error = new Error('Injected error for testing');
         error.name = 'TestingError';
         throw error;
       }
     });
     
     // Verify error boundary caught the error
     await expect(page.getByTestId('error-boundary')).toBeVisible();
     await expect(page.getByText(/something went wrong/i)).toBeVisible();
     
     // Verify error doesn't affect other components
     await expect(page.getByTestId('search-filters')).toBeVisible();
   });
   ```

2. **Service Unavailability**:
   ```typescript
   test('handles complete service outage', async ({ page }) => {
     // Simulate service outage for all API endpoints
     await ErrorTestingUtils.simulateServiceUnavailable(
       page,
       /\/api\/.*/
     );
     
     // Navigate to booking page
     await page.goto('/book/established-builder');
     
     // Verify global service error is shown
     await expect(page.getByTestId('service-error')).toBeVisible();
     await expect(page.getByText(/service (unavailable|temporarily down)/i)).toBeVisible();
     
     // Check for support contact information
     await expect(page.getByText(/contact support/i)).toBeVisible();
   });
   ```

### Dependencies

- Error Testing Utilities: `__tests__/utils/error-testing.ts`
- Mock API Response Data: `__tests__/mocks/scheduling/mock-data.ts`

### Best Practices

1. Test recovery paths after errors are resolved
2. Verify appropriate messaging for different error types
3. Ensure technical error details are not exposed to users
4. Test loading states during slow responses
5. Check error boundary containment
6. Test authorization error handling and session recovery

### Common Pitfalls

1. Only testing happy path flows
2. Missing tests for transient network conditions
3. Not checking error recovery mechanisms
4. Hardcoding error expectations instead of testing for user-friendly messages
5. Ignoring edge cases like multiple concurrent errors

</llm:pattern>
```

## API Testing Documentation

API test patterns are also documented in a structured way:

```markdown
## API Testing Patterns

<llm:pattern id="api-route-testing" category="api" complexity="intermediate">

### Pattern Description

Tests Next.js API routes, focusing on request handling, validation, authentication, and response formatting.

### Use Cases

- Test API route handlers
- Verify request validation
- Test authentication and authorization
- Test error responses

### Pattern Structure

```typescript
import { testApiHandler } from '__tests__/utils/api-test-utils';
import { createMockRequest, createMockResponse } from '__tests__/utils/api-test-utils';
import builderHandler from '@/app/api/marketplace/builders/route';
import { mockBuilders } from '__tests__/mocks/marketplace/mock-builders';
import { getAuthHeaders } from '__tests__/utils/auth-test-utils';

describe('Builders API Route', () => {
  it('returns list of builders with valid request', async () => {
    const { req, res } = createMockRequest({
      method: 'GET',
      query: { limit: '10', domain: 'Web Development' }
    });
    
    await testApiHandler({
      handler: builderHandler,
      req,
      res
    });
    
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toHaveProperty('builders');
    expect(res._getJSONData().builders.length).toBeGreaterThan(0);
    expect(res._getJSONData().builders[0]).toHaveProperty('id');
    expect(res._getJSONData().builders[0]).toHaveProperty('name');
    expect(res._getJSONData().builders[0]).toHaveProperty('hourlyRate');
  });
  
  // Additional test examples...
});
```

### Key Components

- **Mock Request/Response**: `createMockRequest()`, `createMockResponse()`
- **API Handler Testing**: `testApiHandler()`
- **Auth Headers**: `getAuthHeaders()`
- **Response Assertions**: `expect(res.statusCode)`, `expect(res._getJSONData())`
- **Mocking Dependencies**: `vi.mock()`, `vi.restoreAllMocks()`

### Common Variations

1. **Pagination Testing**:
   ```typescript
   it('implements pagination correctly', async () => {
     const pageSize = 5;
     
     // Request first page
     const { req: page1Req, res: page1Res } = createMockRequest({
       method: 'GET',
       query: { limit: pageSize.toString(), page: '1' }
     });
     
     await testApiHandler({
       handler: builderHandler,
       req: page1Req,
       res: page1Res
     });
     
     // Request second page
     const { req: page2Req, res: page2Res } = createMockRequest({
       method: 'GET',
       query: { limit: pageSize.toString(), page: '2' }
     });
     
     await testApiHandler({
       handler: builderHandler,
       req: page2Req,
       res: page2Res
     });
     
     // Verify pagination
     expect(page1Res.statusCode).toBe(200);
     expect(page2Res.statusCode).toBe(200);
     
     const page1Data = page1Res._getJSONData();
     const page2Data = page2Res._getJSONData();
     
     expect(page1Data.builders.length).toBe(pageSize);
     expect(page1Data).toHaveProperty('pagination');
     expect(page1Data.pagination).toHaveProperty('totalPages');
     
     // Ensure no duplicate builders between pages
     const page1Ids = page1Data.builders.map(b => b.id);
     const page2Ids = page2Data.builders.map(b => b.id);
     
     expect(page1Ids.some(id => page2Ids.includes(id))).toBe(false);
   });
   ```

2. **File Upload Handling**:
   ```typescript
   it('handles file uploads', async () => {
     const mockFile = Buffer.from('test file content');
     
     const { req, res } = createMockRequest({
       method: 'POST',
       headers: {
         'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary',
         ...await getAuthHeaders('BUILDER')
       },
       body: mockMultipartFormData('profile-image', mockFile, 'image.jpg')
     });
     
     await testApiHandler({
       handler: uploadHandler,
       req,
       res
     });
     
     expect(res.statusCode).toBe(200);
     expect(res._getJSONData()).toHaveProperty('imageUrl');
   });
   ```

### Dependencies

- API Test Utilities: `__tests__/utils/api-test-utils.ts`
- Auth Test Utilities: `__tests__/utils/auth-test-utils.ts`
- Mock Builders Data: `__tests__/mocks/marketplace/mock-builders.ts`

### Best Practices

1. Test all HTTP methods supported by the endpoint
2. Verify input validation for all parameters
3. Test authentication and authorization requirements
4. Verify pagination, filtering, and sorting
5. Test error handling for various failure scenarios
6. Verify response format matches API contracts
7. Test rate limiting if implemented

### Common Pitfalls

1. Not testing all query parameter validations
2. Missing tests for authentication edge cases
3. Not verifying error response format consistency
4. Ignoring CORS header validation in responses
5. Not testing with realistic data volumes

</llm:pattern>
```

## Documentation Structure Best Practices

The documentation includes best practices for LLM-optimized structure:

```markdown
## LLM Documentation Best Practices

<llm:documentation-guide>

### Machine-Parsable Structure Guidelines

1. **Consistent Tags**: Use `<llm:pattern>`, `<llm:data-model>`, and `<llm:metadata>` tags to explicitly mark sections for machine parsing.

2. **JSON Metadata**: Include structured metadata in JSON format for automated processing.

3. **Code Block Delimitation**: Always use triple backticks with language specification for code blocks.

4. **Pattern IDs**: Assign unique identifiers to test patterns for reference (e.g., `id="auth-signin-test"`).

5. **Categorization**: Tag content with categories and complexity levels for filtering.

6. **Dependencies Section**: Explicitly list dependencies with file paths.

7. **Type Annotations**: Include TypeScript interfaces with JSDoc comments.

8. **Examples with Variations**: Provide base pattern with common variations.

### Content Organization for LLM Comprehension

1. **Hierarchical Structure**: Organize content in a hierarchical structure from general to specific.

2. **Explicit Use Cases**: List specific use cases for each pattern.

3. **Key Components Section**: Highlight the most important components of each pattern.

4. **Common Pitfalls**: Document common mistakes to avoid.

5. **Best Practices**: Include recommendations based on experience.

6. **Cross-References**: Use pattern IDs to reference related patterns.

7. **Versioning Information**: Include version information for framework dependencies.

### Actionable Guidelines for Documentation Authors

1. When documenting a test pattern:
   - Include complete, runnable code examples
   - Document all parameters and return values
   - Provide context about when to use the pattern
   - List common variations with code

2. When documenting test data:
   - Include type definitions with JSDoc comments
   - Provide example instantiations
   - Document relationships between models
   - Include factory functions with parameters

3. When documenting utilities:
   - Document function signatures with types
   - Include example usage for each parameter combination
   - Document error handling behavior
   - Provide performance considerations

4. When updating documentation:
   - Maintain consistent formatting across sections
   - Ensure code examples remain valid
   - Update version information
   - Cross-check references to other patterns

</llm:documentation-guide>
```

## Benefits of LLM-Optimized Documentation

1. **Machine Comprehension**: Makes documentation parsable and useful for AI tools
2. **Automated Test Generation**: Enables AI to generate tests based on patterns
3. **Searchability**: Structured metadata makes it easier to find relevant patterns
4. **Consistency**: Enforces a consistent structure for all test documentation
5. **Context Retention**: Provides explicit relationships between components
6. **Type Safety**: Includes comprehensive type information for all models
7. **Hierarchical Organization**: Structures information from general to specific

## Implementation Approach

1. **Phase 1**: Define documentation structure and metadata schema (Completed)
2. **Phase 2**: Document core authentication and booking test patterns (Completed)
3. **Phase 3**: Document error handling and edge case test patterns (Completed)
4. **Phase 4**: Document component and API test patterns (Completed)
5. **Phase 5**: Documentation tooling for validation and generation (Planned)