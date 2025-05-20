import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updateSessionType, deleteSessionType, getSessionTypeById } from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth } from '@/lib/auth';
import * as Sentry from '@sentry/nextjs';
import { 
  createAuthErrorResponse, 
  addAuthPerformanceMetrics, 
  AuthErrorType 
} from '@/lib/auth/adapters/clerk-express/errors';
import { logger } from '@/lib/logger';
import { UserRole } from '@/lib/auth/types';

// Validation schema for updating a session type
const updateSessionTypeSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  durationMinutes: z.number().int().positive().max(480).optional(), // Max 8 hours
  price: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(), // ISO 4217 currency code
  isActive: z.boolean().optional(),
  color: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
});

/**
 * PATCH handler for updating a session type
 * Updated to use Clerk authentication
 */
export const PATCH = withAuth(async (
  request: NextRequest,
  context: { params?: { id?: string } },
  userId: string, 
  userRoles: UserRole[]
) => {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;
  const id = context.params?.id;

  try {
    if (!id) {
      logger.warn('Missing session type ID for PATCH', { path, method, userId });
      return createAuthErrorResponse(AuthErrorType.VALIDATION, 'Session Type ID is required', 400, path, method, userId);
    }
    
    const body = await request.json();
    const result = updateSessionTypeSchema.safeParse(body);
    
    if (!result.success) {
      logger.warn('Invalid session type data for PATCH', { path, method, userId, sessionId: id, errors: result.error.flatten() });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION, 
        'Invalid session type data',
        400, 
        path, 
        method, 
        userId
      );
    }
    
    // Placeholder: Permission Check (example)
    // const existingSessionType = await getSessionTypeById(id); 
    // if (!existingSessionType) { 
    //   return createAuthErrorResponse(AuthErrorType.RESOURCE_NOT_FOUND, 'Session type not found', 404, path, method, userId);
    // }
    // const canUpdate = userRoles.includes(UserRole.ADMIN) || (userRoles.includes(UserRole.BUILDER) && existingSessionType.builderId === userId);
    // if (!canUpdate) { 
    //   return createAuthErrorResponse(AuthErrorType.AUTHORIZATION, 'Not authorized to update this session type', 403, path, method, userId);
    // }
    
    try {
      const sessionType = await updateSessionType(id, result.data);
      const response = NextResponse.json({ success: true, data: { sessionType } });
      return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
    } catch (error: any) {
      if (error.message === 'SessionType database implementation required') {
        logger.warn('SessionType PATCH using mock data - database implementation pending', { path, method, userId, sessionId: id });
        const { mockSessionTypes } = await import('@/lib/scheduling/mock-data');
        const sessionTypeIndex = mockSessionTypes.findIndex(st => st.id === id);
        if (sessionTypeIndex === -1) {
          return createAuthErrorResponse(AuthErrorType.RESOURCE_NOT_FOUND, 'Session type not found (mock)', 404, path, method, userId);
        }
        const mockSessionType = { ...mockSessionTypes[sessionTypeIndex], ...result.data };
        const response = NextResponse.json({ 
          success: true, 
          data: { sessionType: mockSessionType }, 
          warning: 'Using mock data - database implementation pending'
        });
        return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
      } else {
        throw error;
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error updating session type PATCH', { error: errorMessage, path, method, userId, sessionId: id });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER, 
      'Failed to update session type',
      500, 
      path, 
      method, 
      userId
    );
  }
});

/**
 * DELETE handler for removing a session type
 * Updated to use new auth HOC
 */
export const DELETE = withAuth(async (
  request: NextRequest,
  context: { params?: { id?: string } },
  userId: string, 
  userRoles: UserRole[] 
) => {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;
  const id = context.params?.id;

  try {
    if (!id) {
      logger.warn('Missing session type ID for DELETE', { path, method, userId });
      return createAuthErrorResponse(AuthErrorType.VALIDATION, 'Session Type ID is required', 400, path, method, userId);
    }

    // Placeholder: Permission Check (example)
    // const existingSessionType = await getSessionTypeById(id); 
    // if (!existingSessionType) { 
    //   return createAuthErrorResponse(AuthErrorType.RESOURCE_NOT_FOUND, 'Session type not found', 404, path, method, userId);
    // }
    // const canDelete = userRoles.includes(UserRole.ADMIN) || (userRoles.includes(UserRole.BUILDER) && existingSessionType.builderId === userId);
    // if (!canDelete) { 
    //   return createAuthErrorResponse(AuthErrorType.AUTHORIZATION, 'Not authorized to delete this session type', 403, path, method, userId);
    // }
    
    try {
      await deleteSessionType(id);
      const response = NextResponse.json({ success: true, message: 'Session type deleted successfully' });
      return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
    } catch (error: any) {
      if (error.message === 'SessionType database implementation required') {
        logger.warn('SessionType DELETE using mock data - database implementation pending', { path, method, userId, sessionId: id });
        const response = NextResponse.json({ 
          success: true, 
          message: 'Session type deleted (mock)',
          warning: 'Using mock data - database implementation pending'
        });
        return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
      } else {
        throw error;
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error deleting session type DELETE', { error: errorMessage, path, method, userId, sessionId: id });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER, 
      'Failed to delete session type',
      500, 
      path, 
      method, 
      userId
    );
  }
});