// @ts-nocheck
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { renderWithAuth } from './auth-test-utils';

/**
 * Custom render options extending RTL's options
 */
interface CustomRenderOptions extends RenderOptions {
  theme?: 'light' | 'dark' | 'system';
  withAuth?: boolean;
  userType?: 'client' | 'builder' | 'admin' | 'unauthenticated';
}

/**
 * Custom render function that wraps the component with necessary providers
 * 
 * @param ui Component to render
 * @param options Render options
 * @returns RenderResult from RTL
 */
export function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    theme = 'light',
    withAuth = false,
    userType = 'client',
    ...renderOptions
  } = options;

  // Basic wrapper with theme provider
  function Wrapper({ children }: { children: React.ReactNode }) {
    // return (
    //   <ThemeProvider defaultTheme={theme} enableSystem enableColorScheme>
    //     {children}
    //   </ThemeProvider>
    // );
    // return children; // Return children directly - This caused widespread errors
    return React.createElement('div', null, children);
  }

  // If auth is needed, use renderWithAuth, otherwise use standard render
  if (withAuth) {
    return renderWithAuth(ui, {
      userType,
      wrapper: Wrapper,
      ...renderOptions,
    });
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Wait for a specified amount of time
 * 
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after specified time
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock the window.matchMedia function
 * 
 * @param matches Whether the media query matches
 */
export function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * Mock the window.IntersectionObserver
 */
export function mockIntersectionObserver() {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
  
  window.IntersectionObserver = mockIntersectionObserver;
}

/**
 * Mock the window.ResizeObserver
 */
export function mockResizeObserver() {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
  
  window.ResizeObserver = mockResizeObserver;
}

/**
 * Generate a random string of specified length
 * 
 * @param length Length of the string to generate (default: 10)
 * @returns Random string
 */
export const randomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Mock console methods to silence them in tests
 * 
 * @param methods Console methods to mock
 * @returns Function to restore original methods
 */
export function mockConsole(...methods: Array<'log' | 'error' | 'warn' | 'info'>) {
  const originalMethods: Record<string, any> = {};
  
  methods.forEach(method => {
    originalMethods[method] = console[method];
    console[method] = vi.fn();
  });
  
  return () => {
    methods.forEach(method => {
      console[method] = originalMethods[method];
    });
  };
}

/**
 * Create a mock element for testing DOM interactions
 * 
 * @param tag Element tag (default: 'div')
 * @param attributes Element attributes
 * @param textContent Text content of the element
 * @returns Mock HTML element
 */
export function createMockElement(
  tag = 'div',
  attributes: Record<string, string> = {},
  textContent = ''
) {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([attr, value]) => {
    element.setAttribute(attr, value);
  });
  
  if (textContent) {
    element.textContent = textContent;
  }
  
  return element;
}

// Re-export everything from RTL for convenience
export * from '@testing-library/react';