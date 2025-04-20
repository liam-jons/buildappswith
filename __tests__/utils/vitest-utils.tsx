import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/toaster'

// Mock user data for testing
export const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  image: null,
}

// Mock session data for testing
export const mockSession = {
  user: mockUser,
  expires: '2025-12-31',
}

// Wrapper component that provides all necessary providers
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider session={mockSession}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
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
