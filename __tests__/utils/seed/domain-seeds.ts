/**
 * Domain-specific seed functions for different test scenarios
 */
import { PrismaClient } from '@prisma/client';
import { createPersona, createRelatedEntities } from '../factory';
import { TestPersona } from '../models';
import { seedTestData } from './base-seed';

/**
 * Seed auth-specific test data
 */
export async function seedAuthTestData(): Promise<void> {
  await seedTestData({
    domains: ['users', 'profiles'],
    personas: [
      TestPersona.CLIENT_BASIC,
      TestPersona.CLIENT_PREMIUM,
      TestPersona.BUILDER_EXPERIENCED,
      TestPersona.ADMIN_SUPER
    ],
    count: {
      users: 3 // Minimal set of users
    }
  });
}

/**
 * Seed profile-specific test data
 */
export async function seedProfileTestData(): Promise<void> {
  await seedTestData({
    domains: ['users', 'profiles'],
    personas: [
      TestPersona.CLIENT_BASIC,
      TestPersona.BUILDER_NEW,
      TestPersona.BUILDER_EXPERIENCED
    ],
    count: {
      users: 5
    }
  });
}

/**
 * Seed marketplace-specific test data
 */
export async function seedMarketplaceTestData(): Promise<void> {
  await seedTestData({
    domains: ['users', 'profiles', 'scheduling'],
    personas: [
      TestPersona.CLIENT_BASIC,
      TestPersona.CLIENT_PREMIUM,
      TestPersona.BUILDER_NEW, 
      TestPersona.BUILDER_EXPERIENCED
    ],
    count: {
      users: 10,
      sessionTypes: 5
    }
  });
}

/**
 * Seed scheduling-specific test data
 */
export async function seedSchedulingTestData(): Promise<void> {
  await seedTestData({
    domains: ['users', 'profiles', 'scheduling', 'bookings'],
    personas: [
      TestPersona.CLIENT_BASIC,
      TestPersona.BUILDER_EXPERIENCED
    ],
    count: {
      sessionTypes: 5,
      bookings: 10
    }
  });
}

/**
 * Seed payment-specific test data
 */
export async function seedPaymentTestData(): Promise<void> {
  await seedTestData({
    domains: ['users', 'profiles', 'scheduling', 'bookings', 'payments'],
    personas: [
      TestPersona.CLIENT_PREMIUM,
      TestPersona.BUILDER_EXPERIENCED
    ],
    count: {
      bookings: 5
    }
  });
}

/**
 * Seed minimal test data for quick tests
 */
export async function seedMinimalTestData(): Promise<void> {
  await seedTestData({
    domains: ['users', 'profiles'],
    count: {
      users: 2
    }
  });
}

/**
 * Seed a complete booking scenario with all related entities
 */
export async function seedBookingScenario(prisma: PrismaClient): Promise<any> {
  // Create all related entities for a booking scenario
  const entities = createRelatedEntities();
  
  // Create the user entities
  await prisma.user.create({
    data: {
      id: entities.builder.id,
      name: entities.builder.name,
      email: entities.builder.email,
      clerkId: entities.builder.clerkId || `user_${Math.random().toString(36).substring(2, 15)}`,
      role: entities.builder.role,
      emailVerified: entities.builder.verified ? new Date() : null
    }
  });
  
  await prisma.user.create({
    data: {
      id: entities.client.id,
      name: entities.client.name,
      email: entities.client.email,
      clerkId: entities.client.clerkId || `user_${Math.random().toString(36).substring(2, 15)}`,
      role: entities.client.role,
      emailVerified: entities.client.verified ? new Date() : null
    }
  });
  
  // Create the profile entities
  await prisma.profile.create({
    data: {
      id: entities.builderProfile.id,
      userId: entities.builderProfile.userId,
      bio: entities.builderProfile.bio,
      title: entities.builderProfile.title,
      skills: entities.builderProfile.skills,
      availability: entities.builderProfile.availability,
      hourlyRate: entities.builderProfile.hourlyRate,
      socialLinks: entities.builderProfile.socialLinks as any
    }
  });
  
  await prisma.profile.create({
    data: {
      id: entities.clientProfile.id,
      userId: entities.clientProfile.userId,
      bio: entities.clientProfile.bio,
      title: entities.clientProfile.title,
      skills: entities.clientProfile.skills,
      availability: entities.clientProfile.availability,
      hourlyRate: entities.clientProfile.hourlyRate,
      socialLinks: entities.clientProfile.socialLinks as any
    }
  });
  
  // Create the session type
  await prisma.sessionType.create({
    data: {
      id: entities.sessionType.id,
      builderId: entities.sessionType.builderId,
      name: entities.sessionType.name,
      description: entities.sessionType.description,
      duration: entities.sessionType.duration,
      price: entities.sessionType.price,
      isActive: entities.sessionType.isActive
    }
  });
  
  // Create the booking
  await prisma.booking.create({
    data: {
      id: entities.booking.id,
      clientId: entities.booking.clientId,
      builderId: entities.booking.builderId,
      sessionTypeId: entities.booking.sessionTypeId,
      startTime: entities.booking.startTime,
      endTime: entities.booking.endTime,
      status: entities.booking.status,
      paymentStatus: entities.booking.paymentStatus
    }
  });
  
  // Create the payment
  await prisma.payment.create({
    data: {
      id: entities.payment.id,
      bookingId: entities.payment.bookingId,
      amount: entities.payment.amount,
      currency: entities.payment.currency,
      status: entities.payment.status,
      stripePaymentIntentId: entities.payment.stripePaymentIntentId,
      stripeCustomerId: entities.payment.stripeCustomerId,
      createdAt: entities.payment.createdAt
    }
  });
  
  return entities;
}