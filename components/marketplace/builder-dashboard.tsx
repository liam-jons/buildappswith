"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/core/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/core/card";
import { Input } from "@/components/ui/core/input";
import { Label } from "@/components/ui/core/label";
import { Textarea } from "@/components/ui/core/textarea";
import { Switch } from "@/components/ui/core/switch";
import { ProfileStats } from "@/components/profile/ui/profile-stats";
import { SuccessMetricsDashboard, MetricIcons } from "@/components/profile/success-metrics-dashboard";
// Temporarily comment out until scheduling service is implemented
// import { SessionTypeEditor } from "@/components/scheduling/builder/session-type-editor";
// Temporarily comment out until scheduling service is implemented
// import { AvailabilityManagement } from "@/components/scheduling/builder/availability/availability-management";
import { Button } from "@/components/ui/core/button";
import { PlusCircle, BarChart, Calendar, Settings, User, Clock, X, Plus } from "lucide-react";
import { TextShimmer } from "@/components/magicui/text-shimmer";
import { fetchBuilderById } from "@/lib/marketplace/api";
import { BuilderProfileData } from "@/lib/marketplace/types";
import { toast } from "sonner";

interface BuilderDashboardProps {
  roles: string[];
}

export function BuilderDashboard({ roles }: BuilderDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [builderProfile, setBuilderProfile] = useState<BuilderProfileData | null>(null);

  // Fetch builder profile data
  useEffect(() => {
    const fetchBuilderData = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, you'd fetch the current builder's ID from context or auth state
        // For now, we'll use a mock ID for demonstration
        const builderId = "current-builder"; // This would come from auth context
        
        // This would fetch the actual builder profile from the API
        const profile = await fetchBuilderById(builderId).catch(() => null);
        
        // If profile fetch fails, create a mock profile for demo purposes
        if (!profile) {
          setBuilderProfile({
            id: "mock-builder-id",
            userId: "mock-user-id",
            name: "Demo Builder",
            displayName: "Demo Builder",
            bio: "This is a demo builder profile for the dashboard.",
            headline: "AI Application Expert",
            tagline: "Building the future with AI",
            validationTier: 2,
            skills: ["React", "Next.js", "TypeScript", "AI", "UI/UX"],
            topSkills: ["AI", "React", "TypeScript"],
            hourlyRate: 125,
            rating: 4.8,
            featured: true,
            availability: "available",
            completedProjects: 24,
            responseRate: 98,
            adhd_focus: true,
            domains: ["Web Development", "AI Integration"],
            badges: ["Top Performer", "Fast Response"],
            portfolioItems: [],
            sessionTypes: [
              {
                id: "session-1",
                title: "AI Strategy Consultation",
                description: "A focused session to strategize your AI implementation.",
                durationMinutes: 60,
                price: 150,
                currency: "USD",
                isActive: true,
                color: "#4CAF50"
              },
              {
                id: "session-2",
                title: "Implementation Support",
                description: "Hands-on support for implementing AI solutions.",
                durationMinutes: 90,
                price: 200,
                currency: "USD",
                isActive: true,
                color: "#2196F3"
              }
            ],
            apps: [],
            expertiseAreas: {
              aiImplementation: 5,
              uiDesign: 4,
              productStrategy: 4
            },
            socialLinks: {
              website: "https://example.com",
              github: "https://github.com",
              linkedin: "https://linkedin.com"
            }
          });
          
          toast.info("Using demo data for the builder dashboard");
        } else {
          setBuilderProfile(profile);
        }
      } catch (error) {
        console.error("Error fetching builder profile:", error);
        toast.error("Failed to load your profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuilderData();
  }, []);

  // Session types will be handled when scheduling service is available

  // Session types update will be implemented when scheduling service is available

  // Data for profile stats
  const profileStats = [
    {
      label: "Profile Views",
      value: 182,
      change: 12,
      icon: <BarChart className="h-4 w-4 text-muted-foreground" />
    },
    {
      label: "Search Appearances",
      value: 524,
      change: 8,
      icon: <BarChart className="h-4 w-4 text-muted-foreground" />
    },
    {
      label: "Booking Requests",
      value: 28,
      change: 20,
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />
    },
    {
      label: "Conversion Rate",
      value: 5.4,
      change: 2,
      icon: <BarChart className="h-4 w-4 text-muted-foreground" />
    }
  ];

  // Data for success metrics
  const successMetrics = [
    {
      id: "impact",
      name: "Client Impact",
      icon: MetricIcons.Impact,
      metrics: [
        {
          label: "Time Saved for Clients",
          value: "245+ hours",
          description: "Total time saved across all client projects",
          trend: "up",
          isHighlighted: true
        },
        {
          label: "Efficiency Improvements",
          value: "32%",
          description: "Average improvement in client workflow efficiency",
          trend: "up"
        },
        {
          label: "Decision Quality",
          value: "27%",
          description: "Average improvement in decision quality",
          trend: "up"
        }
      ]
    },
    {
      id: "performance",
      name: "Builder Performance",
      icon: MetricIcons.Performance,
      metrics: [
        {
          label: "Client Satisfaction",
          value: "4.8/5.0",
          description: "Average rating from client feedback",
          trend: "up"
        },
        {
          label: "On-Time Delivery",
          value: "97%",
          description: "Percentage of projects delivered on schedule",
          trend: "neutral"
        },
        {
          label: "Return Clients",
          value: "78%",
          description: "Percentage of clients who book multiple sessions",
          trend: "up"
        }
      ]
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-6 w-40 bg-muted rounded animate-pulse"></div>
            </CardTitle>
            <CardDescription>
              <div className="h-4 w-60 bg-muted rounded animate-pulse"></div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 w-20 bg-muted rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-6 w-16 bg-muted rounded mb-2"></div>
                    <div className="h-4 w-24 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            <TextShimmer>Welcome back, {builderProfile?.displayName || builderProfile?.name}</TextShimmer>
          </h2>
          <p className="text-muted-foreground">
            Manage your profile, bookings, and performance metrics from your dashboard.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden md:flex">
            <User className="mr-2 h-4 w-4" />
            View Public Profile
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline-block">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline-block">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline-block">Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline-block">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <ProfileStats stats={profileStats} />
          
          {/* Success Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Success Metrics</CardTitle>
              <CardDescription>
                Verified outcomes and performance indicators from your client work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SuccessMetricsDashboard 
                validationTier={builderProfile?.validationTier === 3 ? "expert" : (builderProfile?.validationTier === 2 ? "established" : "entry")} 
                metrics={successMetrics}
              />
            </CardContent>
          </Card>
          
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Booking Requests</CardTitle>
              <CardDescription>
                Your most recent booking requests and upcoming sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">No recent booking requests</p>
                <Button variant="link" className="mt-2">
                  View all bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName" 
                      placeholder="Your professional name" 
                      defaultValue={builderProfile?.displayName || builderProfile?.name || ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input 
                      id="headline" 
                      placeholder="A short headline describing your expertise" 
                      defaultValue={builderProfile?.headline || ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input 
                      id="tagline" 
                      placeholder="A brief tagline for your profile" 
                      defaultValue={builderProfile?.tagline || ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input 
                      id="hourlyRate" 
                      type="number" 
                      min="0" 
                      step="5"
                      defaultValue={builderProfile?.hourlyRate?.toString() || ''}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Tell potential clients about your experience and expertise" 
                      rows={5}
                      defaultValue={builderProfile?.bio || ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>ADHD Focus</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="adhd_focus" 
                        defaultChecked={builderProfile?.adhd_focus} 
                      />
                      <Label htmlFor="adhd_focus">Specialize in ADHD productivity solutions</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="searchable" 
                        defaultChecked={true}
                      />
                      <Label htmlFor="searchable">Visible in marketplace search results</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button className="w-full sm:w-auto">
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Skills and Expertise */}
          <Card>
            <CardHeader>
              <CardTitle>Skills and Expertise</CardTitle>
              <CardDescription>
                Highlight your key skills and areas of expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Your Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {builderProfile?.skills?.map((skill, index) => (
                      <div key={index} className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1">
                        <span>{skill}</span>
                        <button className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button className="flex items-center rounded-full border border-dashed px-3 py-1 text-sm text-muted-foreground hover:border-primary hover:text-primary">
                      <Plus className="mr-1 h-3 w-3" />
                      Add Skill
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Top Skills (shown first)</Label>
                  <div className="flex flex-wrap gap-2">
                    {builderProfile?.topSkills?.map((skill, index) => (
                      <div key={index} className="flex items-center bg-primary text-primary-foreground rounded-full px-3 py-1">
                        <span>{skill}</span>
                        <button className="ml-2 text-primary-foreground/70 hover:text-primary-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button className="flex items-center rounded-full border border-dashed px-3 py-1 text-sm text-muted-foreground hover:border-primary hover:text-primary">
                      <Plus className="mr-1 h-3 w-3" />
                      Add Top Skill
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Domains</Label>
                  <div className="flex flex-wrap gap-2">
                    {builderProfile?.domains?.map((domain, index) => (
                      <div key={index} className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1">
                        <span>{domain}</span>
                        <button className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button className="flex items-center rounded-full border border-dashed px-3 py-1 text-sm text-muted-foreground hover:border-primary hover:text-primary">
                      <Plus className="mr-1 h-3 w-3" />
                      Add Domain
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button className="w-full sm:w-auto">
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Connect your online profiles and website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    placeholder="https://yourwebsite.com" 
                    defaultValue={builderProfile?.socialLinks?.website || ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input 
                    id="linkedin" 
                    placeholder="https://linkedin.com/in/yourprofile" 
                    defaultValue={builderProfile?.socialLinks?.linkedin || ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input 
                    id="github" 
                    placeholder="https://github.com/yourusername" 
                    defaultValue={builderProfile?.socialLinks?.github || ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input 
                    id="twitter" 
                    placeholder="https://twitter.com/yourusername" 
                    defaultValue={builderProfile?.socialLinks?.twitter || ''}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button className="w-full sm:w-auto">
                  Update Social Links
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Session Types */}
          <Card>
            <CardHeader>
              <CardTitle>Session Types</CardTitle>
              <CardDescription>
                Configure the types of sessions clients can book with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">Session types will be available soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You'll be able to create and manage different types of sessions here
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Availability Management */}
          <Card>
            <CardHeader>
              <CardTitle>Availability Management</CardTitle>
              <CardDescription>
                Configure your weekly schedule and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">Availability management will be available soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You'll be able to set your weekly schedule and availability preferences here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          {/* Booking Requests Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Booking Requests</CardTitle>
                <CardDescription>
                  Pending requests that need your confirmation
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="bg-muted/30 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                  <Clock className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="mt-2 text-muted-foreground">No pending booking requests</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Client booking requests will appear here for your approval
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  Your confirmed upcoming sessions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <select className="border rounded-md px-2 py-1 text-sm">
                  <option value="day">Day</option>
                  <option value="week" selected>Week</option>
                  <option value="month">Month</option>
                </select>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar View
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Example of what an upcoming session would look like */}
                <div className="hidden border rounded-md p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-medium">AI Strategy Consultation</h4>
                      <div className="text-sm text-muted-foreground mt-1">
                        Tomorrow, 2:00 PM - 3:00 PM (Your time)
                      </div>
                      <div className="text-sm mt-2">
                        <span className="font-medium">Client:</span> Jane Smith
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button variant="default" size="sm">
                        Join
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Default empty state */}
                <div className="text-center py-8">
                  <div className="bg-muted/30 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="mt-2 text-muted-foreground">No upcoming sessions</p>
                  <Button variant="link" className="mt-2">
                    View your availability
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Booking History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>
                  Your past sessions and client interactions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Table for booking history */}
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left text-sm font-medium">Session Type</th>
                      <th className="py-3 px-4 text-left text-sm font-medium">Client</th>
                      <th className="py-3 px-4 text-left text-sm font-medium">Date</th>
                      <th className="py-3 px-4 text-left text-sm font-medium">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Would normally map over booking history here */}
                    <tr className="border-b">
                      <td className="py-3 px-4 text-sm" colSpan={5}>
                        <div className="text-center py-4">
                          <Clock className="h-5 w-5 mx-auto text-muted-foreground/50" />
                          <p className="mt-2 text-sm text-muted-foreground">No past sessions</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Feedback and Testimonials */}
          <Card>
            <CardHeader>
              <CardTitle>Client Feedback</CardTitle>
              <CardDescription>
                Ratings and testimonials from your clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="bg-muted/30 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                  <div className="text-muted-foreground/50">★</div>
                </div>
                <p className="mt-2 text-muted-foreground">No feedback received yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Client ratings and testimonials will appear here after completed sessions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-base font-medium">Email Address</h3>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="email" 
                      placeholder="your.email@example.com" 
                      defaultValue="demo@buildappswith.com"
                      className="max-w-md"
                      disabled
                    />
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is the email address used for account login and notifications
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-base font-medium">Password</h3>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="password" 
                      placeholder="••••••••••••" 
                      value="••••••••••••"
                      className="max-w-md"
                      disabled
                    />
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your password should be at least 12 characters and include a mix of letters, numbers and symbols
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-base font-medium mb-4">Connected Accounts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between max-w-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          G
                        </div>
                        <div>
                          <p className="text-sm font-medium">Google</p>
                          <p className="text-xs text-muted-foreground">Calendar integration</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between max-w-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          Z
                        </div>
                        <div>
                          <p className="text-sm font-medium">Zoom</p>
                          <p className="text-xs text-muted-foreground">Video conferencing</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive updates and booking notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-base font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="notify-bookings" className="text-sm font-medium">Booking Requests</Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified when a client requests a booking
                      </p>
                    </div>
                    <Switch
                      id="notify-bookings"
                      defaultChecked={true}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="notify-reminders" className="text-sm font-medium">Session Reminders</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive reminders about upcoming sessions
                      </p>
                    </div>
                    <Switch
                      id="notify-reminders"
                      defaultChecked={true}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="notify-messages" className="text-sm font-medium">Client Messages</Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified about new messages from clients
                      </p>
                    </div>
                    <Switch
                      id="notify-messages"
                      defaultChecked={true}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="notify-marketing" className="text-sm font-medium">Platform Updates</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive news and updates about platform features
                      </p>
                    </div>
                    <Switch
                      id="notify-marketing"
                      defaultChecked={false}
                    />
                  </div>
                </div>
                
                <h3 className="text-base font-medium pt-4 border-t mt-6">Text Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="sms-bookings" className="text-sm font-medium">Booking Requests</Label>
                      <p className="text-xs text-muted-foreground">
                        Get SMS alerts when a client requests a booking
                      </p>
                    </div>
                    <Switch
                      id="sms-bookings"
                      defaultChecked={false}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <Label htmlFor="sms-reminders" className="text-sm font-medium">Session Reminders</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive SMS reminders about upcoming sessions
                      </p>
                    </div>
                    <Switch
                      id="sms-reminders"
                      defaultChecked={false}
                    />
                  </div>
                </div>
                
                <div className="pt-4 mt-6 flex justify-end">
                  <Button className="w-full sm:w-auto">
                    Save Preferences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Marketplace Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Visibility</CardTitle>
              <CardDescription>
                Control your profile visibility and marketplace settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="profile-visibility" className="text-base font-medium">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible in marketplace searches
                    </p>
                  </div>
                  <Switch
                    id="profile-visibility"
                    defaultChecked={true}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="feature-eligibility" className="text-base font-medium">Featured Builder Eligibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Opt in to be considered for featured builder promotions
                    </p>
                  </div>
                  <Switch
                    id="feature-eligibility"
                    defaultChecked={true}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="direct-messages" className="text-base font-medium">Direct Message Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow clients to send you direct messages before booking
                    </p>
                  </div>
                  <Switch
                    id="direct-messages"
                    defaultChecked={true}
                  />
                </div>
                
                <div className="pt-4 mt-6 flex justify-end">
                  <Button className="w-full sm:w-auto">
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}