import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAdmin } from "@/lib/auth/api-auth";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/express/errors';
import { logger } from '@/lib/logger';
import { UserRole } from "@/lib/auth/types";

const prisma = new PrismaClient();

// Schema for validating session type data
const sessionTypeSchema = z.object({
  builderId: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  durationMinutes: z.number().min(15, "Duration must be at least 15 minutes"),
  price: z.number().min(0, "Price must be a positive number"),
  currency: z.string().min(3, "Currency code must be 3 characters").max(3, "Currency code must be 3 characters"),
  isActive: z.boolean().default(true),
  color: z.string().optional(),
  maxParticipants: z.number().optional(),
});

// GET /api/admin/session-types - Get all session types
// Updated to use Express SDK with admin role check
export const GET = withAdmin(async (req: NextRequest, userId: string, roles: UserRole[]) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    logger.info('Admin session types request received', {
      path,
      method,
      userId
    });
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const builderId = searchParams.get("builderId");
    
    // Fetch session types based on builder ID if provided
    const sessionTypes = await prisma.sessionType.findMany({
      where: builderId ? { builderId } : undefined,
      orderBy: {
        createdAt: "asc",
      },
    });
    
    // Convert Decimal to number for JSON serialization
    const serializedSessionTypes = sessionTypes.map(st => ({
      ...st,
      price: Number(st.price),
    }));
    
    logger.info('Session types retrieved successfully', {
      count: serializedSessionTypes.length,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json({ 
      success: true,
      data: serializedSessionTypes,
      count: serializedSessionTypes.length,
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
    
    logger.error('Error fetching session types', {
      error: errorMessage,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
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

// POST /api/admin/session-types - Create a new session type
// Updated to use Express SDK with admin role check
export const POST = withAdmin(async (req: NextRequest, userId: string, roles: UserRole[]) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    logger.info('Admin session type creation request received', {
      path,
      method,
      userId
    });
    
    // Parse request body
    const body = await req.json();
    
    // Validate with schema
    const validationResult = sessionTypeSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('Invalid session type data', {
        details: validationResult.error.format(),
        path,
        method,
        userId
      });
      
      return createAuthErrorResponse(
        'VALIDATION_ERROR',
        'Invalid session type data',
        400,
        path,
        method,
        userId
      );
    }
    
    // Create new session type
    const data = validationResult.data;
    const newSessionType = await prisma.sessionType.create({
      data: {
        builderId: data.builderId,
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        price: data.price,
        currency: data.currency,
        isActive: data.isActive,
        color: data.color || null,
        maxParticipants: data.maxParticipants || null,
      },
    });
    
    // Convert Decimal to number for JSON serialization
    const serializedSessionType = {
      ...newSessionType,
      price: Number(newSessionType.price),
    };
    
    logger.info('Session type created successfully', {
      sessionTypeId: serializedSessionType.id,
      builderId: serializedSessionType.builderId,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json(
      { 
        success: true,
        message: "Session type created successfully", 
        data: serializedSessionType 
      },
      { status: 201 }
    );

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
    
    logger.error('Error creating session type', {
      error: errorMessage,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
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