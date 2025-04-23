/**
 * CSRF Protection Utility for Buildappswith Platform
 * Version: 0.1.66
 * 
 * Implements Cross-Site Request Forgery protection using double submit cookie pattern
 * with cryptographically secure tokens
 * 
 * Uses Web Crypto API which is compatible with both Server and Edge Runtimes
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Configuration
const CSRF_SECRET_COOKIE = 'buildappswith_csrf';
const CSRF_FORM_FIELD = 'csrf_token';
const CSRF_HEADER = 'X-CSRF-Token';
const TOKEN_BYTE_SIZE = 32; // 256 bits
const TOKEN_EXPIRY = 60 * 60 * 2; // 2 hours in seconds

/**
 * Generate a cryptographically secure random token using Web Crypto API
 * @returns {Promise<string>} Base64 encoded random token
 */
export async function generateCsrfToken(): Promise<string> {
  // Create a new array of random bytes using Web Crypto API
  const buffer = new Uint8Array(TOKEN_BYTE_SIZE);
  crypto.getRandomValues(buffer);
  
  // Convert the random bytes to base64 string
  return btoa(String.fromCharCode(...buffer));
}

/**
 * Sets a CSRF cookie with the provided token
 * @param {string} token - The CSRF token to set
 * @param {number} maxAge - Cookie expiration time in seconds
 * @returns {void}
 */
export async function setCsrfCookie(token: string, maxAge: number = TOKEN_EXPIRY): Promise<void> {
  const cookiesStore = await cookies();
  // Set the cookie
  cookiesStore.set({
    name: CSRF_SECRET_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
}

/**
 * Gets the current CSRF token from cookies
 * @returns {string|undefined} The current CSRF token or undefined if not set
 */
export async function getCsrfCookie(): Promise<string | undefined> {
  const cookiesStore = await cookies();
  // Get the cookie
  const cookie = cookiesStore.get(CSRF_SECRET_COOKIE);
  return cookie?.value;
}

/**
 * Creates a new CSRF token and sets it as a cookie
 * @returns {Promise<string>} The newly generated CSRF token
 */
export async function createCsrfToken(): Promise<string> {
  const token = await generateCsrfToken();
  await setCsrfCookie(token);
  return token;
}

/**
 * Validates a CSRF token against the stored cookie value
 * @param {string} token - The token to validate
 * @returns {boolean} True if the token is valid
 */
export async function validateCsrfToken(token: string): Promise<boolean> {
  const cookieToken = await getCsrfCookie();
  
  // If cookie doesn't exist or tokens don't match, validation fails
  if (!cookieToken || cookieToken !== token) {
    return false;
  }
  
  return true;
}

/**
 * Middleware function to validate CSRF token in API routes
 * Checks for token in headers or form body
 */
export async function csrfProtection(req: NextRequest): Promise<NextResponse | null> {
  // Skip for non-mutation methods
  if (['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(req.method)) {
    return null;
  }

  // Get the token from the appropriate place
  const headerToken = req.headers.get(CSRF_HEADER);
  
  // Try to get token from request body if it's a form submission
  let bodyToken: string | undefined;
  const contentType = req.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    try {
      // Clone the request to read the body without consuming it
      const clonedReq = req.clone();
      // This is an async operation but we're in a synchronous context
      // In a real implementation, you'd need to handle this differently
      // For now, we'll rely primarily on the header token
      bodyToken = undefined;
    } catch (e) {
      // Silently fail and continue with validation
    }
  }
  
  // Use header token if available, fallback to body token
  const token = headerToken || bodyToken;
  
  if (!token || !(await validateCsrfToken(token))) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  
  return null;
}

/**
 * React hook for managing CSRF tokens in forms
 * Usage:
 * 1. Import in your component: import { useCsrf } from '@/lib/csrf'
 * 2. Use in your component: const { csrfToken, CsrfField } = useCsrf()
 * 3. Include CsrfField in your form: <form>{CsrfField}</form>
 * 4. Use csrfToken in fetch headers for AJAX requests
 */
export const useCsrf = () => {
  // This would be implemented with React hooks
  // For now, we'll provide a placeholder implementation
  // Implementation will depend on how client-side code is structured
  
  return {
    // Function to get CSRF token for use in fetch headers
    getCsrfToken: () => {
      // Implementation depends on how client handles auth
      return ''; // Placeholder
    },
    
    // Prebuilt form field component
    CsrfField: null, // Would be a React component
  };
};
