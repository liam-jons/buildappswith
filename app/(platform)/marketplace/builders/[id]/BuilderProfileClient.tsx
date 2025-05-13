"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";
import { Button } from "@/components/ui/core/button";
import { Card, CardContent, CardHeader } from "@/components/ui/core/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/core/tabs";
import { CalendarIcon, Clock, User } from "lucide-react";
import Link from "next/link";

interface BuilderProfile {
  id: string;
  userId: string;
  name: string;
  displayName?: string;
  headline?: string;
  bio?: string;
  tagline?: string;
  avatarUrl?: string | null;
  validationTier: number;
  skills: string[];
  topSkills?: string[];
  hourlyRate?: number;
  rating?: number;
  featured?: boolean;
  availability?: string;
  adhd_focus?: boolean;
  completedProjects?: number;
  responseRate?: number;
  portfolioItems?: any[];
  socialLinks?: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  sessionTypes?: Array<{
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    price: number;
    currency: string;
    isActive: boolean;
  }>;
}

export function BuilderProfileClient({ builderId }: { builderId: string }) {
  const [builder, setBuilder] = useState<BuilderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuilder = async () => {
      try {
        // For the MVP, we'll use a direct API call
        // In a real implementation, we would use SWR or React Query
        const response = await fetch(`/api/marketplace/builders/${builderId}`);

        if (response.ok) {
          const data = await response.json();

          // The API returns { success: true, data: builderData }
          // We need to extract the builder data from the response
          if (data.success && data.data) {
            setBuilder(data.data);
          } else {
            console.error("API response missing builder data", data);
            // Set builder to null if no valid data
            setBuilder(null);
          }
        } else {
          console.error("Failed to fetch builder profile");
          setBuilder(null);
        }
      } catch (error) {
        console.error("Error fetching builder:", error);
        setBuilder(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuilder();
  }, [builderId]);

  // Display loading state
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="animate-pulse">
          <div className="flex items-center space-x-6">
            <div className="rounded-full bg-gray-200 h-24 w-24"></div>
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Display a message if the builder wasn't found
  if (!builder) {
    return (
      <div className="container max-w-4xl py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Builder Not Found</h1>
        <p className="mb-6">The builder profile you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/marketplace">
          <Button>Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  // Render the builder profile when data is available
  return (
    <div className="container max-w-4xl py-12">
      {/* Builder Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        {/* Avatar */}
        <div className="relative h-24 w-24 rounded-full border-2 border-muted overflow-hidden bg-muted">
          {builder.avatarUrl ? (
            <Image
              src={builder.avatarUrl}
              alt={builder.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
              <span className="text-2xl font-semibold text-primary">
                {builder.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        {/* Builder Info */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">{builder.displayName || builder.name || "Unknown Builder"}</h1>
            <ValidationTierBadge tier={builder.validationTier === 1 ? 'basic' : builder.validationTier === 2 ? 'verified' : 'expert'} />
          </div>
          <p className="text-lg text-muted-foreground">{builder.headline || builder.tagline || ""}</p>
          
          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {builder.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-muted text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Profile Content */}
      <Tabs defaultValue="about" className="mt-8">
        <TabsList className="mb-6">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="sessions">Book a Session</TabsTrigger>
        </TabsList>
        
        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Bio</h2>
            </CardHeader>
            <CardContent>
              <p>{builder.bio}</p>
            </CardContent>
          </Card>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hourly Rate</p>
                    <p className="font-medium">${builder.hourlyRate || '120'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                    <Clock className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                    <p className="font-medium">Within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2">
                    <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                    <p className="font-medium">Next week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Social Links */}
          {builder.socialLinks && Object.values(builder.socialLinks).some(link => !!link) && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Connect</h2>
              </CardHeader>
              <CardContent className="flex gap-4">
                {builder.socialLinks.website && (
                  <a 
                    href={builder.socialLinks.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Website
                  </a>
                )}
                {builder.socialLinks.linkedin && (
                  <a 
                    href={builder.socialLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
                {builder.socialLinks.github && (
                  <a 
                    href={builder.socialLinks.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    GitHub
                  </a>
                )}
                {builder.socialLinks.twitter && (
                  <a 
                    href={builder.socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Twitter
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          {builder.portfolioItems && builder.portfolioItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {builder.portfolioItems.map((item: any, index: number) => (
                <Card key={index} className="overflow-hidden">
                  {item.imageUrl && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    {item.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-muted text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.demoUrl && (
                      <a
                        href={item.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Project
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-2">No portfolio items available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Book a Session</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Ready to start working with {builder.name}? Book a session to discuss your project needs.
              </p>
              <div className="mt-4">
                <Link href={`/book/${builder.id}`}>
                  <Button>View Available Sessions</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
