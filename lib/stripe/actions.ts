/**
 * Stripe payment server actions
 * Version: 1.1.0
 * 
 * Server-side actions for payment functionality with Calendly integration
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { z } from 'zod'; // Restore Zod import
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db';
import { getBuilderProfileById } from '@/lib/profile/api';
import { BuilderProfileResponseData as BuilderProfileDataType, BuilderProfileData } from '@/lib/profile/types'; // Renamed to avoid confusion
import { getSessionTypeById, getBookingById as getBookingByIdScheduling, updateBookingPayment, updateBookingStatus } from '@/lib/scheduling/real-data/scheduling-service';
import { authData } from '@/lib/auth/data-access';
import { stripe as stripeServer, getOrCreateCustomer, createBookingCheckoutSession as aliasedCreateStripeCheckoutSession, handleStripeError, StripeErrorType, getCheckoutSession as getStripeSession, BookingCheckoutParams } from './stripe-server'; // Added BookingCheckoutParams
import { AnalyticsEventType } from '@/lib/scheduling/calendly/analytics';
import {
  CheckoutSessionRequest,
  StripeWebhookRequest,
  StripeWebhookEventType,
  PaymentStatus as StripePaymentStatusEnum,
  WebhookEventResponse,
  CheckoutSessionStatus,
  StripeCheckoutMetadata, 
} from './types';
import { Booking, PaymentStatus as SchedulingPaymentStatus, BookingStatus as SchedulingBookingStatus } from '../scheduling/types';
import { PaymentStatus as PrismaPaymentStatus, BookingStatus as PrismaBookingStatus } from '@prisma/client';

// Define a generic ServerActionResponse type
type ServerActionResponse<TData = Record<string, any>, TError = any> = // Keep TError as any for broader compatibility
  | { success: true; data: TData; message?: string }
  | { success: false; message: string; error?: TError };

const checkoutSessionSchema = z.object({
  clientId: z.string(),
  builderId: z.string(),
  sessionTypeId: z.string(),
  bookingId: z.string().optional(),
  notes: z.string().optional(),
  clientTimezone: z.string().optional(),
  paymentOption: z.enum(['full', 'deposit', 'final']).optional(),
  reschedule: z.boolean().optional(),
});

export async function createCheckoutSession(
  bookingDetails: CheckoutSessionRequest
): Promise<ServerActionResponse<{ sessionId: string; url: string }>> { // Simplified TError to be covered by generic 'any'
  try {
    const validationResult = checkoutSessionSchema.safeParse(bookingDetails);
    if (!validationResult.success) {
      logger.error('Invalid booking details for Stripe checkout.', {
        error: validationResult.error.flatten(),
        bookingDetails,
      });
      return { success: false, message: 'Invalid booking details.', error: validationResult.error.flatten() };
    }

    const { builderId, clientId, sessionTypeId, bookingId: existingBookingId, notes, clientTimezone, paymentOption, reschedule } = validationResult.data;
    const clerkUser = auth().userId;
    if (!clerkUser) {
      return { success: false, message: 'Authentication required.' };
    }

    const user = await authData.findUserByClerkId(clerkUser);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const sessionType = await getSessionTypeById(sessionTypeId);
    if (!sessionType) {
      return { success: false, message: 'Session type not found.' };
    }

    // Correctly type the response from getBuilderProfileById
    // getBuilderProfileById returns BuilderProfileDataType directly, or null if not found/error.
    const builderData: BuilderProfileDataType | null = await getBuilderProfileById(builderId);

    if (!builderData) {
      logger.error('Builder profile not found or error fetching.', {
        builderId: builderId,
        bookingDetails: validationResult.data, // Ensure validationResult is in scope
      });
      return { success: false, message: 'Builder profile not found.' };
    }
    // At this point, builderData is of type BuilderProfileDataType and is not null.
    // The original 'builderProfileResponse.data' can be replaced by 'builderData'.

    let booking: Booking | null = null;
    let newBookingCreated = false;
    let finalBookingId = existingBookingId;

    if (!existingBookingId) {
      // Create preliminary booking record - this might need adjustment based on actual createBooking function
      // This is a placeholder - actual booking creation might be more complex
      const tempBooking = await prisma.booking.create({
        data: {
          builderId: builderData.userId, // Use ID from BuilderProfileDataType
          clientId: user.id,
          sessionTypeId: sessionTypeId,
          title: sessionType.title || `Session with ${builderData.displayName}`,
          startTime: new Date(), // Placeholder - should come from availability or client input
          endTime: new Date(Date.now() + (sessionType.durationMinutes || 60) * 60000), // Placeholder
          status: PrismaBookingStatus.PENDING,
          paymentStatus: PrismaPaymentStatus.UNPAID,
          clientTimezone: clientTimezone,
          // currentState, stateData, lastTransition will be set by state machine
        },
      });
      booking = tempBooking as unknown as Booking; // Cast with caution, ensure fields align
      finalBookingId = booking.id;
      newBookingCreated = true;
    } else {
      booking = await getBookingByIdScheduling(existingBookingId) as Booking | null;
      if (!booking) {
        return { success: false, message: `Booking with ID ${existingBookingId} not found.` };
      }
    }

    if (!finalBookingId) {
      return { success: false, message: 'Booking ID is missing.' };
    }

    const customerId = await getOrCreateCustomer({ email: user.email || '', name: user.name || undefined, userId: user.id }); // Corrected call

    const metadata: StripeCheckoutMetadata = {
      bookingId: finalBookingId,
      builderId: builderData.userId, // Use ID from BuilderProfileDataType
      clientId: user.id,
      sessionTypeId: sessionTypeId,
      userEmail: user.email || undefined,
      builderEmail: builderData.email, // Use email from BuilderProfileDataType
    };

    // Construct BookingCheckoutParams instead of Stripe.Checkout.SessionCreateParams directly
    const bookingCheckoutParams: BookingCheckoutParams = {
      builderId: builderData.userId,
      builderName: builderData.displayName || builderData.name || 'Builder',
      sessionType: sessionType.title,
      sessionPrice: sessionType.price,
      userEmail: user.email || '', // Corrected from customerEmail
      bookingId: finalBookingId,
      metadata: metadata, // StripeCheckoutMetadata is compatible here
      userId: user.id,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${finalBookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/book/${builderData.slug || builderData.userId}?session_id={CHECKOUT_SESSION_ID}`,
      paymentOption: paymentOption,
      clientName: user.name || 'Client',
      startTime: new Date(), // TODO: Get from actual booking data
      endTime: new Date(Date.now() + (sessionType.durationMinutes || 60) * 60000), // TODO: Get from actual booking data  
      timeZone: clientTimezone || 'UTC', // TODO: Get from client preferences
    };

    const stripeSessionResult = await aliasedCreateStripeCheckoutSession(bookingCheckoutParams); // Pass BookingCheckoutParams

    if (!stripeSessionResult.success || !stripeSessionResult.data) {
      logger.error('Failed to create Stripe checkout session.', {
        error: stripeSessionResult.message,
        bookingId: finalBookingId,
      });
      if (newBookingCreated && booking) {
        await updateBookingStatus(booking.id, PrismaBookingStatus.CANCELLED);
        await updateBookingPayment(booking.id, PrismaPaymentStatus.CANCELLED); 
      }
      return { success: false, message: stripeSessionResult.message || 'Failed to create Stripe checkout session.', error: stripeSessionResult.message }; // Pass message as error
    }

    // Update booking with Stripe session ID if newly created or not set
    if (booking && (!booking.stripeSessionId || newBookingCreated)) {
      await prisma.booking.update({
        where: { id: finalBookingId },
        data: { stripeSessionId: stripeSessionResult.data.id },
      });
    }

    return { success: true, data: { sessionId: stripeSessionResult.data.id, url: stripeSessionResult.data.url ?? '' } }; // Handle potentially null URL
  } catch (error: any) {
    const genericError = handleStripeError(error, { function: 'createCheckoutSession' });
    logger.error('Error creating Stripe checkout session', { error: genericError });
    return { success: false, message: genericError.detail || 'Failed to create checkout session.', error: genericError };
  }
}

export async function handleWebhookEvent(request: StripeWebhookRequest): Promise<ServerActionResponse<WebhookEventResponse>> {
  try {
    const eventObject = stripeServer.webhooks.constructEvent(
      request.rawBody,
      request.signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    switch (eventObject.type) {
      case StripeWebhookEventType.CHECKOUT_SESSION_COMPLETED:
        const session = eventObject.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;

        if (!bookingId) {
          console.error('Booking ID missing in Stripe session metadata for successful payment', { stripeSessionId: session.id });
          return { success: false, message: 'Booking ID missing in metadata' };
        }

        const booking = await getBookingByIdScheduling(bookingId);
        if (!booking) {
          console.error('Booking not found for webhook', { bookingId, stripeSessionId: session.id });
          return { success: false, message: 'Booking not found for webhook' };
        }

        if (session.payment_status === 'paid') {
          await updateBookingStatus(bookingId, PrismaBookingStatus.CONFIRMED);
          await updateBookingPayment(bookingId, PrismaPaymentStatus.PAID, session.id);
          console.info('Payment successful, booking updated', { bookingId, stripeSessionId: session.id });
        } else {
          await updateBookingPayment(bookingId, PrismaPaymentStatus.CANCELLED, session.id); 
          console.warn('Payment not paid in checkout.session.completed, booking payment status updated to CANCELLED', { bookingId, stripeSessionId: session.id, paymentStatus: session.payment_status });
        }
        break;
      default:
        console.warn(`Unhandled Stripe webhook event type: ${eventObject.type}`);
    }

    return { success: true, data: { received: true, handled: true, type: eventObject.type } };
  } catch (err: any) {
    console.error('Error processing Stripe webhook:', { error: err.message, signature: request.signature });
    const stripeError = handleStripeError(err, { function: 'handleWebhookEvent', eventType: request.event?.type });
    return { success: false, message: stripeError.detail || `Webhook Error: ${err.message}`, error: stripeError };
  }
}

export async function getPaymentStatus(bookingId: string): Promise<ServerActionResponse<{ status: CheckoutSessionStatus; paymentStatus: SchedulingPaymentStatus; bookingId: string; metadata?: Record<string, string> }>> {
  const userId = auth().userId;
  if (!userId) {
    return { success: false, message: 'Authentication required' };
  }

  try {
    const bookingData = await getBookingByIdScheduling(bookingId);
    if (!bookingData || (bookingData.clientId !== userId && bookingData.builderId !== userId)) {
      logger.warn('Unauthorized or booking not found for payment status check', { bookingId, userId });
      return { success: false, message: 'Unauthorized or booking not found' };
    }

    if (bookingData.paymentStatus === SchedulingPaymentStatus.PAID || bookingData.paymentStatus === SchedulingPaymentStatus.REFUNDED) {
      return { success: true, data: { status: CheckoutSessionStatus.COMPLETE, paymentStatus: bookingData.paymentStatus, bookingId } };
    }

    if (bookingData.stripeSessionId) {
      const sessionResult = await getStripeSession(bookingData.stripeSessionId);
      if (sessionResult.success && sessionResult.data) {
        const stripeSession = sessionResult.data;
        let currentPaymentStatus: SchedulingPaymentStatus = bookingData.paymentStatus; 

        if (stripeSession.payment_status === 'paid') {
          await updateBookingPayment(bookingData.id, PrismaPaymentStatus.PAID, bookingData.stripeSessionId);
          await updateBookingStatus(bookingData.id, PrismaBookingStatus.CONFIRMED);
          currentPaymentStatus = SchedulingPaymentStatus.PAID;
        } else if (stripeSession.status === CheckoutSessionStatus.EXPIRED) {
          // Check against FAILED from scheduling/types. CANCELLED is not in SchedulingPaymentStatus.
          if (bookingData.paymentStatus !== SchedulingPaymentStatus.FAILED) { 
            await updateBookingStatus(bookingData.id, PrismaBookingStatus.CANCELLED);
            await updateBookingPayment(bookingData.id, PrismaPaymentStatus.CANCELLED, bookingData.stripeSessionId);
            currentPaymentStatus = SchedulingPaymentStatus.FAILED; 
          }
        }
        return { success: true, data: { status: stripeSession.status as CheckoutSessionStatus, paymentStatus: currentPaymentStatus, bookingId, metadata: (stripeSession.metadata as Record<string,string>) ?? {} } }; 
      } else {
        logger.error('Failed to fetch Stripe session for payment status', {
          bookingId,
          stripeSessionId: bookingData.stripeSessionId,
          error: sessionResult.message,
        });
      }
    } else if (bookingData.paymentStatus === SchedulingPaymentStatus.UNPAID && !bookingData.stripeSessionId) {
      logger.warn('Missing Stripe session ID for UNPAID booking, cannot verify with Stripe.', { bookingId });
    }

    return { success: true, data: { status: CheckoutSessionStatus.OPEN, paymentStatus: bookingData.paymentStatus, bookingId } };
  } catch (error: any) {
    const genericError = handleStripeError(error, { function: 'getPaymentStatus', bookingId });
    console.error('Error fetching payment status', { error: genericError.detail || 'Error fetching payment status', bookingId });
    return { success: false, message: genericError.detail || 'Error fetching payment status.', error: genericError };
  }
}