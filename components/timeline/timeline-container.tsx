'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TimelineFilters, Domain } from '@/lib/timeline/types';
import { fetchCapabilities, getAvailableDomains, getTimelineRange } from '@/lib/timeline/data-service';
import { TimelineTrack } from './timeline-track';
import { TimelineFiltersBar } from './timeline-filters-bar';
import { TimelineLoading } from './timeline-loading';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';

/**
 * TimelineContainer Component
 * 
 * This component manages the state and behavior of the timeline,
 * including filtering, infinite scrolling, and accessibility features.
 */
export function TimelineContainer() {
  const shouldReduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [availableDomains, setAvailableDomains] = useState<Domain[]>([]);
  const [timelineRange, setTimelineRange] = useState({ start: '', end: '' });
  
  // Set up filters with defaults
  const [filters, setFilters] = useState<TimelineFilters>({
    domains: [],
    showModelImprovements: true,
  });
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCapabilityRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreCapabilities();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);
  
  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get available domains for filters
        const domains = await getAvailableDomains();
        setAvailableDomains(domains);
        
        // Get timeline date range
        const range = await getTimelineRange();
        setTimelineRange(range);
        
        // Fetch initial capabilities
        const result = await fetchCapabilities(1, 5);
        setCapabilities(result.data);
        setHasMore(result.pagination.hasMore);
        
      } catch (err) {
        setError('Failed to load timeline data. Please try again later.');
        console.error('Error fetching timeline data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Handle filter changes
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Reset pagination when filters change
        setPage(1);
        
        const result = await fetchCapabilities(1, 5, {
          domains: filters.domains,
          showModelImprovements: filters.showModelImprovements,
          dateRange: filters.dateRange
        });
        
        setCapabilities(result.data);
        setHasMore(result.pagination.hasMore);
        
      } catch (err) {
        setError('Failed to apply filters. Please try again later.');
        console.error('Error applying filters:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    applyFilters();
  }, [filters]);
  
  // Load more capabilities
  const loadMoreCapabilities = async () => {
    if (!hasMore || isLoading) return;
    
    try {
      setIsLoading(true);
      const nextPage = page + 1;
      
      const result = await fetchCapabilities(nextPage, 5, {
        domains: filters.domains,
        showModelImprovements: filters.showModelImprovements,
        dateRange: filters.dateRange
      });
      
      setCapabilities(prev => [...prev, ...result.data]);
      setPage(nextPage);
      setHasMore(result.pagination.hasMore);
      
    } catch (err) {
      setError('Failed to load more capabilities. Please try again later.');
      console.error('Error loading more capabilities:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<TimelineFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  return (
    <div className="timeline-container space-y-8">
      {/* Filters Bar */}
      <TimelineFiltersBar 
        filters={filters}
        availableDomains={availableDomains}
        timelineRange={timelineRange}
        onFilterChange={handleFilterChange}
      />
      
      {/* Timeline Content */}
      {error ? (
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setError(null);
              setPage(1);
              setCapabilities([]);
              fetchCapabilities(1, 5).then(result => {
                setCapabilities(result.data);
                setHasMore(result.pagination.hasMore);
              }).catch(err => {
                setError('Failed to reload timeline data.');
                console.error(err);
              });
            }}
          >
            Try Again
          </Button>
        </div>
      ) : capabilities.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative"
        >
          <TimelineTrack 
            capabilities={capabilities} 
            lastItemRef={lastCapabilityRef} 
          />
          
          {isLoading && <TimelineLoading />}
          
          {!hasMore && (
            <div className="text-center py-8 text-muted-foreground">
              You&apos;ve reached the end of the timeline.
            </div>
          )}
        </motion.div>
      ) : isLoading ? (
        <TimelineLoading />
      ) : (
        <div className="p-8 text-center bg-muted rounded-lg">
          <p className="text-muted-foreground">No capabilities match your current filters.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setFilters({
              domains: [],
              showModelImprovements: true
            })}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
