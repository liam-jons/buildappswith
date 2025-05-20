import { NextRequest, NextResponse } from 'next/server';
import { fetchBuilderById, trackMarketplaceEvent } from '@/lib/marketplace';
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/adapters/clerk-express/errors';
import { logger } from '@/lib/logger';

/**
 * GET handler for fetching a single builder by ID
 * This is a public route with performance tracking but no auth requirements
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;
  let builderId: string | undefined;

  try {
    // Await params properly to fix the Next.js warning
    const resolvedParams = params instanceof Promise ? await params : params;
    builderId = resolvedParams.id;

    logger.info('Marketplace builder profile request received', {
      path,
      method,
      builderId
    });

    if (!builderId) {
      logger.warn('Missing builder ID in request', { path, method });
      return createAuthErrorResponse(
        'VALIDATION_ERROR',
        'Builder ID is required',
        400,
        path,
        method
      );
    }

    // Fetch builder data
    const builder = await fetchBuilderById(builderId);

    if (!builder) {
      logger.warn('Builder not found', { builderId, path, method });
      return createAuthErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Builder not found',
        404,
        path,
        method
      );
    }

    // Track profile view event (don't await to avoid blocking the response)
    trackMarketplaceEvent('profile_view', undefined, builderId);

    logger.info('Builder profile retrieved successfully', {
      builderId,
      path,
      method,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format and add performance metrics
    const response = NextResponse.json({
      success: true,
      data: builder
    });

    return addAuthPerformanceMetrics(
      response,
      startTime,
      true,
      path,
      method
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Error fetching builder profile', {
      error: errorMessage,
      builderId: builderId,
      path,
      method,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to fetch builder profile',
      500,
      path,
      method
    );
  }
}