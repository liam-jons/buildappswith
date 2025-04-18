import { ValidationTier } from "@/components/profile/validation-tier-badge";
import { BuilderProfileData } from "@/components/profile/builder-profile";

/**
 * Interface for marketplace filtering options
 */
export interface MarketplaceFilters {
  // Search text across name, title, bio, skills
  searchQuery?: string;
  
  // Filter by validation tier (entry, established, expert)
  validationTiers?: ValidationTier[];
  
  // Filter by specific skills
  skills?: string[];
  
  // Filter by availability status
  availability?: ('available' | 'limited' | 'unavailable')[];
  
  // Sort options
  sortBy?: 'rating' | 'projects' | 'recent';
}

/**
 * Interface for paginated marketplace responses
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Type for builder response
 */
export type BuildersResponse = PaginatedResponse<BuilderProfileData>;

/**
 * Interface for available marketplace filter options
 */
export interface MarketplaceFilterOptions {
  skills: string[];
}
