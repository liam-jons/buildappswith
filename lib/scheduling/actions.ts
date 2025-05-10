/**
 * Scheduling server actions
 * Version: 1.0.0
 *
 * Server-side actions for scheduling functionality
 */

'use server';

import { z } from 'zod';
import { logger } from '@/lib/logger';
import type { SessionType, AvailabilityRule, AvailabilityException, TimeSlot } from './types';

// Mock session types for development
const MOCK_SESSION_TYPES: SessionType[] = [
  {
    id: 'st_1',
    builderId: 'builder_1',
    title: 'Initial Consultation',
    description: 'A first meeting to discuss your project needs and goals.',
    durationMinutes: 30,
    price: 0,
    currency: 'USD',
    isActive: true,
    color: '#4CAF50',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'st_2',
    builderId: 'builder_1',
    title: 'Strategy Session',
    description: 'Deep dive into planning your project architecture and approach.',
    durationMinutes: 60,
    price: 99,
    currency: 'USD',
    isActive: true,
    color: '#2196F3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'st_3',
    builderId: 'builder_1',
    title: 'Implementation Support',
    description: 'Hands-on assistance with implementing specific features.',
    durationMinutes: 90,
    price: 149,
    currency: 'USD',
    isActive: true,
    color: '#9C27B0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Schema for session type creation
const sessionTypeSchema = z.object({
  builderId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  durationMinutes: z.number().min(15, "Duration must be at least 15 minutes"),
  price: z.number().min(0, "Price must be a positive number"),
  currency: z.string().default("USD"),
  isActive: z.boolean().default(true),
  color: z.string().optional(),
  maxParticipants: z.number().optional()
});

/**
 * Get session types for a builder
 * 
 * @param builderId - The ID of the builder
 * @returns List of session types and optional warning
 */
export async function getSessionTypes(builderId: string): Promise<{ 
  sessionTypes: SessionType[],
  warning?: string 
}> {
  try {
    // In a production environment, this would fetch from the database
    // For now, return mock data for development
    logger.info('Fetching session types', { builderId });
    
    // Filter mock types for the requested builder
    const filteredTypes = MOCK_SESSION_TYPES.filter(type => 
      type.builderId === builderId || builderId === 'builder_1'
    );
    
    return {
      sessionTypes: filteredTypes,
      warning: 'Using mock data for development'
    };
  } catch (error) {
    logger.error('Error fetching session types', { error, builderId });
    return {
      sessionTypes: [],
      warning: 'Error fetching session types, using fallback data'
    };
  }
}

/**
 * Create a new session type
 * 
 * @param data - The session type data
 * @returns The created session type and optional warning
 */
export async function createSessionType(data: Omit<SessionType, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
  sessionType: SessionType,
  warning?: string
}> {
  try {
    // Validate the input data
    const validatedData = sessionTypeSchema.parse(data);
    
    // In a real implementation, this would create the session type in the database
    // For now, create a mock session type
    const mockSessionType: SessionType = {
      id: `st_${Date.now()}`,
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    logger.info('Created session type', { sessionTypeId: mockSessionType.id });
    
    // Add to mock data
    MOCK_SESSION_TYPES.push(mockSessionType);
    
    return {
      sessionType: mockSessionType,
      warning: 'Using mock data for development'
    };
  } catch (error) {
    logger.error('Error creating session type', { error, data });
    throw new Error('Failed to create session type');
  }
}

/**
 * Delete a session type
 * 
 * @param sessionTypeId - The ID of the session type to delete
 * @returns Success message
 */
export async function deleteSessionType(sessionTypeId: string): Promise<{
  success: boolean,
  message: string
}> {
  try {
    // In a real implementation, this would delete from the database
    // For now, just remove from our mock data array
    const index = MOCK_SESSION_TYPES.findIndex(type => type.id === sessionTypeId);

    if (index !== -1) {
      MOCK_SESSION_TYPES.splice(index, 1);
      logger.info('Deleted session type', { sessionTypeId });
      return { success: true, message: 'Session type deleted successfully' };
    } else {
      return { success: false, message: 'Session type not found' };
    }
  } catch (error) {
    logger.error('Error deleting session type', { error, sessionTypeId });
    throw new Error('Failed to delete session type');
  }
}

// Mock availability rules for development
const MOCK_AVAILABILITY_RULES: AvailabilityRule[] = [
  {
    id: 'ar_1',
    builderId: 'builder_1',
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ar_2',
    builderId: 'builder_1',
    dayOfWeek: 2, // Tuesday
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ar_3',
    builderId: 'builder_1',
    dayOfWeek: 3, // Wednesday
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ar_4',
    builderId: 'builder_1',
    dayOfWeek: 4, // Thursday
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ar_5',
    builderId: 'builder_1',
    dayOfWeek: 5, // Friday
    startTime: '09:00',
    endTime: '15:00',
    isRecurring: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Schema for availability rule creation
const availabilityRuleSchema = z.object({
  builderId: z.string(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  isRecurring: z.boolean().default(true)
});

/**
 * Get availability rules for a builder
 *
 * @param builderId - The ID of the builder
 * @returns List of availability rules and optional warning
 */
export async function getAvailabilityRules(builderId: string): Promise<{
  rules: AvailabilityRule[],
  warning?: string
}> {
  try {
    // In a production environment, this would fetch from the database
    // For now, return mock data for development
    logger.info('Fetching availability rules', { builderId });

    // Filter mock rules for the requested builder
    const filteredRules = MOCK_AVAILABILITY_RULES.filter(rule =>
      rule.builderId === builderId || builderId === 'builder_1'
    );

    return {
      rules: filteredRules,
      warning: 'Using mock data for development'
    };
  } catch (error) {
    logger.error('Error fetching availability rules', { error, builderId });
    return {
      rules: [],
      warning: 'Error fetching availability rules, using fallback data'
    };
  }
}

/**
 * Create a new availability rule
 *
 * @param data - The availability rule data
 * @returns The created rule and optional warning
 */
export async function createAvailabilityRule(data: Omit<AvailabilityRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
  rule: AvailabilityRule,
  warning?: string
}> {
  try {
    // Validate the input data
    const validatedData = availabilityRuleSchema.parse(data);

    // In a real implementation, this would create the rule in the database
    // For now, create a mock rule
    const mockRule: AvailabilityRule = {
      id: `ar_${Date.now()}`,
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    logger.info('Created availability rule', { ruleId: mockRule.id });

    // Add to mock data
    MOCK_AVAILABILITY_RULES.push(mockRule);

    return {
      rule: mockRule,
      warning: 'Using mock data for development'
    };
  } catch (error) {
    logger.error('Error creating availability rule', { error, data });
    throw new Error('Failed to create availability rule');
  }
}

/**
 * Delete an availability rule
 *
 * @param ruleId - The ID of the rule to delete
 * @returns Success message
 */
export async function deleteAvailabilityRule(ruleId: string): Promise<{
  success: boolean,
  message: string
}> {
  try {
    // In a real implementation, this would delete from the database
    // For now, just remove from our mock data array
    const index = MOCK_AVAILABILITY_RULES.findIndex(rule => rule.id === ruleId);

    if (index !== -1) {
      MOCK_AVAILABILITY_RULES.splice(index, 1);
      logger.info('Deleted availability rule', { ruleId });
      return { success: true, message: 'Availability rule deleted successfully' };
    } else {
      return { success: false, message: 'Availability rule not found' };
    }
  } catch (error) {
    logger.error('Error deleting availability rule', { error, ruleId });
    throw new Error('Failed to delete availability rule');
  }
}