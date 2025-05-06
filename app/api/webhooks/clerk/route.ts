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
import { logWebhookEvent } from '@/lib/auth/security-logging';

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
      
      // Log the rejected webhook event
      await logWebhookEvent({
        webhookId: request.headers.get('svix-id') || 'unknown',
        eventType: 'unknown',
        status: 'rejected',
        details: {
          reason: 'Unauthorized IP address',
          ip,
          allowedIps: ALLOWED_IPS
        }
      });
      
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
      where: { svixId }
    });
    
    if (existingEvent) {
      logger.info('Webhook already processed', { id: svixId });
      
      // Log the duplicate webhook event
      await logWebhookEvent({
        webhookId: svixId,
        eventType: existingEvent.type,
        status: 'success',
        details: {
          reason: 'Duplicate webhook',
          previouslyProcessed: existingEvent.lastProcessed,
          processingTime: 0
        }
      });
      
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
      
      // Log the verification failure with security logging
      await logWebhookEvent({
        webhookId: svixId,
        eventType: 'verification_failed',
        status: 'rejected',
        error: error instanceof Error ? error : String(error),
        details: {
          reason: 'Invalid webhook signature',
          processingTime: performance.now() - startTime
        }
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid webhook signature' 
        },
        { status: 400 }
      );
    }
    
    // Log the verified webhook event
    await logWebhookEvent({
      webhookId: svixId,
      eventType: evt.type,
      status: 'success',
      details: {
        processingTime: performance.now() - startTime
      }
    });
    
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
    
    // Use our enhanced security logging for the error
    const svixId = request.headers.get('svix-id') || 'unknown';
    const eventType = request.headers.get('svix-event-type') || 'unknown';
    
    await logWebhookEvent({
      webhookId: svixId,
      eventType: eventType,
      status: 'failure',
      error: error instanceof Error ? error : String(error),
      details: {
        headers: Object.fromEntries([...request.headers.entries()].filter(
          ([key]) => !key.includes('authorization') && !key.includes('cookie')
        )),
        errorStack: error instanceof Error ? error.stack : undefined
      }
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
    
    if (!email) {
      logger.error('No email found for user', { userId });
      return;
    }
    
    // Check if user already exists by Clerk ID (idempotency check)
    const existingUserByClerkId = await db.user.findUnique({
      where: { clerkId: userId }
    });
    
    if (existingUserByClerkId) {
      logger.info('User already exists with this Clerk ID, skipping creation', { userId });
      return;
    }
    
    // Check if user exists by email (email reconciliation)
    const existingUserByEmail = await db.user.findUnique({
      where: { email }
    });
    
    if (existingUserByEmail) {
      // Special case: user exists with the email but doesn't have clerkId yet
      if (!existingUserByEmail.clerkId) {
        // Update the existing user with the Clerk ID
        await db.user.update({
          where: { id: existingUserByEmail.id },
          data: { 
            clerkId: userId,
            imageUrl: data.image_url,
            image: data.image_url,
            // Only update name if the existing one is empty
            name: existingUserByEmail.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
            // Update verification status if needed
            ...(data.email_addresses?.[0]?.verification?.status === 'verified' && {
              emailVerified: new Date()
            })
          }
        });
        
        logger.info('Linked existing user with Clerk ID', { 
          userId: existingUserByEmail.id, 
          email, 
          clerkId: userId 
        });
        
        // Log this for special handling of Liam's case
        if (email.includes('buildappswith')) {
          logger.info('Linked buildappswith user email with Clerk ID', { 
            email, 
            userId: existingUserByEmail.id,
            clerkId: userId
          });
        }
        
        return;
      }
      
      // If user exists with email but has a different clerkId, log this anomaly
      logger.warn('Email conflict: user exists with different Clerk ID', {
        email,
        existingClerkId: existingUserByEmail.clerkId,
        newClerkId: userId
      });
      
      return;
    }
    
    // Create the user in our database
    const user = await db.user.create({
      data: {
        clerkId: userId,
        email: email,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        imageUrl: data.image_url,
        image: data.image_url, // Also update the legacy field
        // Add default roles based on your application logic
        roles: data.public_metadata?.roles || ['CLIENT'], // Default role
      }
    });
    
    // Create profiles based on roles
    const roles = data.public_metadata?.roles || ['CLIENT'];
    
    // Create builder profile if needed
    if (roles.includes('BUILDER')) {
      await db.builderProfile.create({
        data: {
          userId: user.id,
          domains: [],
          badges: [],
          availableForHire: true,
          validationTier: 1,
        }
      });
      
      logger.info('Created builder profile for new user', { userId: user.id });
    }
    
    // Create client profile if needed
    if (roles.includes('CLIENT')) {
      await db.clientProfile.create({
        data: {
          userId: user.id,
        }
      });
      
      logger.info('Created client profile for new user', { userId: user.id });
    }
    
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
    
    if (!email) {
      logger.error('No email found for user update', { userId });
      return;
    }
    
    // Find the user in our database
    const existingUser = await db.user.findUnique({
      where: { clerkId: userId }
    });
    
    if (!existingUser) {
      logger.warn('User not found for update, trying to create instead', { clerkId: userId });
      return await handleUserCreated(data);
    }
    
    // Check if the email is changing
    const isEmailChanging = existingUser.email !== email;
    
    if (isEmailChanging) {
      // Check if the new email is already used by another user
      const conflictingUser = await db.user.findUnique({
        where: { email }
      });
      
      if (conflictingUser && conflictingUser.id !== existingUser.id) {
        logger.warn('Email conflict during update: email already in use by different user', {
          email,
          currentUserId: existingUser.id,
          conflictingUserId: conflictingUser.id
        });
        
        // Special case for buildappswith emails
        if (email.includes('buildappswith') || existingUser.email.includes('buildappswith')) {
          logger.info('Special buildappswith email reconciliation needed', {
            oldEmail: existingUser.email,
            newEmail: email,
            userId: existingUser.id
          });
          
          // Log this as an audit event
          await db.auditLog.create({
            data: {
              userId: existingUser.id,
              action: 'EMAIL_RECONCILIATION_NEEDED',
              targetId: existingUser.id,
              targetType: 'User',
              details: {
                oldEmail: existingUser.email,
                newEmail: email,
                reason: 'buildappswith email domain change'
              }
            }
          });
        }
      }
    }
    
    // Update the user in our database
    await db.user.update({
      where: { clerkId: userId },
      data: {
        email: email,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        imageUrl: data.image_url,
        image: data.image_url, // Also update the legacy field
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
    
    // Check if we need to create profiles
    if (data.public_metadata?.roles) {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: {
          builderProfile: true,
          clientProfile: true
        }
      });
      
      if (user) {
        // Create builder profile if needed
        if (
          data.public_metadata.roles.includes('BUILDER') && 
          !user.builderProfile
        ) {
          await db.builderProfile.create({
            data: {
              userId: user.id,
              domains: [],
              badges: [],
              availableForHire: true,
              validationTier: 1,
            }
          });
          
          logger.info('Created builder profile for existing user', { userId: user.id });
        }
        
        // Create client profile if needed
        if (
          data.public_metadata.roles.includes('CLIENT') && 
          !user.clientProfile
        ) {
          await db.clientProfile.create({
            data: {
              userId: user.id,
            }
          });
          
          logger.info('Created client profile for existing user', { userId: user.id });
        }
      }
    }
    
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
