/**
 * Session Types Module
 * 
 * Handles loading and managing session types for builders
 * Version: 1.0.40
 */

import fs from 'fs';
import path from 'path';
import { SessionType } from './scheduling/types';

// Directory where session type data is stored
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Load session types for a specific builder
 * @param builderId The ID of the builder
 * @returns Array of session types or empty array if not found
 */
export async function getSessionTypes(builderId: string): Promise<SessionType[]> {
  try {
    // For Liam Jons, use the special file
    if (builderId === 'liam-jons') {
      const filePath = path.join(DATA_DIR, 'liam-session-types.json');
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
    }
    
    // In the future, this would fetch from the database
    // For now, return default session types if builder-specific ones aren't found
    return getDefaultSessionTypes(builderId);
  } catch (error) {
    console.error(`Error loading session types for builder ${builderId}:`, error);
    return getDefaultSessionTypes(builderId);
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
  const sessionTypes = await getSessionTypes(builderId);
  return sessionTypes.find(session => session.id === sessionTypeId) || null;
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
  
  // For Liam Jons, the marketing IDs match the actual IDs
  if (builderId === 'liam-jons') {
    return marketingId;
  }
  
  // For other builders, implement mapping logic
  // This is a placeholder and should be replaced with actual logic
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
