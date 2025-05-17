# Authentication Testing Patterns

**Version:** 1.0.0
**Date:** May 10, 2025
**Status:** Approved
**Key Stakeholders:** Engineering Team, Security Team, QA

## Overview

This document outlines the testing patterns for authentication in the BuildAppsWith platform. It provides standardized approaches for testing user authentication, role-based permissions, and secure user flows using Clerk as the authentication provider.

## Key Concepts

- **Authentication Testing**: Verification of user identity and login flows
- **Authorization Testing**: Verification of user permissions and access controls
- **Role-Based Testing**: Testing different permission levels by user role
- **Session Management**: Testing session creation, persistence, and invalidation
- **Security Testing**: Testing protection against common auth vulnerabilities

## Authentication Testing Framework

Our authentication testing framework consists of:

1. **Testing Utilities**
   - Mock authentication for unit and component tests
   - Authentication state helpers for E2E tests
   - Role-based test users

2. **Test Categories**
   - Unit tests for auth utilities and hooks
   - Component tests for auth UI elements
   - Integration tests for auth state management
   - E2E tests for complete auth flows

3. **Test Coverage Areas**
   - Sign-up and verification flows
   - Sign-in and session management
   - Role-based access control
   - Profile management and role switching
   - Security boundaries and protections

## Authentication Testing Utilities

### Mock Authentication for Unit/Component Tests

The `auth-test-utils.ts` module provides utilities for mocking Clerk authentication:

```typescript
// __tests__/utils/auth-test-utils.ts

import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { mockUsers } from '../mocks/auth/users.mocks'

/**
 * Set up mock Clerk auth for testing
 */
export function setupMockClerk(
  userType: 'client' | 'builder' | 'admin' | 'unauthenticated' = 'client',
  overrides = {}
) {
  // Implementation details in auth-test-utils.ts
}

/**
 * Render component with authentication mocked
 */
export function renderWithAuth(
  ui: React.ReactElement,
  options = {}
) {
  // Implementation details in auth-test-utils.ts
}

/**
 * Mock server-side auth for API testing
 */
export function mockServerAuth(
  options: {
    isAuthenticated: boolean,
    userId?: string,
    roles?: string[]
  }
) {
  // Implementation details in auth-test-utils.ts
}
```

### E2E Authentication State Management

The `e2e-auth-utils.ts` module provides utilities for E2E test authentication:

```typescript
// __tests__/utils/e2e-auth-utils.ts

/**
 * Manages authentication states for E2E tests
 */
export class AuthUtils {
  /**
   * Get authentication state for specific user role
   */
  static getStorageStatePath(role: string) {
    return `./playwright/.auth/${role}.json`;
  }

  /**
   * Create authentication state for all test users
   */
  static async createAllAuthStates(browser) {
    // Implementation details in e2e-auth-utils.ts
  }

  /**
   * Create authentication state for specific user
   */
  static async createAuthState(browser, user) {
    // Implementation details in e2e-auth-utils.ts
  }
}
```

## Unit Testing Authentication

### Auth Hooks and Utilities

Unit tests for authentication hooks and utilities:

```typescript
// __tests__/unit/auth/hooks/use-auth.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/lib/auth/hooks'
import { setupMockClerk } from '@/__tests__/utils/auth-test-utils'

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns isAuthenticated=true for authenticated user', () => {
    // Set up mock authenticated user
    setupMockClerk('client')

    // Render the hook
    const { result } = renderHook(() => useAuth())

    // Assert authentication state
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toBeDefined()
    expect(result.current.roles).toContain('CLIENT')
  })

  it('returns isAuthenticated=false for unauthenticated user', () => {
    // Set up mock unauthenticated state
    setupMockClerk('unauthenticated')

    // Render the hook
    const { result } = renderHook(() => useAuth())

    // Assert authentication state
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.roles).toEqual([])
  })

  it('correctly identifies user roles', () => {
    // Set up mock multi-role user
    setupMockClerk('client', {
      publicMetadata: { roles: ['CLIENT', 'BUILDER'] }
    })

    // Render the hook
    const { result } = renderHook(() => useAuth())

    // Assert roles
    expect(result.current.roles).toContain('CLIENT')
    expect(result.current.roles).toContain('BUILDER')
    expect(result.current.hasRole('CLIENT')).toBe(true)
    expect(result.current.hasRole('BUILDER')).toBe(true)
    expect(result.current.hasRole('ADMIN')).toBe(false)
  })

  it('handles sign out', async () => {
    // Set up mock authenticated user with signOut mock
    const signOutMock = vi.fn().mockResolvedValue(undefined)
    setupMockClerk('client', {
      signOut: signOutMock
    })

    // Render the hook
    const { result } = renderHook(() => useAuth())

    // Call signOut
    await act(async () => {
      await result.current.signOut()
    })

    // Assert signOut was called
    expect(signOutMock).toHaveBeenCalled()
  })
})
```

