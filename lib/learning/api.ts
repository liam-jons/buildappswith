/**
 * Learning Domain - API Client Functions
 * 
 * This file contains client-side API functions for the learning experience:
 * - Fetching learning paths and content
 * - Tracking progress and completion
 * - Skill assessment
 */

import { 
  LearningPathProgress, 
  LearningModule,
  ContentItem,
  SkillAssessmentResult,
  ContentCompletionResult
} from "./types";

/**
 * Get available learning modules
 * 
 * @returns List of available learning modules
 */
export async function getLearningModules(): Promise<LearningModule[]> {
  try {
    const response = await fetch("/api/learning/modules");
    
    if (!response.ok) {
      throw new Error("Failed to fetch learning modules");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching learning modules:", error);
    return [];
  }
}

/**
 * Get content for a specific learning module
 * 
 * @param moduleId The module ID
 * @returns Array of content items for the module
 */
export async function getModuleContent(moduleId: string): Promise<ContentItem[]> {
  try {
    const response = await fetch(`/api/learning/modules/${moduleId}/content`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch module content");
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching content for module ${moduleId}:`, error);
    return [];
  }
}

/**
 * Get user learning progress
 * 
 * @returns The user's learning progress
 */
export async function getUserProgress(): Promise<LearningPathProgress> {
  try {
    const response = await fetch("/api/learning/progress");
    
    if (!response.ok) {
      throw new Error("Failed to fetch learning progress");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching learning progress:", error);
    
    // Return default data
    return {
      userId: "",
      completedModules: [],
      currentModule: null,
      skillLevels: {
        aiLiteracy: "beginner",
        promptEngineering: "beginner",
        aiApplication: "beginner"
      },
      totalProgress: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Record content completion
 * 
 * @param contentId The content item ID
 * @returns Result of the completion recording
 */
export async function completeContent(contentId: string): Promise<ContentCompletionResult> {
  try {
    const response = await fetch("/api/learning/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ contentId })
    });
    
    if (!response.ok) {
      throw new Error("Failed to record completion");
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
 * Submit skill assessment answers
 * 
 * @param answers The assessment answers
 * @returns Assessment result with skill levels
 */
export async function submitAssessment(
  answers: Record<string, string>
): Promise<SkillAssessmentResult> {
  try {
    const response = await fetch("/api/learning/assessment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ answers })
    });
    
    if (!response.ok) {
      throw new Error("Failed to submit assessment");
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    };
  }
}
