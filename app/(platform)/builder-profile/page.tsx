"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// UI Components
import { BuilderProfile, BuilderProfileData } from "@/components/profile/builder-profile";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ValidationTierBadge } from "@/components/profile/validation-tier-badge";
import { Skeleton } from "@/components/ui/skeleton";

// Helper for form data conversion
import { formValuesToProfileUpdates } from "@/lib/utils/profile-form-helpers";

export default function BuilderProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<BuilderProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // When the page loads, check if the user already has a builder profile
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/signin");
      return;
    }
    
    // Check if the user has a builder profile
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profiles/builder");
        
        if (response.ok) {
          const data = await response.json();
          
          // Transform the data to match BuilderProfileData
          setProfile({
            id: data.id,
            name: data.user.name || "Your Name",
            title: data.headline || "Professional Title",
            bio: data.bio || "Tell clients about yourself and your expertise...",
            avatarUrl: data.user.image,
            validationTier: data.validationTier === 1 ? "entry" : 
                          data.validationTier === 2 ? "established" : "expert",
            joinDate: new Date(data.createdAt),
            completedProjects: 0, // This would come from actual completed projects
            rating: data.rating || 0,
            responseRate: 0.95, // This would come from actual messaging data
            skills: data.skills?.map((s: any) => s.skill.name) || [],
            availability: {
              status: data.availableForHire ? "available" : "unavailable"
            },
            portfolio: data.portfolioItems || [],
            socialLinks: data.socialLinks || {}
          });
        } else if (response.status === 404) {
          // User doesn't have a profile yet - show creation form
          setProfile(null);
          setIsEditing(true);
        } else {
          throw new Error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load builder profile");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProfile();
  }, [session, status, router]);
  
  const handleCreateProfile = async (formData: any) => {
    setIsSaving(true);
    
    try {
      const profileData = formValuesToProfileUpdates(formData);
      
      const response = await fetch("/api/profiles/builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create profile");
      }
      
      const data = await response.json();
      toast.success("Profile created successfully!");
      
      // Refresh the page to show the new profile
      router.refresh();
      
      // Fetch the updated profile
      const profileResponse = await fetch("/api/profiles/builder");
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        
        // Transform the data to match BuilderProfileData
        setProfile({
          id: profileData.id,
          name: profileData.user.name || "Your Name",
          title: profileData.headline || "Professional Title",
          bio: profileData.bio || "Tell clients about yourself and your expertise...",
          avatarUrl: profileData.user.image,
          validationTier: profileData.validationTier === 1 ? "entry" : 
                        profileData.validationTier === 2 ? "established" : "expert",
          joinDate: new Date(profileData.createdAt),
          completedProjects: 0,
          rating: profileData.rating || 0,
          responseRate: 0.95,
          skills: profileData.skills?.map((s: any) => s.skill.name) || [],
          availability: {
            status: profileData.availableForHire ? "available" : "unavailable"
          },
          portfolio: profileData.portfolioItems || [],
          socialLinks: profileData.socialLinks || {}
        });
        
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUpdateProfile = async (formData: any) => {
    setIsSaving(true);
    
    try {
      const profileData = formValuesToProfileUpdates(formData);
      
      const response = await fetch("/api/profiles/builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      toast.success("Profile updated successfully!");
      
      // Refresh profile data
      const profileResponse = await fetch("/api/profiles/builder");
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        
        // Transform and update profile state
        if (profile) {
          setProfile({
            ...profile,
            title: profileData.headline || profile.title,
            bio: profileData.bio || profile.bio,
            skills: profileData.skills?.map((s: any) => s.skill.name) || profile.skills,
            availability: {
              status: profileData.availableForHire ? "available" : "unavailable"
            },
            socialLinks: profileData.socialLinks || profile.socialLinks
          });
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (status === "loading" || isLoading) {
    return (
      <div className="container max-w-7xl py-8">
        <h1 className="text-3xl font-bold mb-6">Builder Profile</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!session) {
    router.push("/signin");
    return null;
  }
  
  // New profile creation view
  if (!profile && isEditing) {
    return (
      <div className="container max-w-7xl py-8">
        <h1 className="text-3xl font-bold mb-6">Create Your Builder Profile</h1>
        
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Get Verified</AlertTitle>
          <AlertDescription>
            Your profile will start at Entry Level verification. Add your details and submit for review to get verified.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Builder Information</CardTitle>
            <CardDescription>
              Share your expertise and experience to attract potential clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditProfileForm 
              profile={{
                id: "new",
                name: session.user?.name || "Your Name",
                title: "AI Developer", // Default title
                bio: "", // Empty bio to start
                validationTier: "entry",
                joinDate: new Date(),
                completedProjects: 0,
                rating: 0,
                responseRate: 0,
                skills: [],
                portfolio: [],
                availability: { status: "available" }
              }}
              onSave={handleCreateProfile}
              onCancel={() => router.push("/")} // Go back to home if they cancel
            />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Editing existing profile
  if (profile && isEditing) {
    return (
      <div className="container max-w-7xl py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Your Builder Profile</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Builder Information</CardTitle>
            <CardDescription>
              Update your profile information to showcase your expertise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditProfileForm 
              profile={profile}
              onSave={handleUpdateProfile}
              onCancel={() => setIsEditing(false)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // View existing profile
  return (
    <div className="container max-w-7xl py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Your Builder Profile</h1>
        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile Preview</TabsTrigger>
          <TabsTrigger value="validation">Validation Status</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-0">
          <div className="border rounded-lg overflow-hidden shadow-sm">
            {profile && (
              <BuilderProfile
                profile={profile}
                isOwner={true}
                onEditProfile={() => setIsEditing(true)}
                onAddProject={() => toast.info("Portfolio project management coming soon!")}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="validation" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                Validation Status <ValidationTierBadge tier="entry" size="md" />
              </CardTitle>
              <CardDescription>
                Your current verification level and next steps to advance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-medium text-lg mb-3">Entry Level Validation</h3>
                  <p className="text-muted-foreground mb-4">
                    You're at the Entry level of builder validation. This level confirms your identity and basic competencies.
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span>Identity verification completed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 3V6.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="6" cy="9" r="1" fill="white"/>
                        </svg>
                      </div>
                      <span>Basic competency quiz pending</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 3V6.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="6" cy="9" r="1" fill="white"/>
                        </svg>
                      </div>
                      <span>Code sample review pending</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">Complete Validation Steps</Button>
                </div>
                
                <div className="border border-dashed rounded-lg p-4 bg-muted/10">
                  <h3 className="font-medium text-lg mb-3">Established Level Requirements</h3>
                  <p className="text-muted-foreground mb-4">
                    The next level of validation requires successful completion of projects and client feedback.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-muted border flex items-center justify-center mt-0.5">
                        <span className="text-xs">1</span>
                      </div>
                      <span>Complete 3+ client projects or generate $1,000+ in value</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-muted border flex items-center justify-center mt-0.5">
                        <span className="text-xs">2</span>
                      </div>
                      <span>Document project outcomes with client verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-muted border flex items-center justify-center mt-0.5">
                        <span className="text-xs">3</span>
                      </div>
                      <span>Complete advanced technical assessment</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Track how your profile is performing and attracting clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-12 border rounded-lg">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">
                    Analytics will be available once you've completed projects
                  </p>
                  <Button variant="outline" size="sm">Learn More</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