### Auth API Utilities

Unit tests for authentication API utilities:

```typescript
// __tests__/unit/auth/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCurrentUser, getUserRoles } from '@/lib/auth/api'
import { mockServerAuth } from '@/__tests__/utils/auth-test-utils'

describe('Auth API utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('getCurrentUser returns user data for authenticated user', async () => {
    // Set up mock authenticated server auth
    mockServerAuth({
      isAuthenticated: true,
      userId: 'user_123',
      roles: ['CLIENT']
    })

    // Call the function
    const user = await getCurrentUser()

    // Assert user data
    expect(user).toBeDefined()
    expect(user.id).toBe('user_123')
  })

  it('getCurrentUser returns null for unauthenticated user', async () => {
    // Set up mock unauthenticated server auth
    mockServerAuth({
      isAuthenticated: false
    })

    // Call the function
    const user = await getCurrentUser()

    // Assert null user
    expect(user).toBeNull()
  })

  it('getUserRoles returns correct roles for authenticated user', async () => {
    // Set up mock authenticated server auth with roles
    mockServerAuth({
      isAuthenticated: true,
      userId: 'user_123',
      roles: ['CLIENT', 'BUILDER']
    })

    // Call the function
    const roles = await getUserRoles()

    // Assert roles
    expect(roles).toContain('CLIENT')
    expect(roles).toContain('BUILDER')
    expect(roles).not.toContain('ADMIN')
  })

  it('getUserRoles returns empty array for unauthenticated user', async () => {
    // Set up mock unauthenticated server auth
    mockServerAuth({
      isAuthenticated: false
    })

    // Call the function
    const roles = await getUserRoles()

    // Assert empty roles
    expect(roles).toEqual([])
  })
})
```

## Component Testing Authentication

### Auth UI Components

Component tests for authentication UI components:

```typescript
// __tests__/components/auth/auth-status.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AuthStatus } from '@/components/auth/auth-status'
import { setupMockClerk, renderWithAuth } from '@/__tests__/utils/auth-test-utils'

describe('AuthStatus component', () => {
  it('displays sign in button when user is not authenticated', () => {
    // Render with unauthenticated user
    renderWithAuth(<AuthStatus />, { userType: 'unauthenticated' })

    // Assert sign in button is displayed
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument()
  })

  it('displays user info when authenticated', () => {
    // Render with authenticated user
    renderWithAuth(<AuthStatus />, { 
      userType: 'client',
      userOverrides: {
        firstName: 'Test',
        lastName: 'User'
      }
    })

    // Assert user menu is displayed
    expect(screen.getByTestId('user-menu')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
  })

  it('triggers sign out when sign out button is clicked', async () => {
    // Setup mock sign out function
    const signOutMock = vi.fn().mockResolvedValue(undefined)
    setupMockClerk('client', {
      signOut: signOutMock
    })

    // Render the component
    render(<AuthStatus />)

    // Open the user menu
    fireEvent.click(screen.getByTestId('user-menu'))

    // Click the sign out button
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))

    // Assert sign out was called
    expect(signOutMock).toHaveBeenCalled()
  })

  it('displays correct roles for multi-role user', () => {
    // Render with multi-role user
    renderWithAuth(<AuthStatus />, { 
      userType: 'client',
      userOverrides: {
        publicMetadata: { 
          roles: ['CLIENT', 'BUILDER'] 
        }
      }
    })

    // Open the user menu
    fireEvent.click(screen.getByTestId('user-menu'))

    // Assert both roles are displayed
    expect(screen.getByText(/client/i)).toBeInTheDocument()
    expect(screen.getByText(/builder/i)).toBeInTheDocument()
  })
})
```

