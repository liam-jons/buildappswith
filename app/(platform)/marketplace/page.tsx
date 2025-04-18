"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ValidationTierBadge } from "@/components/profile/validation-tier-badge";
import { motion } from "framer-motion";
import { TextShimmer } from "@/components/magicui/text-shimmer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function MarketplacePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [builders, setBuilders] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({
    validationTiers: [],
    skills: [],
    availability: []
  });
  const [availableFilters, setAvailableFilters] = useState<any>({
    skills: [],
    validationTiers: [],
    availability: [],
    sortOptions: []
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  // Fetch builders and available filters
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch available filters
        const filtersResponse = await fetch("/api/marketplace/filters");
        if (filtersResponse.ok) {
          const filtersData = await filtersResponse.json();
          setAvailableFilters(filtersData);
        }

        // Fetch builders
        const buildersResponse = await fetch("/api/marketplace/builders?page=1&limit=9&sortBy=rating");
        if (buildersResponse.ok) {
          const buildersData = await buildersResponse.json();
          setBuilders(buildersData.data || []);
        }
      } catch (error) {
        console.error("Error fetching marketplace data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
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
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {availableFilters.sortOptions.map((option: any) => (
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
                {availableFilters.validationTiers.map((tier: any) => (
                  <div key={tier.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tier-${tier.value}`}
                      checked={filters.validationTiers.includes(tier.value)}
                    />
                    <Label htmlFor={`tier-${tier.value}`} className="cursor-pointer">
                      <ValidationTierBadge
                        tier={tier.value as any}
                        size="sm"
                        showTooltip={false}
                      />
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Availability</h3>
              <div className="space-y-2">
                {availableFilters.availability.map((option: any) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`availability-${option.value}`}
                      checked={filters.availability.includes(option.value)}
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
              {availableFilters.skills.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {availableFilters.skills.slice(0, 10).map((skill: any) => (
                    <div key={skill.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`skill-${skill.value}`}
                        checked={filters.skills.includes(skill.value)}
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

            <Button className="w-full" variant="outline">
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <SkeletonBuilderCard key={i} />
              ))}
            </div>
          ) : builders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {builders.map((builder) => (
                <BuilderCard key={builder.id} builder={builder} />
              ))}
            </div>
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
                <TextShimmer className="text-xl font-semibold">No builders found</TextShimmer>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to find builders
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({
                      validationTiers: [],
                      skills: [],
                      availability: []
                    });
                  }}
                >
                  Reset Filters
                </Button>
                
                <div className="mt-8 pt-8 border-t w-full">
                  <p className="text-muted-foreground mb-4">
                    Interested in becoming a builder?
                  </p>
                  <Button>Create Your Builder Profile</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Builder Card Component
function BuilderCard({ builder }: { builder: any }) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          <div className="relative h-16 w-16 rounded-full border border-muted overflow-hidden bg-muted">
            {builder.avatarUrl ? (
              <Image
                src={builder.avatarUrl}
                alt={builder.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                <span className="text-xl font-semibold text-primary">
                  {builder.name?.charAt(0) || "B"}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-semibold mr-2">{builder.name}</h3>
              <ValidationTierBadge tier={builder.validationTier} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">{builder.title}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3 mb-3">
          {builder.bio || "This builder hasn't added a bio yet."}
        </p>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {builder.skills?.slice(0, 5).map((skill: string) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-muted text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
          {(builder.skills?.length || 0) > 5 && (
            <span className="px-2 py-0.5 bg-muted text-xs rounded-full">
              +{builder.skills.length - 5} more
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="default" className="w-full">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
