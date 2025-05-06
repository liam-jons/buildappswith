/**
 * Marketplace types
 * Version: 1.0.0
 * 
 * TypeScript type definitions for marketplace functionality
 */

// Validation tier options
export enum ValidationTier {
  ENTRY = 1,
  ESTABLISHED = 2,
  EXPERT = 3
}

// Availability status
export type AvailabilityStatus = 'available' | 'limited' | 'unavailable';

// Builder profile for marketplace listing
export interface BuilderProfileListing {
  id: string;
  userId: string;
  displayName?: string;
  name: string;
  bio?: string;
  headline?: string;
  tagline?: string;
  avatarUrl?: string;
  validationTier: number;
  skills: string[];
  topSkills: string[];
  hourlyRate?: number;
  rating?: number;
  featured: boolean;
  availability: AvailabilityStatus;
  adhd_focus: boolean;
  completedProjects: number;
  responseRate?: number;
}

// Response for paginated builder listings
export interface BuildersResponse {
  data: BuilderProfileListing[];
  pagination: PaginationInfo;
}

// Pagination information
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// Generic paginated response type
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Filters for marketplace search
export interface MarketplaceFilters {
  searchQuery?: string;
  validationTiers?: number[];
  skills?: string[];
  availability?: string[];
  adhd_focus?: boolean;
  featured?: boolean;
  sortBy?: string;
  minHourlyRate?: number;
  maxHourlyRate?: number;
}

// Available filter options for UI
export interface MarketplaceFilterOptions {
  skills: Array<{value: string; label: string}>;
  validationTiers?: Array<{value: number; label: string}>;
  availability?: Array<{value: string; label: string}>;
  sortOptions?: Array<{value: string; label: string}>;
}

// Full builder profile data (for profile page)
export interface BuilderProfileData extends BuilderProfileListing {
  slug?: string;
  bio?: string;
  socialLinks?: {
    website?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    [key: string]: string | undefined;
  };
  domains: string[];
  badges: string[];
  expertiseAreas?: Record<string, any>;
  portfolioItems: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    technologies: string[];
    projectUrl?: string;
  }>;
  apps?: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    technologies: string[];
    status: string;
    appUrl?: string;
    adhd_focused: boolean;
  }>;
  sessionTypes?: Array<{
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    price: number;
    currency: string;
    isActive: boolean;
    color?: string;
  }>;
}

// Request for creating/updating builder profiles
export interface BuilderProfileRequest {
  bio?: string;
  headline?: string;
  tagline?: string;
  hourlyRate?: number;
  domains?: string[];
  skillIds?: string[];
  socialLinks?: Record<string, string>;
  availableForHire?: boolean;
  adhd_focus?: boolean;
  topSkills?: string[];
  expertiseAreas?: Record<string, any>;
}

// Skills with proficiency
export interface BuilderSkill {
  id: string;
  skillId: string;
  builderId: string;
  proficiency: number;
  verified: boolean;
  skill: {
    id: string;
    name: string;
    slug: string;
    domain: string;
  };
}

// Marketplace analytics event types
export enum MarketplaceEventType {
  PROFILE_VIEW = 'profile_view',
  SEARCH_QUERY = 'search_query',
  FILTER_APPLY = 'filter_apply',
  BOOKING_CLICK = 'booking_click',
  CONTACT_CLICK = 'contact_click'
}

// Analytics event
export interface MarketplaceEvent {
  type: MarketplaceEventType;
  userId?: string;
  builderId?: string;
  searchQuery?: string;
  filters?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: Date;
}