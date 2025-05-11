import { http, HttpResponse, delay, passthrough } from 'msw';
import { mockServer } from '../mocks/server';
import { vi, expect } from 'vitest';
import { UserType } from '@/lib/auth/types';
import { mockUsers } from '../mocks/auth/mock-users';
import { handlers } from '../mocks/handlers';

// Track active mocks for debugging
const activeMocks = new Map<string, { method: string; path: string }>();

/**
 * Helper to mock API responses for testing with improved error handling and debugging
 */
export const apiMock = {
  /**
   * Mock a GET request to a specific endpoint
   *
   * @param path The API path to mock
   * @param responseData The data to return
   * @param status HTTP status code (default: 200)
   * @param options Additional options (delay, network error, etc.)
   */
  get: (path: string, responseData: any, status = 200, options: ApiMockOptions = {}) => {
    const mockId = `GET:${path}`;
    activeMocks.set(mockId, { method: 'GET', path });

    let handler;
    if (options.networkError) {
      // Simulate network error
      handler = http.get(path, () => {
        console.log(`[MSW] Simulating network error for GET ${path}`);
        return new Response(null, { status: 0 });
      });
    } else {
      handler = http.get(path, async () => {
        // Apply artificial delay if specified
        if (options.delayMs) {
          await delay(options.delayMs);
        }

        console.log(`[MSW] Mocked GET ${path} → ${status}`);
        return HttpResponse.json(responseData, {
          status,
          headers: options.headers || {},
        });
      });
    }

    mockServer.use(handler);

    return {
      path,
      responseData,
      status,
      options,
      cleanup: () => {
        activeMocks.delete(mockId);
        mockServer.resetHandlers();
        mockServer.use(...handlers); // Restore default handlers
      }
    };
  },

  /**
   * Mock a POST request to a specific endpoint
   *
   * @param path The API path to mock
   * @param responseData The data to return
   * @param status HTTP status code (default: 200)
   * @param options Additional options (delay, network error, etc.)
   */
  post: (path: string, responseData: any, status = 200, options: ApiMockOptions = {}) => {
    const mockId = `POST:${path}`;
    activeMocks.set(mockId, { method: 'POST', path });

    let handler;
    if (options.networkError) {
      // Simulate network error
      handler = http.post(path, () => {
        console.log(`[MSW] Simulating network error for POST ${path}`);
        return new Response(null, { status: 0 });
      });
    } else {
      handler = http.post(path, async () => {
        // Apply artificial delay if specified
        if (options.delayMs) {
          await delay(options.delayMs);
        }

        console.log(`[MSW] Mocked POST ${path} → ${status}`);
        return HttpResponse.json(responseData, {
          status,
          headers: options.headers || {},
        });
      });
    }

    mockServer.use(handler);

    return {
      path,
      responseData,
      status,
      options,
      cleanup: () => {
        activeMocks.delete(mockId);
        mockServer.resetHandlers();
        mockServer.use(...handlers); // Restore default handlers
      }
    };
  },

  /**
   * Mock a PUT request to a specific endpoint
   *
   * @param path The API path to mock
   * @param responseData The data to return
   * @param status HTTP status code (default: 200)
   * @param options Additional options (delay, network error, etc.)
   */
  put: (path: string, responseData: any, status = 200, options: ApiMockOptions = {}) => {
    const mockId = `PUT:${path}`;
    activeMocks.set(mockId, { method: 'PUT', path });

    let handler;
    if (options.networkError) {
      // Simulate network error
      handler = http.put(path, () => {
        console.log(`[MSW] Simulating network error for PUT ${path}`);
        return new Response(null, { status: 0 });
      });
    } else {
      handler = http.put(path, async () => {
        // Apply artificial delay if specified
        if (options.delayMs) {
          await delay(options.delayMs);
        }

        console.log(`[MSW] Mocked PUT ${path} → ${status}`);
        return HttpResponse.json(responseData, {
          status,
          headers: options.headers || {},
        });
      });
    }

    mockServer.use(handler);

    return {
      path,
      responseData,
      status,
      options,
      cleanup: () => {
        activeMocks.delete(mockId);
        mockServer.resetHandlers();
        mockServer.use(...handlers); // Restore default handlers
      }
    };
  },

  /**
   * Mock a DELETE request to a specific endpoint
   *
   * @param path The API path to mock
   * @param responseData The data to return (default: { success: true })
   * @param status HTTP status code (default: 200)
   * @param options Additional options (delay, network error, etc.)
   */
  delete: (path: string, responseData = { success: true }, status = 200, options: ApiMockOptions = {}) => {
    const mockId = `DELETE:${path}`;
    activeMocks.set(mockId, { method: 'DELETE', path });

    let handler;
    if (options.networkError) {
      // Simulate network error
      handler = http.delete(path, () => {
        console.log(`[MSW] Simulating network error for DELETE ${path}`);
        return new Response(null, { status: 0 });
      });
    } else {
      handler = http.delete(path, async () => {
        // Apply artificial delay if specified
        if (options.delayMs) {
          await delay(options.delayMs);
        }

        console.log(`[MSW] Mocked DELETE ${path} → ${status}`);
        return HttpResponse.json(responseData, {
          status,
          headers: options.headers || {},
        });
      });
    }

    mockServer.use(handler);

    return {
      path,
      responseData,
      status,
      options,
      cleanup: () => {
        activeMocks.delete(mockId);
        mockServer.resetHandlers();
        mockServer.use(...handlers); // Restore default handlers
      }
    };
  },

  /**
   * Mock an error response for any method
   *
   * @param path The API path to mock
   * @param method The HTTP method to mock
   * @param errorMessage Error message to return
   * @param status HTTP status code (default: 400)
   * @param options Additional options (delay, etc.)
   */
  error: (
    path: string,
    method: 'get' | 'post' | 'put' | 'delete' = 'get',
    errorMessage = 'An error occurred',
    status = 400,
    options: ApiMockOptions = {}
  ) => {
    const mockId = `${method.toUpperCase()}:${path}`;
    activeMocks.set(mockId, { method: method.toUpperCase(), path });

    const httpMethod = method === 'get' ? http.get :
                       method === 'post' ? http.post :
                       method === 'put' ? http.put : http.delete;

    const handler = httpMethod(path, async () => {
      // Apply artificial delay if specified
      if (options.delayMs) {
        await delay(options.delayMs);
      }

      console.log(`[MSW] Mocked ${method.toUpperCase()} ${path} → ERROR ${status}: ${errorMessage}`);

      // Return different error format based on status code
      if (status === 422) {
        // Validation error format
        return HttpResponse.json({
          errors: { _errors: [errorMessage] }
        }, { status });
      } else if (status >= 500) {
        // Server error format
        return HttpResponse.json({
          error: errorMessage,
          status: status,
          timestamp: new Date().toISOString()
        }, { status });
      } else {
        // Standard client error format
        return HttpResponse.json({
          error: errorMessage
        }, { status });
      }
    });

    mockServer.use(handler);

    return {
      path,
      errorMessage,
      status,
      options,
      cleanup: () => {
        activeMocks.delete(mockId);
        mockServer.resetHandlers();
        mockServer.use(...handlers); // Restore default handlers
      }
    };
  },

  /**
   * Capture request data for testing with detailed tracking
   *
   * @param path The API path to mock
   * @param method The HTTP method to mock
   * @param responseData Optional response data
   * @param status HTTP status code (default: 200)
   * @param options Additional options
   */
  capture: (
    path: string,
    method: 'get' | 'post' | 'put' | 'delete' = 'post',
    responseData: any = { success: true },
    status = 200,
    options: ApiMockOptions = {}
  ) => {
    const mockId = `${method.toUpperCase()}:${path}`;
    activeMocks.set(mockId, { method: method.toUpperCase(), path });

    let requestData: any = null;
    let requestHeaders: Record<string, string> = {};
    let requestUrl: URL | null = null;
    let requestParams: Record<string, string> = {};
    let callCount = 0;

    const httpMethod = method === 'get' ? http.get :
                       method === 'post' ? http.post :
                       method === 'put' ? http.put : http.delete;

    const handler = httpMethod(path, async ({ request }) => {
      callCount++;

      // Process request URL and parameters
      try {
        requestUrl = new URL(request.url);
        requestParams = Object.fromEntries(requestUrl.searchParams);
      } catch (e) {
        console.warn(`[MSW] Failed to parse URL: ${e.message}`);
      }

      // Process request body for non-GET requests
      if (method !== 'get') {
        try {
          requestData = await request.json();
        } catch (e) {
          // Request might not have a body
          console.log(`[MSW] No JSON body in request: ${e.message}`);
          requestData = null;

          // Try to get form data if present
          try {
            const formData = await request.formData();
            requestData = Object.fromEntries(formData);
          } catch (formError) {
            // Not form data either
            requestData = null;
          }
        }
      }

      // Capture request headers
      requestHeaders = Object.fromEntries(request.headers.entries());

      // Apply artificial delay if specified
      if (options.delayMs) {
        await delay(options.delayMs);
      }

      console.log(`[MSW] Captured ${method.toUpperCase()} ${path}`);

      return HttpResponse.json(responseData, {
        status,
        headers: options.headers || {}
      });
    });

    mockServer.use(handler);

    // Return a set of functions to interact with the captured data
    return {
      getRequestData: () => requestData,
      getRequestHeaders: () => requestHeaders,
      getRequestParams: () => requestParams,
      getRequestUrl: () => requestUrl,
      getCallCount: () => callCount,
      mockId,
      path,
      responseData,
      status,
      cleanup: () => {
        activeMocks.delete(mockId);
        mockServer.resetHandlers();
        mockServer.use(...handlers); // Restore default handlers
      },
      wasCalledWith: (expectedData: Record<string, any>) => {
        if (!requestData) return false;

        // Check if all expected fields are present in the actual request data
        return Object.entries(expectedData).every(
          ([key, value]) => requestData[key] === value
        );
      }
    };
  },

  /**
   * Add a pass-through handler for external requests
   * Useful for specific endpoints that should bypass MSW
   *
   * @param pathPattern Pattern to match for pass-through
   */
  passthrough: (pathPattern: string | RegExp) => {
    const mockId = `PASSTHROUGH:${pathPattern.toString()}`;
    activeMocks.set(mockId, { method: 'ANY', path: pathPattern.toString() });

    const handler = http.all(pathPattern, ({ request }) => {
      console.log(`[MSW] Passing through request: ${request.method} ${request.url}`);
      return passthrough();
    });

    mockServer.use(handler);

    return {
      pathPattern,
      cleanup: () => {
        activeMocks.delete(mockId);
        mockServer.resetHandlers();
        mockServer.use(...handlers); // Restore default handlers
      }
    };
  },

  /**
   * List all active mocks (useful for debugging)
   */
  listActive: () => {
    const mocks = Array.from(activeMocks.entries()).map(([id, info]) => ({
      id,
      method: info.method,
      path: info.path
    }));

    console.table(mocks);
    return mocks;
  },

  /**
   * Reset all custom handlers to defaults
   */
  reset: () => {
    activeMocks.clear();
    mockServer.resetHandlers();
    mockServer.use(...handlers); // Restore default handlers
    console.log('[MSW] Reset all handlers to defaults');
  }
};

