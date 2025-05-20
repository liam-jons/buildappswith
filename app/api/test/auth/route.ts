import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import * as Sentry from '@sentry/nextjs';
import { 
  createAuthErrorResponse, 
  addAuthPerformanceMetrics, 
  AuthErrorType 
} from '@/lib/auth/adapters/clerk-express/errors';
import { logger } from '@/lib/logger';
import { UserRole } from '@/lib/auth/types';

/**
 * GET handler for testing authentication
 * Returns authenticated user ID and roles if available
 * Version: 1.0.60
 */
export const GET = withAuth(async (
  request: NextRequest, 
  context: any, 
  userId: string, 
  userRoles: UserRole[]
) => {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;

  try {
    logger.info('Test auth route accessed successfully', { path, method, userId, roles: userRoles });
    
    const responseData = {
      message: 'Authentication successful',
      userId: userId,
      roles: userRoles,
    };

    const response = NextResponse.json({ success: true, data: responseData });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error in test auth route', { error: errorMessage, path, method, userId });
    Sentry.captureException(error);
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER, 
      'Failed to get authenticated user data',
      500, 
      path, 
      method, 
      userId
    );
  }
});