### Protected Routes

Component tests for protected route components:

```typescript
// __tests__/components/auth/protected-route.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { renderWithAuth } from '@/__tests__/utils/auth-test-utils'

describe('ProtectedRoute component', () => {
  it('renders children when user has required role', () => {
    // Render with client role
    renderWithAuth(
      <ProtectedRoute requiredRoles={['CLIENT']}>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>,
      { userType: 'client' }
    )

    // Assert content is displayed
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders access denied when user lacks required role', () => {
    // Render with client role but requiring builder role
    renderWithAuth(
      <ProtectedRoute requiredRoles={['BUILDER']}>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>,
      { userType: 'client' }
    )

    // Assert access denied is displayed
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('renders loading state while auth is loading', () => {
    // Mock loading state
    vi.mock('@clerk/nextjs', () => ({
      useAuth: () => ({
        isLoaded: false,
        isSignedIn: undefined
      }),
      useUser: () => ({
        isLoaded: false,
        user: undefined
      })
    }))

    // Render the component
    render(
      <ProtectedRoute requiredRoles={['CLIENT']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Assert loading state is displayed
    expect(screen.getByTestId('auth-loading')).toBeInTheDocument()
  })

  it('redirects unauthenticated users to login', () => {
    // Mock router
    const mockPush = vi.fn()
    vi.mock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush
      })
    }))

    // Render with unauthenticated user
    renderWithAuth(
      <ProtectedRoute requiredRoles={['CLIENT']}>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { userType: 'unauthenticated' }
    )

    // Assert router was called with login path
    expect(mockPush).toHaveBeenCalledWith('/login?returnUrl=%2F')
  })
})
```

## Integration Testing Authentication

### Auth State Management

Integration tests for authentication state management:

```typescript
// __tests__/integration/auth-marketplace/auth-state.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { AuthProvider } from '@/components/providers/auth-provider'
import { MarketplaceWithAuth } from '@/components/marketplace/marketplace-with-auth'
import { setupMockClerk } from '@/__tests__/utils/auth-test-utils'

describe('Auth state in marketplace context', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows personalized content for authenticated users', async () => {
    // Set up authenticated user
    setupMockClerk('client', {
      firstName: 'Test',
      publicMetadata: {
        preferences: {
          favoriteCategories: ['AI', 'Web Development']
        }
      }
    })

    // Render marketplace with auth provider
    render(
      <AuthProvider>
        <MarketplaceWithAuth />
      </AuthProvider>
    )

    // Assert personalized greeting is shown
    expect(screen.getByText(/welcome back, test/i)).toBeInTheDocument()
    
    // Assert personalized recommendations are shown
    expect(screen.getByText(/recommended for you/i)).toBeInTheDocument()
    expect(screen.getByText(/based on your interest in ai/i)).toBeInTheDocument()
  })

  it('shows generic content for unauthenticated users', () => {
    // Set up unauthenticated state
    setupMockClerk('unauthenticated')

    // Render marketplace with auth provider
    render(
      <AuthProvider>
        <MarketplaceWithAuth />
      </AuthProvider>
    )

    // Assert generic greeting is shown
    expect(screen.getByText(/discover top developers/i)).toBeInTheDocument()
    
    // Assert generic recommendations are shown
    expect(screen.getByText(/popular categories/i)).toBeInTheDocument()
    expect(screen.queryByText(/recommended for you/i)).not.toBeInTheDocument()
  })

  it('updates UI when user signs in', async () => {
    // Set up initial unauthenticated state
    const mockSignIn = vi.fn().mockResolvedValue({
      createdSessionId: 'sess_123',
      status: 'complete',
      userData: {
        firstName: 'Test',
        publicMetadata: {
          roles: ['CLIENT']
        }
      }
    })
    
    setupMockClerk('unauthenticated', {
      signIn: mockSignIn
    })

    // Render marketplace with auth provider
    render(
      <AuthProvider>
        <MarketplaceWithAuth />
      </AuthProvider>
    )

    // Assert unauthenticated state
    expect(screen.getByText(/discover top developers/i)).toBeInTheDocument()
    
    // Trigger sign in
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Mock auth state change
    await act(async () => {
      setupMockClerk('client', {
        firstName: 'Test',
        publicMetadata: {
          roles: ['CLIENT']
        }
      })
      
      // Force re-render by triggering auth change callback
      const authChangeCallback = vi.mocked(mockSignIn).mock.calls[0][0].afterSignInUrl
      await authChangeCallback()
    })
    
    // Assert authenticated state
    expect(screen.getByText(/welcome back, test/i)).toBeInTheDocument()
  })
})
```

