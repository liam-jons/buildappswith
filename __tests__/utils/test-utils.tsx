import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/toaster'

// Import clerk test utilities
import { configureMockClerk, ClerkUser } from './clerk-test-utils'
import { mockUsers } from '../mocks/users'

// Mock user data for testing - using Clerk format
export const mockUser: ClerkUser = {
  id: mockUsers.client.clerkId,
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  username: 'testuser',
  primaryEmailAddress: {
    emailAddress: 'client@example.com',
    id: 'email-id',
    verification: { status: 'verified' }
  },
  primaryEmailAddressId: 'email-id',
  emailAddresses: [{
    emailAddress: 'client@example.com',
    id: 'email-id',
    verification: { status: 'verified' }
  }],
  imageUrl: '/images/avatar-placeholder.png',
  publicMetadata: {
    roles: mockUsers.client.roles,
    verified: true,
    completedOnboarding: true,
    stripeCustomerId: 'stripe-client-id'
  },
  privateMetadata: {},
  unsafeMetadata: {},
  reload: jest.fn().mockResolvedValue(undefined)
}

// Wrapper component that provides all necessary providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider publishableKey="test_key">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </ClerkProvider>
  )
}

// Custom render method that wraps components with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method directly
export { customRender as render }

// Mock functions for common operations
export const mockFetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
)

// Helper to create mock API routes
export const mockApi = (path: string, response: any, options = {}) => {
  return jest.fn().mockImplementation(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(response),
    ...options,
  }))
}

// Helper for accessibility testing
export const runAccessibilityTests = async (container: HTMLElement) => {
  const { axe } = require('jest-axe')
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}
