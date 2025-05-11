'use client';

import { useState, useCallback, useEffect } from 'react';

// Define types for learning state
export type LearningFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';
export type LearningTimeframe = 'all' | 'week' | 'month' | 'year';
export type LearningSort = 'newest' | 'oldest' | 'popular';

// Interface for learning state
export interface LearningState {
  filter: LearningFilter;
  timeframe: LearningTimeframe;
  sort: LearningSort;
  search: string;
}

// Default state
const DEFAULT_STATE: LearningState = {
  filter: 'all',
  timeframe: 'all',
  sort: 'newest',
  search: ''
};

/**
 * Hook for managing learning content filtering and sorting state
 */
export function useLearningState() {
  const [state, setState] = useState<LearningState>(DEFAULT_STATE);
  
  // Load state from local storage on initialization
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('learning-state');
      if (savedState) {
        setState(JSON.parse(savedState));
      }
    } catch (error) {
      console.error('Error loading learning state:', error);
    }
  }, []);
  
  // Save state to local storage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('learning-state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving learning state:', error);
    }
  }, [state]);
  
  // Update filter
  const setFilter = useCallback((filter: LearningFilter) => {
    setState(prev => ({ ...prev, filter }));
  }, []);
  
  // Update timeframe
  const setTimeframe = useCallback((timeframe: LearningTimeframe) => {
    setState(prev => ({ ...prev, timeframe }));
  }, []);
  
  // Update sort
  const setSort = useCallback((sort: LearningSort) => {
    setState(prev => ({ ...prev, sort }));
  }, []);
  
  // Update search
  const setSearch = useCallback((search: string) => {
    setState(prev => ({ ...prev, search }));
  }, []);
  
  // Reset all filters
  const resetFilters = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);
  
  return {
    ...state,
    setFilter,
    setTimeframe,
    setSort,
    setSearch,
    resetFilters
  };
}