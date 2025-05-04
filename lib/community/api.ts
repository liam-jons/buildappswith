/**
 * Community Domain - API Client Functions
 * 
 * This file contains client-side API functions for the community features:
 * - Discussion and comment fetching
 * - Content contribution
 * - Rating and recognition
 */

import { 
  Discussion, 
  Comment,
  DiscussionCreationResult,
  CommentCreationResult,
  ContributionRatingResult,
  DiscussionCreationData,
  CommentCreationData
} from "./types";

/**
 * Get recent discussions
 * 
 * @param limit Number of discussions to retrieve
 * @param tag Optional tag to filter by
 * @returns Array of recent discussions
 */
export async function getRecentDiscussions(
  limit: number = 10,
  tag?: string
): Promise<Discussion[]> {
  try {
    const url = new URL("/api/community/discussions", window.location.origin);
    url.searchParams.append("limit", limit.toString());
    if (tag) {
      url.searchParams.append("tag", tag);
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error("Failed to fetch discussions");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return [];
  }
}

/**
 * Get discussion by ID
 * 
 * @param discussionId The discussion ID
 * @returns The discussion details
 */
export async function getDiscussion(discussionId: string): Promise<Discussion | null> {
  try {
    const response = await fetch(`/api/community/discussions/${discussionId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch discussion");
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching discussion ${discussionId}:`, error);
    return null;
  }
}

/**
 * Get comments for discussion
 * 
 * @param discussionId The discussion ID
 * @returns Array of comments
 */
export async function getDiscussionComments(discussionId: string): Promise<Comment[]> {
  try {
    const response = await fetch(`/api/community/discussions/${discussionId}/comments`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch comments");
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching comments for discussion ${discussionId}:`, error);
    return [];
  }
}

/**
 * Create a new discussion
 * 
 * @param discussionData The discussion data
 * @returns Result with created discussion
 */
export async function createDiscussion(
  discussionData: DiscussionCreationData
): Promise<DiscussionCreationResult> {
  try {
    const response = await fetch("/api/community/discussions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(discussionData)
    });
    
    if (!response.ok) {
      throw new Error("Failed to create discussion");
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    };
  }
}

/**
 * Add comment to discussion
 * 
 * @param commentData The comment data
 * @returns Result with created comment
 */
export async function addComment(
  commentData: CommentCreationData
): Promise<CommentCreationResult> {
  try {
    const response = await fetch("/api/community/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(commentData)
    });
    
    if (!response.ok) {
      throw new Error("Failed to add comment");
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    };
  }
}

/**
 * Rate a contribution
 * 
 * @param contributionId The contribution ID
 * @param rating The rating value
 * @returns Result of the rating operation
 */
export async function rateContribution(
  contributionId: string,
  rating: number
): Promise<ContributionRatingResult> {
  try {
    const response = await fetch("/api/community/rate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ contributionId, rating })
    });
    
    if (!response.ok) {
      throw new Error("Failed to rate contribution");
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    };
  }
}

/**
 * Get available discussion tags
 * 
 * @returns Array of available tags
 */
export async function getDiscussionTags(): Promise<string[]> {
  try {
    const response = await fetch("/api/community/tags");
    
    if (!response.ok) {
      throw new Error("Failed to fetch tags");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}
