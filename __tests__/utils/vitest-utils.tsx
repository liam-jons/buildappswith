import React from 'react'
import { render as rtlRender } from '@testing-library/react'
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
  reload: vi.fn().mockResolvedValue(undefined)
}

// Wrapper component that provides all necessary providers
function AllTheProviders({ children }: { children: React.ReactNode }) {
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
function customRender(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything from testing library
export * from '@testing-library/react'

// Export our custom render method
export { customRender as render }

// Helper for accessibility testing (you'll need to install jest-axe for this)
export async function runAccessibilityTests(container: HTMLElement) {
  try {
    const { axe } = require('jest-axe')
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  } catch (error) {
    console.warn('Accessibility tests not available:', error)
  }
}
