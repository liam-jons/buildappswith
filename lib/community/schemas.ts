/**
 * Community Domain - Validation Schemas
 * 
 * This file contains Zod schemas for validating community-related data:
 * - Discussion and comment formats
 * - Rating and contribution validation
 * - User recognition criteria
 */

import { z } from "zod";

/**
 * Discussion creation schema
 */
export const discussionCreationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  tags: z.array(z.string()).max(5, "Maximum 5 tags allowed").optional()
});

/**
 * Comment creation schema
 */
export const commentCreationSchema = z.object({
  discussionId: z.string().min(1, "Discussion ID is required"),
  content: z.string().min(3, "Comment must be at least 3 characters").max(2000, "Comment must be less than 2000 characters"),
  parentCommentId: z.string().optional()
});

/**
 * Contribution rating schema
 */
export const contributionRatingSchema = z.object({
  contributionId: z.string().min(1, "Contribution ID is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5")
});

/**
 * Discussion schema
 */
export const discussionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  commentCount: z.number().int().nonnegative(),
  likeCount: z.number().int().nonnegative(),
  tags: z.array(z.string()).optional()
});

/**
 * Comment schema
 */
export const commentSchema = z.object({
  id: z.string(),
  discussionId: z.string(),
  content: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  createdAt: z.string().datetime(),
  likeCount: z.number().int().nonnegative(),
  parentCommentId: z.string().optional()
});

/**
 * User contribution schema
 */
export const userContributionSchema = z.object({
  userId: z.string(),
  discussionCount: z.number().int().nonnegative(),
  commentCount: z.number().int().nonnegative(),
  helpfulRating: z.number().min(0).max(5),
  contributionPoints: z.number().int().nonnegative(),
  recognitionBadges: z.array(z.string())
});

/**
 * Discussion list response schema
 */
export const discussionListSchema = z.array(discussionSchema);

/**
 * Comment list response schema
 */
export const commentListSchema = z.array(commentSchema);
