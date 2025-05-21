/**
 * Type Converters
 * Version: 1.0.0
 * 
 * Utilities for converting between Prisma types and API/UI friendly types
 * Handles Decimal to number conversions and field name transformations
 */

import { Decimal } from '@prisma/client/runtime/library';
import { 
  BuilderProfileBase, 
  BookingBase,
  SessionTypeBase,
  SocialLinksJson,
  PortfolioItemJson,
  ExpertiseAreasJson
} from '../types/prisma-types';
import { BuilderProfileData } from '../profile/types';
import { ValidationTier } from '../marketplace/types';

/**
 * Convert Prisma Decimal to number or undefined
 */
export function decimalToNumber(value: Decimal | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  return parseFloat(value.toString());
}

/**
 * Convert string date to Date object or undefined
 */
export function stringToDate(value: string | null | undefined): Date | undefined {
  if (value === null || value === undefined) return undefined;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * Convert mixed format dates to ISO strings
 */
export function toISOString(value: Date | string | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  return value.toISOString();
}

/**
 * SafeJSON parsing that returns undefined on error
 */
export function safeJsonParse<T>(json: string | null | undefined): T | undefined {
  if (!json) return undefined;
  try {
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

/**
 * Format BuilderProfile from Prisma type to API response type
 */
export function formatBuilderProfile(profile: BuilderProfileBase): BuilderProfileData {
  return {
    id: profile.id,
    bio: profile.bio || undefined,
    headline: profile.headline || undefined,
    slug: profile.slug || undefined,
    tagline: profile.tagline || undefined,
    displayName: profile.displayName || undefined,
    validationTier: profile.validationTier,
    domains: profile.domains,
    badges: profile.badges,
    completedProjects: profile.completedProjects,
    responseRate: profile.responseRate || undefined,
    hourlyRate: profile.hourlyRate ? decimalToNumber(profile.hourlyRate) : undefined,
    availableForHire: profile.availableForHire,
    adhd_focus: profile.adhd_focus,
    expertiseAreas: profile.expertiseAreas as Record<string, any> || {},
    socialLinks: profile.socialLinks as Record<string, string> || {},
    portfolioItems: profile.portfolioItems as any[] || [],
    featured: profile.featured,
    searchable: profile.searchable,
    availability: profile.availability,
    topSkills: profile.topSkills,
  };
}

/**
 * Format SessionType from Prisma type to API response type
 */
export function formatSessionType(sessionType: SessionTypeBase): any {
  return {
    id: sessionType.id,
    builderId: sessionType.builderId,
    title: sessionType.title,
    description: sessionType.description,
    durationMinutes: sessionType.durationMinutes,
    price: decimalToNumber(sessionType.price),
    currency: sessionType.currency,
    isActive: sessionType.isActive,
    color: sessionType.color || undefined,
    maxParticipants: sessionType.maxParticipants || undefined,
    requiresAuth: sessionType.requiresAuth,
    displayOrder: sessionType.displayOrder,
    eventTypeCategory: sessionType.eventTypeCategory || undefined,
    timeZone: sessionType.timeZone || undefined,
    isRecurring: sessionType.isRecurring || false,
    calendlyEventTypeId: sessionType.calendlyEventTypeId || undefined,
    calendlyEventTypeUri: sessionType.calendlyEventTypeUri || undefined,
  };
}

/**
 * Format Booking from Prisma type to API response type
 */
export function formatBooking(booking: BookingBase): any {
  return {
    id: booking.id,
    builderId: booking.builderId,
    clientId: booking.clientId || undefined,
    sessionTypeId: booking.sessionTypeId || undefined,
    title: booking.title,
    description: booking.description || undefined,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    amount: decimalToNumber(booking.amount),
    stripeSessionId: booking.stripeSessionId || undefined,
    clientTimezone: booking.clientTimezone || undefined,
    builderTimezone: booking.builderTimezone || undefined,
    pathway: booking.pathway || undefined,
    customQuestionResponse: booking.customQuestionResponse || undefined,
    calendlyEventId: booking.calendlyEventId || undefined,
    calendlyEventUri: booking.calendlyEventUri || undefined,
    calendlyInviteeUri: booking.calendlyInviteeUri || undefined,
    currentState: booking.currentState || undefined,
    stateData: booking.stateData || undefined,
    lastTransition: booking.lastTransition || undefined,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

/**
 * Extract specific fields from an object when needed
 * Useful for selecting only required fields for a response
 */
export function extractFields<T extends object, K extends keyof T>(
  obj: T, 
  fields: K[]
): Pick<T, K> {
  return fields.reduce((acc, field) => {
    if (field in obj) {
      acc[field] = obj[field];
    }
    return acc;
  }, {} as Pick<T, K>);
}

/**
 * Convert snake_case object keys to camelCase
 */
export function snakeToCamel<T extends object>(obj: T): Record<string, any> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = value;
    return acc;
  }, {} as Record<string, any>);
}

/**
 * ValidationTier Conversion Utilities
 * Following architectural decision to use marketplace enum as source of truth
 */

export type TrustValidationTier = "basic" | "verified" | "expert";

/**
 * Convert marketplace ValidationTier enum to trust domain string
 */
export function validationTierToString(tier: ValidationTier): TrustValidationTier {
  switch (tier) {
    case ValidationTier.ENTRY:
      return 'basic';
    case ValidationTier.ESTABLISHED:
      return 'verified';
    case ValidationTier.EXPERT:
      return 'expert';
    default:
      return 'basic';
  }
}

/**
 * Convert trust domain string to marketplace ValidationTier enum
 */
export function stringToValidationTier(tier: TrustValidationTier): ValidationTier {
  switch (tier) {
    case 'basic':
      return ValidationTier.ENTRY;
    case 'verified':
      return ValidationTier.ESTABLISHED;
    case 'expert':
      return ValidationTier.EXPERT;
    default:
      return ValidationTier.ENTRY;
  }
}

/**
 * Convert ValidationTier to CSS style mapping (for legacy components)
 */
export function getValidationTierStyle(tier: ValidationTier): {
  colorClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
} {
  const tierString = validationTierToString(tier);
  
  switch (tierString) {
    case 'basic':
      return {
        colorClass: 'border-blue-400 dark:border-blue-400 from-blue-400/80 to-blue-400/0',
        borderClass: 'border-blue-200 dark:border-blue-800',
        bgClass: 'bg-blue-50 dark:bg-blue-950/30',
        textClass: 'text-blue-600 dark:text-blue-400'
      };
    case 'verified':
      return {
        colorClass: 'border-purple-500 dark:border-purple-400 from-purple-500/80 to-purple-400/0',
        borderClass: 'border-purple-200 dark:border-purple-800',
        bgClass: 'bg-purple-50 dark:bg-purple-950/30',
        textClass: 'text-purple-600 dark:text-purple-400'
      };
    case 'expert':
      return {
        colorClass: 'border-amber-500 dark:border-amber-400 from-amber-500/80 to-amber-400/0',
        borderClass: 'border-amber-200 dark:border-amber-800',
        bgClass: 'bg-amber-50 dark:bg-amber-950/30',
        textClass: 'text-amber-600 dark:text-amber-400'
      };
    default:
      return {
        colorClass: 'border-gray-400 dark:border-gray-400 from-gray-400/80 to-gray-400/0',
        borderClass: 'border-gray-200 dark:border-gray-800',
        bgClass: 'bg-gray-50 dark:bg-gray-950/30',
        textClass: 'text-gray-600 dark:text-gray-400'
      };
  }
}