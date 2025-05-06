/**
 * Profile types
 * Version: 1.0.0
 * 
 * TypeScript type definitions for profiles
 */

export enum ValidationTier {
  TIER1 = 1,
  TIER2 = 2,
  TIER3 = 3
}

export enum UserRole {
  CLIENT = "CLIENT",
  BUILDER = "BUILDER",
  ADMIN = "ADMIN"
}

export enum SpecializationArea {
  ADHD_PRODUCTIVITY = "ADHD_PRODUCTIVITY",
  AI_LITERACY = "AI_LITERACY",
  BUILDING_WITH_AI = "BUILDING_WITH_AI",
  BUSINESS_VALUE = "BUSINESS_VALUE"
}

export interface ProfileImage {
  url: string;
  alt?: string;
}

export interface SocialProfiles {
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

export interface SpecializationContent {
  description: string;
  bulletPoints: string[];
  testimonials: Testimonial[];
}

export interface Testimonial {
  id: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number;
  date: string | Date;
}

export interface BuilderAvailability {
  status: "available" | "limited" | "unavailable";
  nextAvailable?: Date;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  technologies: string[];
  demoUrl?: string;
  repositoryUrl?: string;
  completionDate?: string | Date;
  featured?: boolean;
}

export interface AIApp {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  technologies: string[];
  status: "LIVE" | "DEMO" | "CONCEPT";
  appUrl?: string;
  adhdFocused: boolean;
}

export interface MetricsCategory {
  id: string;
  name: string;
  description: string;
  metrics: Metric[];
}

export interface Metric {
  id: string;
  name: string;
  value: string | number;
  suffix?: string;
  description?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    percentage?: number;
  };
}

export type ExpertiseAreasUpdate = Record<string, any>;

export interface SessionTypeWithId {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
  color?: string;
  maxParticipants?: number;
}

export interface BuilderProfileData {
  id: string;
  bio?: string;
  headline?: string;
  slug?: string;
  tagline?: string;
  displayName?: string;
  validationTier: number;
  domains: string[];
  badges: string[];
  completedProjects: number;
  responseRate?: number;
  hourlyRate?: number;
  availableForHire: boolean;
  adhd_focus: boolean;
  expertiseAreas: Record<string, any>;
  socialLinks: Record<string, string>;
  portfolioItems: any[];
  featured: boolean;
  searchable: boolean;
  availability: string;
  topSkills: string[];
}

export interface BuilderProfileResponse {
  userId: string;
  clerkId?: string;
  email: string;
  name?: string;
  profile: BuilderProfileData;
}

// Type for updating builder profile
export interface UpdateBuilderProfileData {
  bio?: string | null;
  headline?: string | null;
  slug?: string | null;
  tagline?: string | null;
  displayName?: string | null;
  domains?: string[];
  badges?: string[];
  hourlyRate?: number | null;
  availableForHire?: boolean;
  adhd_focus?: boolean;
  socialLinks?: Record<string, string> | null;
  portfolioItems?: any[] | null;
  searchable?: boolean;
  availability?: string;
  topSkills?: string[];
}

/**
 * Profile permissions for authorization
 */
export interface ProfilePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canVerify: boolean;
}

/**
 * Profile auth context for UI components
 */
export interface ProfileAuthContext {
  profile?: BuilderProfileData;
  permissions: ProfilePermissions;
  isOwner: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}