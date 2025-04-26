# Middleware Consolidation Test Plan

This document outlines the testing approach for the consolidated middleware implementation.

## Test Scenarios

### Authentication Tests

1. **Public Route Access**
   - Test accessing public routes while unauthenticated (e.g., home page, login page)
   - Expected Result: Access granted, no redirects

2. **Protected Route Access - Unauthenticated**
   - Test accessing protected routes while unauthenticated (e.g., dashboard, profile)
   - Expected Result: Redirect to login page with return URL

3. **Protected Route Access - Authenticated**
   - Test accessing protected routes while authenticated
   - Expected Result: Access granted, no redirects

4. **Auth Page Access - Authenticated**
   - Test accessing login/signup pages while authenticated
   - Expected Result: Redirect to dashboard

### API Protection Tests

5. **Public API Access**
   - Test accessing public API endpoints (e.g., /api/marketplace/builders)
   - Expected Result: Access granted, response returned

6. **Protected API Access - Unauthenticated**
   - Test accessing protected API endpoints while unauthenticated
   - Expected Result: 401 Unauthorized response

7. **Protected API Access - Authenticated**
   - Test accessing protected API endpoints while authenticated
   - Expected Result: Access granted, response returned

8. **CSRF Protection Test**
   - Test POST requests to protected endpoints without CSRF token
   - Expected Result: CSRF error response

9. **Rate Limiting Test**
   - Test multiple rapid requests to rate-limited endpoints
   - Expected Result: 429 Too Many Requests after threshold

### Security Headers Tests

10. **CSP Headers - Page Request**
    - Test CSP headers on regular page requests
    - Expected Result: Proper CSP headers with Clerk domains included

11. **CSP Headers - API Request**
    - Test CSP headers on API requests
    - Expected Result: Proper CSP headers with Clerk domains included

### Legacy Route Tests

12. **NextAuth Session Route**
    - Test accessing /api/auth/session
    - Expected Result: 404 with message about migration

13. **NextAuth SignIn Route**
    - Test accessing /api/auth/signin
    - Expected Result: Redirect to /login

14. **NextAuth SignOut Route**
    - Test accessing /api/auth/signout
    - Expected Result: Redirect to Clerk signout endpoint

## Manual Testing Procedure

1. Rename the consolidated middleware file:
   ```bash
   mv /Users/liamj/Documents/Development/buildappswith/middleware.ts /Users/liamj/Documents/Development/buildappswith/middleware.original.ts
   mv /Users/liamj/Documents/Development/buildappswith/middleware.consolidated.ts /Users/liamj/Documents/Development/buildappswith/middleware.ts
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Test each scenario from the list above manually

4. If issues are discovered:
   - Fix the issues in the consolidated middleware
   - Retest the affected scenarios

5. If all tests pass:
   - Keep the consolidated middleware as the active version
   - Archive or remove the other middleware files

## Automated Testing (Future Implementation)

For future implementation, consider adding automated tests for middleware functionality:

```typescript
// Example test structure
import { createRequest } from 'node-mocks-http';
import middleware from '../middleware';

describe('Middleware Tests', () => {
  it('should redirect unauthenticated users from protected routes', async () => {
    const req = createRequest({
      method: 'GET',
      url: '/dashboard',
    });
    
    const res = await middleware(req);
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain('/login');
  });

  // More test cases...
});
```
