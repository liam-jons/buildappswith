/**
 * API Types
 * Version: 1.0.0
 * 
 * Standardized API response interfaces and error types
 * Provides consistent structure for all API endpoints
 */

/**
 * Standard API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

/**
 * Standard API response structure (marketplace-compatible)
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  pagination?: PaginationInfo;
}

/**
 * Standardized API response interface following marketplace pattern
 * This ensures all APIs follow the same response structure as marketplace
 */
export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
  message?: string;
}

/**
 * Pagination information for list endpoints
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Paginated response structure for list endpoints
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationInfo;
}

/**
 * Helper type for paginated API responses
 */
export type PaginatedApiResponse<T> = ApiResponse<PaginatedData<T>>;

/**
 * Error codes for standard error responses
 */
export enum ApiErrorCode {
  BAD_REQUEST = 'bad_request',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  VALIDATION_ERROR = 'validation_error',
  INTERNAL_ERROR = 'internal_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  CONFLICT = 'conflict',
  RATE_LIMITED = 'rate_limited'
}

/**
 * Sort direction for list endpoints
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Common query parameters for list endpoints
 */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
  search?: string;
  filters?: Record<string, any>;
}

/**
 * Resource created response
 */
export interface ResourceCreatedResponse {
  id: string;
  [key: string]: any;
}

/**
 * Resource updated response
 */
export interface ResourceUpdatedResponse {
  success: boolean;
  id: string;
  updated: boolean;
  [key: string]: any;
}

/**
 * Resource deleted response
 */
export interface ResourceDeletedResponse {
  success: boolean;
  id: string;
  deleted: boolean;
}

/**
 * Utility functions for API response standardization
 */

/**
 * Transform data to marketplace-compatible response format
 */
export function toStandardResponse<T>(
  data: T, 
  options?: { 
    error?: ApiError; 
    pagination?: PaginationInfo;
    message?: string;
  }
): StandardApiResponse<T> {
  return {
    success: !options?.error,
    data: options?.error ? undefined : data,
    error: options?.error,
    pagination: options?.pagination,
    message: options?.message,
  };
}

/**
 * Convert legacy responses to marketplace format
 */
export function convertToMarketplaceFormat<T>(legacyResponse: any): StandardApiResponse<T> {
  // Already marketplace format
  if ('success' in legacyResponse && 'data' in legacyResponse) {
    return legacyResponse as StandardApiResponse<T>;
  }
  
  // Convert legacy format to marketplace format
  return { 
    success: true, 
    data: legacyResponse as T 
  };
}

/**
 * Transform null values to undefined for consistent API responses
 */
export function normalizeNullToUndefined<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] === null) {
      result[key] = undefined as any;
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = normalizeNullToUndefined(result[key]);
    }
  }
  return result;
}