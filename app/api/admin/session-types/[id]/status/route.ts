import { NextRequest, NextResponse } from "next/server";
import { type RouteParams } from "@/app/api/route-types";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { UserRole } from "@/lib/auth/types";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for validating status update
const statusUpdateSchema = z.object({
  isActive: z.boolean(),
});

// PATCH /api/admin/session-types/[id]/status - Update session type status
export async function PATCH(
  req: NextRequest,
  context: RouteParams<{ id: string }>
) {
  try {
    // Check authentication and admin status
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
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
    return NextResponse.json(
      { error: "Failed to update session type status" },
      { status: 500 }
    );
  }
}