/**
 * Filter helper utilities for marketplace components
 */

import { MarketplaceFilters } from '@/lib/marketplace';

/**
 * Creates URL search params from marketplace filters
 */
export function createFilterParams(filters: MarketplaceFilters): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.searchQuery) {
    params.set('q', filters.searchQuery);
  }
  
  if (filters.skills && filters.skills.length > 0) {
    params.set('skills', filters.skills.join(','));
  }
  
  if (filters.validationTiers && filters.validationTiers.length > 0) {
    params.set('tiers', filters.validationTiers.join(','));
  }
  
  if (filters.availability && filters.availability.length > 0) {
    params.set('availability', filters.availability.join(','));
  }
  
  if (filters.featured) {
    params.set('featured', 'true');
  }
  
  if (filters.sortBy) {
    params.set('sort', filters.sortBy);
  }
  
  if (filters.minHourlyRate) {
    params.set('minRate', filters.minHourlyRate.toString());
  }
  
  if (filters.maxHourlyRate) {
    params.set('maxRate', filters.maxHourlyRate.toString());
  }
  
  return params;
}

/**
 * Parses URL search params into marketplace filters
 */
export function parseFilterParams(params: URLSearchParams): MarketplaceFilters {
  const filters: MarketplaceFilters = {};
  
  const searchQuery = params.get('q');
  if (searchQuery) {
    filters.searchQuery = searchQuery;
  }
  
  const skills = params.get('skills');
  if (skills) {
    filters.skills = skills.split(',');
  }
  
  const tiers = params.get('tiers');
  if (tiers) {
    filters.validationTiers = tiers.split(',').map(Number);
  }
  
  const availability = params.get('availability');
  if (availability) {
    filters.availability = availability.split(',');
  }
  
  const featured = params.get('featured');
  if (featured) {
    filters.featured = featured === 'true';
  }
  
  const sortBy = params.get('sort');
  if (sortBy) {
    filters.sortBy = sortBy;
  }
  
  const minRate = params.get('minRate');
  if (minRate) {
    filters.minHourlyRate = parseInt(minRate, 10);
  }
  
  const maxRate = params.get('maxRate');
  if (maxRate) {
    filters.maxHourlyRate = parseInt(maxRate, 10);
  }
  
  return filters;
}

/**
 * Checks if a filter set is empty (no active filters)
 */
export function isEmptyFilter(filters: MarketplaceFilters): boolean {
  if (!filters) return true;
  
  return (
    !filters.searchQuery &&
    (!filters.skills || filters.skills.length === 0) &&
    (!filters.validationTiers || filters.validationTiers.length === 0) &&
    (!filters.availability || filters.availability.length === 0) &&
    filters.featured === undefined &&
    !filters.sortBy &&
    filters.minHourlyRate === undefined &&
    filters.maxHourlyRate === undefined
  );
}