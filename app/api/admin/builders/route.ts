import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAdmin } from "@/lib/auth/api-auth";
import { UserRole } from "@/lib/auth/types";
import * as Sentry from "@sentry/nextjs";
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/express/errors';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

// GET /api/admin/builders - Get all builders
// Updated to use Express SDK with admin role check
export const GET = withAdmin(async (req: NextRequest, userId: string, roles: UserRole[]) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    logger.info('Admin builders list request received', {
      path,
      method,
      userId
    });
    
    // Fetch builders
    const builders = await prisma.builderProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    
    // Format builder data for response
    const formattedBuilders = builders.map(builder => ({
      id: builder.id,
      userId: builder.userId,
      name: builder.user.name,
      email: builder.user.email,
      image: builder.user.imageUrl,
      headline: builder.headline,
      hourlyRate: builder.hourlyRate ? Number(builder.hourlyRate) : null,
      featuredBuilder: builder.featuredBuilder,
      adhd_focus: builder.adhd_focus,
      availableForHire: builder.availableForHire,
      validationTier: builder.validationTier
    }));
    
    logger.info('Builders list retrieved successfully', {
      count: formattedBuilders.length,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json({ 
      success: true,
      data: formattedBuilders,
      count: formattedBuilders.length,
    });

    // Add performance metrics to the response
    return addAuthPerformanceMetrics(
      response, 
      startTime, 
      true, 
      path, 
      method, 
      userId
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Error fetching builders', {
      error: errorMessage,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
    Sentry.captureException(error);
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to fetch builders',
      500,
      path,
      method,
      userId
    );
  }
});