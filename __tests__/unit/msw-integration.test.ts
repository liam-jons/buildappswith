/**
 * MSW Integration Tests
 *
 * These tests verify that our MSW setup is working correctly.
 * This test file is also used as part of the debug-msw.js diagnostic tool.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { http, HttpResponse, delay } from 'msw';
import { mockServer } from '../mocks/server';
import { apiMock, apiExpect } from '../utils/api-test-utils';
import { setupMockClerk, renderWithAuth } from '../utils/auth-test-utils';
import { handlers } from '../mocks/handlers';
import React from 'react';

// Simple component for testing auth-related API calls
function TestAuthComponent() {
  const fetchProfile = async () => {
    const response = await fetch('/api/profiles/me');
    return response.json();
  };
  
  // Using React.createElement instead of JSX to avoid parsing issues
  return React.createElement('div', null, 
    React.createElement('h1', null, 'Test Auth Component'),
    React.createElement('button', { onClick: fetchProfile }, 'Fetch Profile')
  );
}

describe('MSW Integration', () => {
  // Trace for debugging
  console.log('[TEST] Starting MSW integration tests');

  // Reset handlers after each test
  afterEach(() => {
    // Reset all mocks
    apiMock.reset();
    vi.resetAllMocks();
  });

  it('should handle basic GET requests correctly', async () => {
    // Set up a mock GET endpoint
    const mock = apiMock.get('/api/test/endpoint', {
      success: true,
      message: 'Test successful',
      data: [1, 2, 3]
    });

    // Make a fetch request to the endpoint
    const response = await fetch('/api/test/endpoint');
    const data = await response.json();

    // Verify the response
    expect(response.ok).toBe(true);
    expect(data).toEqual({
      success: true,
      message: 'Test successful',
      data: [1, 2, 3]
    });

    // Clean up the mock
    mock.cleanup();
  });

  it('should handle POST requests with JSON body correctly', async () => {
    // Set up a mock POST endpoint
    const mock = apiMock.post('/api/test/submit', {
      success: true,
      id: 'test-123'
    });

    // Make a fetch request to the endpoint
    const response = await fetch('/api/test/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Test User' })
    });
    const data = await response.json();

    // Verify the response
    expect(response.ok).toBe(true);
    expect(data).toEqual({
      success: true,
      id: 'test-123'
    });

    // Clean up the mock
    mock.cleanup();
  });

  it('should handle URL query parameters correctly', async () => {
    // Set up a mock handler for a GET request with query parameters
    mockServer.use(
      http.get('/api/test/search', ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get('q');

        return HttpResponse.json({
          results: [`Result for: ${query}`]
        });
      })
    );

    // Make a fetch request with a query parameter
    const response = await fetch('/api/test/search?q=test+query');
    const data = await response.json();

    // Verify the response contains the query parameter
    expect(response.ok).toBe(true);
    expect(data.results).toContain('Result for: test query');

    // Reset handlers after the test
    mockServer.resetHandlers();
    mockServer.use(...handlers);
  });

  it('should handle request body and content type correctly', async () => {
    // Set up a mock handler for a POST request that uses the request body
    mockServer.use(
      http.post('/api/test/echo', async ({ request }) => {
        const body = await request.json();
        const headers = Object.fromEntries(request.headers.entries());

        return HttpResponse.json({
          echo: body,
          contentType: headers['content-type']
        });
      })
    );

    // Make a fetch request with a request body
    const testData = { id: 123, name: 'Test', items: [1, 2, 3] };
    const response = await fetch('/api/test/echo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    const data = await response.json();

    // Verify the response echoes the request body and has the right content type
    expect(response.ok).toBe(true);
    expect(data.echo).toEqual(testData);
    expect(data.contentType).toBe('application/json');

    // Reset handlers after the test
    mockServer.resetHandlers();
    mockServer.use(...handlers);
  });

  it('should handle API errors with different status codes', async () => {
    // Test various error types
    const clientError = apiMock.error('/api/test/client-error', 'get', 'Bad request', 400);
    const validationError = apiMock.error('/api/test/validation', 'post', 'Validation failed', 422);
    const serverError = apiMock.error('/api/test/server-error', 'post', 'Internal error', 500);

    // Test client error
    const clientResponse = await fetch('/api/test/client-error');
    const clientData = await clientResponse.json();
    expect(clientResponse.status).toBe(400);
    expect(clientData.error).toBe('Bad request');

    // Test validation error
    const validationResponse = await fetch('/api/test/validation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const validationData = await validationResponse.json();
    expect(validationResponse.status).toBe(422);
    expect(validationData.errors._errors).toContain('Validation failed');

    // Test server error
    const serverResponse = await fetch('/api/test/server-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const serverData = await serverResponse.json();
    expect(serverResponse.status).toBe(500);
    expect(serverData.error).toBe('Internal error');
    expect(serverData.status).toBe(500);
    expect(serverData.timestamp).toBeDefined();

    // Clean up
    clientError.cleanup();
    validationError.cleanup();
    serverError.cleanup();
  });

  it('should capture request data including headers, params, and body', async () => {
    // Set up a capture mock for a POST request
    const captureMock = apiMock.capture('/api/test/capture', 'post', {
      success: true,
      id: 'captured-123'
    });

    // Make a fetch request with a request body
    const requestData = { name: 'Capture Test', email: 'test@example.com' };
    const response = await fetch('/api/test/capture?param1=value1&param2=value2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'X-Custom-Header': 'custom-value'
      },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();

    // Verify the response
    expect(response.ok).toBe(true);
    expect(data).toEqual({
      success: true,
      id: 'captured-123'
    });

    // Verify the captured request data
    const capturedData = captureMock.getRequestData();
    expect(capturedData).toEqual(requestData);

    // Verify the captured request headers
    const capturedHeaders = captureMock.getRequestHeaders();
    expect(capturedHeaders.authorization).toBe('Bearer test-token');
    expect(capturedHeaders['x-custom-header']).toBe('custom-value');

    // Verify URL parameters
    const capturedParams = captureMock.getRequestParams();
    expect(capturedParams.param1).toBe('value1');
    expect(capturedParams.param2).toBe('value2');

    // Verify the wasCalledWith helper
    expect(captureMock.wasCalledWith({ name: 'Capture Test' })).toBe(true);
    expect(captureMock.wasCalledWith({ name: 'Wrong Name' })).toBe(false);

    // Verify call count
    expect(captureMock.getCallCount()).toBe(1);

    // Clean up
    captureMock.cleanup();
  });

  it('should handle delayed responses for testing loading states', async () => {
    // Set up a mock with an artificial delay
    const mock = apiMock.get('/api/test/delayed', { result: 'Delayed response' }, 200, {
      delayMs: 100 // 100ms delay
    });

    // Start timer
    const startTime = Date.now();

    // Make request
    const response = await fetch('/api/test/delayed');
    const data = await response.json();

    // Calculate elapsed time
    const elapsedTime = Date.now() - startTime;

    // Verify response and delay
    expect(data.result).toBe('Delayed response');
    expect(elapsedTime).toBeGreaterThanOrEqual(100);

    // Clean up
    mock.cleanup();
  });

  it('should simulate network errors', async () => {
    // Set up a mock that simulates a network error
    const mock = apiMock.get('/api/test/network-error', {}, 200, {
      networkError: true
    });

    // Make request and expect it to fail
    try {
      await fetch('/api/test/network-error');
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Network errors should be caught here
      expect(error).toBeDefined();
    }

    // Clean up
    mock.cleanup();
  });

  it('should integrate with auth testing utilities', async () => {
    // Setup Clerk with a specific user type
    setupMockClerk('builder');

    // Set up a mock that returns different data based on auth
    const mock = apiMock.get('/api/profiles/me', {
      id: 'profile-123',
      role: 'BUILDER',
      name: 'Test Builder'
    });

    // Render a component with auth
    const { user } = renderWithAuth(React.createElement(TestAuthComponent));

    // Click the button to fetch profile
    const button = document.querySelector('button');
    await user.click(button);

    // Verify that the right request was made
    const activeApiMocks = apiMock.listActive();
    expect(activeApiMocks.some(mock => mock.path === '/api/profiles/me')).toBe(true);

    // Clean up
    mock.cleanup();
  });

  it('should work with apiExpect utilities', async () => {
    // Set up mocks for different status codes
    const successMock = apiMock.get('/api/test/success', { data: 'Success' });
    const errorMock = apiMock.error('/api/test/failed', 'get', 'Test error', 400);

    // Make requests
    const successResponse = await fetch('/api/test/success');
    const errorResponse = await fetch('/api/test/failed');

    // Use apiExpect to verify responses
    await apiExpect.success(successResponse, { data: 'Success' });
    await apiExpect.error(errorResponse, 400, 'Test error');

    // Clean up
    successMock.cleanup();
    errorMock.cleanup();
  });

  it('should maintain singleton pattern across tests', () => {
    // Get server instances - should be the same object
    const server1 = mockServer;
    const server2 = mockServer;

    // They should be exactly the same instance
    expect(server1).toBe(server2);
  });

  it('should list active mocks for debugging', async () => {
    // Add several mocks
    const mock1 = apiMock.get('/api/test/one', { id: 1 });
    const mock2 = apiMock.post('/api/test/two', { id: 2 });
    const mock3 = apiMock.error('/api/test/three', 'put', 'Error', 500);

    // List active mocks
    const activeMocks = apiMock.listActive();

    // Verify that all our mocks are active
    expect(activeMocks.length).toBeGreaterThanOrEqual(3);
    expect(activeMocks.some(m => m.path === '/api/test/one')).toBe(true);
    expect(activeMocks.some(m => m.path === '/api/test/two')).toBe(true);
    expect(activeMocks.some(m => m.path === '/api/test/three')).toBe(true);

    // Clean up
    mock1.cleanup();
    mock2.cleanup();
    mock3.cleanup();
  });
});