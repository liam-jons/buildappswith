import '@testing-library/jest-dom';
import { vi, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { setupMockServer, setupGlobalMocks } from './__tests__/mocks/initMocks';

// Enable console.log("[MSW] ...") for debugging test issues
const DEBUG_MSW = process.env.DEBUG_MSW === 'true' || false;

// Extend expect with jest-axe
expect.extend(toHaveNoViolations);

// Make axe accessible globally
global.axe = axe;

// Set up global mocks
setupGlobalMocks();

// Set up mock server for API requests
// The second parameter enables detailed request logging for debugging
setupMockServer(DEBUG_MSW);

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
  })),
}));

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
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

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
}));

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return React.createElement('img', props);
  },
}));

// Mock fetch for tests that directly use it instead of MSW
vi.stubGlobal('fetch', vi.fn((url) => {
  console.warn(`Unmocked fetch call to ${url}, consider using MSW instead`);
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  });
}));