### Role-Based Feature Access

Integration tests for role-based feature access:

```typescript
// __tests__/integration/auth-marketplace/role-access.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppWithAuth } from '@/components/app-with-auth'
import { renderWithAuth } from '@/__tests__/utils/auth-test-utils'

describe('Role-based feature access', () => {
  it('shows builder features for builder role', () => {
    // Render with builder role
    renderWithAuth(
      <AppWithAuth />,
      { userType: 'builder' }
    )

    // Navigate to dashboard
    fireEvent.click(screen.getByRole('link', { name: /dashboard/i }))

    // Assert builder features are shown
    expect(screen.getByText(/manage profile/i)).toBeInTheDocument()
    expect(screen.getByText(/session types/i)).toBeInTheDocument()
    expect(screen.getByText(/availability/i)).toBeInTheDocument()
    expect(screen.getByText(/bookings/i)).toBeInTheDocument()
  })

  it('shows client features for client role', () => {
    // Render with client role
    renderWithAuth(
      <AppWithAuth />,
      { userType: 'client' }
    )

    // Navigate to dashboard
    fireEvent.click(screen.getByRole('link', { name: /dashboard/i }))

    // Assert client features are shown
    expect(screen.getByText(/my bookings/i)).toBeInTheDocument()
    expect(screen.getByText(/favorite builders/i)).toBeInTheDocument()
    expect(screen.queryByText(/session types/i)).not.toBeInTheDocument()
  })

  it('shows admin features for admin role', () => {
    // Render with admin role
    renderWithAuth(
      <AppWithAuth />,
      { userType: 'admin' }
    )

    // Assert admin menu is shown
    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument()

    // Navigate to admin panel
    fireEvent.click(screen.getByRole('link', { name: /admin/i }))

    // Assert admin features are shown
    expect(screen.getByText(/user management/i)).toBeInTheDocument()
    expect(screen.getByText(/builder verification/i)).toBeInTheDocument()
    expect(screen.getByText(/platform settings/i)).toBeInTheDocument()
  })

  it('shows combined features for multi-role user', () => {
    // Render with client+builder roles
    renderWithAuth(
      <AppWithAuth />,
      { 
        userType: 'client',
        userOverrides: {
          publicMetadata: { 
            roles: ['CLIENT', 'BUILDER'] 
          }
        }
      }
    )

    // Navigate to dashboard
    fireEvent.click(screen.getByRole('link', { name: /dashboard/i }))

    // Assert role switcher is shown
    expect(screen.getByTestId('role-switcher')).toBeInTheDocument()

    // Assert both client and builder features are accessible
    expect(screen.getByText(/my bookings/i)).toBeInTheDocument()
    expect(screen.getByText(/manage profile/i)).toBeInTheDocument()
  })
})
```

## End-to-End Testing Authentication

### Authentication Flows

E2E tests for authentication flows:

