# Marketplace Consolidated Architecture

## Overview

This document outlines the consolidated architecture for the marketplace components, designed to resolve circular dependencies, simplify state management, and standardize the component structure. The architecture follows a domain-based pattern with clear separation of concerns and consistent file structure.

## Directory Structure

```
marketplace/
├── components/               # Component implementations
│   ├── builder-card/         # Builder card component directory
│   │   ├── builder-card.tsx  # Main component implementation
│   │   ├── card-skeleton.tsx # Loading skeleton implementation
│   │   └── index.ts          # Barrel exports
│   ├── builder-image/        # Consolidated builder image component
│   │   ├── builder-image.tsx # Main component implementation
│   │   ├── fallback.tsx      # Fallback component for errors/missing images
│   │   └── index.ts          # Barrel exports
│   ├── builder-list/         # List component directory
│   │   ├── builder-list.tsx  # Main list component
│   │   └── index.ts          # Barrel exports
│   ├── error-boundaries/     # Error handling components
│   ├── filter-panel/         # Filter UI components
│   ├── index.ts              # Barrel exports for all components
│   └── types.ts              # Component-specific type definitions
├── hooks/                    # Custom React hooks
│   ├── use-builder-filter.ts # Filter state management
│   ├── use-builder-search.ts # Search functionality
│   └── index.ts              # Barrel exports for hooks
├── utils/                    # Utility functions
│   ├── filter-helpers.ts     # Filter processing utilities
│   └── index.ts              # Barrel exports for utils
├── index.ts                  # Main barrel exports for marketplace module
└── lib/marketplace/          # Domain business logic
    ├── index.ts              # Barrel exports
    ├── types.ts              # Domain-specific type definitions
    ├── marketplace-service.ts # Marketplace data operations (maintained)
    ├── analytics-service.ts  # Analytics tracking
    └── data-service.ts       # DEPRECATED - use marketplace-service.ts
```

### Deprecated Components

The following components have been marked as deprecated and are kept only for historical reference. They will be removed in a future cleanup:

- `components/marketplace/builder-image.tsx` → Use `components/marketplace/components/builder-image`
- `components/marketplace/simplified-builder-image.tsx` → Use `components/marketplace/components/builder-image`
- `components/marketplace/fixed-builder-image.tsx` → Use `components/marketplace/components/builder-image`
- `lib/marketplace/data-service.ts` → Use `lib/marketplace/marketplace-service.ts`

### Types Consolidation

All marketplace types have been consolidated into appropriate locations:

1. **Domain Types** - `lib/marketplace/types.ts`
   - Contains all domain business logic types
   - Used by services and server-side components
   - Includes core model definitions

2. **Component Types** - `components/marketplace/components/types.ts`
   - Contains all component-specific types
   - Prevents circular dependencies
   - Provides proper type isolation

## Key Design Principles

1. **Domain-Based Architecture** - Following the standard BuildAppsWith architecture pattern with actions, API, schemas, types, utils, and index exports

2. **Component Organization** - Each component lives in its own directory with supporting files:
   - `component-name/` - Directory for a specific component
   - `component-name/component-name.tsx` - Main component implementation
   - `component-name/index.ts` - Barrel exports for the component
   - `component-name/types.ts` - Component-specific types (if needed)

3. **Single Implementation** - Consolidating duplicate code to eliminate redundancy
   - Multiple builder image implementations → Single BuilderImage component
   - Consistent, predictable API across components

4. **Type Separation** - Clear separation between:
   - Domain types (`lib/marketplace/types.ts`) - Core business logic types
   - Component types (`components/marketplace/components/types.ts`) - UI component types

5. **Barrel Exports** - Standardized exports throughout the codebase:
   - Components export named exports for better tree-shaking
   - Index files provide clean import paths
   - Prevents circular dependencies

6. **Error Handling** - Robust error handling strategy:
   - Error boundaries for component isolation
   - Fallbacks for failed image loading
   - Clear error messages for developers

