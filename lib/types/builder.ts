/**
 * Builder-related type definitions
 * Version: 1.0.0
 * 
 * This file contains types used in the builder profile and marketplace components.
 */

/**
 * Builder metrics data for performance dashboard
 */
export interface BuilderMetrics {
  // Core metrics
  successRate: number;           // Percentage of successful projects
  onTimeDelivery: number;        // Percentage of on-time deliveries
  clientSatisfaction: number;    // Client satisfaction rating (0-100)
  responseTime: number;          // Average response time in hours
  
  // Project stats
  completedProjects: number;     // Total number of completed projects
  activeProjects: number;        // Number of currently active projects
  
  // Client stats
  totalClients: number;          // Total number of unique clients
  repeatClients: number;         // Number of repeat clients
  entrepreneursCreated: number;  // Number of entrepreneurs created/supported
  
  // Impact metrics
  businessImpact: number;        // Business impact score
  
  // Revenue metrics (optional)
  averageProjectValue?: number;  // Average project value
  monthlyRevenue?: number;       // Monthly revenue
  
  // Comparison metrics
  industryAverages: {
    successRate: number;
    onTimeDelivery: number;
    clientSatisfaction: number;
    responseTime: number;
  }
}

/**
 * Builder validation tiers
 * Note: This type is aligned with lib/trust/types.ts ValidationTier
 */
export type ValidationTier = 'basic' | 'verified' | 'expert';

/**
 * Builder expertise areas
 */
export enum ExpertiseAreas {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  FULLSTACK = 'fullstack',
  MOBILE = 'mobile',
  DATA = 'data',
  DEVOPS = 'devops',
  AI = 'ai',
  BLOCKCHAIN = 'blockchain',
  SECURITY = 'security',
  UI_UX = 'ui_ux'
}

/**
 * Builder profile data structure
 */
export interface BuilderProfileData {
  id: string;
  userId: string;
  name: string;
  bio: string;
  avatarUrl?: string;
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  validationTier: ValidationTier;
  expertiseAreas: ExpertiseAreas[];
  skills: string[];
  hourlyRate?: number;
  availability?: boolean;
  metrics?: BuilderMetrics;
  projects?: Project[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Project in a builder's portfolio
 */
export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  images?: string[];
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  caseStudyUrl?: string;
  featured: boolean;
  completionDate: Date | string;
  date?: Date | string;  // Alternative date field
  outcomes?: Array<{
    description: string;
    metric?: string;
    isVerified?: boolean;
    verified?: boolean;
    type?: string;
    label?: string;
    value?: string | number;
  }>;
  client?: {
    name: string;
    industry?: string;
    logo?: string;
  };
  testimonial?: {
    text: string;
    author: string;
    role: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}
