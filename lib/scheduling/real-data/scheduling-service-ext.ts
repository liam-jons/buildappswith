/**
 * Additional Scheduling Service Functions for Session Types
 *
 * This module extends the main scheduling service with specific functions
 * for managing session types. These functions were previously missing and
 * are required by API routes.
 *
 * Version: 1.0.0
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
import type { SessionType } from '../types';
import { getCalendlyService } from '../calendly';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Get a session type by ID
 * 
 * @param id - The ID of the session type to retrieve
 * @returns The session type if found, null otherwise
 */
export async function getSessionTypeById(id: string): Promise<SessionType | null> {
  try {
    const sessionType = await prisma.sessionType.findUnique({
      where: { id }
    });

    if (!sessionType) {
      return null;
    }

    // Transform the database session type to our API type
    return {
      id: sessionType.id,
      builderId: sessionType.builderId,
      title: sessionType.title,
      description: sessionType.description,
      durationMinutes: sessionType.durationMinutes,
      price: sessionType.price.toNumber(),
      currency: sessionType.currency,
      isActive: sessionType.isActive,
      color: sessionType.color || undefined,
      maxParticipants: sessionType.maxParticipants || undefined,
      calendlyEventTypeId: sessionType.calendlyEventTypeId || undefined,
      calendlyEventTypeUri: sessionType.calendlyEventTypeUri || undefined,
      createdAt: sessionType.createdAt.toISOString(),
      updatedAt: sessionType.updatedAt.toISOString(),
    };
  } catch (error) {
    logger.error('Error retrieving session type', { error, id });
    throw new Error('Failed to retrieve session type');
  }
}

/**
 * Create a new session type
 * 
 * @param data - The session type data to create
 * @returns The created session type
 */
export async function createSessionType(data: {
  builderId: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive?: boolean;
  color?: string;
  maxParticipants?: number;
  calendlyEventTypeId?: string;
  calendlyEventTypeUri?: string;
}): Promise<SessionType> {
  try {
    // Validate builder exists
    const builder = await prisma.builderProfile.findUnique({
      where: { id: data.builderId },
      include: {
        schedulingSettings: true
      }
    });

    if (!builder) {
      throw new Error('Builder not found');
    }

    // Create the session type
    const sessionType = await prisma.sessionType.create({
      data: {
        builderId: data.builderId,
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        price: data.price,
        currency: data.currency || 'USD',
        isActive: data.isActive !== undefined ? data.isActive : true,
        color: data.color,
        maxParticipants: data.maxParticipants,
        calendlyEventTypeId: data.calendlyEventTypeId,
        calendlyEventTypeUri: data.calendlyEventTypeUri
      }
    });

    logger.info('Created session type', {
      sessionTypeId: sessionType.id,
      builderId: sessionType.builderId,
      title: sessionType.title
    });

    // Transform the database session type to our API type
    return {
      id: sessionType.id,
      builderId: sessionType.builderId,
      title: sessionType.title,
      description: sessionType.description,
      durationMinutes: sessionType.durationMinutes,
      price: sessionType.price.toNumber(),
      currency: sessionType.currency,
      isActive: sessionType.isActive,
      color: sessionType.color || undefined,
      maxParticipants: sessionType.maxParticipants || undefined,
      calendlyEventTypeId: sessionType.calendlyEventTypeId || undefined,
      calendlyEventTypeUri: sessionType.calendlyEventTypeUri || undefined,
      createdAt: sessionType.createdAt.toISOString(),
      updatedAt: sessionType.updatedAt.toISOString(),
    };
  } catch (error) {
    logger.error('Error creating session type', { error, data });
    throw new Error('Failed to create session type');
  }
}

/**
 * Update an existing session type
 * 
 * @param id - The ID of the session type to update
 * @param data - The partial session type data to update
 * @returns The updated session type
 */
