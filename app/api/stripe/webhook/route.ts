/**
 * Stripe webhook API route
 * @version 1.0.110
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, handleWebhookEvent } from '@/lib/stripe/stripe-server';
import { logger } from '@/lib/logger';

// Get the webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Define response type for consistent error handling
type ApiResponse = {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
};

/**
 * Handle POST requests for Stripe webhooks
 * This endpoint receives webhook events from Stripe
 */
export async function POST(request: NextRequest) {
  // Skip CSRF token validation for Stripe webhooks
  // Stripe provides its own security through signatures
  
  try {
    // Get the raw body and signature from the request
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;

    // Validate webhook signature and secret
    if (!signature) {
      logger.warn('Missing Stripe signature in webhook request');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing signature', 
          error: 'MISSING_SIGNATURE' 
        } as ApiResponse,
        { status: 400 }
      );
    }
    
    if (!webhookSecret) {
      logger.error('Stripe webhook secret not configured');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Webhook secret not configured', 
          error: 'CONFIGURATION_ERROR' 
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logger.info(`Webhook event received: ${event.type}`, { eventId: event.id });
    } catch (err: any) {
      logger.error('Webhook signature verification failed', { 
        error: err.message, 
        signatureHeader: signature.substring(0, 20) + '...' // Log partial signature for debugging
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Webhook signature verification failed', 
          error: err.message 
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Process the webhook event
    const result = await handleWebhookEvent(event);
    
    // Return appropriate response based on the result
    if (!result.success) {
      logger.warn('Webhook event handling failed', { 
        eventId: event.id, 
        eventType: event.type, 
        error: result.message 
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: result.message, 
          error: 'EVENT_HANDLING_FAILED' 
        } as ApiResponse,
        { status: 422 } // Unprocessable Entity
      );
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received and processed',
      data: { event: event.type }
    } as ApiResponse);
    
  } catch (error) {
    // Log detailed error information
    logger.error('Stripe webhook error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return a structured error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Webhook handler failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      } as ApiResponse,
      { status: 500 }
    );
  }
}
