/**
 * Centralized JSON utilities for Prisma
 * Version: 0.1.1
 *
 * This file provides utilities for working with Prisma JSON fields.
 * It imports types from prisma-types.ts which is the source of truth
 * for all database-related type definitions.
 */

import { Prisma } from "@prisma/client";
import { SocialLinks, PortfolioItem, PortfolioItemOutcome } from './prisma-types';

// Type definitions are imported from prisma-types.ts to avoid duplication

// Global namespace types are declared in prisma-types.ts to avoid duplication

/**
 * Convert SocialLinks to a Prisma-compatible JSON value
 */
export function socialLinksToJson(links?: SocialLinks): Prisma.InputJsonValue | undefined {
  if (!links) return undefined;
  return links as unknown as Prisma.InputJsonValue;
}

/**
 * Convert PortfolioItem[] to a Prisma-compatible JSON array
 */
export function portfolioItemsToJson(items?: PortfolioItem[]): Prisma.InputJsonValue[] | undefined {
  if (!items) return undefined;
  return items as unknown as Prisma.InputJsonValue[];
}

/**
 * Get SocialLinks from a BuilderProfile
 */
export function getSocialLinks(profile: { socialLinks?: Prisma.JsonValue | null }): SocialLinks | undefined {
  if (!profile.socialLinks) return undefined;
  return profile.socialLinks as unknown as SocialLinks;
}

/**
 * Get PortfolioItems from a BuilderProfile
 */
export function getPortfolioItems(profile: { portfolioItems?: Prisma.JsonValue[] }): PortfolioItem[] | undefined {
  if (!profile.portfolioItems || !Array.isArray(profile.portfolioItems)) return undefined;
  return profile.portfolioItems as unknown as PortfolioItem[];
}

// Re-export the types from prisma-types.ts
export type { SocialLinks, PortfolioItem, PortfolioItemOutcome };

// Export the utility functions
export const PrismaJsonUtils = {
  socialLinksToJson,
  portfolioItemsToJson,
  getSocialLinks,
  getPortfolioItems
};

export default PrismaJsonUtils;
