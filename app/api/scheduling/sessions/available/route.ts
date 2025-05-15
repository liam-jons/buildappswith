import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { z } from "zod";

const querySchema = z.object({
  authenticated: z.union([z.literal("true"), z.literal("false")]).optional(),
  builderId: z.string().optional(),
  category: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    const searchParams = req.nextUrl.searchParams;
    
    // Parse query parameters
    const query = querySchema.parse({
      authenticated: searchParams.get("authenticated") || undefined,
      builderId: searchParams.get("builderId") || undefined,
      category: searchParams.get("category") || undefined,
    });

    // Determine if user is authenticated
    const isAuthenticated = !!userId;
    const showAuthRequired = query.authenticated === "true" || (query.authenticated === undefined && isAuthenticated);

    // Base query conditions
    const where: any = {
      isActive: true,
    };

    // Filter by authentication requirement
    if (query.authenticated !== undefined) {
      where.requiresAuth = query.authenticated === "true";
    } else if (!isAuthenticated) {
      // If user is not authenticated, only show sessions that don't require auth
      where.requiresAuth = false;
    }

    // Filter by builder if specified
    if (query.builderId) {
      where.builderId = query.builderId;
    }

    // Filter by category if specified
    if (query.category) {
      where.eventTypeCategory = query.category;
    }

    // Fetch session types
    const sessionTypes = await db.sessionType.findMany({
      where,
      include: {
        builder: {
          select: {
            id: true,
            displayName: true,
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { price: 'asc' },
        { title: 'asc' }
      ]
    });

    // Group sessions by category for better organization
    const groupedSessions = sessionTypes.reduce((acc, session) => {
      const category = session.eventTypeCategory || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: session.id,
        title: session.title,
        description: session.description,
        duration: session.durationMinutes,
        price: session.price.toNumber(),
        currency: session.currency,
        color: session.color,
        requiresAuth: session.requiresAuth,
        calendlyUrl: session.calendlyEventTypeUri,
        builder: {
          id: session.builder.id,
          name: session.builder.displayName || session.builder.user.name,
          email: session.builder.user.email,
        }
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Define category order and labels
    const categoryInfo = {
      free: { label: "Free Sessions", order: 1 },
      pathway: { label: "Learning Pathway Sessions", order: 2 },
      specialized: { label: "Specialized Sessions", order: 3 },
      other: { label: "Other Sessions", order: 4 },
    };

    // Sort categories and format response
    const sortedCategories = Object.entries(groupedSessions)
      .sort(([a], [b]) => {
        const orderA = categoryInfo[a as keyof typeof categoryInfo]?.order || 999;
        const orderB = categoryInfo[b as keyof typeof categoryInfo]?.order || 999;
        return orderA - orderB;
      })
      .map(([category, sessions]) => ({
        category,
        label: categoryInfo[category as keyof typeof categoryInfo]?.label || category,
        sessions,
      }));

    return NextResponse.json({
      success: true,
      categories: sortedCategories,
      totalSessions: sessionTypes.length,
      userAuthenticated: isAuthenticated,
    });

  } catch (error) {
    console.error('Error fetching available sessions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}