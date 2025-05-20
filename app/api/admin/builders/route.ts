import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAdmin, AuthenticationError, AuthorizationError, AuthErrorType } from "@/lib/auth";
import { UserRole, AuthObject } from "@/lib/auth/types";
import * as Sentry from "@sentry/nextjs";
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

// GET /api/admin/builders - Get all builders
export const GET = withAdmin(async (req: NextRequest, auth: AuthObject) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    logger.info('Admin builders list request received', {
      path,
      method,
      userId: auth.userId
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
      userId: auth.userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json({ 
      success: true,
      data: formattedBuilders,
      count: formattedBuilders.length,
    });

    return response;
  } catch (error) {
    Sentry.captureException(error);
    logger.error('Error fetching builders', { 
      path, 
      method, 
      userId: auth.userId,
      error: error instanceof Error ? error.message : 'Unknown error' 
    });

    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json(
      { message: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
});