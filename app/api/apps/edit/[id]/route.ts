import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import * as Sentry from "@sentry/nextjs";
import { UserRole, AuthObject } from "@/lib/auth/types";

export const PATCH = withAuth(async (
  request: NextRequest,
  context: { params: { id: string } },
  auth: AuthObject
): Promise<NextResponse> => {
  try {
    const { id } = context.params;
    const body = await request.json();
    
    const app = await db.app.findUnique({
      where: { id },
      include: {
        builder: {
          select: { userId: true }
        }
      }
    });
    
    if (!app) {
      return NextResponse.json(
        { error: "App not found" },
        { status: 404 }
      );
    }
    
    if (app.builder.userId !== auth.userId) {
      const userRoles = auth.roles;

      if (!userRoles.includes(UserRole.ADMIN)) {
        return NextResponse.json(
          { error: "You don't have permission to edit this app" },
          { status: 403 }
        );
      }
    }
    
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
  context: { params: { id: string } },
  auth: AuthObject
): Promise<NextResponse> => {
  try {
    const { id } = context.params;
    
    const app = await db.app.findUnique({
      where: { id },
      include: {
        builder: {
          select: { userId: true }
        }
      }
    });
    
    if (!app) {
      return NextResponse.json(
        { error: "App not found" },
        { status: 404 }
      );
    }
    
    if (app.builder.userId !== auth.userId) {
      const userRoles = auth.roles;

      if (!userRoles.includes(UserRole.ADMIN)) {
        return NextResponse.json(
          { error: "You don't have permission to delete this app" },
          { status: 403 }
        );
      }
    }
    
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