```typescript
// __tests__/e2e/auth/auth-flow.test.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication flows', () => {
  test('successful sign up flow', async ({ page }) => {
    // Navigate to sign up page
    await page.goto('/signup')
    
    // Fill out sign up form
    await page.fill('input[name="firstName"]', 'New')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'Password123!')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify success
    await expect(page).toHaveURL(/\/onboarding/)
    await expect(page.locator('h1')).toContainText(/complete your profile/i)
  })

  test('successful sign in flow', async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/login')
    
    // Fill out sign in form with test user
    await page.fill('input[name="email"]', 'client-test1@buildappswith.com')
    await page.fill('input[name="password"]', 'TestClient123!')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify successful login and redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('[data-testid="user-greeting"]')).toContainText(/welcome/i)
  })

  test('invalid credentials error handling', async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/login')
    
    // Fill out sign in form with invalid credentials
    await page.fill('input[name="email"]', 'client-test1@buildappswith.com')
    await page.fill('input[name="password"]', 'WrongPassword123!')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify error message
    await expect(page.locator('[data-testid="auth-error"]')).toContainText(/invalid credentials/i)
    await expect(page).toHaveURL(/\/login/)
  })

  test('password reset flow', async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/login')
    
    // Click forgot password link
    await page.click('text=Forgot password?')
    
    // Fill out password reset form
    await page.fill('input[name="email"]', 'client-test1@buildappswith.com')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify success message
    await expect(page.locator('[data-testid="reset-success"]')).toContainText(/email sent/i)
  })
})
```

### Role-Based Access Control

E2E tests for role-based access control:

```typescript
// __tests__/e2e/auth/rbac.test.ts
import { test, expect } from '@playwright/test'
import { AuthUtils } from '@/__tests__/utils/e2e-auth-utils'

test.describe('Role-based access control', () => {
  test('client can access client dashboard', async ({ browser }) => {
    // Create context with client auth state
    const context = await browser.newContext({
      storageState: AuthUtils.getStorageStatePath('client')
    })
    const page = await context.newPage()
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Verify client dashboard elements
    await expect(page.locator('h1')).toContainText(/client dashboard/i)
    await expect(page.locator('[data-testid="bookings-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="favorites-list"]')).toBeVisible()
  })

  test('builder can access builder dashboard', async ({ browser }) => {
    // Create context with builder auth state
    const context = await browser.newContext({
      storageState: AuthUtils.getStorageStatePath('builder')
    })
    const page = await context.newPage()
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Verify builder dashboard elements
    await expect(page.locator('h1')).toContainText(/builder dashboard/i)
    await expect(page.locator('[data-testid="session-types"]')).toBeVisible()
    await expect(page.locator('[data-testid="availability"]')).toBeVisible()
    await expect(page.locator('[data-testid="bookings-management"]')).toBeVisible()
  })

  test('admin can access admin panel', async ({ browser }) => {
    // Create context with admin auth state
    const context = await browser.newContext({
      storageState: AuthUtils.getStorageStatePath('admin')
    })
    const page = await context.newPage()
    
    // Navigate to admin panel
    await page.goto('/admin')
    
    // Verify admin panel elements
    await expect(page.locator('h1')).toContainText(/admin panel/i)
    await expect(page.locator('[data-testid="user-management"]')).toBeVisible()
    await expect(page.locator('[data-testid="builder-verification"]')).toBeVisible()
    await expect(page.locator('[data-testid="platform-settings"]')).toBeVisible()
  })

  test('client cannot access admin panel', async ({ browser }) => {
    // Create context with client auth state
    const context = await browser.newContext({
      storageState: AuthUtils.getStorageStatePath('client')
    })
    const page = await context.newPage()
    
    // Attempt to navigate to admin panel
    await page.goto('/admin')
    
    // Verify access denied or redirect
    await expect(page).toHaveURL(/\/login/) // Redirected to login
    // OR
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()
  })

  test('unauthenticated user is redirected from protected routes', async ({ page }) => {
    // Attempt to navigate to dashboard (protected route)
    await page.goto('/dashboard')
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fdashboard/)
  })
})
```

### Profile Management and Role Switching

E2E tests for profile management and role switching:

