import { z } from "zod";
import { ValidationTier } from "@/types/builder";

// Basic validation constants
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
const TIMEZONE_REGEX = /^[A-Za-z_\/+-]+$/;
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Tech Stack Validation
export const techStackSchema = z.object({
  name: z.string().min(1, "Technology name is required"),
  yearsOfExperience: z.number().min(0, "Years of experience must be a positive number"),
  proficiencyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"])
});

// Portfolio Project Validation
export const portfolioProjectSchema = z.object({
  id: z.string().optional(), // Optional for new projects
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(10, "Please provide a more detailed project description"),
  technologies: z.array(z.string()).min(1, "Add at least one technology"),
  imageUrl: z.string().regex(URL_REGEX, "Please enter a valid URL").optional(),
  projectUrl: z.string().regex(URL_REGEX, "Please enter a valid URL").optional(),
  githubUrl: z.string().regex(URL_REGEX, "Please enter a valid URL").optional(),
  featured: z.boolean().default(false),
  completionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
});

// Testimonial Validation
export const testimonialSchema = z.object({
  id: z.string().optional(), // Optional for new testimonials
  clientName: z.string().min(1, "Client name is required"),
  clientCompany: z.string().optional(),
  text: z.string().min(10, "Testimonial text should be at least 10 characters"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  projectId: z.string().optional()
});

// Availability Validation
export const availabilitySchema = z.object({
  timezone: z.string().regex(TIMEZONE_REGEX, "Please enter a valid timezone"),
  weekdayAvailability: z.object({
    monday: z.boolean().default(false),
    tuesday: z.boolean().default(false),
    wednesday: z.boolean().default(false),
    thursday: z.boolean().default(false),
    friday: z.boolean().default(false),
    saturday: z.boolean().default(false),
    sunday: z.boolean().default(false)
  }),
  preferredHours: z.object({
    start: z.string().regex(TIME_REGEX, "Time must be in HH:MM format"),
    end: z.string().regex(TIME_REGEX, "Time must be in HH:MM format")
  }),
  schedulingUrl: z.string().regex(URL_REGEX, "Please enter a valid URL").optional()
});

// Achievement Badge Validation
export const achievementBadgeSchema = z.object({
  id: z.string().optional(), // Optional for new badges
  name: z.string().min(1, "Badge name is required"),
  description: z.string().min(10, "Please provide a more detailed badge description"),
  imageUrl: z.string().regex(URL_REGEX, "Please enter a valid URL"),
  dateAwarded: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  category: z.enum(["certification", "community", "project", "skill"])
});

// Complete Builder Profile Validation
export const builderProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  profileImage: z.string().optional(),
  headline: z.string().min(10, "Headline must be at least 10 characters").max(100, "Headline cannot exceed 100 characters"),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(2000, "Bio cannot exceed 2000 characters"),
  location: z.string().min(2, "Location is required"),
  website: z.string().regex(URL_REGEX, "Please enter a valid URL").optional(),
  github: z.string().regex(URL_REGEX, "Please enter a valid URL").optional(),
  linkedin: z.string().regex(URL_REGEX, "Please enter a valid URL").optional(),
  twitter: z.string().optional(),
  specializationTags: z.array(z.string()).min(1, "Add at least one specialization"),
  techStack: z.array(techStackSchema).min(1, "Add at least one technology"),
  portfolioProjects: z.array(portfolioProjectSchema).optional(),
  testimonials: z.array(testimonialSchema).optional(),
  availability: availabilitySchema,
  ratePer15MinutesUSD: z.number().min(0, "Rate must be a positive number"),
  freeSessionMinutes: z.number().min(0, "Free session minutes must be a positive number"),
  achievementBadges: z.array(achievementBadgeSchema).optional(),
  skills: z.array(z.string()).min(1, "Add at least one skill")
});

// Schema for updating a builder profile
export const builderProfileUpdateSchema = builderProfileSchema.partial();

// Validation requirements by tier
export const tierRequirements = {
  [ValidationTier.ENTRY]: {
    portfolioProjects: 0,
    testimonials: 0,
    minSkills: 3,
    achievementBadges: 0
  },
  [ValidationTier.ESTABLISHED]: {
    portfolioProjects: 2,
    testimonials: 1,
    minSkills: 5,
    achievementBadges: 1,
    minClientSatisfactionScore: 4.0,
    minCompletedProjects: 2
  },
  [ValidationTier.EXPERT]: {
    portfolioProjects: 5,
    testimonials: 3,
    minSkills: 8,
    achievementBadges: 3,
    minClientSatisfactionScore: 4.5,
    minCompletedProjects: 5,
    maxResponseTimeMinutes: 480 // 8 hours
  }
};

// Function to check if a profile meets requirements for a specific tier
export const checkTierRequirements = (profile: any, tier: ValidationTier): boolean => {
  const requirements = tierRequirements[tier];
  
  // Basic requirements for all tiers
  if (
    !profile.name ||
    !profile.email ||
    !profile.headline ||
    !profile.bio ||
    !profile.location ||
    !profile.specializationTags?.length ||
    !profile.techStack?.length ||
    !profile.skills?.length
  ) {
    return false;
  }
  
  // Specific tier requirements
  switch (tier) {
    case ValidationTier.ENTRY:
      return profile.skills.length >= requirements.minSkills;
      
    case ValidationTier.ESTABLISHED:
      return (
        profile.portfolioProjects?.length >= requirements.portfolioProjects &&
        profile.testimonials?.length >= requirements.testimonials &&
        profile.skills.length >= requirements.minSkills &&
        profile.achievementBadges?.length >= requirements.achievementBadges &&
        (profile.clientSatisfactionScore ?? 0) >= (requirements.minClientSatisfactionScore ?? 0) &&
        (profile.projectCompletionRate ?? 0) >= (requirements.minCompletedProjects ?? 0)
      );
      
    case ValidationTier.EXPERT:
      return (
        profile.portfolioProjects?.length >= requirements.portfolioProjects &&
        profile.testimonials?.length >= requirements.testimonials &&
        profile.skills.length >= requirements.minSkills &&
        profile.achievementBadges?.length >= requirements.achievementBadges &&
        (profile.clientSatisfactionScore ?? 0) >= (requirements.minClientSatisfactionScore ?? 0) &&
        (profile.projectCompletionRate ?? 0) >= (requirements.minCompletedProjects ?? 0) &&
        (profile.responseTimeMinutes ?? Infinity) <= (requirements.maxResponseTimeMinutes ?? Infinity)
      );
      
    default:
      return false;
  }
};