export async function updateSessionType(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    durationMinutes: number;
    price: number;
    currency: string;
    isActive: boolean;
    color: string;
    maxParticipants: number;
  }>
): Promise<SessionType> {
  try {
    // Validate session type exists
    const existingSessionType = await prisma.sessionType.findUnique({
      where: { id }
    });

    if (!existingSessionType) {
      throw new Error('Session type not found');
    }

    // For Calendly event types, some fields cannot be updated
    // They should be updated in Calendly first
    if (existingSessionType.calendlyEventTypeId) {
      // Filter out fields that should be managed by Calendly
      const { durationMinutes, title, description, ...allowedUpdates } = data;
      
      // Log warning about Calendly integration
      logger.warn('Updating Calendly-linked session type', {
        sessionTypeId: id,
        calendlyEventTypeId: existingSessionType.calendlyEventTypeId,
        message: 'Some fields like title, description, and duration should be updated in Calendly first'
      });

      // Update only allowed fields
      const sessionType = await prisma.sessionType.update({
        where: { id },
        data: allowedUpdates
      });

      // Transform the database session type to our API type
      return {
        id: sessionType.id,
        builderId: sessionType.builderId,
        title: sessionType.title,
        description: sessionType.description,
        durationMinutes: sessionType.durationMinutes,
        price: sessionType.price.toNumber(),
        currency: sessionType.currency,
        isActive: sessionType.isActive,
        color: sessionType.color || undefined,
        maxParticipants: sessionType.maxParticipants || undefined,
        calendlyEventTypeId: sessionType.calendlyEventTypeId || undefined,
        calendlyEventTypeUri: sessionType.calendlyEventTypeUri || undefined,
        createdAt: sessionType.createdAt.toISOString(),
        updatedAt: sessionType.updatedAt.toISOString(),
      };
    }

    // For regular session types, update all fields
    const sessionType = await prisma.sessionType.update({
      where: { id },
      data
    });

    logger.info('Updated session type', {
      sessionTypeId: sessionType.id,
      builderId: sessionType.builderId,
      title: sessionType.title
    });

    // Transform the database session type to our API type
    return {
      id: sessionType.id,
      builderId: sessionType.builderId,
      title: sessionType.title,
      description: sessionType.description,
      durationMinutes: sessionType.durationMinutes,
      price: sessionType.price.toNumber(),
      currency: sessionType.currency,
      isActive: sessionType.isActive,
      color: sessionType.color || undefined,
      maxParticipants: sessionType.maxParticipants || undefined,
      calendlyEventTypeId: sessionType.calendlyEventTypeId || undefined,
      calendlyEventTypeUri: sessionType.calendlyEventTypeUri || undefined,
      createdAt: sessionType.createdAt.toISOString(),
      updatedAt: sessionType.updatedAt.toISOString(),
    };
  } catch (error) {
    logger.error('Error updating session type', { error, id, data });
    throw new Error('Failed to update session type');
  }
}

/**
 * Delete a session type
 * 
 * @param id - The ID of the session type to delete
 * @returns True if deletion was successful
 */
export async function deleteSessionType(id: string): Promise<boolean> {
  try {
    // Validate session type exists
    const sessionType = await prisma.sessionType.findUnique({
      where: { id }
    });

    if (!sessionType) {
      throw new Error('Session type not found');
    }

    // Check if the session type is linked to Calendly
    if (sessionType.calendlyEventTypeId) {
      // For Calendly-linked session types, we just set isActive to false
      // instead of actually deleting, to maintain the link
      await prisma.sessionType.update({
        where: { id },
        data: { isActive: false }
      });

      logger.info('Deactivated Calendly-linked session type', {
        sessionTypeId: id,
        calendlyEventTypeId: sessionType.calendlyEventTypeId
      });
    } else {
      // For regular session types, perform actual deletion
      // First check if there are any bookings using this session type
      const bookingsCount = await prisma.booking.count({
        where: { sessionTypeId: id }
      });

      if (bookingsCount > 0) {
        // If bookings exist, just mark as inactive instead of deleting
        await prisma.sessionType.update({
          where: { id },
          data: { isActive: false }
        });

        logger.info('Deactivated session type with existing bookings', {
          sessionTypeId: id,
          bookingsCount
        });
      } else {
        // If no bookings, safe to delete
        await prisma.sessionType.delete({
          where: { id }
        });

        logger.info('Deleted session type', { sessionTypeId: id });
      }
    }

    return true;
  } catch (error) {
    logger.error('Error deleting session type', { error, id });
    throw new Error('Failed to delete session type');
  }
}