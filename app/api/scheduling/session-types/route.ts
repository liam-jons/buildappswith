import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTypes, createSessionType } from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth, withOptionalAuth } from '@/lib/auth';
import { UserRole } from '@/lib/auth/types';
import * as Sentry from '@sentry/nextjs';
import { 
  createAuthErrorResponse, 
  addAuthPerformanceMetrics, 
  AuthErrorType 
} from '@/lib/auth/adapters/clerk-express/errors';
import { logger } from '@/lib/logger';
import { toStandardResponse, ApiErrorCode } from '@/lib/types/api-types';

// Validation schema for query parameters
const querySchema = z.object({
  builderId: z.string(),
});

// Validation schema for creating a session type
const createSessionTypeSchema = z.object({
  builderId: z.string(),
  title: z.string().min(3).max(100),
  description: z.string().max(500),
  durationMinutes: z.number().int().positive().max(480), // Max 8 hours
  price: z.number().nonnegative(),
  currency: z.string().length(3), // ISO 4217 currency code
  isActive: z.boolean(),
  color: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
});

/**
 * GET handler for fetching session types for a builder
 * Uses withOptionalAuth as session types might be publicly viewable for a builder
 */
export const GET = withOptionalAuth(async (
  request: NextRequest, 
  context: any, 
  userId?: string, 
  userRoles?: UserRole[]
) => {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;

  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const result = querySchema.safeParse(rawParams);
    
    if (!result.success) {
      logger.warn('Invalid query parameters for GET session-types', { path, method, userId, errors: result.error.flatten() });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION, 
        'Invalid query parameters',
        400, 
        path, 
        method, 
        userId
      );
    }
    
    const { builderId } = result.data;
    
    try {
      const sessionTypes = await getSessionTypes(builderId);
      const response = NextResponse.json(toStandardResponse({ sessionTypes }));
      return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
    } catch (error: any) {
      if (error.message === 'SessionType database implementation required') {
        logger.warn('SessionType GET using mock data - database implementation pending', { path, method, userId, builderId });
        const { mockSessionTypes } = await import('@/lib/scheduling/mock-data');
        const filteredTypes = mockSessionTypes.filter(st => st.builderId === builderId);
        const response = NextResponse.json(toStandardResponse({ sessionTypes: filteredTypes }, {
          message: 'Using mock data - database implementation pending'
        }));
        return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
      } else {
        throw error;
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error in session types GET endpoint', { error: errorMessage, path, method, userId });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER, 
      'Failed to fetch session types',
      500, 
      path, 
      method, 
      userId
    );
  }
});

/**
 * POST handler for creating a new session type
 * Updated to use new auth HOC
 */
export const POST = withAuth(async (
  request: NextRequest, 
  context: any, 
  userId: string, 
  userRoles: UserRole[]
) => {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;

  try {
    const body = await request.json();
    const result = createSessionTypeSchema.safeParse(body);
    
    if (!result.success) {
      logger.warn('Invalid session type data for POST session-types', { path, method, userId, errors: result.error.flatten() });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION, 
        'Invalid session type data',
        400, 
        path, 
        method, 
        userId
      );
    }
    
    const isAdminUser = userRoles.includes(UserRole.ADMIN);
    const isOwnProfile = userId === result.data.builderId;
    
    if (!isAdminUser && !isOwnProfile) {
      logger.warn('Unauthorized attempt to create session type for another builder', { path, method, userId, targetBuilderId: result.data.builderId });
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION, 
        'Not authorized to create session types for this builder',
        403, 
        path, 
        method, 
        userId
      );
    }
    
    try {
      const sessionType = await createSessionType(result.data);
      const response = NextResponse.json(toStandardResponse({ sessionType }), { status: 201 });
      return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
    } catch (error: any) {
      if (error.message === 'SessionType database implementation required') {
        logger.warn('SessionType POST using mock data - database implementation pending', { path, method, userId, data: result.data });
        const { mockSessionTypes } = await import('@/lib/scheduling/mock-data');
        const mockSessionType = { id: 'mock-' + Math.random().toString(36).substring(2, 15), ...result.data };
        const response = NextResponse.json(toStandardResponse({ sessionType: mockSessionType }, {
          message: 'Using mock data - database implementation pending'
        }), { status: 201 });
        return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
      } else {
        throw error;
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error creating session type POST', { error: errorMessage, path, method, userId });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER, 
      'Failed to create session type',
      500, 
      path, 
      method, 
      userId
    );
  }
});