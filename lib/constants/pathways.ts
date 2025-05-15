/**
 * Pathway configuration for the BuildAppsWith platform
 * This file contains the structure and configuration for learning pathways
 */

export const PATHWAYS = {
  ACCELERATE: {
    id: 'accelerate',
    name: 'Accelerate',
    description: 'Fast-track your AI implementation journey with focused, intensive learning',
    icon: '🚀',
    color: '#10B981', // Emerald
    tiers: {
      tier1: {
        name: 'Foundation',
        description: 'Build a solid foundation in AI concepts and tools',
        skills: [] // To be populated from database
      },
      tier2: {
        name: 'Application',
        description: 'Apply AI tools to real-world scenarios',
        skills: []
      },
      tier3: {
        name: 'Mastery',
        description: 'Master advanced AI techniques and strategies',
        skills: []
      }
    }
  },
  PIVOT: {
    id: 'pivot',
    name: 'Pivot',
    description: 'Transition your career or business model to leverage AI opportunities',
    icon: '🔄',
    color: '#3B82F6', // Blue
    tiers: {
      tier1: {
        name: 'Assessment',
        description: 'Assess your current skills and identify gaps',
        skills: []
      },
      tier2: {
        name: 'Transition',
        description: 'Build new skills while leveraging existing strengths',
        skills: []
      },
      tier3: {
        name: 'Integration',
        description: 'Integrate AI into your professional identity',
        skills: []
      }
    }
  },
  PLAY: {
    id: 'play',
    name: 'Play',
    description: 'Explore AI through creative experimentation and playful discovery',
    icon: '🎨',
    color: '#8B5CF6', // Purple
    tiers: {
      tier1: {
        name: 'Exploration',
        description: 'Explore AI tools through fun experiments',
        skills: []
      },
      tier2: {
        name: 'Creation',
        description: 'Create projects that inspire and engage',
        skills: []
      },
      tier3: {
        name: 'Innovation',
        description: 'Push boundaries with innovative AI applications',
        skills: []
      }
    }
  }
} as const;

export type PathwayId = keyof typeof PATHWAYS;
export type PathwayConfig = typeof PATHWAYS[PathwayId];

// Helper functions
export function getPathwayById(id: string): PathwayConfig | null {
  const uppercaseId = id.toUpperCase() as PathwayId;
  return PATHWAYS[uppercaseId] || null;
}

export function getAllPathways(): PathwayConfig[] {
  return Object.values(PATHWAYS);
}

export function getPathwayNames(): string[] {
  return Object.values(PATHWAYS).map(p => p.name);
}

// Default pathway for new users
export const DEFAULT_PATHWAY = 'ACCELERATE';

// Pathway progress status
export const PATHWAY_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed'
} as const;

export type PathwayStatus = typeof PATHWAY_STATUS[keyof typeof PATHWAY_STATUS];