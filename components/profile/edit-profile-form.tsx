"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GlobeIcon,
  LinkedInLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
  Cross2Icon,
  PlusIcon,
  CheckIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { BuilderProfileData } from "./builder-profile";

// Form validation schema
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(500, "Bio cannot exceed 500 characters"),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  availability: z.object({
    status: z.enum(["available", "limited", "unavailable"]),
    nextAvailable: z.string().optional(),
  }),
  socialLinks: z.object({
    website: z.string().url("Must be a valid URL").or(z.string().length(0)).optional(),
    linkedin: z.string().url("Must be a valid URL").or(z.string().length(0)).optional(),
    github: z.string().url("Must be a valid URL").or(z.string().length(0)).optional(),
    twitter: z.string().url("Must be a valid URL").or(z.string().length(0)).optional(),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  profile: BuilderProfileData;
  onSave: (data: ProfileFormValues) => Promise<void>;
  onCancel: () => void;
}

export function EditProfileForm({ profile, onSave, onCancel }: EditProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  // Initialize form with existing profile data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      title: profile.title,
      bio: profile.bio,
      skills: profile.skills,
      availability: {
        status: profile.availability?.status || "available",
        nextAvailable: profile.availability?.nextAvailable 
          ? profile.availability.nextAvailable.toISOString().split('T')[0] 
          : undefined,
      },
      socialLinks: {
        website: profile.socialLinks?.website || "",
        linkedin: profile.socialLinks?.linkedin || "",
        github: profile.socialLinks?.github || "",
        twitter: profile.socialLinks?.twitter || "",
      },
    },
  });

  // Handle form submission
  async function onSubmit(values: ProfileFormValues) {
    setIsSubmitting(true);
    try {
      await onSave(values);
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle adding a new skill
  function handleAddSkill() {
    if (!newSkill.trim()) return;
    
    const currentSkills = form.getValues("skills");
    if (!currentSkills.includes(newSkill.trim())) {
      form.setValue("skills", [...currentSkills, newSkill.trim()]);
      form.trigger("skills");
    }
    setNewSkill("");
  }

  // Handle removing a skill
  function handleRemoveSkill(skillToRemove: string) {
    const currentSkills = form.getValues("skills");
    form.setValue(
      "skills", 
      currentSkills.filter(skill => skill !== skillToRemove)
    );
    form.trigger("skills");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., AI Application Developer" {...field} />
                </FormControl>
                <FormDescription>
                  A short title describing your expertise.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell clients about yourself, your experience, and approach..." 
                    className="min-h-32 resize-y"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  {field.value.length}/500 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Skills Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Skills</h3>
          
          <FormField
            control={form.control}
            name="skills"
            render={() => (
              <FormItem>
                <FormLabel>Your Skills</FormLabel>
                <div className="space-y-4">
                  <div className="flex">
                    <Input
                      placeholder="Add a skill (e.g., React, AI Integration, API Development)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="rounded-r-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddSkill}
                      variant="secondary"
                      className="rounded-l-none"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {form.getValues("skills").map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-muted-foreground hover:text-foreground transition-colors rounded-full"
                          aria-label={`Remove ${skill}`}
                        >
                          <Cross2Icon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </div>
                <FormDescription>
                  Add skills that showcase your expertise to potential clients.
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
        
        {/* Availability Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Availability</h3>
          
          <FormField
            control={form.control}
            name="availability.status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Availability</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your availability" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="available">Available Now</SelectItem>
                    <SelectItem value="limited">Limited Availability</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Let potential clients know if you&apos;re taking on new projects.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {form.watch("availability.status") === "unavailable" && (
            <FormField
              control={form.control}
              name="availability.nextAvailable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available From</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormDescription>
                    When will you be available for new projects?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        {/* Social Links Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Social Links</h3>
          
          <FormField
            control={form.control}
            name="socialLinks.website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="bg-muted p-2 rounded-l-md border border-r-0 border-input">
                      <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      placeholder="https://yourwebsite.com" 
                      className="rounded-l-none"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="socialLinks.linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="bg-muted p-2 rounded-l-md border border-r-0 border-input">
                      <LinkedInLogoIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      placeholder="https://linkedin.com/in/yourusername" 
                      className="rounded-l-none"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="socialLinks.github"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="bg-muted p-2 rounded-l-md border border-r-0 border-input">
                      <GitHubLogoIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      placeholder="https://github.com/yourusername" 
                      className="rounded-l-none"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="socialLinks.twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="bg-muted p-2 rounded-l-md border border-r-0 border-input">
                      <TwitterLogoIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      placeholder="https://twitter.com/yourusername" 
                      className="rounded-l-none"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
