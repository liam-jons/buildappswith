/**
 * Type definitions for the "What AI Can/Can't Do" Timeline component
 */

/**
 * Domains for categorizing AI capabilities
 */
export type Domain = 
  | 'business' 
  | 'education' 
  | 'creative' 
  | 'healthcare'
  | 'finance' 
  | 'science'
  | 'general';

/**
 * Example interface for providing practical implementations
 */
export interface Example {
  title: string;
  description: string;
  implementation?: string; // Code or implementation details
}

/**
 * Main interface for AI capability entries
 */
export interface AICapability {
  id: string;
  date: string; // ISO date string
  title: string;
  description: string;
  domain: Domain;
  examples: Example[];
  limitations: string[];
  technicalRequirements?: string[];
  isModelImprovement?: boolean; // To mark significant model improvements
  modelName?: string; // Name of the model if applicable
  source?: string; // Source of information
  verified?: boolean; // Whether this capability has been verified
}

/**
 * Filters for the timeline
 */
export interface TimelineFilters {
  domains: Domain[];
  showModelImprovements: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}