/**
 * Type definition for API mock options
 */
interface ApiMockOptions {
  delayMs?: number;
  networkError?: boolean;
  headers?: Record<string, string>;
}

/**
 * Helper to validate API responses with enhanced error reporting
 */
export const apiExpect = {
  /**
   * Test if a fetch response has a successful status and the correct data
   *
   * @param response Fetch response object
   * @param expectedData Expected data shape
   */
  success: async (response: Response, expectedData?: any) => {
    try {
      expect(response.ok).toBe(true);
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);

      if (expectedData) {
        const data = await response.json();
        expect(data).toMatchObject(expectedData);
        return data; // Return parsed data for further assertions
      }
    } catch (error) {
      // Enhanced error reporting
      console.error(`[API Expect] Success assertion failed:`, {
        status: response.status,
        statusText: response.statusText,
        error: error.message
      });

      // Try to include response body in error message if possible
      try {
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        console.error(`[API Expect] Response body:`, text);
      } catch (e) {
        console.error(`[API Expect] Could not read response body`);
      }

      throw error;
    }
  },

  /**
   * Test if a fetch response is an error with the expected status and message
   *
   * @param response Fetch response object
   * @param expectedStatus Expected HTTP status code (default: 400)
   * @param expectedError Expected error message (if provided)
   */
  error: async (response: Response, expectedStatus = 400, expectedError?: string) => {
    try {
      expect(response.ok).toBe(false);
      expect(response.status).toBe(expectedStatus);

      if (expectedError) {
        const data = await response.json();

        // Handle different error formats
        if (data.errors && data.errors._errors) {
          // Validation error format
          expect(data.errors._errors).toContain(expectedError);
        } else {
          // Standard error format
          expect(data.error).toBe(expectedError);
        }

        return data; // Return parsed data for further assertions
      }
    } catch (error) {
      // Enhanced error reporting
      console.error(`[API Expect] Error assertion failed:`, {
        status: response.status,
        statusText: response.statusText,
        expectedStatus,
        expectedError,
        errorMessage: error.message
      });

      // Try to include response body in error message if possible
      try {
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        console.error(`[API Expect] Response body:`, text);
      } catch (e) {
        console.error(`[API Expect] Could not read response body`);
      }

      throw error;
    }
  },

  /**
   * Test if a fetch response has validation errors
   *
   * @param response Fetch response object
   * @param fieldNames Names of fields expected to have validation errors
   */
  validationErrors: async (response: Response, fieldNames: string[]) => {
    try {
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.errors).toBeDefined();

      for (const field of fieldNames) {
        expect(data.errors).toHaveProperty(field);
      }

      return data.errors; // Return errors for further assertions
    } catch (error) {
      // Enhanced error reporting
      console.error(`[API Expect] Validation error assertion failed:`, {
        status: response.status,
        statusText: response.statusText,
        expectedFields: fieldNames,
        errorMessage: error.message
      });

      // Try to include response body in error message if possible
      try {
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        console.error(`[API Expect] Response body:`, text);
      } catch (e) {
        console.error(`[API Expect] Could not read response body`);
      }

      throw error;
    }
  },

  /**
   * Test if a fetch response matches a custom condition
   *
   * @param response Fetch response object
   * @param assertFn Function to perform custom assertions
   */
  custom: async (response: Response, assertFn: (data: any, response: Response) => void) => {
    try {
      const data = await response.json();
      await assertFn(data, response);
      return data; // Return parsed data for further assertions
    } catch (error) {
      // Enhanced error reporting
      console.error(`[API Expect] Custom assertion failed:`, {
        status: response.status,
        statusText: response.statusText,
        errorMessage: error.message
      });

      throw error;
    }
  }
};

