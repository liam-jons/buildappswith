import { Prisma } from '@prisma/client';
import { SocialLinks, PortfolioItem } from './prisma-types';

/**
 * This module provides extensions for Prisma to handle JSON fields
 * without modifying the generated types directly
 */

/**
 * Runtime extensions and utilities for Prisma
 */
export const PrismaExtensions = {
  /**
   * Helper to cast a builder profile for type safety
   */
  castBuilderProfile: <T extends { socialLinks?: Prisma.JsonValue | null, portfolioItems?: Prisma.JsonValue[] }>(profile: T) => {
    return {
      ...profile,
      socialLinks: profile.socialLinks as unknown as SocialLinks,
      portfolioItems: profile.portfolioItems as unknown as PortfolioItem[]
    };
  },

  /**
   * Helper to safely access socialLinks
   */
  getSocialLinks: (profile: { socialLinks?: Prisma.JsonValue | null }): SocialLinks | undefined => {
    if (!profile.socialLinks) return undefined;
    return profile.socialLinks as unknown as SocialLinks;
  },

  /**
   * Helper to safely access portfolioItems
   */
  getPortfolioItems: (profile: { portfolioItems?: Prisma.JsonValue[] }): PortfolioItem[] | undefined => {
    if (!profile.portfolioItems) return undefined;
    return profile.portfolioItems as unknown as PortfolioItem[];
  }
};

// Export the module to ensure type extensions are applied
export default PrismaExtensions;
