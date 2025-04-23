/**
 * Session Types Module
 * 
 * Handles loading and managing session types for builders
 * Version: 1.0.43
 */

import { PrismaClient } from '@prisma/client';
import { SessionType } from './scheduling/types';

// Initialize PrismaClient
const prisma = new PrismaClient();

/**
 * Load session types for a specific builder
 * @param builderId The ID of the builder
 * @returns Array of session types or empty array if not found
 */
export async function getSessionTypes(builderId: string): Promise<SessionType[]> {
  try {
    // Fetch from database instead of the filesystem
    const dbSessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId,
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
    });

    // If there are session types in the database, return them
    if (dbSessionTypes.length > 0) {
      return dbSessionTypes.map(st => ({
        id: st.id,
        builderId: st.builderId,
        title: st.title,
        description: st.description,
        durationMinutes: st.durationMinutes,
        price: Number(st.price), // Convert Decimal to number
        currency: st.currency,
        isActive: st.isActive,
        color: st.color || undefined,
        maxParticipants: st.maxParticipants || undefined
      }));
    }
    
    // If nothing found, return default session types
    return getDefaultSessionTypes(builderId);
  } catch (error) {
    console.error(`Error loading session types for builder ${builderId}:`, error);
    return getDefaultSessionTypes(builderId);
  } finally {
    // No need to disconnect as PrismaClient manages its own connections
  }
}

/**
 * Get default session types if no custom ones are defined
 * @param builderId The ID of the builder
 * @returns Array of default session types
 */
function getDefaultSessionTypes(builderId: string): SessionType[] {
  return [
    {
      id: "individual-1-to-1",
      builderId,
      title: "Individuals - 1-to-1",
      description: "Personal one-to-one session to discuss your specific AI needs",
      durationMinutes: 60,
      price: 99,
      currency: "USD",
      isActive: true
    },
    {
      id: "individual-group",
      builderId,
      title: "Individuals - Group",
      description: "Join a small group session with other individuals interested in AI",
      durationMinutes: 90,
      price: 49,
      currency: "USD",
      isActive: true,
      maxParticipants: 10
    },
    {
      id: "business-1-to-1",
      builderId,
      title: "Businesses - 1-to-1",
      description: "Focused session for businesses to discuss AI implementation strategies",
      durationMinutes: 60,
      price: 199,
      currency: "USD",
      isActive: true
    },
    {
      id: "business-group",
      builderId,
      title: "Businesses - Group",
      description: "Group session for businesses to learn about AI applications",
      durationMinutes: 90,
      price: 99,
      currency: "USD",
      isActive: true,
      maxParticipants: 8
    }
  ];
}

/**
 * Get session type by ID
 * @param builderId The ID of the builder
 * @param sessionTypeId The ID of the session type
 * @returns The session type or null if not found
 */
export async function getSessionTypeById(builderId: string, sessionTypeId: string): Promise<SessionType | null> {
  try {
    // Query the database for the specific session type
    const sessionType = await prisma.sessionType.findFirst({
      where: {
        id: sessionTypeId,
        builderId,
        isActive: true,
      },
    });

    // If found, return it
    if (sessionType) {
      return {
        id: sessionType.id,
        builderId: sessionType.builderId,
        title: sessionType.title,
        description: sessionType.description,
        durationMinutes: sessionType.durationMinutes,
        price: Number(sessionType.price), // Convert Decimal to number
        currency: sessionType.currency,
        isActive: sessionType.isActive,
        color: sessionType.color || undefined,
        maxParticipants: sessionType.maxParticipants || undefined
      };
    }

    // If not found in database, fall back to all session types
    const sessionTypes = await getSessionTypes(builderId);
    return sessionTypes.find(session => session.id === sessionTypeId) || null;
  } catch (error) {
    console.error(`Error fetching session type by ID ${sessionTypeId}:`, error);
    // Fallback to all session types
    const sessionTypes = await getSessionTypes(builderId);
    return sessionTypes.find(session => session.id === sessionTypeId) || null;
  }
}

/**
 * Map marketing session IDs to actual session type IDs
 * @param marketingId The marketing session ID (e.g., "session1")
 * @param builderId The ID of the builder
 * @returns The corresponding session type ID
 */
export async function mapMarketingSessionId(marketingId: string, builderId: string): Promise<string> {
  // Get all session types
  const sessionTypes = await getSessionTypes(builderId);
  
  // For Liam Jons, try to match by specific marketing IDs first
  if (builderId === 'liam-jons' || builderId === 'cm9neoier00029kxo8b1pme9x') {
    try {
      // Try to find a session type with the exact marketing ID 
      // This requires the sessionType ID to be set to the marketing ID
      const exactMatch = await prisma.sessionType.findFirst({
        where: {
          id: marketingId,
          builderId,
          isActive: true,
        },
      });

      if (exactMatch) {
        return exactMatch.id;
      }

      // If no exact match, use our mapping logic
      switch (marketingId) {
        case 'session1':
          return sessionTypes.find(st => st.title.includes('1:1 AI Discovery'))?.id || 
                 sessionTypes.find(st => st.title.includes('1-to-1'))?.id || 
                 'individual-1-to-1';
        case 'session2':
          return sessionTypes.find(st => st.title.includes('ADHD'))?.id || 
                 sessionTypes.find(st => st.title.includes('1-to-1'))?.id || 
                 'individual-1-to-1';
        case 'session3':
          return sessionTypes.find(st => st.title.includes('Fundamentals') || st.title.includes('Literacy'))?.id || 
                 sessionTypes.find(st => st.title.includes('Group'))?.id || 
                 'individual-group';
        case 'session4':
          return sessionTypes.find(st => st.title.includes('Unemployed') || st.title.includes('Free'))?.id || 
                 sessionTypes.find(st => st.title.includes('Group'))?.id || 
                 'individual-group';
        default:
          return sessionTypes[0]?.id || 'individual-1-to-1';
      }
    } catch (error) {
      console.error(`Error mapping marketing session ID ${marketingId}:`, error);
      // Return the first session type ID as fallback
      return sessionTypes[0]?.id || 'individual-1-to-1';
    }
  }
  
  // For other builders, implement mapping logic
  switch (marketingId) {
    case 'session1':
      return 'individual-1-to-1';
    case 'session2':
      return 'individual-1-to-1'; // ADHD session maps to 1:1
    case 'session3':
    case 'session4':
      return 'individual-group';
    default:
      return sessionTypes[0]?.id || 'individual-1-to-1';
  }
}

// Add alias for backward compatibility
export const getBuilderSessionTypes = getSessionTypes;