```typescript
// __tests__/e2e/auth/profile-management.test.ts
import { test, expect } from '@playwright/test'
import { AuthUtils } from '@/__tests__/utils/e2e-auth-utils'

test.describe('Profile management', () => {
  test('user can update profile information', async ({ browser }) => {
    // Create context with client auth state
    const context = await browser.newContext({
      storageState: AuthUtils.getStorageStatePath('client')
    })
    const page = await context.newPage()
    
    // Navigate to profile settings
    await page.goto('/dashboard')
    await page.click('[data-testid="profile-settings"]')
    
    // Update profile information
    const newBio = `Updated bio ${Date.now()}`
    await page.fill('textarea[name="bio"]', newBio)
    await page.click('button[type="submit"]')
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // Reload page and verify persistence
    await page.reload()
    await expect(page.locator('textarea[name="bio"]')).toHaveValue(newBio)
  })

  test('multi-role user can switch between roles', async ({ browser }) => {
    // Create context with multi-role user auth state
    const context = await browser.newContext({
      storageState: AuthUtils.getStorageStatePath('multi-role')
    })
    const page = await context.newPage()
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Verify default role view (client)
    await expect(page.locator('h1')).toContainText(/client dashboard/i)
    
    // Switch to builder role
    await page.click('[data-testid="role-switcher"]')
    await page.click('text=Builder')
    
    // Verify builder view
    await expect(page.locator('h1')).toContainText(/builder dashboard/i)
    await expect(page.locator('[data-testid="session-types"]')).toBeVisible()
    
    // Verify role persistence on navigation
    await page.click('[data-testid="nav-marketplace"]')
    await page.click('[data-testid="nav-dashboard"]')
    await expect(page.locator('h1')).toContainText(/builder dashboard/i)
  })
})
```

## API Testing Authentication

### Authentication Middleware

Tests for authentication middleware:

```typescript
// __tests__/api/auth/middleware.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authMiddleware, requireRole } from '@/lib/middleware/auth'
import { createMockRequest } from '@/__tests__/utils/api-test-utils'
import { mockServerAuth } from '@/__tests__/utils/auth-test-utils'

describe('Auth middleware', () => {
  let mockNext: ReturnType<typeof vi.fn>
  
  beforeEach(() => {
    vi.resetAllMocks()
    mockNext = vi.fn()
  })

  it('allows authenticated requests through', async () => {
    // Mock authenticated server request
    mockServerAuth({
      isAuthenticated: true,
      userId: 'user_123',
      roles: ['CLIENT']
    })
    
    // Create mock request
    const req = createMockRequest('/api/test')
    
    // Call middleware
    await authMiddleware(req, mockNext)
    
    // Assert next was called (middleware allowed request)
    expect(mockNext).toHaveBeenCalled()
  })

  it('rejects unauthenticated requests', async () => {
    // Mock unauthenticated server request
    mockServerAuth({
      isAuthenticated: false
    })
    
    // Create mock request
    const req = createMockRequest('/api/test')
    
    // Create response spy
    const jsonMock = vi.fn()
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    const resMock = { status: statusMock }
    
    // Call middleware
    await authMiddleware(req, mockNext, resMock)
    
    // Assert next was not called (middleware blocked request)
    expect(mockNext).not.toHaveBeenCalled()
    
    // Assert error response was returned
    expect(statusMock).toHaveBeenCalledWith(401)
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('unauthorized')
      })
    )
  })

  it('requireRole allows users with required role', async () => {
    // Mock authenticated server request with CLIENT role
    mockServerAuth({
      isAuthenticated: true,
      userId: 'user_123',
      roles: ['CLIENT']
    })
    
    // Create mock request
    const req = createMockRequest('/api/test')
    
    // Call middleware
    await requireRole(['CLIENT'])(req, mockNext)
    
    // Assert next was called (middleware allowed request)
    expect(mockNext).toHaveBeenCalled()
  })

  it('requireRole blocks users missing required role', async () => {
    // Mock authenticated server request with CLIENT role
    mockServerAuth({
      isAuthenticated: true,
      userId: 'user_123',
      roles: ['CLIENT']
    })
    
    // Create mock request
    const req = createMockRequest('/api/test')
    
    // Create response spy
    const jsonMock = vi.fn()
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    const resMock = { status: statusMock }
    
    // Call middleware requiring ADMIN role
    await requireRole(['ADMIN'])(req, mockNext, resMock)
    
    // Assert next was not called (middleware blocked request)
    expect(mockNext).not.toHaveBeenCalled()
    
    // Assert error response was returned
    expect(statusMock).toHaveBeenCalledWith(403)
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('forbidden')
      })
    )
  })
})
```

