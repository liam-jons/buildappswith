import { NextRequest, NextResponse } from "next/server";
import { type RouteParams } from "@/app/api/route-types";
import { PrismaClient } from "@prisma/client";
import { withAdmin } from "@/lib/auth/clerk/api-auth";
import { AuthUser } from "@/lib/auth/clerk/helpers";
import * as Sentry from "@sentry/nextjs";
import { UserRole } from "@/lib/auth/types";
import { z } from "zod";

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
// Updated to use Clerk authentication with admin role check
export const GET = withAdmin(async (
  req: NextRequest,
  user: AuthUser,
  context: RouteParams<{ id: string }>
) => {
  try {
    
    // Await the params to get the id
    const params = await context.params;
    const id = params.id;
    
    // Fetch the session type
    const sessionType = await prisma.sessionType.findUnique({
      where: { id },
    });
    
    if (!sessionType) {
      return NextResponse.json(
        { error: "Session type not found" },
        { status: 404 }
      );
    }
    
    // Convert Decimal to number for JSON serialization
    const serializedSessionType = {
      ...sessionType,
      price: Number(sessionType.price),
    };
    
    return NextResponse.json({ data: serializedSessionType });
  } catch (error) {
    console.error("Error fetching session type:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch session type" },
      { status: 500 }
    );
  }
});

// PUT /api/admin/session-types/[id] - Update a session type
// Updated to use Clerk authentication with admin role check
export const PUT = withAdmin(async (
  req: NextRequest,
  user: AuthUser,
  context: RouteParams<{ id: string }>
) => {
  try {
    
    // Await the params to get the id
    const params = await context.params;
    const id = params.id;
    
    // Check if session type exists
    const existingSessionType = await prisma.sessionType.findUnique({
      where: { id },
    });
    
    if (!existingSessionType) {
      return NextResponse.json(
        { error: "Session type not found" },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate with schema
    const validationResult = sessionTypeUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid session type data", details: validationResult.error.format() },
        { status: 400 }
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
    
    return NextResponse.json({
      message: "Session type updated successfully",
      data: serializedSessionType,
    });
  } catch (error) {
    console.error("Error updating session type:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to update session type" },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/session-types/[id] - Delete a session type
// Updated to use Clerk authentication with admin role check
export const DELETE = withAdmin(async (
  req: NextRequest,
  user: AuthUser,
  context: RouteParams<{ id: string }>
) => {
  try {
    
    // Await the params to get the id
    const params = await context.params;
    const id = params.id;
    
    // Check if session type exists
    const existingSessionType = await prisma.sessionType.findUnique({
      where: { id },
    });
    
    if (!existingSessionType) {
      return NextResponse.json(
        { error: "Session type not found" },
        { status: 404 }
      );
    }
    
    // Check if session type has any bookings
    const bookingsCount = await prisma.booking.count({
      where: { sessionTypeId: id },
    });
    
    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete session type with existing bookings" },
        { status: 400 }
      );
    }
    
    // Delete session type
    await prisma.sessionType.delete({
      where: { id },
    });
    
    return NextResponse.json({
      message: "Session type deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting session type:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to delete session type" },
      { status: 500 }
    );
  }
});