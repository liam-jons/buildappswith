import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAdmin } from "@/lib/auth/clerk/api-auth";
import { AuthUser } from "@/lib/auth/clerk/helpers";
import * as Sentry from "@sentry/nextjs";

const prisma = new PrismaClient();

// GET /api/admin/builders - Get all builders
// Version: 1.0.59
export const GET = withAdmin(async (req: NextRequest, user: AuthUser) => {
  try {
    // Using withAdmin middleware which already checks for admin role
    // No need to check authentication as withAdmin already handles it
    
    // Fetch builders
    const builders = await prisma.builderProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    
    // Format builder data for response
    const formattedBuilders = builders.map(builder => ({
      id: builder.id,
      userId: builder.userId,
      name: builder.user.name,
      email: builder.user.email,
      image: builder.user.image,
      headline: builder.headline,
      hourlyRate: builder.hourlyRate ? Number(builder.hourlyRate) : null,
      featuredBuilder: builder.featuredBuilder,
      adhd_focus: builder.adhd_focus,
      availableForHire: builder.availableForHire,
      validationTier: builder.validationTier
    }));
    
    return NextResponse.json({ 
      data: formattedBuilders,
      count: formattedBuilders.length,
    });
  } catch (error) {
    console.error("Error fetching builders:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch builders" },
      { status: 500 }
    );
  }
});