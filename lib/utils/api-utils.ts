/**
 * API Utilities
 * Version: 1.0.0
 * 
 * Utilities for creating standardized API responses
 * Provides consistent error handling and response formatting
 */

import { 
  ApiResponse, 
  ApiError, 
  ApiErrorCode,
  PaginationInfo,
  PaginatedData,
  PaginatedApiResponse,
  ResourceCreatedResponse,
  ResourceUpdatedResponse,
  ResourceDeletedResponse
} from '../types/api-types';

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, any>,
  statusCode?: number
): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, details, statusCode }
  };
}

/**
 * Create a paginated API response
 */
export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): PaginatedApiResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  const pagination: PaginationInfo = {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages
  };
  
  const paginatedData: PaginatedData<T> = {
    items,
    pagination
  };
  
  return createSuccessResponse(paginatedData);
}

/**
 * Create a resource created response
 */
export function createResourceCreatedResponse(
  id: string,
  additionalData?: Record<string, any>
): ApiResponse<ResourceCreatedResponse> {
  return createSuccessResponse({
    id,
    ...additionalData
  }, 'Resource created successfully');
}

/**
 * Create a resource updated response
 */
export function createResourceUpdatedResponse(
  id: string,
  updated: boolean = true,
  additionalData?: Record<string, any>
): ApiResponse<ResourceUpdatedResponse> {
  return createSuccessResponse({
    success: true,
    id,
    updated,
    ...additionalData
  }, 'Resource updated successfully');
}

/**
 * Create a resource deleted response
 */
export function createResourceDeletedResponse(
  id: string,
  deleted: boolean = true
): ApiResponse<ResourceDeletedResponse> {
  return createSuccessResponse({
    success: true,
    id,
    deleted
  }, 'Resource deleted successfully');
}

/**
 * Create a bad request error response
 */
export function createBadRequestError(message: string, details?: Record<string, any>): ApiResponse<never> {
  return createErrorResponse(ApiErrorCode.BAD_REQUEST, message, details, 400);
}

/**
 * Create an unauthorized error response
 */
export function createUnauthorizedError(message: string = 'Unauthorized', details?: Record<string, any>): ApiResponse<never> {
  return createErrorResponse(ApiErrorCode.UNAUTHORIZED, message, details, 401);
}

/**
 * Create a forbidden error response
 */
export function createForbiddenError(message: string = 'Forbidden', details?: Record<string, any>): ApiResponse<never> {
  return createErrorResponse(ApiErrorCode.FORBIDDEN, message, details, 403);
}

/**
 * Create a not found error response
 */
export function createNotFoundError(message: string = 'Resource not found', details?: Record<string, any>): ApiResponse<never> {
  return createErrorResponse(ApiErrorCode.NOT_FOUND, message, details, 404);
}

/**
 * Create a validation error response
 */
export function createValidationError(message: string, details?: Record<string, any>): ApiResponse<never> {
  return createErrorResponse(ApiErrorCode.VALIDATION_ERROR, message, details, 422);
}

/**
 * Create an internal server error response
 */
export function createInternalError(message: string = 'Internal server error', details?: Record<string, any>): ApiResponse<never> {
  return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, message, details, 500);
}

/**
 * Create a conflict error response
 */
export function createConflictError(message: string, details?: Record<string, any>): ApiResponse<never> {
  return createErrorResponse(ApiErrorCode.CONFLICT, message, details, 409);
}

/**
 * Create a rate limited error response
 */
export function createRateLimitedError(message: string = 'Too many requests', details?: Record<string, any>): ApiResponse<never> {
  return createErrorResponse(ApiErrorCode.RATE_LIMITED, message, details, 429);
}

/**
 * Extract pagination parameters from query with defaults
 */
export function extractPaginationParams(query: any): { page: number; limit: number } {
  const page = query?.page ? parseInt(query.page as string, 10) : 1;
  const limit = query?.limit ? parseInt(query.limit as string, 10) : 10;
  
  return {
    page: isNaN(page) || page < 1 ? 1 : page,
    limit: isNaN(limit) || limit < 1 || limit > 100 ? 10 : limit
  };
}

/**
 * Extract sort parameters from query with defaults
 */
export function extractSortParams(query: any, defaultSortBy: string = 'createdAt', defaultSortDirection: 'asc' | 'desc' = 'desc'): { 
  sortBy: string; 
  sortDirection: 'asc' | 'desc' 
} {
  const sortBy = query?.sortBy as string || defaultSortBy;
  const sortDirection = (query?.sortDirection as 'asc' | 'desc') || defaultSortDirection;
  
  return {
    sortBy,
    sortDirection: sortDirection === 'asc' ? 'asc' : 'desc'
  };
}