### User API Endpoints

Tests for user API endpoints:

```typescript
// __tests__/api/auth/users.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/auth/users/route'
import { createMockRequest } from '@/__tests__/utils/api-test-utils'
import { mockServerAuth } from '@/__tests__/utils/auth-test-utils'

describe('User API endpoints', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('GET /api/auth/users/me', () => {
    it('returns user data for authenticated user', async () => {
      // Mock authenticated server request
      mockServerAuth({
        isAuthenticated: true,
        userId: 'user_123',
        roles: ['CLIENT']
      })
      
      // Create mock request
      const req = createMockRequest('/api/auth/users/me')
      
      // Call API route
      const res = await GET(req)
      
      // Assert response
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.id).toBe('user_123')
      expect(data.user.roles).toContain('CLIENT')
    })

    it('returns 401 for unauthenticated user', async () => {
      // Mock unauthenticated server request
      mockServerAuth({
        isAuthenticated: false
      })
      
      // Create mock request
      const req = createMockRequest('/api/auth/users/me')
      
      // Call API route
      const res = await GET(req)
      
      // Assert response
      expect(res.status).toBe(401)
      
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })

  describe('POST /api/auth/users/roles', () => {
    it('allows admins to update user roles', async () => {
      // Mock authenticated server request with ADMIN role
      mockServerAuth({
        isAuthenticated: true,
        userId: 'admin_123',
        roles: ['ADMIN']
      })
      
      // Mock database update
      vi.mock('@/lib/auth/data-access', () => ({
        updateUserRoles: vi.fn().mockResolvedValue({
          id: 'user_456',
          roles: ['CLIENT', 'BUILDER']
        })
      }))
      
      // Create mock request
      const req = createMockRequest('/api/auth/users/roles', {
        method: 'POST',
        body: {
          userId: 'user_456',
          roles: ['CLIENT', 'BUILDER']
        }
      })
      
      // Call API route
      const res = await POST(req)
      
      // Assert response
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.roles).toContain('CLIENT')
      expect(data.user.roles).toContain('BUILDER')
    })

    it('prevents non-admins from updating roles', async () => {
      // Mock authenticated server request with CLIENT role
      mockServerAuth({
        isAuthenticated: true,
        userId: 'user_123',
        roles: ['CLIENT']
      })
      
      // Create mock request
      const req = createMockRequest('/api/auth/users/roles', {
        method: 'POST',
        body: {
          userId: 'user_456',
          roles: ['CLIENT', 'BUILDER']
        }
      })
      
      // Call API route
      const res = await POST(req)
      
      // Assert response
      expect(res.status).toBe(403)
      
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })
})
```

## Security Testing Patterns

### Common Security Vulnerabilities

Test for common authentication security vulnerabilities:

```typescript
// __tests__/security/auth-vulnerabilities.test.ts
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SignInForm } from '@/components/auth/sign-in-form'
import { renderWithAuth } from '@/__tests__/utils/auth-test-utils'

describe('Authentication security', () => {
  it('prevents XSS in authentication forms', () => {
    // Render sign in form
    render(<SignInForm />)
    
    // Attempt XSS in email field
    const xssPayload = '<script>alert("XSS")</script>'
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: xssPayload }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Assert error handling without executing script
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    
    // Verify the raw script is not rendered
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    expect(emailInput.value).toBe(xssPayload)
    expect(document.querySelector('script')).toBeNull()
  })

  it('enforces password strength requirements', () => {
    // Render sign up form
    render(<SignUpForm />)
    
    // Enter weak password
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))
    
    // Assert password strength error
    expect(screen.getByText(/password is too weak/i)).toBeInTheDocument()
    expect(screen.getByText(/must include uppercase, number, and special character/i)).toBeInTheDocument()
  })

  it('has CSRF protection for authentication forms', () => {
    // Render sign in form
    render(<SignInForm />)
    
    // Check for CSRF token
    const form = screen.getByRole('form')
    const csrfInput = form.querySelector('input[name="csrf"]')
    
    // Assert CSRF token exists
    expect(csrfInput).not.toBeNull()
    expect(csrfInput?.getAttribute('value')).not.toBe('')
  })

  it('has rate limiting for failed login attempts', async () => {
    // Mock rate limiting
    vi.mock('@/lib/rate-limit', () => ({
      rateLimitLogin: vi.fn().mockImplementation((email) => {
        if (email === 'rate-limited@example.com') {
          throw new Error('Too many login attempts. Try again later.')
        }
        return Promise.resolve()
      })
    }))
    
    // Render sign in form
    render(<SignInForm />)
    
    // Enter rate-limited email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'rate-limited@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Assert rate limit error
    await screen.findByText(/too many login attempts/i)
    expect(screen.getByText(/try again later/i)).toBeInTheDocument()
  })
})
```

