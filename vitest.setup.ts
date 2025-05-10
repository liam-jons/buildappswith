import '@testing-library/jest-dom'
import { vi, expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import React from 'react'
import { setupMockServer } from './__tests__/mocks/initMocks'

// Extend expect with jest-axe
expect.extend(toHaveNoViolations)

// Make accessible everywhere
global.axe = axe

// Set up mock server for API requests
setupMockServer()

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

// Mock Next.js features
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
  })),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() { return null }
  unobserve() { return null }
  disconnect() { return null }
}
window.IntersectionObserver = MockIntersectionObserver

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() { return null }
  unobserve() { return null }
  disconnect() { return null }
}
window.ResizeObserver = MockResizeObserver

// Mock Clerk authentication
vi.mock('@clerk/nextjs', () => ({
  auth: vi.fn(() => ({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: vi.fn().mockResolvedValue('test-token'),
  })),
  currentUser: vi.fn().mockResolvedValue({
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    publicMetadata: {
      roles: ['CLIENT'],
    },
  }),
  useUser: vi.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      publicMetadata: {
        roles: ['CLIENT'],
      },
    },
  })),
  ClerkProvider: ({ children }) => React.createElement(React.Fragment, null, children),
  useAuth: vi.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: vi.fn().mockResolvedValue('test-token'),
  })),
  SignedIn: ({ children }) => React.createElement(React.Fragment, null, children),
  SignedOut: () => null,
}))

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return React.createElement('img', props)
  },
}))