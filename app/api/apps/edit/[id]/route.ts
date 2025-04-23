import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
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
      return Response.json(
        { error: "App not found" },
        { status: 404 }
      );
    }
    
    // Check if the user owns this app
    if (app.builder.user.email !== session.user.email) {
      // Admin check
      const currentUser = await db.user.findUnique({
        where: { email: session.user.email || '' }
      });
      
      if (!currentUser?.roles.includes("ADMIN")) {
        return Response.json(
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
    
    return Response.json(updatedApp, { status: 200 });
  } catch (error) {
    console.error("[API] Error updating app:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
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
      return Response.json(
        { error: "App not found" },
        { status: 404 }
      );
    }
    
    // Check if the user owns this app
    if (app.builder.user.email !== session.user.email) {
      // Admin check
      const currentUser = await db.user.findUnique({
        where: { email: session.user.email || '' }
      });
      
      if (!currentUser?.roles.includes("ADMIN")) {
        return Response.json(
          { error: "You don't have permission to delete this app" },
          { status: 403 }
        );
      }
    }
    
    // Delete the app
    await db.app.delete({
      where: { id },
    });
    
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[API] Error deleting app:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}