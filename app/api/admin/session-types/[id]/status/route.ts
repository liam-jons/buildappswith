import { NextRequest, NextResponse } from "next/server";
import { type RouteParams } from "@/app/api/route-types";
import { PrismaClient } from "@prisma/client";
import { withAdmin } from "@/lib/auth/clerk/api-auth";
import { AuthUser } from "@/lib/auth/clerk/helpers";
import * as Sentry from "@sentry/nextjs";
import { UserRole } from "@/lib/auth/types";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for validating status update
const statusUpdateSchema = z.object({
  isActive: z.boolean(),
});

// PATCH /api/admin/session-types/[id]/status - Update session type status
// Updated to use Clerk authentication with admin role check
export const PATCH = withAdmin(async (
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
    const validationResult = statusUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Update session type status
    const { isActive } = validationResult.data;
    const updatedSessionType = await prisma.sessionType.update({
      where: { id },
      data: { isActive },
    });
    
    // Convert Decimal to number for JSON serialization
    const serializedSessionType = {
      ...updatedSessionType,
      price: Number(updatedSessionType.price),
    };
    
    return NextResponse.json({
      message: `Session type ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: serializedSessionType,
    });
  } catch (error) {
    console.error("Error updating session type status:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to update session type status" },
      { status: 500 }
    );
  }
});