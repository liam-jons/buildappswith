import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { http, HttpResponse } from 'msw';

// Singleton pattern state tracking
let mockServerInstance = null;
let isLoggingEnabled = false;

/**
 * Get the MSW server singleton - creates it only once
 * @returns The MSW server instance
 */
function getMockServer() {
  if (!mockServerInstance) {
    // Create the server with default handlers
    mockServerInstance = setupServer(...handlers);

    // Add global event listeners for error tracking
    mockServerInstance.events.on('unhandledException', (error) => {
      console.error(`[MSW] Unhandled exception: ${error.name} - ${error.message}`);
      console.error(error.stack);
    });
  }

  return mockServerInstance;
}

// Export the singleton getter
export const mockServer = getMockServer();

/**
 * Add custom handlers to the mock server temporarily
 * @param additionalHandlers The handlers to add
 * @returns A cleanup function that resets handlers
 */
export function addTemporaryHandlers(...additionalHandlers) {
  mockServer.use(...additionalHandlers);
  return () => mockServer.resetHandlers(); // Returns a cleanup function
}

/**
 * Enable detailed request/response logging for MSW
 * @param options Additional logging options
 */
export function enableMockServerLogging(options = {
  showRequestDetails: false,
  showHeaders: false
}) {
  // Only attach listeners once
  if (isLoggingEnabled) return;
  isLoggingEnabled = true;

  mockServer.events.on('request:start', ({ request }) => {
    console.log(`[MSW] Request: ${request.method} ${request.url}`);

    if (options.showRequestDetails) {
      // Log request details for debugging
      try {
        console.log(`[MSW] Request details:`, {
          path: new URL(request.url).pathname,
          query: Object.fromEntries(new URL(request.url).searchParams),
          headers: options.showHeaders ? Object.fromEntries(request.headers.entries()) : '[hidden]',
        });
      } catch (e) {
        console.log(`[MSW] Could not parse request details: ${e.message}`);
      }
    }
  });

  mockServer.events.on('response:mocked', ({ request, response }) => {
    console.log(`[MSW] Mocked: ${request.method} ${request.url} → ${response.status}`);
  });

  mockServer.events.on('response:bypass', ({ request }) => {
    console.warn(`[MSW] Bypassed: ${request.method} ${request.url}`);
  });

  mockServer.events.on('unhandledException', (error) => {
    console.error(`[MSW] Error: ${error.name} - ${error.message}`);
    console.error(error.stack);
  });
}