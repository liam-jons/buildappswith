import { http, HttpResponse } from 'msw';
import { mockServer } from '../mocks/server';
import { vi, expect } from 'vitest';
import { UserType } from '@/lib/auth/types';
import { mockUsers } from '../mocks/auth/mock-users';

/**
 * Helper to mock API responses for testing
 */
export const apiMock = {
  /**
   * Mock a GET request to a specific endpoint
   * 
   * @param path The API path to mock
   * @param responseData The data to return
   * @param status HTTP status code (default: 200)
   */
  get: (path: string, responseData: any, status = 200) => {
    mockServer.use(
      http.get(path, () => {
        return HttpResponse.json(responseData, { status });
      })
    );
    return { path, responseData, status };
  },

  /**
   * Mock a POST request to a specific endpoint
   * 
   * @param path The API path to mock
   * @param responseData The data to return
   * @param status HTTP status code (default: 200)
   */
  post: (path: string, responseData: any, status = 200) => {
    mockServer.use(
      http.post(path, () => {
        return HttpResponse.json(responseData, { status });
      })
    );
    return { path, responseData, status };
  },

  /**
   * Mock a PUT request to a specific endpoint
   * 
   * @param path The API path to mock
   * @param responseData The data to return
   * @param status HTTP status code (default: 200)
   */
  put: (path: string, responseData: any, status = 200) => {
    mockServer.use(
      http.put(path, () => {
        return HttpResponse.json(responseData, { status });
      })
    );
    return { path, responseData, status };
  },

  /**
   * Mock a DELETE request to a specific endpoint
   * 
   * @param path The API path to mock
   * @param responseData The data to return (default: { success: true })
   * @param status HTTP status code (default: 200)
   */
  delete: (path: string, responseData = { success: true }, status = 200) => {
    mockServer.use(
      http.delete(path, () => {
        return HttpResponse.json(responseData, { status });
      })
    );
    return { path, responseData, status };
  },

  /**
   * Mock an error response for any method
   * 
   * @param path The API path to mock
   * @param method The HTTP method to mock
   * @param errorMessage Error message to return
   * @param status HTTP status code (default: 400)
   */
  error: (
    path: string, 
    method: 'get' | 'post' | 'put' | 'delete' = 'get', 
    errorMessage = 'An error occurred', 
    status = 400
  ) => {
    const httpMethod = method === 'get' ? http.get :
                       method === 'post' ? http.post :
                       method === 'put' ? http.put : http.delete;
    
    mockServer.use(
      httpMethod(path, () => {
        return HttpResponse.json({ error: errorMessage }, { status });
      })
    );
    return { path, errorMessage, status };
  },

  /**
   * Capture request data for testing
   * 
   * @param path The API path to mock
   * @param method The HTTP method to mock
   * @param responseData Optional response data
   * @param status HTTP status code (default: 200)
   */
  capture: (
    path: string, 
    method: 'get' | 'post' | 'put' | 'delete' = 'post', 
    responseData: any = { success: true }, 
    status = 200
  ) => {
    let requestData: any = null;
    let requestHeaders: any = null;
    
    const httpMethod = method === 'get' ? http.get :
                       method === 'post' ? http.post :
                       method === 'put' ? http.put : http.delete;
    
    mockServer.use(
      httpMethod(path, async ({ request }) => {
        if (method !== 'get') {
          try {
            requestData = await request.json();
          } catch (e) {
            // Request might not have a body
            requestData = null;
          }
        }
        
        // Capture request headers
        requestHeaders = Object.fromEntries(request.headers.entries());
        
        return HttpResponse.json(responseData, { status });
      })
    );
    
    // Return a function to get the captured data
    return {
      getRequestData: () => requestData,
      getRequestHeaders: () => requestHeaders,
      path,
      responseData,
      status
    };
  },
  
  /**
   * Reset all custom handlers
   */
  reset: () => {
    mockServer.resetHandlers();
  }
};

/**
 * Helper to validate API responses
 */
export const apiExpect = {
  /**
   * Test if a fetch response has a successful status and the correct data
   * 
   * @param response Fetch response object
   * @param expectedData Expected data shape
   */
  success: async (response: Response, expectedData?: any) => {
    expect(response.ok).toBe(true);
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
    
    if (expectedData) {
      const data = await response.json();
      expect(data).toMatchObject(expectedData);
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
    expect(response.ok).toBe(false);
    expect(response.status).toBe(expectedStatus);
    
    if (expectedError) {
      const data = await response.json();
      expect(data.error).toBe(expectedError);
    }
  },
  
  /**
   * Test if a fetch response has validation errors
   * 
   * @param response Fetch response object
   * @param fieldNames Names of fields expected to have validation errors
   */
  validationErrors: async (response: Response, fieldNames: string[]) => {
    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.errors).toBeDefined();
    
    for (const field of fieldNames) {
      expect(data.errors).toHaveProperty(field);
    }
  }
};

/**
 * Setup authentication headers for API calls
 * 
 * @param userType Type of user to authenticate as (default: 'client')
 * @returns Headers object with auth token
 */
export function getAuthHeaders(userType: 'client' | 'builder' | 'admin' = 'client') {
  const user = mockUsers[userType];
  
  // Mock token generation
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
 */
export function createMockRequest({
  method = 'GET',
  body = null,
  query = {},
  headers = {},
  userRole = null,
}: {
  method?: string;
  body?: any;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  userRole?: UserType | null;
}) {
  // Create basic request object
  const req: any = {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
    nextUrl: new URL(`https://example.com/api/test?${new URLSearchParams(query).toString()}`),
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
    data: null,
  };
  
  return res;
}

/**
 * Helper to test API route handlers
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
  } = {}
) {
  const mockReq = createMockRequest(requestConfig);
  let response;
  
  try {
    response = await handler(mockReq as unknown as Request);
  } catch (error) {
    throw new Error(`API handler threw an error: ${error}`);
  }
  
  return response;
}