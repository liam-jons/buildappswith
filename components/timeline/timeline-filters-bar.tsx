'use client';

import { Domain, TimelineFilters } from '@/lib/timeline/types';
import { useState } from 'react';
import { Check, ChevronDown, Filter, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TimelineFiltersBarProps {
  filters: TimelineFilters;
  availableDomains: Domain[];
  timelineRange: { start: string; end: string };
  onFilterChange: (filters: Partial<TimelineFilters>) => void;
}

/**
 * TimelineFiltersBar Component
 * 
 * Provides UI controls for filtering timeline capabilities by domain,
 * showing/hiding model improvements, and optionally by date range.
 */
export function TimelineFiltersBar({
  filters,
  availableDomains,
  timelineRange,
  onFilterChange
}: TimelineFiltersBarProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Check if any filters are active
  const hasActiveFilters = 
    filters.domains.length > 0 || 
    !filters.showModelImprovements || 
    (filters.dateRange !== undefined);
  
  // Map domains to display names
  const domainDisplayNames: Record<Domain, string> = {
    'business': 'Business',
    'education': 'Education',
    'creative': 'Creative',
    'healthcare': 'Healthcare',
    'finance': 'Finance',
    'science': 'Science',
    'general': 'General'
  };
  
  // Toggle a domain filter
  const toggleDomain = (domain: Domain) => {
    const updatedDomains = filters.domains.includes(domain)
      ? filters.domains.filter(d => d !== domain)
      : [...filters.domains, domain];
    
    onFilterChange({ domains: updatedDomains });
  };
  
  // Toggle model improvements filter
  const toggleModelImprovements = () => {
    onFilterChange({ showModelImprovements: !filters.showModelImprovements });
  };
  
  // Clear all filters
  const clearFilters = () => {
    onFilterChange({
      domains: [],
      showModelImprovements: true,
      dateRange: undefined
    });
  };
  
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <h2 className="text-sm font-medium mr-2">Timeline Filters</h2>
            
            {/* Active filter badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1.5 items-center">
                {filters.domains.map(domain => (
                  <Badge 
                    key={domain} 
                    variant="outline"
                    className="bg-primary/10 text-primary text-xs rounded-full px-2"
                  >
                    {domainDisplayNames[domain]}
                    <button 
                      onClick={() => toggleDomain(domain)}
                      className="ml-1 text-primary/70 hover:text-primary"
                      aria-label={`Remove ${domainDisplayNames[domain]} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                
                {!filters.showModelImprovements && (
                  <Badge 
                    variant="outline"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs rounded-full px-2"
                  >
                    Hide Model Releases
                    <button 
                      onClick={toggleModelImprovements}
                      className="ml-1 text-amber-500 hover:text-amber-700 dark:hover:text-amber-200"
                      aria-label="Show model releases"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
          
          {/* Filter controls */}
          <div className="flex items-center gap-2">
            <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "h-8 gap-1 text-sm",
                    hasActiveFilters && "border-primary text-primary"
                  )}
                >
                  <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                  Filters
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  {/* Domain filters */}
                  <div>
                    <h3 className="font-medium mb-2 text-sm">Domains</h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      {availableDomains.map(domain => (
                        <Button
                          key={domain}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "justify-start h-7 px-2.5 text-xs", 
                            filters.domains.includes(domain) 
                              ? "bg-primary/10 text-primary border-primary/30" 
                              : "bg-transparent"
                          )}
                          onClick={() => toggleDomain(domain)}
                        >
                          <span className={cn(
                            "w-3.5 h-3.5 mr-1.5 rounded-full flex items-center justify-center",
                            filters.domains.includes(domain) 
                              ? "bg-primary text-primary-foreground" 
                              : "border border-muted-foreground/30"
                          )}>
                            {filters.domains.includes(domain) && (
                              <Check className="h-2.5 w-2.5" />
                            )}
                          </span>
                          {domainDisplayNames[domain]}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="h-px bg-border" />
                  
                  {/* Model improvements toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="model-improvements" className="flex items-center gap-1.5 cursor-pointer text-sm">
                      <span className="w-2.5 h-2.5 rounded-full inline-block bg-amber-500" aria-hidden="true" />
                      Show Model Releases
                    </Label>
                    <Switch
                      id="model-improvements"
                      checked={filters.showModelImprovements}
                      onCheckedChange={toggleModelImprovements}
                    />
                  </div>
                  
                  {/* Date range filters could be added here */}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
