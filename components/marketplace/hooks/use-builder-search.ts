"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { BuilderProfileListing, BuildersResponse, fetchBuilders } from '@/lib/marketplace';

interface UseBuilderSearchOptions {
  initialFilters?: Record<string, any>;
  debounceMs?: number;
  pageSize?: number;
}

/**
 * Hook for searching and fetching builders
 * 
 * Provides debounced search functionality with loading states and error handling
 */
export function useBuilderSearch({
  initialFilters = {},
  debounceMs = 500,
  pageSize = 9
}: UseBuilderSearchOptions = {}) {
  // State
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [builders, setBuilders] = useState<BuilderProfileListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBuilders, setTotalBuilders] = useState(0);
  
  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebounce(search, debounceMs);
  
  // Fetch builders based on current search, filters, and pagination
  const fetchData = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const combinedFilters = {
        ...filters,
        searchQuery: debouncedSearch || undefined
      };
      
      const response: BuildersResponse = await fetchBuilders(page, pageSize, combinedFilters);
      
      setBuilders(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalBuilders(response.pagination.total);
    } catch (err) {
      console.error('Error fetching builders:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch builders'));
      setBuilders([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filters, pageSize]);
  
  // Fetch data when debounced search or filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page
    fetchData(1);
  }, [debouncedSearch, filters, fetchData]);
  
  // Handle page change
  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(page);
  }, [fetchData]);
  
  // Update search term
  const updateSearch = useCallback((term: string) => {
    setSearch(term);
  }, []);
  
  // Update filters
  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);
  
  // Clear all filters and search
  const clearAll = useCallback(() => {
    setSearch('');
    setFilters({});
  }, []);
  
  // Refresh data with current search and filters
  const refresh = useCallback(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);
  
  return {
    search,
    filters,
    builders,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalBuilders,
    updateSearch,
    updateFilters,
    changePage,
    clearAll,
    refresh
  };
}