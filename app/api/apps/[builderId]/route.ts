import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/auth/clerk/api-auth";
import { AuthUser } from "@/lib/auth/clerk/helpers";
import * as Sentry from "@sentry/nextjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ builderId: string }> }
): Promise<Response> {
  try {
    const { builderId } = await params;
    
    if (!builderId) {
      return Response.json(
        { error: "Builder ID is required" },
        { status: 400 }
      );
    }
    
    // Check if the builder profile exists
    const builderProfile = await db.builderProfile.findUnique({
      where: { id: builderId },
    });
    
    if (!builderProfile) {
      return Response.json(
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
    
    return Response.json(apps, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching apps:", error);
    Sentry.captureException(error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(async (
  request: NextRequest,
  user: AuthUser,
  { params }: { params: Promise<{ builderId: string }> }
): Promise<Response> => {
  try {
    const { builderId } = await params;
    const body = await request.json();
    
    // Verify this user owns the builder profile
    const builderProfile = await db.builderProfile.findUnique({
      where: { id: builderId },
      include: { user: true },
    });
    
    if (!builderProfile) {
      return Response.json(
        { error: "Builder profile not found" },
        { status: 404 }
      );
    }
    
    if (builderProfile.user.email !== user.email) {
      return Response.json(
        { error: "You don't have permission to add apps to this profile" },
        { status: 403 }
      );
    }
    
    // Validate required fields
    if (!body.title || !body.description) {
      return Response.json(
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
    
    return Response.json(app, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating app:", error);
    Sentry.captureException(error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});