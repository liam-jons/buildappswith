import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAdmin, AuthenticationError, AuthorizationError, ResourceNotFoundError, AuthErrorType } from "@/lib/auth";
import * as Sentry from "@sentry/nextjs";
import { UserRole, AuthObject } from "@/lib/auth/types";
import { z } from "zod";
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
export const GET = withAdmin(async (
  req: NextRequest,
  context: { params: { id: string } },
  auth: AuthObject
) => {
  const path = req.nextUrl.pathname;
  const method = req.method;
  const id = context.params.id;

  try {
    logger.info('Admin session type request received', {
      path,
      method,
      userId: auth.userId,
      sessionTypeId: id
    });
    
    const sessionType = await prisma.sessionType.findUnique({
      where: { id },
    });
    
    if (!sessionType) {
      logger.warn('Session type not found', {
        sessionTypeId: id,
        path,
        method,
        userId: auth.userId
      });
      const notFoundError = new ResourceNotFoundError('Session type not found');
      return NextResponse.json({ message: notFoundError.message }, { status: notFoundError.statusCode });
    }
    
    const serializedSessionType = {
      ...sessionType,
      price: Number(sessionType.price),
    };
    
    logger.info('Session type retrieved successfully', {
      sessionTypeId: id,
      builderId: sessionType.builderId,
      path,
      method,
      userId: auth.userId,
    });

    return NextResponse.json({ 
      success: true,
      data: serializedSessionType 
    });

  } catch (error) {
    Sentry.captureException(error);
    logger.error('Error fetching session type', {
      error: error instanceof Error ? error.message : String(error),
      sessionTypeId: id,
      path,
      method,
      userId: auth.userId,
    });
        
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json(
      { message: 'Failed to fetch session type' }, 
      { status: 500 }
    );
  }
});

// PUT /api/admin/session-types/[id] - Update a session type
export const PUT = withAdmin(async (
  req: NextRequest,
  context: { params: { id: string } },
  auth: AuthObject
) => {
  const path = req.nextUrl.pathname;
  const method = req.method;
  const id = context.params.id;

  try {
    logger.info('Admin session type update request received', {
      path,
      method,
      userId: auth.userId,
      sessionTypeId: id
    });
    
    const existingSessionType = await prisma.sessionType.findUnique({
      where: { id },
    });
    
    if (!existingSessionType) {
      logger.warn('Session type not found for update', {
        sessionTypeId: id,
        path,
        method,
        userId: auth.userId
      });
      const notFoundError = new ResourceNotFoundError('Session type not found for update');
      return NextResponse.json({ message: notFoundError.message }, { status: notFoundError.statusCode });
    }

    const body = await req.json();
    const validation = sessionTypeUpdateSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('Invalid session type update data', {
        sessionTypeId: id,
        path,
        method,
        userId: auth.userId,
        errors: validation.error.flatten()
      });
      return NextResponse.json(
        { message: 'Invalid request data', errors: validation.error.flatten().fieldErrors }, 
        { status: 400 }
      );
    }

    const updatedSessionType = await prisma.sessionType.update({
      where: { id },
      data: validation.data,
    });

    const serializedUpdatedSessionType = {
      ...updatedSessionType,
      price: Number(updatedSessionType.price),
    };

    logger.info('Session type updated successfully', {
      sessionTypeId: id,
      path,
      method,
      userId: auth.userId,
    });

    return NextResponse.json({ 
      success: true,
      data: serializedUpdatedSessionType 
    });

  } catch (error) {
    Sentry.captureException(error);
    logger.error('Error updating session type', {
      error: error instanceof Error ? error.message : String(error),
      sessionTypeId: id,
      path,
      method,
      userId: auth.userId,
    });

    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json(
      { message: 'Failed to update session type' }, 
      { status: 500 }
    );
  }
});

// DELETE /api/admin/session-types/[id] - Delete a session type
export const DELETE = withAdmin(async (
  req: NextRequest,
  context: { params: { id: string } },
  auth: AuthObject
) => {
  const path = req.nextUrl.pathname;
  const method = req.method;
  const id = context.params.id;

  try {
    logger.info('Admin session type delete request received', {
      path,
      method,
      userId: auth.userId,
      sessionTypeId: id
    });
    
    const existingSessionType = await prisma.sessionType.findUnique({
      where: { id },
    });
    
    if (!existingSessionType) {
      logger.warn('Session type not found for delete', {
        sessionTypeId: id,
        path,
        method,
        userId: auth.userId
      });
      const notFoundError = new ResourceNotFoundError('Session type not found for delete');
      return NextResponse.json({ message: notFoundError.message }, { status: notFoundError.statusCode });
    }

    await prisma.sessionType.delete({
      where: { id },
    });

    logger.info('Session type deleted successfully', {
      sessionTypeId: id,
      path,
      method,
      userId: auth.userId,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Session type deleted successfully' 
    });

  } catch (error) {
    Sentry.captureException(error);
    logger.error('Error deleting session type', {
      error: error instanceof Error ? error.message : String(error),
      sessionTypeId: id,
      path,
      method,
      userId: auth.userId,
    });

    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json(
      { message: 'Failed to delete session type' }, 
      { status: 500 }
    );
  }
});