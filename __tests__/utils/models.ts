/**
 * Test data models for testing infrastructure
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Base test user model
 */
export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'BUILDER' | 'ADMIN';
  clerkId?: string;
  verified: boolean;
}

/**
 * Test profile model
 */
export interface TestProfile {
  id: string;
  userId: string;
  bio?: string;
  title?: string;
  skills?: string[];
  availability?: string;
  hourlyRate?: number;
  socialLinks?: Record<string, string>;
}

/**
 * Test session type model
 */
export interface TestSessionType {
  id: string;
  builderId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive: boolean;
}

/**
 * Test booking model
 */
export interface TestBooking {
  id: string;
  clientId: string;
  builderId: string;
  sessionTypeId: string;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
}

/**
 * Test payment model
 */
export interface TestPayment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  createdAt: Date;
}

/**
 * Standard test personas
 */
export enum TestPersona {
  CLIENT_BASIC = 'CLIENT_BASIC',
  CLIENT_PREMIUM = 'CLIENT_PREMIUM',
  BUILDER_NEW = 'BUILDER_NEW',
  BUILDER_EXPERIENCED = 'BUILDER_EXPERIENCED',
  ADMIN_SUPER = 'ADMIN_SUPER',
}

/**
 * Clerk test user IDs
 */
export const testClerkIds = {
  clientOne: 'user_2wtz5pWuoIXbbkdndL6n5f0tMLT',
  premiumOne: 'user_2wtzoD4QCQCCYs4Z4MKUFAdMYQq',
  newBuilder: 'user_2wu00KHccnL1FoCIIzEQYlzVjpW',
  establishedBuilder: 'user_2wu07wHNdf7LolavvVZxbrmdEqg',
  adminOne: 'user_2wu0TwPYijtMmMrzvdiP7ys5Mmh',
  dualRole: 'user_2wu0bNqtVmt4E7WfGwrzlWSxd1k',
  tripleRole: 'user_2wu0EluO69r3MDAMSKy5ORgpz1Z',
};