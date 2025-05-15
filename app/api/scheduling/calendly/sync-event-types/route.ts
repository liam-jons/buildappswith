import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { z } from "zod";

// Environment variable validation
const calendlyApiKey = process.env.CALENDLY_API_KEY;
const calendlyApiBaseUrl = process.env.CALENDLY_API_BASE_URL || "https://api.calendly.com";

// Response schemas
const calendlyEventTypeSchema = z.object({
  uri: z.string(),
  name: z.string(),
  active: z.boolean(),
  slug: z.string(),
  scheduling_url: z.string(),
  duration: z.number(),
  color: z.string(),
  description_plain: z.string().optional(),
  description_html: z.string().optional(),
  profile: z.object({
    type: z.string(),
    name: z.string(),
    owner: z.string(),
  }),
  secret: z.boolean().optional(),
  custom_questions: z.array(z.any()).optional(),
});

const calendlyResponseSchema = z.object({
  collection: z.array(calendlyEventTypeSchema),
  pagination: z.object({
    count: z.number(),
    next_page: z.string().nullable(),
    previous_page: z.string().nullable(),
    next_page_token: z.string().nullable(),
    previous_page_token: z.string().nullable(),
  }),
});

// Helper function to categorize event types
function categorizeEventType(eventType: z.infer<typeof calendlyEventTypeSchema>): string {
  const name = eventType.name.toLowerCase();
  const isFree = name.includes('free') || 
                 name.includes('getting started') || 
                 name.includes('initial consultation') ||
                 name.includes('back to work');
  
  if (isFree) return 'free';
  
  // Check for pathway-specific keywords
  if (name.includes('accelerate') || 
      name.includes('pivot') || 
      name.includes('play')) {
    return 'pathway';
  }
  
  // Default to specialized if not free or pathway
  return 'specialized';
}

// Helper function to determine if auth is required
function requiresAuth(category: string): boolean {
  return category !== 'free';
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or builder
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { 
        id: true, 
        roles: true,
        builderProfile: {
          select: { id: true }
        }
      }
    });

    if (!user || (!user.roles.includes('ADMIN') && !user.builderProfile)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!calendlyApiKey) {
      return NextResponse.json({ error: "Calendly API key not configured" }, { status: 500 });
    }

    // Get builder ID from request body or use current user's builder profile
    const body = await req.json();
    const builderId = body.builderId || user.builderProfile?.id;

    if (!builderId) {
      return NextResponse.json({ error: "Builder ID required" }, { status: 400 });
    }

    // Get builder's Calendly user URI from their profile
    const builder = await db.builderProfile.findUnique({
      where: { id: builderId },
      select: {
        socialLinks: true,
        user: {
          select: { email: true }
        }
      }
    });

    if (!builder) {
      return NextResponse.json({ error: "Builder not found" }, { status: 404 });
    }

    // Extract Calendly username from socialLinks
    const socialLinks = builder.socialLinks as any;
    const calendlyUsername = socialLinks?.calendlyUsername;

    if (!calendlyUsername) {
      return NextResponse.json({ 
        error: "Builder has no Calendly username configured" 
      }, { status: 400 });
    }

    // First, get the user URI
    const userResponse = await fetch(`${calendlyApiBaseUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${calendlyApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch Calendly user: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    const userUri = userData.resource.uri;

    // Fetch event types for the user
    const eventTypesResponse = await fetch(
      `${calendlyApiBaseUrl}/event_types?organization=${userUri}&active=true`,
      {
        headers: {
          'Authorization': `Bearer ${calendlyApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!eventTypesResponse.ok) {
      throw new Error(`Failed to fetch event types: ${eventTypesResponse.statusText}`);
    }

    const eventTypesData = await eventTypesResponse.json();
    const validatedData = calendlyResponseSchema.parse(eventTypesData);

    // Sync event types with database
    const syncResults = await Promise.all(
      validatedData.collection.map(async (eventType, index) => {
        const category = categorizeEventType(eventType);
        const requiresAuthentication = requiresAuth(category);
        
        // Check if session type already exists
        const existingSessionType = await db.sessionType.findFirst({
          where: {
            builderId,
            calendlyEventTypeId: eventType.slug,
          }
        });

        if (existingSessionType) {
          // Update existing session type
          return await db.sessionType.update({
            where: { id: existingSessionType.id },
            data: {
              title: eventType.name,
              description: eventType.description_plain || eventType.name,
              durationMinutes: eventType.duration,
              calendlyEventTypeUri: eventType.scheduling_url,
              isActive: eventType.active,
              color: eventType.color,
              requiresAuth: requiresAuthentication,
              eventTypeCategory: category,
              displayOrder: index,
              updatedAt: new Date(),
            }
          });
        } else {
          // Create new session type
          return await db.sessionType.create({
            data: {
              builderId,
              title: eventType.name,
              description: eventType.description_plain || eventType.name,
              durationMinutes: eventType.duration,
              price: 0, // Default to 0, can be updated later
              currency: 'GBP',
              isActive: eventType.active,
              color: eventType.color,
              calendlyEventTypeId: eventType.slug,
              calendlyEventTypeUri: eventType.scheduling_url,
              requiresAuth: requiresAuthentication,
              eventTypeCategory: category,
              displayOrder: index,
            }
          });
        }
      })
    );

    // Mark any session types not in Calendly as inactive
    const calendlyEventTypeIds = validatedData.collection.map(et => et.slug);
    await db.sessionType.updateMany({
      where: {
        builderId,
        calendlyEventTypeId: {
          notIn: calendlyEventTypeIds
        }
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${syncResults.length} event types`,
      eventTypes: syncResults.map(st => ({
        id: st.id,
        title: st.title,
        category: st.eventTypeCategory,
        requiresAuth: st.requiresAuth,
        isActive: st.isActive,
      }))
    });

  } catch (error) {
    console.error('Error syncing Calendly event types:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync event types" },
      { status: 500 }
    );
  }
}