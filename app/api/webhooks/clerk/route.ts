/**
 * Clerk Webhook Handler
 * 
 * This enhanced handler processes Clerk webhook events with:
 * - IP allowlisting for enhanced security
 * - Signature verification to validate authenticity
 * - Idempotency to prevent duplicate processing
 * - Structured logging for monitoring and debugging
 * 
 * Version: 1.1.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// Environment variables
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

// Allowed IPs for Svix webhook service
// Source: https://clerk.com/docs/webhooks/svix-ip-allowlist
const ALLOWED_IPS = [
  '3.128.159.22',
  '3.21.242.127',
  '52.14.114.70',
  '3.125.183.140',
  '3.65.193.143',
  '3.71.203.39',
  '18.192.147.95',
  '18.156.74.191',
  '3.10.8.30',
  '13.42.119.50',
  '18.168.67.42',
  '3.9.123.191',
];

/**
 * Handler for Clerk webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Start timing
    const startTime = performance.now();
    
    // Get the client IP address
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') ||
                     '0.0.0.0';
    
    // Check if the client IP is in the allowed list
    const ip = clientIP.split(',')[0].trim();
    if (!ALLOWED_IPS.includes(ip)) {
      logger.warn('Unauthorized webhook attempt', { ip });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized IP address' 
        }, 
        { status: 401 }
      );
    }
    
    // Get the webhook body
    const payload = await request.text();
    const headersList = request.headers;
    
    // Get the webhook signature
    const svixId = headersList.get('svix-id') || '';
    const svixTimestamp = headersList.get('svix-timestamp') || '';
    const svixSignature = headersList.get('svix-signature') || '';
    
    // Check if we've already processed this webhook
    const existingEvent = await db.webhookEvent.findUnique({
      where: { id: svixId }
    });
    
    if (existingEvent) {
      logger.info('Webhook already processed', { id: svixId });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook already processed' 
      });
    }
    
    // Verify the webhook signature
    if (!WEBHOOK_SECRET) {
      logger.error('Missing webhook secret');
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Server configuration error' 
        },
        { status: 500 }
      );
    }
    
    // Create a new svix instance with our secret
    const wh = new Webhook(WEBHOOK_SECRET);
    
    // Verify the payload with the headers
    let evt: WebhookEvent;
    
    try {
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (error) {
      logger.error('Webhook verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        svixId,
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid webhook signature' 
        },
        { status: 400 }
      );
    }
    
    // Successfully verified webhook
    logger.info('Webhook received', { 
      type: evt.type,
      id: svixId
    });
    
    // Handle the webhook based on the event type
    switch (evt.type) {
      case 'user.created': {
        await handleUserCreated(evt.data);
        break;
      }
      case 'user.updated': {
        await handleUserUpdated(evt.data);
        break;
      }
      case 'user.deleted': {
        await handleUserDeleted(evt.data);
        break;
      }
      case 'organization.created': {
        await handleOrganizationCreated(evt.data);
        break;
      }
      case 'organization.updated': {
        await handleOrganizationUpdated(evt.data);
        break;
      }
      case 'organization.deleted': {
        await handleOrganizationDeleted(evt.data);
        break;
      }
      default: {
        logger.info('Unhandled webhook event type', { type: evt.type });
      }
    }
    
    // Mark webhook as processed to prevent duplicate processing
    await db.webhookEvent.create({
      data: {
        id: svixId,
        type: evt.type,
        timestamp: new Date(svixTimestamp),
        processed: true,
        processingTime: performance.now() - startTime,
      }
    });
    
    // Record metric
    await recordWebhookMetric({
      type: evt.type,
      status: 'success',
      processingTime: performance.now() - startTime,
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    // Log the error with context
    logger.error('Webhook processing error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      headers: Object.fromEntries([...request.headers.entries()].filter(
        ([key]) => !key.includes('authorization') && !key.includes('cookie')
      )),
    });
    
    // Record error metric
    await recordWebhookMetric({
      type: 'unknown',
      status: 'failure',
      processingTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: 'Error processing webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Record webhook metric for monitoring
 */
