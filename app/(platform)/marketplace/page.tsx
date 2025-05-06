"use client";

import { useState, useEffect, useCallback } from "react";
import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";
import { BuilderCard } from "@/components/marketplace/builder-card";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Button } from "@/components/ui/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/core/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/core/select";
import { Input } from "@/components/ui/core/input";
import { Checkbox } from "@/components/ui/core/checkbox";
import { Label } from "@/components/ui/core/label";
import { 
  BuilderProfileListing,
  MarketplaceFilters,
  MarketplaceFilterOptions,
  PaginationInfo
} from "@/lib/marketplace/types";
import { fetchBuilders, fetchMarketplaceFilterOptions } from "@/lib/marketplace/api";
import { useDebounce } from "@/hooks/use-debounce";

export default function MarketplacePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [builders, setBuilders] = useState<BuilderProfileListing[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  
  const [filters, setFilters] = useState<MarketplaceFilters>({
    validationTiers: [],
    skills: [],
    availability: [],
    sortBy: "featured"
  });
  
  const [activeFilters, setActiveFilters] = useState<MarketplaceFilters>(filters);
  const [availableFilters, setAvailableFilters] = useState<MarketplaceFilterOptions>({
    skills: [],
    validationTiers: [],
    availability: [],
    sortOptions: []
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch builders and available filters
  const fetchData = useCallback(async (page: number = 1, currentFilters: MarketplaceFilters) => {
    setIsLoading(true);
    try {
      // Fetch available filters if first load
      if (availableFilters.skills.length === 0) {
        try {
          const filtersResponse = await fetchMarketplaceFilterOptions();
          setAvailableFilters(filtersResponse);
        } catch (error) {
          console.error('Error fetching available filters:', error);
        }
      }

      // Fetch builders
      const response = await fetchBuilders(
        page, 
        pagination.limit,
        {
          ...currentFilters,
          searchQuery: debouncedSearchQuery || undefined
        }
      );
      
      setBuilders(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [availableFilters.skills.length, debouncedSearchQuery, pagination.limit]);

  // Initial data load
  useEffect(() => {
    fetchData(1, activeFilters);
  }, [fetchData, activeFilters]);

  // Update search query when debounced value changes
  useEffect(() => {
    const updatedFilters = { ...activeFilters, searchQuery: debouncedSearchQuery || undefined };
    setActiveFilters(updatedFilters);
  }, [debouncedSearchQuery]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const updatedFilters = { ...filters, sortBy: value };
    setFilters(updatedFilters);
  };

  // Handle checkbox changes
  const handleCheckboxChange = (
    filterType: 'validationTiers' | 'skills' | 'availability',
    value: string | number,
    checked: boolean
  ) => {
    const currentValues = filters[filterType] || [];
    let newValues: (string | number)[];
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    setFilters({
      ...filters,
      [filterType]: newValues
    });
  };

  // Apply filters button
  const handleApplyFilters = () => {
    setActiveFilters(filters);
  };

  // Reset filters button
  const handleResetFilters = () => {
    setFilters({
      validationTiers: [],
      skills: [],
      availability: [],
      sortBy: "featured"
    });
    setSearchQuery("");
    setActiveFilters({
      validationTiers: [],
      skills: [],
      availability: [],
      sortBy: "featured"
    });
  };

  // Load more builders
  const handleLoadMore = () => {
    if (pagination.hasMore) {
      fetchData(pagination.page + 1, activeFilters);
    }
  };

  // Quick skeleton loader for builder cards
  const SkeletonBuilderCard = () => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-6 w-14 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="h-9 w-full bg-gray-200 rounded animate-pulse" />
      </CardFooter>
    </Card>
  );

  // Check if any filters are active
  const hasActiveFilters = 
    filters.validationTiers?.length > 0 || 
    filters.skills?.length > 0 || 
    filters.availability?.length > 0 ||
    !!searchQuery;

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Application Builders</h1>
          <p className="text-muted-foreground">
            Find skilled builders to help bring your AI application ideas to life
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search builders..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full md:w-64"
          />
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {availableFilters.sortOptions?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Validation Level</h3>
              <div className="space-y-2">
                {availableFilters.validationTiers?.map((tier) => (
                  <div key={tier.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tier-${tier.value}`}
                      checked={filters.validationTiers?.includes(tier.value)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('validationTiers', tier.value, checked === true)
                      }
                    />
                    <Label htmlFor={`tier-${tier.value}`} className="cursor-pointer">
                      <ValidationTierBadge
                        tier={tier.value === 1 ? "basic" : tier.value === 2 ? "verified" : "expert"}
                        size="sm"
                        showLabel={true}
                      />
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Availability</h3>
              <div className="space-y-2">
                {availableFilters.availability?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`availability-${option.value}`}
                      checked={filters.availability?.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('availability', option.value, checked === true)
                      }
                    />
                    <Label htmlFor={`availability-${option.value}`} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Skills</h3>
              {availableFilters.skills?.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {availableFilters.skills.slice(0, 10).map((skill) => (
                    <div key={skill.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`skill-${skill.value}`}
                        checked={filters.skills?.includes(skill.value)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('skills', skill.value, checked === true)
                        }
                      />
                      <Label htmlFor={`skill-${skill.value}`} className="cursor-pointer">
                        {skill.label}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No skills available yet
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                variant="default"
                onClick={handleApplyFilters}
                disabled={!hasActiveFilters}
              >
                Apply Filters
              </Button>
              <Button 
                className="flex-shrink-0" 
                variant="outline"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {isLoading && builders.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <SkeletonBuilderCard key={i} />
              ))}
            </div>
          ) : builders.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {builders.map((builder) => (
                  <BuilderCard key={builder.id} builder={builder} />
                ))}
              </div>
              
              {pagination.hasMore && (
                <div className="mt-8 text-center">
                  <Button 
                    onClick={handleLoadMore}
                    variant="outline"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Load More Builders"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="w-full p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-muted p-6">
                  <svg
                    className="h-8 w-8 text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <TextAnimate animation="blurIn" className="text-xl font-semibold">No builders found</TextAnimate>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to find builders
                </p>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilters}
                >
                  Reset Filters
                </Button>
                
                <div className="mt-8 pt-8 border-t w-full">
                  <p className="text-muted-foreground mb-4">
                    Interested in becoming a builder?
                  </p>
                  <Button onClick={() => window.location.href = "/profile"}>
                    Create Your Builder Profile
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}