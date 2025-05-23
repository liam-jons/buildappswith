/**
 * Booking State Machine Storage Layer
 * 
 * This module provides functions for persisting and retrieving state machine data
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../logger';
import { db } from '../../db';
import {
  BookingContext,
  BookingStateData,
  BookingStateEnum,
  TransitionResult
} from './types';
import {
  encryptSensitiveData,
  decryptSensitiveData,
  sanitizeForLogging
} from './security';

/**
 * Initialize a new booking state
 */
export async function initializeBookingState(
  bookingId: string,
  initialState: BookingStateEnum,
  initialStateData: BookingStateData
): Promise<BookingContext> {
  try {
    // Log with sanitized data
    logger.info('Initializing booking state', {
      bookingId,
      initialState,
      stateData: sanitizeForLogging(initialStateData)
    });

    // Encrypt sensitive data
    const secureStateData = encryptSensitiveData(initialStateData);

    // Check if a booking already exists
    const existingBooking = await db.booking.findUnique({
      where: { id: bookingId }
    });

    if (existingBooking) {
      // Update the existing booking with state data
      await db.booking.update({
        where: { id: bookingId },
        data: {
          currentState: initialState,
          stateData: secureStateData as any,
          lastTransition: new Date()
        }
      });
    } else {
      // Create a new booking with state data
      await db.booking.create({
        data: {
          id: bookingId,
          builderId: secureStateData.builderId || '',
          clientId: secureStateData.clientId || undefined, // Support anonymous users
          sessionTypeId: secureStateData.sessionTypeId,
          title: `Booking ${bookingId.substring(0, 8)}`, // Temporary title
          startTime: secureStateData.startTime ? new Date(secureStateData.startTime) : new Date(), // Default to now
          endTime: secureStateData.endTime ? new Date(secureStateData.endTime) : new Date(Date.now() + 60 * 60 * 1000), // Default to 1 hour from now
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          currentState: initialState,
          stateData: secureStateData as any,
          lastTransition: new Date()
        }
      });
    }
    
    return {
      bookingId,
      state: initialState,
      stateData: initialStateData
    };
  } catch (error) {
    logger.error('Error initializing booking state', { 
      bookingId, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

/**
 * Get the current booking state
 */
export async function getBookingState(bookingId: string): Promise<BookingContext | null> {
  try {
    logger.debug('Getting booking state', { bookingId });

    const booking = await db.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking || !booking.currentState) {
      logger.warn('Booking state not found', { bookingId });
      return null;
    }

    // Get encrypted state data
    const encryptedStateData = booking.stateData as unknown as BookingStateData;

    // Decrypt sensitive data
    const decryptedStateData = decryptSensitiveData(encryptedStateData);

    logger.debug('Retrieved booking state', {
      bookingId,
      state: booking.currentState,
      stateData: sanitizeForLogging(decryptedStateData)
    });

    return {
      bookingId,
      state: booking.currentState as BookingStateEnum,
      stateData: decryptedStateData
    };
  } catch (error) {
    logger.error('Error getting booking state', {
      bookingId,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Update the booking state
 */
export async function updateBookingState(
  bookingId: string,
  transitionResult: TransitionResult
): Promise<BookingContext> {
  try {
    const { currentState, stateData } = transitionResult;

    logger.info('Updating booking state', {
      bookingId,
      previousState: transitionResult.previousState,
      currentState,
      success: transitionResult.success,
      stateData: sanitizeForLogging(stateData)
    });

    // Encrypt sensitive data
    const secureStateData = encryptSensitiveData(stateData);

    // Start a transaction to ensure consistency
    await db.$transaction(async (prisma) => {
      // Update the booking with the new state data
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          currentState,
          stateData: secureStateData as any,
          lastTransition: new Date(),
          // Update the booking and payment status
          status: stateData.bookingStatus,
          paymentStatus: stateData.paymentStatus as any,
          // Update additional fields if present in stateData
          // Use decrypted values for explicit fields
          stripeSessionId: stateData.stripeSessionId,
          stripePaymentIntentId: stateData.stripePaymentIntentId,
          calendlyEventId: stateData.calendlyEventId,
          calendlyEventUri: stateData.calendlyEventUri,
          calendlyInviteeUri: stateData.calendlyInviteeUri,
          // Handle cancellation fields
          cancelReason: stateData.cancelReason,
          cancelledAt: stateData.cancelledAt ? new Date(stateData.cancelledAt) : undefined,
          // Handle refund fields
          stripeRefundId: stateData.stripeRefundId,
          refundAmount: stateData.refundAmount
        }
      });

      // TODO: Add state transition logging when stateTransitionLog table is added to schema
      // For now, log transitions via logger
      logger.info('State transition completed', {
        bookingId,
        fromState: transitionResult.previousState,
        toState: currentState,
        eventType: transitionResult.event,
        success: transitionResult.success,
        timestamp: new Date(transitionResult.timestamp).toISOString()
      });
    });
    
    return {
      bookingId,
      state: currentState,
      stateData
    };
  } catch (error) {
    logger.error('Error updating booking state', { 
      bookingId, 
      error: error instanceof Error ? error.message : String(error),
      transitionResult
    });
    throw error;
  }
}

/**
 * Get the transition history for a booking
 */
export async function getTransitionHistory(bookingId: string): Promise<any[]> {
  try {
    logger.debug('Getting transition history', { bookingId });
    
    // TODO: Implement with proper stateTransitionLog table
    // For now, return empty array
    logger.info('Transition history requested for booking', { bookingId });
    const transitionLogs: any[] = [];
    
    return transitionLogs;
  } catch (error) {
    logger.error('Error getting transition history', { 
      bookingId, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

/**
 * Get bookings in a specific state
 */
export async function getBookingsInState(
  state: BookingStateEnum,
  limit: number = 10
): Promise<BookingContext[]> {
  try {
    logger.debug('Getting bookings in state', { state, limit });
    
    const bookings = await db.booking.findMany({
      where: { currentState: state },
      take: limit,
      orderBy: { lastTransition: 'desc' }
    });
    
    return bookings.map(booking => ({
      bookingId: booking.id,
      state: booking.currentState as BookingStateEnum,
      stateData: booking.stateData as unknown as BookingStateData
    }));
  } catch (error) {
    logger.error('Error getting bookings in state', { 
      state, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

/**
 * Delete a booking state (for testing and cleanup)
 */
export async function deleteBookingState(bookingId: string): Promise<void> {
  try {
    logger.info('Deleting booking state', { bookingId });
    
    // Start a transaction to ensure consistency
    await db.$transaction(async (prisma) => {
      // TODO: Delete state transition logs when table exists
      // await prisma.stateTransitionLog.deleteMany({ where: { bookingId } });
      
      // Delete the booking
      await prisma.booking.delete({
        where: { id: bookingId }
      });
    });
  } catch (error) {
    logger.error('Error deleting booking state', { 
      bookingId, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}