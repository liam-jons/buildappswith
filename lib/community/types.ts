/**
 * Community Domain - Type Definitions
 * 
 * This file contains TypeScript types for the community features:
 * - Discussion and comment structures
 * - Contribution and rating types
 * - Recognition system types
 */

/**
 * Discussion structure
 */
export interface Discussion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  likeCount: number;
  tags?: string[];
}

/**
 * Comment structure
 */
export interface Comment {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likeCount: number;
  parentCommentId?: string;
}

/**
 * Data for creating a discussion
 */
export interface DiscussionCreationData {
  title: string;
  content: string;
  tags?: string[];
}

/**
 * Data for creating a comment
 */
export interface CommentCreationData {
  discussionId: string;
  content: string;
  parentCommentId?: string;
}

/**
 * Result of discussion creation
 */
export interface DiscussionCreationResult {
  success: boolean;
  message: string;
  discussion?: Discussion;
  validationErrors?: any[];
}

/**
 * Result of comment creation
 */
export interface CommentCreationResult {
  success: boolean;
  message: string;
  comment?: Comment;
  validationErrors?: any[];
}

/**
 * Result of rating a contribution
 */
export interface ContributionRatingResult {
  success: boolean;
  message: string;
  newRating?: number;
  totalRatings?: number;
}

/**
 * User contribution statistics
 */
export interface UserContribution {
  userId: string;
  discussionCount: number;
  commentCount: number;
  helpfulRating: number; // 0-5 scale
  contributionPoints: number;
  recognitionBadges: string[];
}

/**
 * Recognition badge
 */
export interface RecognitionBadge {
  id: string;
  name: string;
  description: string;
  criteria: string;
  iconUrl: string;
}

/**
 * Community space
 */
export interface CommunitySpace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  discussionCount: number;
  createdAt: string;
}

/**
 * Discussion list response
 */
export type DiscussionList = Discussion[];

/**
 * Comment list response
 */
export type CommentList = Comment[];
