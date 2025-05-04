/**
 * Trust Domain - Validation Schemas
 * 
 * This file contains Zod schemas for validating trust-related data:
 * - Trust evidence submission format
 * - Validation tier requirements
 * - Verification request format
 */

import { z } from "zod";

/**
 * Trust evidence schema
 * 
 * Defines the structure for trust evidence submission
 */
export const trustEvidenceSchema = z.object({
  builderId: z.string().min(1, "Builder ID is required"),
  evidenceType: z.enum(["portfolio", "certification", "review", "verification"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  url: z.string().url("Valid URL is required").optional(),
  attachmentId: z.string().optional(),
  submissionDate: z.string().datetime("Valid date is required")
});

/**
 * Trust validation tier schema
 * 
 * Defines the structure for validation tier information
 */
export const trustValidationTierSchema = z.object({
  tier: z.enum(["basic", "verified", "expert"]),
  requirements: z.array(
    z.object({
      evidenceType: z.enum(["portfolio", "certification", "review", "verification"]),
      count: z.number().int().positive(),
      required: z.boolean()
    })
  ),
  verifiedDate: z.string().datetime().optional(),
  lastUpdated: z.string().datetime()
});

/**
 * Trust validation result schema
 * 
 * Defines the structure for validation result responses
 */
export const trustValidationResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  validationTier: z.enum(["basic", "verified", "expert"]).optional(),
  validationErrors: z.array(z.any()).optional()
});

// Convenience type-only export for the validation schema
export const trustValidationSchema = trustEvidenceSchema;
