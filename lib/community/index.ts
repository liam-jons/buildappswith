/**
 * Community Domain - Barrel Exports
 * 
 * This file exports all community-related functionality from the community domain.
 */

// Export server actions (preferred for server-side usage)
export {
  getRecentDiscussions,
  createDiscussion, 
  addComment,
  rateContribution
} from "./actions";

// Export client API functions with renamed exports to avoid conflicts
export {
  getRecentDiscussions as getRecentDiscussionsApi,
  createDiscussion as createDiscussionApi,
  addComment as addCommentApi,
  rateContribution as rateContributionApi
} from "./api";

// Export utility functions
export * from "./utils";

// Export types
export * from "./types";

// Export schemas
export * from "./schemas";
