/**
 * Marketplace Component Types
 * Version: 1.0.0
 * 
 * This file contains type definitions for the marketplace components.
 * It follows the domain-based architecture pattern to avoid circular dependencies.
 */

// ===== Builder Image Types =====

export interface BuilderImageProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ImageFallbackProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ===== Builder Card Types =====

export interface BuilderCardProps {
  builder: BuilderProfileBase;
  className?: string;
}

// ===== Builder List Types =====

export interface BuilderListProps {
  builders: BuilderProfileBase[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

// ===== Filter Panel Types =====

export interface FilterPanelProps {
  filters: MarketplaceFilters;
  options: MarketplaceFilterOptions;
  onFilterChange: (filters: MarketplaceFilters) => void;
  isLoading?: boolean;
  className?: string;
}

// ===== Base Types =====
// These are simplified versions of the types in /lib/marketplace/types.ts
// to avoid circular dependencies

export interface BuilderProfileBase {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string;
  headline?: string;
  tagline?: string;
  validationTier: number;
  skills?: string[];
  topSkills?: string[];
  hourlyRate?: number;
  availability?: 'available' | 'limited' | 'unavailable';
  featured?: boolean;
  isDemo?: boolean;
}

export interface MarketplaceFilters {
  searchQuery?: string;
  validationTiers?: number[];
  skills?: string[];
  availability?: string[];
  sortBy?: string;
  minHourlyRate?: number;
  maxHourlyRate?: number;
}

export interface MarketplaceFilterOptions {
  skills: Array<{value: string; label: string}>;
  validationTiers?: Array<{value: number; label: string}>;
  availability?: Array<{value: string; label: string}>;
  sortOptions?: Array<{value: string; label: string}>;
}
