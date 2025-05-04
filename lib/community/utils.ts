/**
 * Community Domain - Utility Functions
 * 
 * This file contains utility functions for the community features:
 * - Formatting and display helpers
 * - Rating calculation functions
 * - Contribution analysis tools
 */

import { Discussion, Comment, UserContribution } from "./types";

/**
 * Format date for display
 * 
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than a minute
  if (diff < 60 * 1000) {
    return "just now";
  }
  
  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }
  
  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }
  
  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
  
  // Regular date format
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/**
 * Truncate text with ellipsis
 * 
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + "...";
}

/**
 * Sort discussions by various criteria
 * 
 * @param discussions Array of discussions
 * @param sortBy Sort criteria
 * @returns Sorted discussions
 */
export function sortDiscussions(
  discussions: Discussion[],
  sortBy: "recent" | "popular" | "comments"
): Discussion[] {
  switch (sortBy) {
    case "recent":
      return [...discussions].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    case "popular":
      return [...discussions].sort((a, b) => b.likeCount - a.likeCount);
    
    case "comments":
      return [...discussions].sort((a, b) => b.commentCount - a.commentCount);
    
    default:
      return discussions;
  }
}

/**
 * Calculate contribution points
 * 
 * @param userContribution User contribution data
 * @returns Total contribution points
 */
export function calculateContributionPoints(userContribution: UserContribution): number {
  // Simple algorithm - to be enhanced
  const discussionPoints = userContribution.discussionCount * 10;
  const commentPoints = userContribution.commentCount * 3;
  const ratingPoints = Math.round(userContribution.helpfulRating * 5);
  
  return discussionPoints + commentPoints + ratingPoints;
}

/**
 * Get contribution level based on points
 * 
 * @param points Contribution points
 * @returns Contribution level
 */
export function getContributionLevel(points: number): string {
  if (points >= 1000) {
    return "Expert Contributor";
  } else if (points >= 500) {
    return "Advanced Contributor";
  } else if (points >= 200) {
    return "Regular Contributor";
  } else if (points >= 50) {
    return "Active Participant";
  } else {
    return "New Member";
  }
}

/**
 * Generate comment thread structure
 * 
 * @param comments Flat array of comments
 * @returns Nested thread structure
 */
export function generateCommentThread(comments: Comment[]): Comment[] {
  // Copy comments to avoid modifying original
  const commentsCopy = [...comments];
  
  // Sort by creation date
  commentsCopy.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  // Filter top-level comments
  return commentsCopy.filter(comment => !comment.parentCommentId);
}
