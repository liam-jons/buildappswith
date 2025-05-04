/**
 * Learning Domain - Validation Schemas
 * 
 * This file contains Zod schemas for validating learning-related data:
 * - Learning module structure
 * - Progress tracking format
 * - Skill assessment data
 */

import { z } from "zod";

/**
 * Learning content item schema
 */
export const contentItemSchema = z.object({
  id: z.string().min(1, "Content ID is required"),
  title: z.string().min(1, "Title is required"),
  type: z.enum(["video", "article", "interactive", "quiz", "project"]),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(),
  contentUrl: z.string().url("Valid URL is required").optional(),
  order: z.number().int().nonnegative()
});

/**
 * Learning module schema
 */
export const learningModuleSchema = z.object({
  id: z.string().min(1, "Module ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  prerequisites: z.array(z.string()).optional(),
  estimatedDuration: z.number().int().positive().optional(),
  contentItems: z.array(contentItemSchema).optional(),
  order: z.number().int().nonnegative()
});

/**
 * Progress item schema
 */
export const progressItemSchema = z.object({
  contentId: z.string().min(1, "Content ID is required"),
  completed: z.boolean(),
  completedAt: z.string().datetime().optional(),
  score: z.number().min(0).max(100).optional()
});

/**
 * Skill level definition
 */
export const skillLevelSchema = z.enum(["beginner", "intermediate", "advanced", "expert"]);

/**
 * Learning progress schema
 */
export const learningProgressSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  completedModules: z.array(z.string()),
  currentModule: z.object({
    id: z.string(),
    title: z.string(),
    progress: z.number().min(0).max(100),
    startedAt: z.string().datetime()
  }).nullable(),
  skillLevels: z.record(skillLevelSchema),
  totalProgress: z.number().min(0).max(100),
  lastUpdated: z.string().datetime()
});

/**
 * Assessment answer schema
 */
export const assessmentAnswerSchema = z.record(z.string());

/**
 * Content completion request schema
 */
export const contentCompletionSchema = z.object({
  contentId: z.string().min(1, "Content ID is required")
});

/**
 * Recommendation schema
 */
export const recommendationSchema = z.object({
  moduleId: z.string(),
  title: z.string(),
  reason: z.string()
});
