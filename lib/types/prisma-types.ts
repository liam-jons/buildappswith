/**
 * Prisma Types
 * Version: 1.0.0
 * 
 * Base types derived from Prisma models to ensure consistent
 * type mapping between database and TypeScript types
 */

import { Prisma } from '@prisma/client';

// Re-export Prisma's generated enums for consistency across the codebase
export { 
  UserRole,
  AppStatus,
  SkillStatus,
  ResourceType,
  ProjectStatus,
  BookingStatus,
  PaymentStatus,
  ProgressStatus,
  CompletionMethod
} from '@prisma/client';

/**
 * Base type for User from Prisma schema
 */
export type UserBase = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    emailVerified: true;
    imageUrl: true;
    roles: true;
    isFounder: true;
    stripeCustomerId: true;
    verified: true;
    clerkId: true;
    isDemo: true;
    createdAt: true;
    updatedAt: true;
  }
}>;

/**
 * Base type for BuilderProfile from Prisma schema
 */
export type BuilderProfileBase = Prisma.BuilderProfileGetPayload<{
  select: {
    id: true;
    userId: true;
    bio: true;
    headline: true;
    hourlyRate: true;
    featuredBuilder: true;
    domains: true;
    badges: true;
    rating: true;
    portfolioItems: true;
    validationTier: true;
    availableForHire: true;
    adhd_focus: true;
    createdAt: true;
    updatedAt: true;
    socialLinks: true;
    slug: true;
    tagline: true;
    displayName: true;
    completedProjects: true;
    responseRate: true;
    expertiseAreas: true;
    featured: true;
    clerkUserId: true;
    searchable: true;
    availability: true;
    topSkills: true;
    schedulingSettings: true;
  }
}>;

/**
 * Base type for ClientProfile from Prisma schema
 */
export type ClientProfileBase = Prisma.ClientProfileGetPayload<{
  select: {
    id: true;
    userId: true;
    companyName: true;
    industry: true;
    projectPreferences: true;
    pathways: true;
    createdAt: true;
    updatedAt: true;
  }
}>;

/**
 * Base type for SubscriberProfile from Prisma schema
 */
export type SubscriberProfileBase = Prisma.SubscriberProfileGetPayload<{
  select: {
    id: true;
    userId: true;
    interests: true;
    newsletterFrequency: true;
    subscriptionDate: true;
    lastEmailSent: true;
    createdAt: true;
    updatedAt: true;
  }
}>;

/**
 * Base type for App from Prisma schema
 */
export type AppBase = Prisma.AppGetPayload<{
  select: {
    id: true;
    title: true;
    description: true;
    imageUrl: true;
    technologies: true;
    status: true;
    appUrl: true;
    builderId: true;
    adhd_focused: true;
    createdAt: true;
    updatedAt: true;
  }
}>;

/**
 * Base type for Skill from Prisma schema
 */
export type SkillBase = Prisma.SkillGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    description: true;
    domain: true;
    level: true;
    prerequisites: true;
    status: true;
    isFundamental: true;
    pathways: true;
    createdAt: true;
    updatedAt: true;
  }
}>;

/**
 * Base type for BuilderSkill from Prisma schema
 */
export type BuilderSkillBase = Prisma.BuilderSkillGetPayload<{
  select: {
    id: true;
    skillId: true;
    builderId: true;
    proficiency: true;
    verified: true;
    verifiedBy: true;
    verifiedAt: true;
    createdAt: true;
    updatedAt: true;
  }
}>;

/**
 * Base type for Booking from Prisma schema
 */
export type BookingBase = Prisma.BookingGetPayload<{
  select: {
    id: true;
    builderId: true;
    clientId: true;
    sessionTypeId: true;
    title: true;
    description: true;
    startTime: true;
    endTime: true;
    status: true;
    paymentStatus: true;
    amount: true;
    stripeSessionId: true;
    clientTimezone: true;
    builderTimezone: true;
    pathway: true;
    customQuestionResponse: true;
    createdAt: true;
    updatedAt: true;
    calendlyEventId: true;
    calendlyEventUri: true;
    calendlyInviteeUri: true;
    currentState: true;
    stateData: true;
    lastTransition: true;
  }
}>;

