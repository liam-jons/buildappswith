"use client";

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MarketplaceFilters, MarketplaceFilterOptions, fetchMarketplaceFilterOptions } from '@/lib/marketplace';

/**
 * Hook for managing marketplace builder filters
 * 
 * Provides URL-driven filter state management with the following features:
 * - Synchronizes filter state with URL parameters
 * - Loads available filter options from API
 * - Provides methods for updating and clearing filters
 */
export function useBuilderFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<MarketplaceFilterOptions>({
    skills: [],
    validationTiers: [],
    availability: [],
    sortOptions: [
      { value: 'featured', label: 'Featured' },
      { value: 'rating', label: 'Highest Rated' },
      { value: 'newest', label: 'Newest' }
    ]
  });
  
  // Extract current filters from URL
  const [filters, setFilters] = useState<MarketplaceFilters>(() => {
    const initialFilters: MarketplaceFilters = {};
    
    // Handle null searchParams
    if (!searchParams) return initialFilters;
    
    // Extract search query
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      initialFilters.searchQuery = searchQuery;
    }
    
    // Extract skills
    const skills = searchParams.get('skills');
    if (skills) {
      initialFilters.skills = skills.split(',');
    }
    
    // Extract validation tiers
    const tiers = searchParams.get('tiers');
    if (tiers) {
      initialFilters.validationTiers = tiers.split(',').map(Number);
    }
    
    // Extract availability
    const availability = searchParams.get('availability');
    if (availability) {
      initialFilters.availability = availability.split(',');
    }
    
    // Extract featured flag
    const featured = searchParams.get('featured');
    if (featured) {
      initialFilters.featured = featured === 'true';
    }
    
    // Extract sort option
    const sortBy = searchParams.get('sort');
    if (sortBy) {
      initialFilters.sortBy = sortBy;
    }
    
    // Extract price range
    const minRate = searchParams.get('minRate');
    if (minRate) {
      initialFilters.minHourlyRate = parseInt(minRate, 10);
    }
    
    const maxRate = searchParams.get('maxRate');
    if (maxRate) {
      initialFilters.maxHourlyRate = parseInt(maxRate, 10);
    }
    
    return initialFilters;
  });
  
  // Load filter options from API
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await fetchMarketplaceFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFilterOptions();
  }, []);
  
  // Function to update URL parameters based on current filters
  const updateURLParams = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add search query
    if (filters.searchQuery) {
      params.set('q', filters.searchQuery);
    }
    
    // Add skills
    if (filters.skills && filters.skills.length > 0) {
      params.set('skills', filters.skills.join(','));
    }
    
    // Add tiers
    if (filters.validationTiers && filters.validationTiers.length > 0) {
      params.set('tiers', filters.validationTiers.join(','));
    }
    
    // Add availability
    if (filters.availability && filters.availability.length > 0) {
      params.set('availability', filters.availability.join(','));
    }
    
    // Add featured flag
    if (filters.featured) {
      params.set('featured', 'true');
    }
    
    // Add sort option
    if (filters.sortBy) {
      params.set('sort', filters.sortBy);
    }
    
    // Add price range
    if (typeof filters.minHourlyRate === 'number') {
      params.set('minRate', String(filters.minHourlyRate));
    }
    
    if (typeof filters.maxHourlyRate === 'number') {
      params.set('maxRate', String(filters.maxHourlyRate));
    }
    
    // Update URL without triggering a navigation
    router.replace(`?${params.toString()}`);
  }, [filters, router]);
  
  // Update URL when filters change
  useEffect(() => {
    updateURLParams();
  }, [filters, updateURLParams]);
  
  // Method to update filters
  const updateFilters = useCallback((newFilters: Partial<MarketplaceFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);
  
  // Method to clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  // Method to toggle a single filter value
  const toggleFilter = useCallback((key: keyof MarketplaceFilters, value: string | number) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Handle array filters like skills, validationTiers, availability
      if (Array.isArray(prev[key])) {
        const currentArray = prev[key] as (string | number)[] || [];
        const valueIndex = currentArray.indexOf(value);
        
        if (valueIndex >= 0) {
          // Remove value if it exists
          const newArray = [...currentArray];
          newArray.splice(valueIndex, 1);
          newFilters[key] = newArray.length > 0 ? newArray : undefined;
        } else {
          // Add value if it doesn't exist
          newFilters[key] = [...currentArray, value];
        }
      } else {
        // Handle boolean or string filters
        if (prev[key] === value) {
          // Remove if value matches current
          delete newFilters[key];
        } else {
          // Set to new value
          newFilters[key] = value;
        }
      }
      
      return newFilters;
    });
  }, []);
  
  return {
    filters,
    filterOptions,
    isLoading,
    updateFilters,
    clearFilters,
    toggleFilter
  };
}