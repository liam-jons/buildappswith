/**
 * Initialize mock server for tests
 * 
 * This file sets up the MSW mock server for use in tests.
 */
import { mockServer } from './server';

/**
 * Set up mock server for running tests
 */
export function setupMockServer() {
  // Start the server before all tests
  beforeAll(() => mockServer.listen({ onUnhandledRequest: 'warn' }));
  
  // Reset handlers after each test
  afterEach(() => mockServer.resetHandlers());
  
  // Clean up after all tests are done
  afterAll(() => mockServer.close());
}

/**
 * Start the mock server for a specific test
 * Use this for tests that need MSW but aren't using the beforeAll/afterAll setup
 */
export function startMockServer() {
  mockServer.listen({ onUnhandledRequest: 'warn' });
  return mockServer;
}

/**
 * Stop the mock server
 * Use this to clean up after a test that uses startMockServer
 */
export function stopMockServer() {
  mockServer.close();
}

/**
 * Reset the mock server handlers
 * Use this to reset handlers between test cases
 */
export function resetMockServerHandlers() {
  mockServer.resetHandlers();
}

/**
 * Use this function for one-off tests with MSW
 * @param callback Function to run with the server active
 */
export async function withMockServer<T>(callback: () => Promise<T>): Promise<T> {
  try {
    mockServer.listen({ onUnhandledRequest: 'warn' });
    return await callback();
  } finally {
    mockServer.close();
  }
}