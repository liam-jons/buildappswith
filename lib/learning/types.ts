/**
 * Learning Domain - Type Definitions
 * 
 * This file contains TypeScript types for the learning experience:
 * - Learning path and module structures
 * - Progress tracking types
 * - Skill assessment types
 */

/**
 * Content type definitions
 */
export type ContentType = "video" | "article" | "interactive" | "quiz" | "project";

/**
 * Skill level definitions
 */
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

/**
 * Content item structure
 */
export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  description?: string;
  duration?: number; // in minutes
  contentUrl?: string;
  order: number;
}

/**
 * Learning module structure
 */
export interface LearningModule {
  id: string;
  title: string;
  description: string;
  skillLevel: SkillLevel;
  prerequisites?: string[];
  estimatedDuration?: number; // in minutes
  contentItems?: ContentItem[];
  order: number;
}

/**
 * Progress item for tracking completion
 */
export interface ProgressItem {
  contentId: string;
  completed: boolean;
  completedAt?: string;
  score?: number; // for quizzes, 0-100
}

/**
 * Current module progress
 */
export interface CurrentModuleProgress {
  id: string;
  title: string;
  progress: number; // 0-100
  startedAt: string;
}

/**
 * Overall learning path progress
 */
export interface LearningPathProgress {
  userId: string;
  completedModules: string[];
  currentModule: CurrentModuleProgress | null;
  skillLevels: Record<string, SkillLevel>;
  totalProgress: number; // 0-100
  lastUpdated: string;
}

/**
 * Learning path definition
 */
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetSkills: string[];
  modules: LearningModule[];
}

/**
 * Recommendation for learning content
 */
export interface Recommendation {
  moduleId: string;
  title: string;
  reason: string;
}

/**
 * Skill assessment result
 */
export interface SkillAssessmentResult {
  success: boolean;
  message: string;
  skillLevels?: Record<string, SkillLevel>;
  recommendations?: Recommendation[];
}

/**
 * Content completion result
 */
export interface ContentCompletionResult {
  success: boolean;
  message: string;
  updatedProgress?: ProgressItem;
}

/**
 * Learning capability definition
 */
export interface LearningCapability {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "can" | "cannot" | "limitation";
  examples: string[];
  dateAdded: string;
  limitations?: string[];
}
