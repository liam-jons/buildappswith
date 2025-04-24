import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/auth/clerk/api-auth";
import { AuthUser } from "@/lib/auth/clerk/helpers";
import * as Sentry from "@sentry/nextjs";

export const PATCH = withAuth(async (
  request: NextRequest,
  user: AuthUser,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Get the app with builder info
    const app = await db.app.findUnique({
      where: { id },
      include: {
        builder: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!app) {
      return NextResponse.json(
        { error: "App not found" },
        { status: 404 }
      );
    }
    
    // Check if the user owns this app
    if (app.builder.user.email !== user.email) {
      // Admin check
      const currentUser = await db.user.findUnique({
        where: { email: user.email }
      });
      
      if (!currentUser?.roles.includes("ADMIN")) {
        return NextResponse.json(
          { error: "You don't have permission to edit this app" },
          { status: 403 }
        );
      }
    }
    
    // Update the app
    const updatedApp = await db.app.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
        technologies: body.technologies !== undefined ? body.technologies : undefined,
        status: body.status !== undefined ? body.status : undefined,
        appUrl: body.appUrl !== undefined ? body.appUrl : undefined,
        adhd_focused: body.adhd_focused !== undefined ? body.adhd_focused : undefined,
      },
    });
    
    return NextResponse.json(updatedApp, { status: 200 });
  } catch (error) {
    console.error("[API] Error updating app:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (
  request: NextRequest,
  user: AuthUser,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    const { id } = await params;
    
    // Get the app with builder info
    const app = await db.app.findUnique({
      where: { id },
      include: {
        builder: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!app) {
      return NextResponse.json(
        { error: "App not found" },
        { status: 404 }
      );
    }
    
    // Check if the user owns this app
    if (app.builder.user.email !== user.email) {
      // Admin check
      const currentUser = await db.user.findUnique({
        where: { email: user.email }
      });
      
      if (!currentUser?.roles.includes("ADMIN")) {
        return NextResponse.json(
          { error: "You don't have permission to delete this app" },
          { status: 403 }
        );
      }
    }
    
    // Delete the app
    await db.app.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[API] Error deleting app:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});