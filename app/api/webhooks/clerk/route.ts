/**
 * Clerk Webhook Handler
 * 
 * This API route handles webhook events from Clerk. It synchronizes user data
 * between Clerk and our database, ensuring user profiles are created and updated
 * appropriately based on authentication events.
 * 
 * Supported events:
 * - user.created: Creates a new user record in our database
 * - user.updated: Updates user information in our database
 * 
 * @version 1.0.64
 */

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/auth/types';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  // Get the webhook signature from the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, return a 400 error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    logger.error('Missing svix headers', { svix_id, svix_timestamp });
    return new NextResponse('Missing Svix headers', { status: 400 });
  }

  // Get the webhook secret from the environment
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error('Missing CLERK_WEBHOOK_SECRET in environment');
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }

  // Get the request body and verify the webhook
  let payload: WebhookEvent;

  try {
    const body = await req.text();
    const wh = new Webhook(webhookSecret);
    payload = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    logger.error('Error verifying webhook', { error });
    return new NextResponse('Invalid webhook signature', { status: 400 });
  }

  const { type, data } = payload;
  logger.info(`Webhook received: ${type}`, { userId: data.id });

  // Handle user.created event
  if (type === 'user.created') {
    try {
      // Extract user data from the webhook payload
      const {
        id: clerkId,
        email_addresses,
        image_url,
        first_name,
        last_name,
        public_metadata,
      } = data;

      // Get primary email
      const primaryEmail = email_addresses.find(email => email.id === data.primary_email_address_id);
      if (!primaryEmail) {
        logger.error('No primary email found for user', { clerkId });
        return new NextResponse('No primary email found', { status: 400 });
      }

      // Get roles from metadata or default to CLIENT
      const roles = (public_metadata.roles as UserRole[]) || [UserRole.CLIENT];

      // Create the user in our database
      const user = await db.user.create({
        data: {
          clerkId,
          email: primaryEmail.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          image: image_url,
          roles,
          verified: primaryEmail.verification?.status === 'verified' || false,
          stripeCustomerId: (public_metadata.stripeCustomerId as string) || null,
        },
      });

      // Create a client profile for all users by default
      await db.clientProfile.create({
        data: {
          userId: user.id,
        },
      });

      logger.info('User created successfully', { userId: user.id, clerkId });
      return NextResponse.json({ success: true, userId: user.id });
    } catch (error) {
      logger.error('Error creating user', { error, userId: data.id });
      return new NextResponse('Error creating user', { status: 500 });
    }
  }

  // Handle user.updated event
  if (type === 'user.updated') {
    try {
      // Extract user data from the webhook payload
      const {
        id: clerkId,
        email_addresses,
        image_url,
        first_name,
        last_name,
        public_metadata,
      } = data;

      // Find existing user by Clerk ID
      const existingUser = await db.user.findUnique({
        where: { clerkId },
      });

      if (!existingUser) {
        logger.error('User not found for update', { clerkId });
        return new NextResponse('User not found', { status: 404 });
      }

      // Get primary email
      const primaryEmail = email_addresses.find(email => email.id === data.primary_email_address_id);
      if (!primaryEmail) {
        logger.error('No primary email found for user update', { clerkId });
        return new NextResponse('No primary email found', { status: 400 });
      }

      // Get roles from metadata or keep existing
      const roles = (public_metadata.roles as UserRole[]) || existingUser.roles;

      // Update the user in our database
      const updatedUser = await db.user.update({
        where: { clerkId },
        data: {
          email: primaryEmail.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim() || existingUser.name,
          image: image_url || existingUser.image,
          roles,
          verified: primaryEmail.verification?.status === 'verified' || existingUser.verified,
          stripeCustomerId: (public_metadata.stripeCustomerId as string) || existingUser.stripeCustomerId,
        },
      });

      logger.info('User updated successfully', { userId: updatedUser.id, clerkId });
      return NextResponse.json({ success: true, userId: updatedUser.id });
    } catch (error) {
      logger.error('Error updating user', { error, userId: data.id });
      return new NextResponse('Error updating user', { status: 500 });
    }
  }

  // Return success for other event types we don't handle
  return NextResponse.json({ success: true, message: `Webhook received: ${type}` });
}

// Only allow POST requests to this endpoint
export async function GET() {
  return new NextResponse('Method not allowed', { status: 405 });
}