7. **Stateless Design** - Components are stateless where possible:
   - State management moved to hooks
   - Pure render functions for predictable behavior
   - No complex useEffect dependencies

8. **Analytics Integration** - Built-in analytics tracking through marketplace-service

## Component Implementations

### 1. Builder Image Component (Consolidated)

```tsx
// marketplace/components/builder-image/builder-image.tsx
import React from 'react';
import Image from 'next/image';
import { getInitials } from '../utils/image-helpers';
import { ImageFallback } from './fallback';

interface BuilderImageProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BuilderImage({
  src,
  alt,
  size = 'md',
  className = '',
}: BuilderImageProps) {
  // Size class mapping
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };
  
  // Simple validation of image source
  const hasValidImageSrc = Boolean(src) && 
    (src?.startsWith('/') || src?.startsWith('http'));
  
  return (
    <div className={`relative ${sizeClasses[size]} rounded-full border border-muted overflow-hidden bg-muted ${className}`}>
      {hasValidImageSrc ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          className="object-cover"
          onError={(e) => {
            const imgElement = e.currentTarget as HTMLImageElement;
            imgElement.style.display = 'none';
          }}
          unoptimized={true}
        />
      ) : (
        <ImageFallback 
          text={alt} 
          size={size} 
        />
      )}
    </div>
  );
}
```

### 2. Builder Card Component

