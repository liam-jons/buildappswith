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
  date: Date;
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
  completionDate?: Date;
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

export type ExpertiseAreas = Partial<Record<SpecializationArea, SpecializationContent>>;

export interface BuilderProfile {
  id: string;
  clerkUserId: string; // Link to Clerk user
  displayName: string;
  tagline: string;
  bio: string;
  specializations: string[];
  avatar?: ProfileImage;
  coverImage?: ProfileImage;
  validationTier: ValidationTier;
  roles: UserRole[];
  isFounder?: boolean;
  adhdFocus: boolean;
  skills: string[];
  joinDate: Date;
  completedProjects: number;
  rating: number;
  responseRate: number;
  socialLinks?: SocialProfiles;
  availability: BuilderAvailability;
  portfolio: PortfolioProject[];
  apps?: AIApp[];
  testimonials?: Testimonial[];
  metrics?: MetricsCategory[];
  featured: boolean;
  slug: string;

  // Specialization content
  expertiseAreas: ExpertiseAreas;
}

// Type for API responses
export interface BuilderProfileResponse {
  success: boolean;
  data?: BuilderProfile;
  error?: string;
}

export interface BuilderProfilesResponse {
  success: boolean;
  data?: BuilderProfile[];
  error?: string;
}

// Type for API requests
export interface CreateProfileRequest {
  displayName: string;
  tagline: string;
  bio: string;
  specializations: string[];
  validationTier: ValidationTier;
  roles: UserRole[];
  isFounder?: boolean;
  adhdFocus: boolean;
  skills: string[];
  socialLinks?: SocialProfiles;
  slug: string;
  expertiseAreas?: ExpertiseAreas;
}

export interface UpdateProfileRequest {
  displayName?: string;
  tagline?: string;
  bio?: string;
  specializations?: string[];
  validationTier?: ValidationTier;
  roles?: UserRole[];
  isFounder?: boolean;
  adhdFocus?: boolean;
  skills?: string[];
  socialLinks?: SocialProfiles;
  availability?: BuilderAvailability;
  slug?: string;
  featured?: boolean;
  expertiseAreas?: ExpertiseAreas;
}