/**
 * Setup authentication headers for API calls with Clerk test IDs
 *
 * @param userType Type of user to authenticate as (default: 'client')
 * @returns Headers object with auth token
 */
export function getAuthHeaders(userType: 'client' | 'premium-client' | 'builder' | 'new-builder' | 'admin' | 'dual-role' | 'triple-role' = 'client') {
  const user = mockUsers[userType];

  if (!user) {
    throw new Error(`Unknown user type: ${userType}`);
  }

  // Use consistent clerk ID-based token
  const mockToken = `mock-token-${user.id}-${Date.now()}`;

  return {
    Authorization: `Bearer ${mockToken}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Create a mock Next.js API request object for testing
 *
 * @param method HTTP method
 * @param body Request body
 * @param query URL query parameters
 * @param headers Request headers
 * @param userRole User role for authenticated requests
 * @param path Request path (optional)
 */
export function createMockRequest({
  method = 'GET',
  body = null,
  query = {},
  headers = {},
  userRole = null,
  path = '/api/test',
}: {
  method?: string;
  body?: any;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  userRole?: UserType | null;
  path?: string;
}) {
  // Create query string from parameters
  const queryString = new URLSearchParams(query).toString();
  const url = `https://example.com${path}${queryString ? `?${queryString}` : ''}`;

  // Create basic request object
  const req: any = {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
    nextUrl: new URL(url),
    url,
    json: vi.fn().mockResolvedValue(body),
  };

  // Add auth data if userRole is provided
  if (userRole) {
    const userId = userRole === 'CLIENT'
      ? mockUsers.client.id
      : userRole === 'BUILDER'
        ? mockUsers.builder.id
        : mockUsers.admin.id;

    req.auth = {
      userId,
      role: userRole,
    };
  }

  return req;
}

/**
 * Create a mock Next.js API response object for testing
 */
export function createMockResponse() {
  const res: any = {
    statusCode: 200,
    status: vi.fn(function(status: number) {
      this.statusCode = status;
      return this;
    }),
    json: vi.fn(function(data: any) {
      this.data = data;
      return this;
    }),
    headers: new Map(),
    setHeader: vi.fn(function(name: string, value: string) {
      this.headers.set(name, value);
      return this;
    }),
    data: null,
  };

  return res;
}

/**
 * Helper to test API route handlers with enhanced error handling
 *
 * @param handler API route handler function
 * @param requestConfig Request configuration
 */
export async function testApiHandler(
  handler: (req: Request) => Promise<Response>,
  requestConfig: {
    method?: string;
    body?: any;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    userRole?: UserType | null;
    path?: string;
  } = {}
) {
  const mockReq = createMockRequest(requestConfig);
  let response;

  try {
    response = await handler(mockReq as unknown as Request);
  } catch (error) {
    console.error('[testApiHandler] Handler threw an error:', error);
    console.error('Request details:', {
      method: requestConfig.method || 'GET',
      path: requestConfig.path || '/api/test',
      query: requestConfig.query || {},
      body: requestConfig.body || null,
      userRole: requestConfig.userRole || null,
    });
    throw new Error(`API handler threw an error: ${error.message}`);
  }

  return response;
}