```tsx
// marketplace/components/builder-card/builder-card.tsx
import React from 'react';
import Link from 'next/link';
import { BuilderImage } from '../builder-image';
import { ValidationTierBadge } from '@/components/trust/ui/validation-tier-badge';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { BuilderProfileListing } from '../../types';
import { getTierString, formatHourlyRate } from '../../utils/display-helpers';

interface BuilderCardProps {
  builder: BuilderProfileListing;
  className?: string;
}

export function BuilderCard({ builder, className }: BuilderCardProps) {
  return (
    <Card className={`overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          <BuilderImage
            src={builder.avatarUrl}
            alt={builder.name}
            size="md"
          />
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-semibold mr-2">{builder.name}</h3>
              <ValidationTierBadge tier={getTierString(builder.validationTier)} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">
              {builder.headline || builder.tagline || formatHourlyRate(builder.hourlyRate)}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3 mb-3">
          {builder.bio || "This builder hasn't added a bio yet."}
        </p>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(builder.topSkills?.length > 0 ? builder.topSkills : builder.skills)
            ?.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-muted text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
          {(builder.skills?.length || 0) > 5 && (
            <span className="px-2 py-0.5 bg-muted text-xs rounded-full">
              +{(builder.skills?.length || 0) - 5} more
            </span>
          )}
        </div>

        {/* Availability indicator */}
        {builder.availability && (
          <div className="mt-3 flex items-center">
            <AvailabilityIndicator status={builder.availability} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link
          href={`/marketplace/builders/${builder.id}`}
          className="w-full"
        >
          <Button 
            variant="default" 
            className="w-full"
          >
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function AvailabilityIndicator({ status }: { status: 'available' | 'limited' | 'unavailable' }) {
  const colors = {
    available: 'bg-green-500',
    limited: 'bg-yellow-500',
    unavailable: 'bg-red-500',
  };
  
  const labels = {
    available: 'Available for hire',
    limited: 'Limited availability',
    unavailable: 'Currently unavailable',
  };
  
  return (
    <>
      <span className={`w-2 h-2 rounded-full mr-2 ${colors[status]}`} />
      <span className="text-xs text-muted-foreground">
        {labels[status]}
      </span>
    </>
  );
}
```

### 3. Filter Panel Component

```tsx
// marketplace/components/filter-panel/filter-panel.tsx
import React from 'react';
import { Select } from '@/components/ui/core/select';
import { Checkbox } from '@/components/ui/core/checkbox';
import { Button } from '@/components/ui/core/button';
import { MarketplaceFilters, MarketplaceFilterOptions } from '../../types';
import { ActiveFilters } from './active-filters';

interface FilterPanelProps {
  filters: MarketplaceFilters;
  filterOptions: MarketplaceFilterOptions;
  onFilterChange: (filters: MarketplaceFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

export function FilterPanel({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  className = '',
}: FilterPanelProps) {
  // Handle updating a single filter value
  const updateFilter = (key: keyof MarketplaceFilters, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };
  
  // Check if any filters are applied
  const hasFilters = Object.values(filters).some(value => 
    (Array.isArray(value) && value.length > 0) || 
    (typeof value === 'boolean' && value) ||
    (typeof value === 'string' && value.length > 0)
  );
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Active filters */}
      {hasFilters && (
        <ActiveFilters 
          filters={filters} 
          onRemoveFilter={(key) => updateFilter(key, undefined)} 
          onClearFilters={onClearFilters}
        />
      )}
      
      {/* Skills filter */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Skills</h3>
        <div className="space-y-1">
          {filterOptions.skills?.map((skill) => (
            <div key={skill.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`skill-${skill.value}`}
                checked={filters.skills?.includes(skill.value)}
                onCheckedChange={(checked) => {
                  const currentSkills = filters.skills || [];
                  const newSkills = checked
                    ? [...currentSkills, skill.value]
                    : currentSkills.filter(s => s !== skill.value);
                  updateFilter('skills', newSkills);
                }}
              />
              <label 
                htmlFor={`skill-${skill.value}`}
                className="text-sm cursor-pointer"
              >
                {skill.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Sort by */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Sort by</h3>
        <Select
          value={filters.sortBy || 'featured'}
          onValueChange={(value) => updateFilter('sortBy', value)}
          options={filterOptions.sortOptions || [
            { value: 'featured', label: 'Featured' },
            { value: 'rating', label: 'Highest Rated' },
          ]}
        />
      </div>
      
      {/* Clear filters button */}
      {hasFilters && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearFilters}
          className="w-full"
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}
```

### 4. Custom Hooks for State Management

```tsx
// marketplace/hooks/use-builder-filter.ts
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MarketplaceFilters, MarketplaceFilterOptions } from '../types';
import { fetchMarketplaceFilterOptions } from '../api';

export function useBuilderFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for filters and available options
  const [filters, setFilters] = useState<MarketplaceFilters>({});
  const [filterOptions, setFilterOptions] = useState<MarketplaceFilterOptions>({
    skills: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize filters from URL query params
  useEffect(() => {
    const initialFilters: MarketplaceFilters = {};
    
    // Parse searchQuery
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      initialFilters.searchQuery = searchQuery;
    }
    
    // Parse skills
    const skills = searchParams.get('skills');
    if (skills) {
      initialFilters.skills = skills.split(',');
    }
    
    // Parse validation tiers
    const tiers = searchParams.get('tiers');
    if (tiers) {
      initialFilters.validationTiers = tiers.split(',').map(Number);
    }
    
    // Parse sortBy
    const sortBy = searchParams.get('sort');
    if (sortBy) {
      initialFilters.sortBy = sortBy;
    }
    
    setFilters(initialFilters);
  }, [searchParams]);
  
  // Fetch available filter options
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        setIsLoading(true);
        const options = await fetchMarketplaceFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadFilterOptions();
  }, []);
  
  // Update URL when filters change
  const updateFilters = useCallback((newFilters: MarketplaceFilters) => {
    setFilters(newFilters);
    
    // Update URL query params
    const params = new URLSearchParams();
    
    if (newFilters.searchQuery) {
      params.set('search', newFilters.searchQuery);
    }
    
    if (newFilters.skills?.length) {
      params.set('skills', newFilters.skills.join(','));
    }
    
    if (newFilters.validationTiers?.length) {
      params.set('tiers', newFilters.validationTiers.join(','));
    }
    
    if (newFilters.sortBy) {
      params.set('sort', newFilters.sortBy);
    }
    
    // Update URL without refreshing the page
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/marketplace${newUrl}`);
  }, [router]);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    router.push('/marketplace');
  }, [router]);
  
  return {
    filters,
    filterOptions,
    isLoading,
    updateFilters,
    clearFilters
  };
}
```

### 5. Marketplace Main Page

```tsx
// app/(platform)/marketplace/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { BuilderList } from '@/marketplace/components/builder-list';
import { FilterPanel } from '@/marketplace/components/filter-panel';
import { SearchBar } from '@/marketplace/components/search-bar';
import { ErrorBoundary } from '@/components/error-boundaries';
import { fetchBuilders } from '@/marketplace/api';
import { useBuilderFilter } from '@/marketplace/hooks/use-builder-filter';

export default function MarketplacePage() {
  const { 
    filters, 
    filterOptions, 
    isLoading: isLoadingFilters,
    updateFilters, 
    clearFilters 
  } = useBuilderFilter();
  
  const [builders, setBuilders] = useState([]);
  const [isLoadingBuilders, setIsLoadingBuilders] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Search and filter effects combined in a single data fetch
  useEffect(() => {
    async function loadBuilders() {
      try {
        setIsLoadingBuilders(true);
        const response = await fetchBuilders(1, 12, filters);
        setBuilders(response.data);
        setError(null);
      } catch (err) {
        console.error('Error loading builders:', err);
        setError(err instanceof Error ? err : new Error('Failed to load builders'));
      } finally {
        setIsLoadingBuilders(false);
      }
    }
    
    loadBuilders();
  }, [filters]);
  
  // Handle search submission
  const handleSearch = (query: string) => {
    updateFilters({
      ...filters,
      searchQuery: query
    });
  };
  
  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Application Builders</h1>
          <p className="text-muted-foreground mb-6">
            Find skilled builders to help bring your AI application ideas to life
          </p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters (responsive) */}
        <div className="md:w-64 space-y-6">
          <SearchBar 
            initialValue={filters.searchQuery || ''} 
            onSearch={handleSearch} 
          />
          
          <ErrorBoundary fallback={<div>Filter options failed to load</div>}>
            <FilterPanel
              filters={filters}
              filterOptions={filterOptions}
              onFilterChange={updateFilters}
              onClearFilters={clearFilters}
              isLoading={isLoadingFilters}
            />
          </ErrorBoundary>
        </div>
        
        {/* Builder list */}
        <div className="flex-1">
          <ErrorBoundary fallback={<div>Failed to load builders</div>}>
            {isLoadingBuilders ? (
              <BuilderListSkeleton count={6} />
            ) : error ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Error loading builders</h3>
                <p className="text-muted-foreground mt-2">
                  {error.message || 'Please try again later'}
                </p>
              </div>
            ) : (
              <BuilderList builders={builders} />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
```

### 6. Component Index Files to Prevent Circular Dependencies

```tsx
// marketplace/components/index.ts
// Export components directly with no re-exports
export { BuilderCard } from './builder-card/builder-card';
export { BuilderImage } from './builder-image/builder-image';
export { FilterPanel } from './filter-panel/filter-panel';
export { BuilderList } from './builder-list/builder-list';
export { SearchBar } from './search-bar/search-bar';

// marketplace/components/builder-image/index.ts
export { BuilderImage } from './builder-image';
export { ImageFallback } from './fallback';
```

## Migration Strategy

For components with circular dependencies or multiple implementations, we've implemented a targeted approach:

1. **BuilderImage Component** - Consolidated three implementations (original, fixed, simplified) into a single implementation
2. **Feature Flag Integration** - Removed feature flag-based rendering to prevent render loops
3. **Barrel Exports** - Eliminated nested re-exports to prevent circular dependencies

## Next Steps

See the MARKETPLACE_DATA_FLOW.md document for a complete overview of data flow patterns in the consolidated marketplace architecture.