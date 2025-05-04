/**
 * Zod validation schemas for admin data
 */

import { z } from "zod";
import { UserRole } from "@/lib/auth/types";
import { VerificationStatus } from "./types";

/**
 * Schema for builder verification
 */
export const builderVerificationSchema = z.object({
  status: z.nativeEnum(VerificationStatus, {
    required_error: "Verification status is required",
    invalid_type_error: "Status must be a valid verification status",
  }),
  notes: z.string().optional(),
  validationTier: z.number().int().min(1).max(5).optional(),
  approvedBy: z.string().uuid().optional(),
  rejectionReason: z.string().optional(),
});

/**
 * Schema for session type management
 */
export const sessionTypeSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters",
  }),
  description: z.string().optional(),
  duration: z.number().int().min(15, {
    message: "Duration must be at least 15 minutes",
  }),
  price: z.number().min(0, {
    message: "Price must be non-negative",
  }),
  currency: z.string().length(3, {
    message: "Currency must be a 3-letter ISO currency code",
  }).default("USD"),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  requiredValidationTier: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

/**
 * Schema for system settings
 */
export const systemSettingsSchema = z.object({
  // Platform configuration
  platformName: z.string().min(1).optional(),
  platformDescription: z.string().optional(),
  contactEmail: z.string().email().optional(),
  supportEmail: z.string().email().optional(),
  
  // Feature flags
  enablePublicMarketplace: z.boolean().optional(),
  enableCommunityFeatures: z.boolean().optional(),
  enableLearningFeatures: z.boolean().optional(),
  enablePaymentProcessing: z.boolean().optional(),
  
  // Marketplace settings
  defaultCurrency: z.string().length(3).optional(),
  defaultSessionDuration: z.number().int().min(15).optional(),
  maximumSessionDuration: z.number().int().min(30).optional(),
  
  // Validation settings
  requireBuilderVerification: z.boolean().optional(),
  defaultValidationTier: z.number().int().min(1).max(5).optional(),
  validationTierNames: z.array(z.string()).length(5).optional(),
  
  // Integration settings
  stripePublishableKey: z.string().optional(),
  mailchimpApiKey: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  
  // Content settings
  termsOfServiceUrl: z.string().url().optional(),
  privacyPolicyUrl: z.string().url().optional(),
  cookiePolicyUrl: z.string().url().optional(),
  
  // System limits
  maxFileSizeUpload: z.number().int().min(1).max(100).optional(), // In MB
  maxSessionsPerBuilder: z.number().int().min(1).optional(),
  maxConcurrentBookings: z.number().int().min(1).optional(),
});

/**
 * Schema for user role management
 */
export const userRoleSchema = z.object({
  userId: z.string().uuid({
    message: "User ID must be a valid UUID",
  }),
  role: z.nativeEnum(UserRole, {
    required_error: "Role is required",
    invalid_type_error: "Role must be a valid user role",
  }),
  action: z.enum(["add", "remove"], {
    required_error: "Action is required",
    invalid_type_error: "Action must be 'add' or 'remove'",
  }),
});

/**
 * Schema for dashboard filter parameters
 */
export const dashboardFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  interval: z.enum(["day", "week", "month"]).optional().default("day"),
  metrics: z.array(
    z.enum([
      "totalUsers",
      "newUsers",
      "activeUsers",
      "totalBuilders",
      "verifiedBuilders",
      "totalBookings",
      "completedBookings",
      "totalRevenue",
      "averageSessionPrice",
    ])
  ).optional(),
});

/**
 * Schema for builder management
 */
export const builderManagementSchema = z.object({
  builderId: z.string().uuid({
    message: "Builder ID must be a valid UUID",
  }),
  featured: z.boolean().optional(),
  priorityRanking: z.number().int().min(0).optional(),
  specializations: z.array(z.string()).optional(),
  showcaseInCategories: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

/**
 * Schema for marketplace category management
 */
export const marketplaceCategorySchema = z.object({
  name: z.string().min(3, {
    message: "Category name must be at least 3 characters",
  }),
  description: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be a valid URL slug (lowercase with hyphens)",
  }),
  iconName: z.string().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0).optional(),
  parentCategoryId: z.string().uuid().optional(),
});
