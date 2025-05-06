/**
 * Profile validation schemas
 * Version: 1.0.0
 * 
 * Zod schemas for profile data validation
 */

import { z } from 'zod';
import { UserRole, ValidationTier, SpecializationArea } from './types';

// Base schemas
export const profileImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
});

export const socialProfilesSchema = z.object({
  website: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  twitter: z.string().url().optional(),
});

export const testimonialSchema = z.object({
  id: z.string().optional(),
  author: z.string().min(1),
  role: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().optional(),
  content: z.string().min(1),
  rating: z.number().min(1).max(5),
  date: z.date().optional().or(z.string()),
});

export const availabilitySchema = z.object({
  status: z.enum(['available', 'limited', 'unavailable']),
  nextAvailable: z.date().optional().or(z.string().optional()),
});

export const portfolioProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()),
  technologies: z.array(z.string()),
  demoUrl: z.string().url().optional(),
  repositoryUrl: z.string().url().optional(),
  completionDate: z.date().optional().or(z.string().optional()),
  featured: z.boolean().optional(),
});

export const aiAppSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  technologies: z.array(z.string()),
  status: z.enum(['LIVE', 'DEMO', 'CONCEPT']),
  appUrl: z.string().url().optional(),
  adhdFocused: z.boolean(),
});

export const metricSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  value: z.union([z.string(), z.number()]),
  suffix: z.string().optional(),
  description: z.string().optional(),
  trend: z.object({
    direction: z.enum(['up', 'down', 'neutral']),
    percentage: z.number().optional(),
  }).optional(),
});

export const metricsCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string(),
  metrics: z.array(metricSchema),
});

export const specializationContentSchema = z.object({
  description: z.string().min(10),
  bulletPoints: z.array(z.string().min(1)),
  testimonials: z.array(testimonialSchema),
});

// Partial specialization areas record
export const expertiseAreasSchema = z.record(
  z.nativeEnum(SpecializationArea),
  specializationContentSchema
).partial();

// Main schema for creating a builder profile
export const createBuilderProfileSchema = z.object({
  displayName: z.string().min(2).max(100),
  tagline: z.string().min(5).max(150),
  bio: z.string().min(20),
  specializations: z.array(z.string()),
  validationTier: z.nativeEnum(ValidationTier),
  roles: z.array(z.nativeEnum(UserRole)),
  isFounder: z.boolean().optional(),
  adhdFocus: z.boolean(),
  skills: z.array(z.string()),
  socialLinks: socialProfilesSchema.optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  expertiseAreas: expertiseAreasSchema.optional(),
});

// Schema for updating a builder profile (all fields optional)
export const updateBuilderProfileSchema = createBuilderProfileSchema.partial().extend({
  avatar: profileImageSchema.optional(),
  coverImage: profileImageSchema.optional(),
  availability: availabilitySchema.optional(),
  portfolio: z.array(portfolioProjectSchema).optional(),
  apps: z.array(aiAppSchema).optional(),
  testimonials: z.array(testimonialSchema).optional(),
  metrics: z.array(metricsCategorySchema).optional(),
  featured: z.boolean().optional(),
});

// Query parameters schema for filtering builder profiles
export const builderProfileQuerySchema = z.object({
  featured: z.boolean().optional(),
  adhdFocus: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
  page: z.number().min(1).optional(),
});

// Type exports
export type ProfileImage = z.infer<typeof profileImageSchema>;
export type SocialProfiles = z.infer<typeof socialProfilesSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type PortfolioProject = z.infer<typeof portfolioProjectSchema>;
export type AIApp = z.infer<typeof aiAppSchema>;
export type Metric = z.infer<typeof metricSchema>;
export type MetricsCategory = z.infer<typeof metricsCategorySchema>;
export type SpecializationContent = z.infer<typeof specializationContentSchema>;
export type ExpertiseAreas = z.infer<typeof expertiseAreasSchema>;
export type CreateBuilderProfileData = z.infer<typeof createBuilderProfileSchema>;
export type UpdateBuilderProfileData = z.infer<typeof updateBuilderProfileSchema>;
export type BuilderProfileQuery = z.infer<typeof builderProfileQuerySchema>;