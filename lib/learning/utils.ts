/**
 * Learning Domain - Utility Functions
 * 
 * This file contains utility functions for the learning experience:
 * - Progress calculation helpers
 * - Learning path navigation
 * - Recommendation algorithms
 */

import { 
  LearningModule, 
  ContentItem, 
  ProgressItem,
  LearningPathProgress,
  SkillLevel,
  Recommendation
} from "./types";

/**
 * Calculate module completion percentage
 * 
 * @param moduleItems Array of content items in the module
 * @param progress Array of progress items for the user
 * @returns Completion percentage (0-100)
 */
export function calculateModuleProgress(
  moduleItems: ContentItem[],
  progress: ProgressItem[]
): number {
  if (!moduleItems.length) {
    return 0;
  }
  
  // Create a map of completed content
  const completedMap = progress.reduce((map, item) => {
    if (item.completed) {
      map[item.contentId] = true;
    }
    return map;
  }, {} as Record<string, boolean>);
  
  // Count completed items
  const completedCount = moduleItems.filter(item => completedMap[item.id]).length;
  
  // Calculate percentage
  return Math.round((completedCount / moduleItems.length) * 100);
}

/**
 * Get next recommended content
 * 
 * @param currentProgress User's current progress
 * @param modules Available learning modules
 * @returns Next recommended content item or null if completed
 */
export function getNextRecommendedContent(
  currentProgress: LearningPathProgress,
  modules: LearningModule[]
): ContentItem | null {
  // If no current module, recommend first module's first item
  if (!currentProgress.currentModule) {
    const firstModule = modules.sort((a, b) => a.order - b.order)[0];
    if (firstModule?.contentItems?.length) {
      return firstModule.contentItems.sort((a, b) => a.order - b.order)[0];
    }
    return null;
  }
  
  // Find current module
  const currentModule = modules.find(m => m.id === currentProgress.currentModule?.id);
  if (!currentModule?.contentItems?.length) {
    return null;
  }
  
  // Get completed content IDs
  const completedContentIds = new Set(
    currentProgress.completedModules.flatMap(moduleId => {
      const module = modules.find(m => m.id === moduleId);
      return module?.contentItems?.map(item => item.id) || [];
    })
  );
  
  // Find first incomplete content item
  const nextContent = currentModule.contentItems
    .sort((a, b) => a.order - b.order)
    .find(item => !completedContentIds.has(item.id));
  
  return nextContent || null;
}

/**
 * Format skill level for display
 * 
 * @param level The skill level
 * @returns Formatted display name
 */
export function formatSkillLevel(level: SkillLevel): string {
  switch (level) {
    case "beginner":
      return "Beginner";
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
    case "expert":
      return "Expert";
    default:
      return "Unknown";
  }
}

/**
 * Generate recommendations based on skill levels
 * 
 * @param skillLevels User's current skill levels
 * @param modules Available learning modules
 * @returns Array of recommended modules
 */
export function generateRecommendations(
  skillLevels: Record<string, SkillLevel>,
  modules: LearningModule[]
): Recommendation[] {
  // Simple implementation - to be enhanced
  const recommendations: Recommendation[] = [];
  
  // Find modules that match skill levels
  for (const [skill, level] of Object.entries(skillLevels)) {
    const relevantModules = modules.filter(m => 
      m.skillLevel === level || 
      (level === "beginner" && m.skillLevel === "intermediate") ||
      (level === "intermediate" && m.skillLevel === "advanced")
    );
    
    // Add top recommendations
    relevantModules.slice(0, 2).forEach(module => {
      recommendations.push({
        moduleId: module.id,
        title: module.title,
        reason: `Matches your ${formatSkillLevel(level)} level in ${skill}`
      });
    });
  }
  
  // Remove duplicates
  const uniqueRecommendations = recommendations.filter(
    (rec, index, self) => 
      index === self.findIndex(r => r.moduleId === rec.moduleId)
  );
  
  return uniqueRecommendations.slice(0, 3);
}

/**
 * Calculate time to complete a module
 * 
 * @param module The learning module
 * @returns Estimated time in minutes
 */
export function calculateModuleTime(module: LearningModule): number {
  // If module has explicit duration, use it
  if (module.estimatedDuration !== undefined) {
    return module.estimatedDuration;
  }
  
  // Otherwise calculate from content items
  return (module.contentItems || [])
    .reduce((total, item) => total + (item.duration || 0), 0);
}
