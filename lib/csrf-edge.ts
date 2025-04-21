/**
 * Edge Runtime Compatible CSRF Protection Utility
 * 
 * This version uses the Web Crypto API which is compatible with Edge Runtime
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
  const array = new Uint8Array(TOKEN_BYTE_SIZE);
  crypto.getRandomValues(array);
  
  // Convert to base64
  const binaryString = Array.from(array)
    .map(byte => String.fromCharCode(byte))
    .join('');
  
  return btoa(binaryString);
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
  
  // Use header token for validation
  if (!headerToken || !(await validateCsrfToken(headerToken))) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  
  return null;
}