/**
 * Base type for SessionType from Prisma schema
 */
export type SessionTypeBase = Prisma.SessionTypeGetPayload<{
  select: {
    id: true;
    builderId: true;
    title: true;
    description: true;
    durationMinutes: true;
    price: true;
    currency: true;
    isActive: true;
    color: true;
    maxParticipants: true;
    requiresAuth: true;
    displayOrder: true;
    eventTypeCategory: true;
    timeZone: true;
    isRecurring: true;
    createdAt: true;
    updatedAt: true;
    calendlyEventTypeId: true;
    calendlyEventTypeUri: true;
  }
}>;

/**
 * Base type for AvailabilityRule from Prisma schema
 */
export type AvailabilityRuleBase = Prisma.AvailabilityRuleGetPayload<{
  select: {
    id: true;
    builderId: true;
    dayOfWeek: true;
    startTime: true;
    endTime: true;
    isRecurring: true;
    effectiveDate: true;
    expirationDate: true;
    createdAt: true;
    updatedAt: true;
  }
}>;

/**
 * Base type for AvailabilityException from Prisma schema
 */
export type AvailabilityExceptionBase = Prisma.AvailabilityExceptionGetPayload<{
  select: {
    id: true;
    builderId: true;
    date: true;
    isAvailable: true;
    slots: true;
    reason: true;
    createdAt: true;
    updatedAt: true;
  }
}>;

/**
 * Base type for UserSkillProgress from Prisma schema
 */
export type UserSkillProgressBase = Prisma.UserSkillProgressGetPayload<{
  select: {
    id: true;
    userId: true;
    skillId: true;
    status: true;
    completedAt: true;
    completedVia: true;
    validatedBy: true;
    pathway: true;
    notes: true;
    attempts: true;
    lastAttemptAt: true;
    createdAt: true;
    updatedAt: true;
  }
}>;

/**
 * Type for JSON fields that represent portfolio items
 */
export interface PortfolioItemJson {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  technologies: string[];
  demoUrl?: string;
  repositoryUrl?: string;
  completionDate?: string;
  featured?: boolean;
}

/**
 * Type for JSON fields that represent social links
 */
export interface SocialLinksJson {
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  [key: string]: string | undefined;
}

/**
 * Type for JSON fields that represent expertise areas
 */
export interface ExpertiseAreasJson {
  areas: {
    name: string;
    level: number;
    description?: string;
  }[];
  specializations?: {
    id: string;
    name: string;
    description: string;
  }[];
  [key: string]: any;
}

/**
 * Type for JSON fields that represent scheduling settings
 */
export interface SchedulingSettingsJson {
  defaultAvailability?: {
    days: {
      dayOfWeek: number;
      available: boolean;
      startTime?: string;
      endTime?: string;
    }[];
  };
  bufferTimeBefore?: number;
  bufferTimeAfter?: number;
  timezone?: string;
  [key: string]: any;
}

/**
 * Type for JSON fields that represent custom question responses
 */
export interface CustomQuestionResponseJson {
  questions: {
    id: string;
    question: string;
    answer: string;
  }[];
  [key: string]: any;
}

/**
 * Type for JSON fields that represent booking state data
 */
export interface BookingStateDataJson {
  status: string;
  confirmationToken?: string;
  paymentIntentId?: string;
  cancelReason?: string;
  rescheduleToken?: string;
  remindersSent?: boolean;
  lastNotificationSent?: string;
  [key: string]: any;
}

/**
 * Type for JSON fields that represent availability slots
 */
export interface AvailabilitySlotsJson {
  slots: {
    startTime: string;
    endTime: string;
    isBooked: boolean;
  }[];
  [key: string]: any;
}