import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
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
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
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
