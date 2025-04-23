/**
 * Types for Next.js API route parameters
 */

/**
 * Type for route parameters in a dynamic API route
 * 
 * In Next.js 15.3.1, params in API route handlers are Promise-based
 */
export interface RouteParams<T = Record<string, string>> {
  params: Promise<T>;
}
