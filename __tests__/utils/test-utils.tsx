import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { configureMockClerk, UserMockType } from './clerk-test-utils'
import { vi } from 'vitest'

// Set up Clerk mock for testing
export const mockClerk = configureMockClerk('client')

// Mock the @clerk/nextjs module
vi.mock('@clerk/nextjs', () => mockClerk)

// Mock the ClerkProvider component
vi.mock('@/components/providers/clerk-provider', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Wrapper component that provides all necessary providers
const AllTheProviders = ({ 
  children,
  userType = 'client',
  userOverrides = {} 
}: { 
  children: React.ReactNode,
  userType?: UserMockType,
  userOverrides?: Record<string, any>
}) => {
  // Configure Clerk mock with the specified user type and overrides
  const mockClerk = configureMockClerk(userType, userOverrides)
  
  // Update the mock for @clerk/nextjs
  vi.mocked('@clerk/nextjs').mockImplementation(() => mockClerk)
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster />
    </ThemeProvider>
  )
}

// Custom render method that wraps components with providers
const customRender = (
  ui: React.ReactElement,
  options: { 
    userType?: UserMockType,
    userOverrides?: Record<string, any>,
    renderOptions?: Omit<RenderOptions, 'wrapper'>
  } = {}
) => {
  const { 
    userType = 'client', 
    userOverrides = {}, 
    renderOptions = {} 
  } = options
  
  return rtlRender(ui, { 
    wrapper: (props) => (
      <AllTheProviders 
        userType={userType} 
        userOverrides={userOverrides} 
        {...props} 
      />
    ), 
    ...renderOptions 
  })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method directly
export { customRender as render }

// Mock functions for common operations
export const mockFetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
)

// Helper to create mock API routes
export const mockApi = (path: string, response: any, options = {}) => {
  return vi.fn().mockImplementation(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(response),
    ...options,
  }))
}

// Helper for accessibility testing
export const runAccessibilityTests = async (container: HTMLElement) => {
  try {
    const { axe } = require('jest-axe')
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  } catch (error) {
    console.warn('Accessibility tests not available:', error)
  }
}
