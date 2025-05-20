import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import * as Sentry from "@sentry/nextjs";
import { AuthObject } from "@/lib/auth/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ builderId: string }> }
): Promise<NextResponse> {
  try {
    const { builderId } = await params;
    
    if (!builderId) {
      return NextResponse.json(
        { error: "Builder ID is required" },
        { status: 400 }
      );
    }
    
    // Check if the builder profile exists
    const builderProfile = await db.builderProfile.findUnique({
      where: { id: builderId },
    });
    
    if (!builderProfile) {
      return NextResponse.json(
        { error: "Builder profile not found" },
        { status: 404 }
      );
    }
    
    // Get all apps for this builder
    const apps = await db.app.findMany({
      where: {
        builderId: builderId,
      },
      orderBy: [
        { status: 'asc' }, // LIVE first, then DEMO, then CONCEPT
        { createdAt: 'desc' }, // Most recent first
      ],
    });
    
    return NextResponse.json(apps, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching apps:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(async (
  request: NextRequest,
  context: { params: { builderId: string } },
  auth: AuthObject
): Promise<NextResponse> => {
  try {
    const { builderId } = context.params;
    const body = await request.json();
    
    // Verify this user owns the builder profile
    const builderProfile = await db.builderProfile.findUnique({
      where: { id: builderId },
      include: { user: true },
    });
    
    if (!builderProfile) {
      return NextResponse.json(
        { error: "Builder profile not found" },
        { status: 404 }
      );
    }
    
    if (builderProfile.userId !== auth.userId) {
      return NextResponse.json(
        { error: "You don't have permission to add apps to this profile" },
        { status: 403 }
      );
    }
    
    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }
    
    // Create the app
    const app = await db.app.create({
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        technologies: body.technologies || [],
        status: body.status || "CONCEPT",
        appUrl: body.appUrl,
        adhd_focused: body.adhd_focused || false,
        builderId,
      },
    });
    
    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating app:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});