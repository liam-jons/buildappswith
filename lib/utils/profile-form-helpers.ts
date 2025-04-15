// /lib/utils/profile-form-helpers.ts

import { BuilderProfileData } from "@/components/profile/builder-profile";
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

// Type definitions for form values
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProjectFormValues = z.infer<typeof projectFormSchema>;

/**
 * Converts a BuilderProfileData object to ProfileFormValues format
 */
export function profileToFormValues(profile: BuilderProfileData): ProfileFormValues {
  return {
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
    skills: formValues.skills,
    availability: {
      status: formValues.availability.status,
      nextAvailable: formValues.availability.nextAvailable 
        ? new Date(formValues.availability.nextAvailable) 
        : undefined,
    },
    socialLinks: {
      website: formValues.socialLinks.website || undefined,
      linkedin: formValues.socialLinks.linkedin || undefined,
      github: formValues.socialLinks.github || undefined,
      twitter: formValues.socialLinks.twitter || undefined,
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