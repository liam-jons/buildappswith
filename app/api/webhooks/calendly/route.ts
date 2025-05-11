import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { 
  verifyWebhookSignature, 
  WebhookSignatureError 
} from '@/lib/scheduling/calendly/webhook-security';
import { handleCalendlyWebhook } from '@/lib/scheduling/state-machine';

// Calendly webhook event schema
const CalendlyEventSchema = z.object({
  event: z.string(),
  payload: z.object({
    event_type: z.object({
      name: z.string(),
      uuid: z.string()
    }).optional(),
    event: z.object({
      uuid: z.string(),
      uri: z.string(),
      start_time: z.string().optional(),
      end_time: z.string().optional()
    }).optional(),
    invitee: z.object({
      uuid: z.string(),
      uri: z.string(),
      name: z.string().optional(),
      email: z.string().optional(),
      timezone: z.string().optional()
    }).optional(),
    tracking: z.object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_content: z.string().optional(),
      utm_term: z.string().optional()
    }).optional(),
    cancellation: z.object({
      reason: z.string().optional(),
      canceled_by: z.string().optional(),
      canceled_at: z.string().optional()
    }).optional()
  })
});

/**
 * Handle Calendly webhook events
 * 
 * This endpoint receives webhook events from Calendly, verifies their
 * authenticity using signature verification, and processes them.
 */
export async function POST(req: NextRequest) {
  try {
    // Get the signature from headers
    const signature = req.headers.get('calendly-webhook-signature');
    if (!signature) {
      logger.warn('Missing Calendly webhook signature');
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }
    
    // Get the raw body as text
    const body = await req.text();
    
    try {
      // Verify the signature using security utility
      verifyWebhookSignature(signature, body, process.env.CALENDLY_WEBHOOK_SIGNING_KEY);
      
      // Parse the body as JSON
      const jsonData = JSON.parse(body);
      
      // Validate the event structure
      try {
        const validatedEvent = CalendlyEventSchema.parse(jsonData);
        
        // Log the received event
        logger.info('Received Calendly webhook event', {
          event: validatedEvent.event,
          eventTypeUuid: validatedEvent.payload.event_type?.uuid,
          eventUuid: validatedEvent.payload.event?.uuid,
          inviteeUuid: validatedEvent.payload.invitee?.uuid
        });
        
        // Extract booking ID from UTM content in tracking
        const bookingId = validatedEvent.payload.tracking?.utm_content;
        if (!bookingId) {
          logger.warn('No booking ID found in Calendly webhook', {
            event: validatedEvent.event
          });
          
          // We can still return 200 to prevent Calendly from retrying
          return NextResponse.json(
            { 
              success: false, 
              message: 'Missing booking ID in tracking parameters' 
            },
            { status: 200 }
          );
        }
        
        // Process the webhook with our state machine
        const result = await handleCalendlyWebhook(validatedEvent.event, validatedEvent.payload);
        
        if (!result) {
          logger.warn('No state transition performed for Calendly webhook', {
            event: validatedEvent.event,
            bookingId
          });
          
          return NextResponse.json(
            { 
              success: false,
              message: 'No state transition performed' 
            },
            { status: 200 }
          );
        }
        
        logger.info('Successfully processed Calendly webhook', {
          event: validatedEvent.event,
          bookingId,
          previousState: result.previousState,
          currentState: result.currentState
        });
        
        return NextResponse.json({ 
          success: true,
          previousState: result.previousState,
          currentState: result.currentState
        });
        
      } catch (validationError) {
        logger.error('Invalid Calendly webhook payload', {
          error: validationError,
          body: jsonData
        });
        
        return NextResponse.json(
          { error: 'Invalid webhook payload' },
          { status: 400 }
        );
      }
      
    } catch (signatureError) {
      if (signatureError instanceof WebhookSignatureError) {
        logger.warn('Invalid Calendly webhook signature', {
          error: signatureError.message
        });
        
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
      
      throw signatureError;
    }
    
  } catch (error) {
    logger.error('Error processing Calendly webhook', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, calendly-webhook-signature',
      'Access-Control-Max-Age': '86400'
    }
  });
}