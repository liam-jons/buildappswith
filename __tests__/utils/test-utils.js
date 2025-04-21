const React = require('react')
const RTL = require('@testing-library/react')
const { ThemeProvider } = require('../../components/theme-provider')
const { SessionProvider } = require('next-auth/react')
const { Toaster } = require('../../components/ui/toaster')

// Mock user data for testing
const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  image: null,
}

// Mock session data for testing
const mockSession = {
  user: mockUser,
  expires: '2025-12-31',
}

// Wrapper component that provides all necessary providers
const AllTheProviders = ({ children }) => {
  return React.createElement(SessionProvider, { session: mockSession },
    React.createElement(ThemeProvider, {
      attribute: "class",
      defaultTheme: "system",
      enableSystem: true,
      disableTransitionOnChange: true
    },
      children,
      React.createElement(Toaster)
    )
  )
}

// Custom render method that wraps components with providers
const customRender = (ui, options) => {
  return RTL.render(ui, { wrapper: AllTheProviders, ...options })
}

// Mock functions for common operations
const mockFetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
)

// Helper to create mock API routes
const mockApi = (path, response, options = {}) => {
  return jest.fn().mockImplementation(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(response),
    ...options,
  }))
}

// Helper for accessibility testing
const runAccessibilityTests = async (container) => {
  const { axe } = require('jest-axe')
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

// Direct exports
module.exports = {
  render: customRender,
  screen: RTL.screen,
  fireEvent: RTL.fireEvent,
  waitFor: RTL.waitFor,
  mockFetch,
  mockApi,
  runAccessibilityTests,
  mockUser,
  mockSession,
  // Export all remaining functions from RTL
  ...RTL
}
