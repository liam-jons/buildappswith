# Learning Domain

This directory contains business logic and data models for the Buildappswith learning experience, which implements the progressive mastery framework for AI literacy.

## Overview

The learning domain enables practical AI skill development through real-world application, with a focus on critical thinking and adaptability. It implements a cognitive science-based progressive mastery framework that guides users from initial exposure to advanced capability.

## Directory Structure

```
/lib/learning
├── actions.ts      # Server actions for learning progression
├── api.ts          # Client API functions for learning content
├── schemas.ts      # Zod validation schemas
├── types.ts        # TypeScript type definitions
├── utils.ts        # Utility functions
└── index.ts        # Barrel exports
```

## Core Functionality

The learning domain implements:

1. **Progressive Mastery Framework**: Structured skill development path
2. **Learning Path Management**: Content organization and progression tracking
3. **Skill Assessment**: Evaluation of user capabilities and recommendations
4. **Content Completion Tracking**: Progress monitoring and achievement recognition

## Key Types

- `LearningPath`: Structured learning journey with modules and progression
- `LearningModule`: Specific learning unit with content items
- `SkillLevel`: Progression levels (beginner, intermediate, advanced, expert)
- `SkillAssessmentResult`: Evaluation of user capabilities

## Usage

Import learning-related functionality using the barrel exports:

```typescript
import { 
  getUserProgress,
  calculateModuleProgress,
  generateRecommendations 
} from "@/lib/learning";
```

## Related Components

Learning experience components can be found in:

```
/components/learning
├── ui/
│   ├── skill-progress-display.tsx
│   ├── learning-path-navigator.tsx
│   └── content-viewer.tsx
└── index.ts
```

## Progressive Mastery Principles

The learning experience is built on these principles:

- **Skill Before Theory**: Practical application before theoretical understanding
- **Quick Wins**: Demonstrable value within first five minutes of engagement
- **Contextual Learning**: Knowledge delivered at the moment of application
- **Visible Progress**: Clear visualization of advancement and achievement
- **Critical Thinking Priority**: Emphasis on understanding "how" and "why" over memorization
