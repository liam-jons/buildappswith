// /lib/utils/profile-form-helpers.ts

import { BuilderProfileData } from "@/lib/profile/types";
import { PortfolioProject } from "@/components/profile/portfolio-showcase";
import { z } from "zod";

// Form validation schemas (duplicate of what's in the respective form components)
export const profileFormSchema = z.object({
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

export const projectFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(300, "Description cannot exceed 300 characters"),
  imageUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
  projectUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
  tags: z.array(z.string()).min(1, "Add at least one tag"),
  outcomes: z.array(z.object({
    label: z.string().min(1, "Label is required"),
    value: z.string().min(1, "Value is required"),
    trend: z.enum(["up", "down", "neutral"]).optional(),
  })).min(1, "Add at least one outcome"),
});

// Basic profile data validation schema for test compatibility
export const validateProfileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Must be a valid email"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  expertise: z.array(z.string()).min(1, "Add at least one area of expertise"),
  hourlyRate: z.number().positive("Hourly rate must be a positive number"),
});

// Type definitions for form values
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProjectFormValues = z.infer<typeof projectFormSchema>;

/**
 * Converts a BuilderProfileData object to ProfileFormValues format
 */
export function profileToFormValues(profile: BuilderProfileData): ProfileFormValues {
  return {
    name: profile.name || "",
    title: profile.title || "",
    bio: profile.bio || "",
    skills: profile.topSkills || [],
    availability: {
      status: (profile.availability as "available" | "limited" | "unavailable") || "available",
      nextAvailable: undefined, // This is now handled differently in the updated type
    },
    socialLinks: {
      website: profile.socialLinks?.website || "",
      linkedin: profile.socialLinks?.linkedin || "",
      github: profile.socialLinks?.github || "",
      twitter: profile.socialLinks?.twitter || "",
    },
  };
}

/**
 * Converts ProfileFormValues to a partial BuilderProfileData object
 * for updating the profile
 */
export function formValuesToProfileUpdates(formValues: ProfileFormValues): Partial<BuilderProfileData> {
  return {
    name: formValues.name,
    title: formValues.title,
    bio: formValues.bio,
    topSkills: formValues.skills,
    availability: formValues.availability.status, // Now a string in the unified type
    socialLinks: {
      website: formValues.socialLinks.website || "",
      linkedin: formValues.socialLinks.linkedin || "",
      github: formValues.socialLinks.github || "",
      twitter: formValues.socialLinks.twitter || "",
    },
  };
}

/**
 * Converts a PortfolioProject to ProjectFormValues format
 */
export function projectToFormValues(project: PortfolioProject): ProjectFormValues {
  return {
    title: project.title,
    description: project.description,
    imageUrl: project.imageUrl,
    projectUrl: project.projectUrl || "",
    tags: project.tags,
    outcomes: project.outcomes,
  };
}

/**
 * Converts ProjectFormValues to a partial PortfolioProject object
 * for updating the project
 */
export function formValuesToProjectUpdates(formValues: ProjectFormValues): Partial<PortfolioProject> {
  return {
    title: formValues.title,
    description: formValues.description,
    imageUrl: formValues.imageUrl,
    projectUrl: formValues.projectUrl || "",
    tags: formValues.tags,
    outcomes: formValues.outcomes,
  };
}

/**
 * Creates a new PortfolioProject from ProjectFormValues
 */
export function createProjectFromFormValues(formValues: ProjectFormValues): Omit<PortfolioProject, "id" | "createdAt"> {
  return {
    title: formValues.title,
    description: formValues.description,
    imageUrl: formValues.imageUrl,
    projectUrl: formValues.projectUrl || "",
    tags: formValues.tags,
    outcomes: formValues.outcomes,
  };
}

/**
 * Validates profile data against schema
 * Returns object with validation errors or empty object if valid
 */
export function validateProfileData(profileData: any) {
  try {
    validateProfileSchema.parse(profileData);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      
      error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      
      return errors;
    }
    
    return { general: 'An unexpected error occurred' };
  }
}

/**
 * Formats profile data for API submission by removing unnecessary fields
 */
export function formatProfileForAPI(profileData: any) {
  const { name, email, bio, expertise, hourlyRate, socialLinks } = profileData;
  
  const formatted = {
    name,
    email,
    bio,
    expertise,
    hourlyRate,
    socialLinks: socialLinks ? { ...socialLinks } : undefined
  };
  
  return formatted;
}

/**
 * Parses API profile data for use in forms
 */
export function parseProfileFromAPI(apiData: any) {
  const { id, name, email, bio, expertise, hourlyRate, socialLinks, createdAt, updatedAt, ...rest } = apiData;
  
  return {
    id,
    name,
    email,
    bio,
    expertise,
    hourlyRate,
    socialLinks: socialLinks ? { ...socialLinks } : undefined,
    createdAt: createdAt ? new Date(createdAt) : undefined,
    updatedAt: updatedAt ? new Date(updatedAt) : undefined,
    ...rest
  };
}