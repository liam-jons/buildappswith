import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAdmin } from "@/lib/auth/express/api-auth";
import * as Sentry from "@sentry/nextjs";
import { UserRole } from "@/lib/auth/types";
import { z } from "zod";
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/express/errors';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

// Schema for validating session type update data
const sessionTypeUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  durationMinutes: z.number().min(15, "Duration must be at least 15 minutes").optional(),
  price: z.number().min(0, "Price must be a positive number").optional(),
  currency: z.string().min(3, "Currency code must be 3 characters").max(3, "Currency code must be 3 characters").optional(),
  isActive: z.boolean().optional(),
  color: z.string().optional().nullable(),
  maxParticipants: z.number().optional().nullable(),
});

// GET /api/admin/session-types/[id] - Get a specific session type
// Updated to use Express SDK with admin role check
export const GET = withAdmin(async (
  req: NextRequest,
  userId: string,
  roles: UserRole[],
  { params }: { params: { id: string } }
) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  const id = params.id;

  try {
    logger.info('Admin session type request received', {
      path,
      method,
      userId,
      sessionTypeId: id
    });
    
    // Fetch the session type
    const sessionType = await prisma.sessionType.findUnique({
      where: { id },
    });
    
    if (!sessionType) {
      logger.warn('Session type not found', {
        sessionTypeId: id,
        path,
        method,
        userId
      });
      
      return createAuthErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Session type not found',
        404,
        path,
        method,
        userId
      );
    }
    
    // Convert Decimal to number for JSON serialization
    const serializedSessionType = {
      ...sessionType,
      price: Number(sessionType.price),
    };
    
    logger.info('Session type retrieved successfully', {
      sessionTypeId: id,
      builderId: sessionType.builderId,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json({ 
      success: true,
      data: serializedSessionType 
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
    
    logger.error('Error fetching session type', {
      error: errorMessage,
      sessionTypeId: id,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
    Sentry.captureException(error);
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to fetch session type',
      500,
      path,
      method,
      userId
    );
  }
});

// PUT /api/admin/session-types/[id] - Update a session type
// Updated to use Express SDK with admin role check
export const PUT = withAdmin(async (
  req: NextRequest,
  userId: string,
  roles: UserRole[],
  { params }: { params: { id: string } }
) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  const id = params.id;

  try {
    logger.info('Admin session type update request received', {
      path,
      method,
      userId,
      sessionTypeId: id
    });
    
    // Check if session type exists
    const existingSessionType = await prisma.sessionType.findUnique({
      where: { id },
    });
    
    if (!existingSessionType) {
      logger.warn('Session type not found for update', {
        sessionTypeId: id,
        path,
        method,
        userId
      });
      
      return createAuthErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Session type not found',
        404,
        path,
        method,
        userId
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate with schema
    const validationResult = sessionTypeUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('Invalid session type update data', {
        details: validationResult.error.format(),
        sessionTypeId: id,
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
    
    // Update session type
    const data = validationResult.data;
    const updatedSessionType = await prisma.sessionType.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.durationMinutes && { durationMinutes: data.durationMinutes }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.currency && { currency: data.currency }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.maxParticipants !== undefined && { maxParticipants: data.maxParticipants }),
      },
    });
    
    // Convert Decimal to number for JSON serialization
    const serializedSessionType = {
      ...updatedSessionType,
      price: Number(updatedSessionType.price),
    };
    
    logger.info('Session type updated successfully', {
      sessionTypeId: id,
      builderId: updatedSessionType.builderId,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json({
      success: true,
      message: "Session type updated successfully",
      data: serializedSessionType,
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
    
    logger.error('Error updating session type', {
      error: errorMessage,
      sessionTypeId: id,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
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

// DELETE /api/admin/session-types/[id] - Delete a session type
// Updated to use Express SDK with admin role check
export const DELETE = withAdmin(async (
  req: NextRequest,
  userId: string,
  roles: UserRole[],
  { params }: { params: { id: string } }
) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  const id = params.id;

  try {
    logger.info('Admin session type deletion request received', {
      path,
      method,
      userId,
      sessionTypeId: id
    });
    
    // Check if session type exists
    const existingSessionType = await prisma.sessionType.findUnique({
      where: { id },
    });
    
    if (!existingSessionType) {
      logger.warn('Session type not found for deletion', {
        sessionTypeId: id,
        path,
        method,
        userId
      });
      
      return createAuthErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Session type not found',
        404,
        path,
        method,
        userId
      );
    }
    
    // Check if session type has any bookings
    const bookingsCount = await prisma.booking.count({
      where: { sessionTypeId: id },
    });
    
    if (bookingsCount > 0) {
      logger.warn('Cannot delete session type with existing bookings', {
        sessionTypeId: id,
        bookingsCount,
        path,
        method,
        userId
      });
      
      return createAuthErrorResponse(
        'VALIDATION_ERROR',
        'Cannot delete session type with existing bookings',
        400,
        path,
        method,
        userId
      );
    }
    
    // Delete session type
    await prisma.sessionType.delete({
      where: { id },
    });
    
    logger.info('Session type deleted successfully', {
      sessionTypeId: id,
      builderId: existingSessionType.builderId,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json({
      success: true,
      message: "Session type deleted successfully",
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
    
    logger.error('Error deleting session type', {
      error: errorMessage,
      sessionTypeId: id,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
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