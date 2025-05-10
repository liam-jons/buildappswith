"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/core/input';
import { Button } from '@/components/ui/core/button';
import { Badge } from '@/components/ui/core/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/core/card';
import { MarketplaceErrorBoundary } from '@/components/marketplace/components/error-boundaries';
import { useBuilderFilter } from '@/components/marketplace/hooks';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  className?: string;
}

/**
 * FilterPanel component
 * 
 * Provides UI for filtering marketplace builders with search and filter options
 */
export function FilterPanel({ className }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    filters, 
    filterOptions, 
    isLoading, 
    updateFilters, 
    clearFilters,
    toggleFilter
  } = useBuilderFilter();
  
  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ searchQuery: e.target.value });
  };
  
  // Handle skill selection
  const handleSkillToggle = (skillValue: string) => {
    const currentSkills = filters.skills || [];
    const newSkills = currentSkills.includes(skillValue)
      ? currentSkills.filter(s => s !== skillValue)
      : [...currentSkills, skillValue];
    
    updateFilters({ skills: newSkills });
  };
  
  // Handle availability filter
  const handleAvailabilityToggle = (availability: string) => {
    const currentAvailability = filters.availability || [];
    const newAvailability = currentAvailability.includes(availability)
      ? currentAvailability.filter(a => a !== availability)
      : [...currentAvailability, availability];
    
    updateFilters({ availability: newAvailability });
  };
  
  // Handle validation tier selection
  const handleTierToggle = (tier: number) => {
    const currentTiers = filters.validationTiers || [];
    const newTiers = currentTiers.includes(tier)
      ? currentTiers.filter(t => t !== tier)
      : [...currentTiers, tier];
    
    updateFilters({ validationTiers: newTiers });
  };
  
  // Check if any filters are applied
  const hasActiveFilters = Boolean(
    (filters.searchQuery && filters.searchQuery.length > 0) ||
    (filters.skills && filters.skills.length > 0) ||
    (filters.validationTiers && filters.validationTiers.length > 0) ||
    (filters.availability && filters.availability.length > 0)
  );
  
  return (
    <MarketplaceErrorBoundary componentName="FilterPanel">
      <Card className={cn("bg-card border", className)}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Filters</CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="md:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={cn(
          isOpen ? 'block' : 'hidden md:block'
        )}>
          <div className="space-y-4">
            {/* Search input */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Search</h3>
              <Input
                placeholder="Search builders..."
                value={filters.searchQuery || ''}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            
            {/* Skills filter */}
            {filterOptions.skills && filterOptions.skills.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.skills.slice(0, 10).map((skill) => (
                    <Badge
                      key={skill.value}
                      variant={(filters.skills || []).includes(skill.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleSkillToggle(skill.value)}
                    >
                      {skill.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Availability filter */}
            {filterOptions.availability && filterOptions.availability.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Availability</h3>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.availability.map((option) => (
                    <Badge
                      key={option.value}
                      variant={(filters.availability || []).includes(option.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleAvailabilityToggle(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Validation tier filter */}
            {filterOptions.validationTiers && filterOptions.validationTiers.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Verification Level</h3>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.validationTiers.map((tier) => (
                    <Badge
                      key={tier.value}
                      variant={(filters.validationTiers || []).includes(tier.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTierToggle(tier.value as number)}
                    >
                      {tier.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MarketplaceErrorBoundary>
  );
}