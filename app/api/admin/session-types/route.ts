import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";

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
export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin status
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    if (!session.user.roles.includes("ADMIN")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
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
    
    return NextResponse.json({ 
      data: serializedSessionTypes,
      count: serializedSessionTypes.length,
    });
  } catch (error) {
    console.error("Error fetching session types:", error);
    return NextResponse.json(
      { error: "Failed to fetch session types" },
      { status: 500 }
    );
  }
}

// POST /api/admin/session-types - Create a new session type
export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin status
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    if (!session.user.roles.includes("ADMIN")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate with schema
    const validationResult = sessionTypeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid session type data", details: validationResult.error.format() },
        { status: 400 }
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
    
    return NextResponse.json(
      { message: "Session type created successfully", data: serializedSessionType },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating session type:", error);
    return NextResponse.json(
      { error: "Failed to create session type" },
      { status: 500 }
    );
  }
}