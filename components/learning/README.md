# Learning Domain Components

This directory contains components related to the learning domain of the Buildappswith platform. These components implement the educational experience and content delivery aspects of the platform.

## Directory Structure

```
/learning
├── ui/                   # Learning-specific UI components
│   ├── [component].tsx   # Individual UI components
│   └── index.ts          # Barrel exports
├── [component].tsx       # Domain-specific components
└── index.ts              # Barrel exports
```

## Component Categories

1. **Timeline Components**
   - Components for visualizing the "What AI Can/Can't Do" timeline
   - Interactive timeline elements with filtering capabilities
   - Timeline data visualization components

2. **Educational Components**
   - Content delivery components
   - Interactive learning modules
   - Progress tracking visualizations

3. **Quiz and Assessment Components**
   - Knowledge verification components
   - Skill assessment interfaces
   - Feedback presentation components

## Usage Guidelines

Import components using the barrel exports:

```typescript
// Good ✅
import { LearningTimeline, SkillProgressIndicator } from "@/components/learning";
import { TimelineFilter } from "@/components/learning/ui";

// Avoid ❌
import { LearningTimeline } from "@/components/learning/learning-timeline";
import { TimelineFilter } from "@/components/learning/ui/timeline-filter";
```

## Related Domains

- **Profile**: User learning progress and achievements
- **Community**: Knowledge sharing and collaborative learning
- **Trust**: Validation of learning achievements
