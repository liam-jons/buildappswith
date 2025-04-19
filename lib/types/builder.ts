/**
 * Types for the Builder profiles and related entities
 * Version: 0.1.67
 */

import { Prisma } from "@prisma/client";
import { ValidationTier as ComponentValidationTier } from '@/components/profile/validation-tier-badge';
// Import types from prisma-types (our source of truth)
import { 
  SocialLinks as PrismaSocialLinks, 
  PortfolioItem as PrismaPortfolioItem,
  PortfolioItemOutcome as PrismaPortfolioItemOutcome
} from '@/lib/prisma-types';

// Import utility functions from json-utilities
import { 
  socialLinksToJson, 
  portfolioItemsToJson 
} from '@/lib/json-utilities';

/**
 * Builder type - represents a complete builder profile
 */
export interface Builder {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string | null;
  validationTier: ComponentValidationTier;
  joinDate: Date;
  completedProjects: number;
  rating: number;
  responseRate: number;
  skills: string[];
  availability: {
    status: 'available' | 'unavailable';
  };
  portfolio: PortfolioItem[];
  socialLinks: SocialLinks;
  updatedAt?: string; // Added for API compatibility
}

/**
 * Validation tier type
 */
export type ValidationTier = ComponentValidationTier;

/**
 * Builder metrics for dashboard
 * Combined interface that includes all metrics used across components
 */
export interface BuilderMetrics {
  // Core metrics
  clientsHelped: number;
  projectsCompleted: number;
  averageRating: number;
  responseRate: number;
  averageCompletionTime: number; // in days
  revenue: number;
  
  // Validation metrics
  successRate: number; // Percentage of projects meeting requirements
  onTimeDelivery: number; // Percentage of milestones completed on time
  clientSatisfaction: number; // Average rating out of 5
  entrepreneursCreated: number; // Number of businesses launched
  businessImpact: number; // Percentage improvement in client metrics
}

/**
 * Project type (alias for PortfolioItem for component compatibility)
 */
export type Project = PortfolioItem & {
  technologies: string[];
  client?: string;
  date?: string | Date;
  images?: string[];
};

/**
 * Portfolio item outcome - represents a measurable outcome of a project
 */
export interface PortfolioItemOutcome extends PrismaPortfolioItemOutcome {
  // Any additional properties specific to this context
}

/**
 * Portfolio item - represents a project in a builder's portfolio
 * This matches the structure expected by Prisma for JSON fields
 */
export interface PortfolioItem extends PrismaPortfolioItem {
  // Any additional properties specific to this context
}

/**
 * Social links - represents a builder's social media profiles
 * This matches the structure expected by Prisma for JSON fields
 */
export interface SocialLinks extends PrismaSocialLinks {
  // Any additional properties specific to this context
}

/**
 * Convert PortfolioItem[] to Prisma-compatible JSON value
 */
export function portfolioItemsToPrisma(items: PortfolioItem[] | undefined): Prisma.InputJsonValue[] | undefined {
  return portfolioItemsToJson(items);
}

/**
 * Convert SocialLinks to Prisma-compatible JSON value
 */
export function socialLinksToPrisma(links: SocialLinks | undefined): Prisma.InputJsonValue | undefined {
  return socialLinksToJson(links);
}

// Use utility functions from json-utilities
export { socialLinksToJson, portfolioItemsToJson };
