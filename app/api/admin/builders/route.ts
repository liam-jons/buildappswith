import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth/auth";

const prisma = new PrismaClient();

// GET /api/admin/builders - Get all builders
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
    return NextResponse.json(
      { error: "Failed to fetch builders" },
      { status: 500 }
    );
  }
}