async function recordWebhookMetric(metric: {
  type: string;
  status: 'success' | 'failure';
  processingTime: number;
  error?: string;
}) {
  try {
    // Store webhook metrics in database
    await db.webhookMetric.create({
      data: {
        type: metric.type,
        status: metric.status,
        processingTime: metric.processingTime,
        error: metric.error,
        timestamp: new Date(),
      }
    });
  } catch (error) {
    // Log but don't fail the webhook on metric recording errors
    logger.error('Failed to record webhook metric', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Handler for user.created events
 */
async function handleUserCreated(data: any) {
  try {
    const userId = data.id;
    const email = data.email_addresses?.[0]?.email_address;
    
    // Check if user already exists (idempotency check)
    const existingUser = await db.user.findUnique({
      where: { clerkId: userId }
    });
    
    if (existingUser) {
      logger.info('User already exists, skipping creation', { userId });
      return;
    }
    
    // Create the user in our database
    await db.user.create({
      data: {
        clerkId: userId,
        email: email,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        imageUrl: data.image_url,
        // Add default roles based on your application logic
        roles: ['CLIENT'], // Default role
      }
    });
    
    logger.info('User created successfully', { userId });
  } catch (error) {
    logger.error('Error handling user.created event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: data.id,
    });
    throw error; // Re-throw to trigger error handling in the main function
  }
}

/**
 * Handler for user.updated events
 */
async function handleUserUpdated(data: any) {
  try {
    const userId = data.id;
    const email = data.email_addresses?.[0]?.email_address;
    
    // Update the user in our database
    await db.user.update({
      where: { clerkId: userId },
      data: {
        email: email,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        imageUrl: data.image_url,
        // Only update roles if they're in the public metadata
        ...(data.public_metadata?.roles && { 
          roles: data.public_metadata.roles 
        }),
        // Track verification status
        ...(data.public_metadata?.verified !== undefined && {
          verified: data.public_metadata.verified
        }),
        // Update other fields as needed
      }
    });
    
    logger.info('User updated successfully', { userId });
  } catch (error) {
    logger.error('Error handling user.updated event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: data.id,
    });
    throw error;
  }
}

/**
 * Handler for user.deleted events
 */
async function handleUserDeleted(data: any) {
  try {
    const userId = data.id;
    
    // Soft delete the user in our database
    await db.user.update({
      where: { clerkId: userId },
      data: {
        active: false,
        deletedAt: new Date(),
      }
    });
    
    logger.info('User marked as deleted', { userId });
  } catch (error) {
    logger.error('Error handling user.deleted event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: data.id,
    });
    throw error;
  }
}

/**
 * Handler for organization.created events
 */
async function handleOrganizationCreated(data: any) {
  try {
    const orgId = data.id;
    
    // Check if organization already exists (idempotency check)
    const existingOrg = await db.organization.findUnique({
      where: { clerkId: orgId }
    });
    
    if (existingOrg) {
      logger.info('Organization already exists, skipping creation', { orgId });
      return;
    }
    
    // Create the organization in our database
    await db.organization.create({
      data: {
        clerkId: orgId,
        name: data.name,
        slug: data.slug,
        imageUrl: data.image_url,
      }
    });
    
    logger.info('Organization created successfully', { orgId });
  } catch (error) {
    logger.error('Error handling organization.created event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      orgId: data.id,
    });
    throw error;
  }
}

/**
 * Handler for organization.updated events
 */
async function handleOrganizationUpdated(data: any) {
  try {
    const orgId = data.id;
    
    // Update the organization in our database
    await db.organization.update({
      where: { clerkId: orgId },
      data: {
        name: data.name,
        slug: data.slug,
        imageUrl: data.image_url,
      }
    });
    
    logger.info('Organization updated successfully', { orgId });
  } catch (error) {
    logger.error('Error handling organization.updated event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      orgId: data.id,
    });
    throw error;
  }
}

/**
 * Handler for organization.deleted events
 */
async function handleOrganizationDeleted(data: any) {
  try {
    const orgId = data.id;
    
    // Soft delete the organization in our database
    await db.organization.update({
      where: { clerkId: orgId },
      data: {
        active: false,
        deletedAt: new Date(),
      }
    });
    
    logger.info('Organization marked as deleted', { orgId });
  } catch (error) {
    logger.error('Error handling organization.deleted event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      orgId: data.id,
    });
    throw error;
  }
}
