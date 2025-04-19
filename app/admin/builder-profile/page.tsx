"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

// Simple form for updating basic builder profile
export default function BuilderProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    headline: "",
    bio: "",
    hourlyRate: 0,
    availableForHire: true,
  });

  // Fetch builder profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // In a real implementation, we would fetch from API
        // For now, we'll use dummy data for Liam Jons
        setProfile({
          headline: "AI Application Developer & Platform Founder",
          bio: "Founder of Buildappswith.com with 15+ years experience in software development. I'm passionate about democratizing AI and helping people leverage technology to solve real problems.",
          hourlyRate: 120,
          availableForHire: true,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle switch toggle
  const handleAvailabilityToggle = (checked: boolean) => {
    setProfile((prev) => ({ ...prev, availableForHire: checked }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // In a real implementation, we would save to API
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/admin");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Builder Profile</CardTitle>
          <CardDescription>
            Update your public profile information visible to potential clients
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="headline">Professional Headline</Label>
              <Input
                id="headline"
                name="headline"
                value={profile.headline}
                onChange={handleChange}
                placeholder="AI Developer, Machine Learning Expert, etc."
              />
              <p className="text-xs text-muted-foreground">
                A short title that appears under your name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell potential clients about your expertise and experience..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Describe your experience, expertise, and what you can offer clients
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                value={profile.hourlyRate.toString()}
                onChange={handleChange}
                min="0"
                step="1"
              />
              <p className="text-xs text-muted-foreground">
                Your standard hourly rate for consultation and development work
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="availableForHire"
                checked={profile.availableForHire}
                onCheckedChange={handleAvailabilityToggle}
              />
              <Label htmlFor="availableForHire">Available for Hire</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
