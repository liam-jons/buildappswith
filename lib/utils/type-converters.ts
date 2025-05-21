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