### Session Management Tests

Tests for secure session management:

```typescript
// __tests__/security/session-management.test.ts
import { test, expect } from '@playwright/test'

test.describe('Session management security', () => {
  test('session expires after inactivity', async ({ page }) => {
    // Sign in
    await page.goto('/login')
    await page.fill('input[name="email"]', 'client-test1@buildappswith.com')
    await page.fill('input[name="password"]', 'TestClient123!')
    await page.click('button[type="submit"]')
    
    // Verify successful login
    await expect(page).toHaveURL(/\/dashboard/)
    
    // Set cookie expiration to the past to simulate timeout
    await page.evaluate(() => {
      // This simulates what happens when the session expires
      document.cookie = "__session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;"
    })
    
    // Attempt to access protected route
    await page.goto('/dashboard')
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('session is invalidated on logout', async ({ page }) => {
    // Sign in
    await page.goto('/login')
    await page.fill('input[name="email"]', 'client-test1@buildappswith.com')
    await page.fill('input[name="password"]', 'TestClient123!')
    await page.click('button[type="submit"]')
    
    // Verify successful login
    await expect(page).toHaveURL(/\/dashboard/)
    
    // Sign out
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Sign out')
    
    // Verify redirect to home
    await expect(page).toHaveURL('/')
    
    // Attempt to access protected route
    await page.goto('/dashboard')
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('concurrent sessions are handled properly', async ({ browser }) => {
    // Create first browser context
    const context1 = await browser.newContext()
    const page1 = await context1.newPage()
    
    // Sign in on first browser
    await page1.goto('/login')
    await page1.fill('input[name="email"]', 'client-test1@buildappswith.com')
    await page1.fill('input[name="password"]', 'TestClient123!')
    await page1.click('button[type="submit"]')
    
    // Verify successful login
    await expect(page1).toHaveURL(/\/dashboard/)
    
    // Create second browser context
    const context2 = await browser.newContext()
    const page2 = await context2.newPage()
    
    // Sign in on second browser
    await page2.goto('/login')
    await page2.fill('input[name="email"]', 'client-test1@buildappswith.com')
    await page2.fill('input[name="password"]', 'TestClient123!')
    await page2.click('button[type="submit"]')
    
    // Verify successful login
    await expect(page2).toHaveURL(/\/dashboard/)
    
    // Both sessions should still be valid
    await page1.reload()
    await expect(page1).toHaveURL(/\/dashboard/)
    
    // Test session management behavior based on your requirements
    // (e.g., if you want to invalidate old sessions, verify page1 gets redirected)
  })
})
```

## Related Documents

- [Comprehensive Testing Strategy](./COMPREHENSIVE_TESTING_STRATEGY.md) - Master testing document
- [Testing Implementation Summary](./TESTING_IMPLEMENTATION_SUMMARY.md) - Current implementation status
- [Test User Matrix](./TEST_USER_MATRIX.md) - Standard test users for testing
- [Test Environment Setup](./TEST_ENVIRONMENT_SETUP.md) - Environment configuration

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | May 10, 2025 | Initial authentication testing patterns | BuildAppsWith Team |