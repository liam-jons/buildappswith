# Learning UI Components

This directory contains UI components specific to the learning domain. These components implement specialized user interfaces for educational content, progress tracking, and interactive learning experiences.

## Component Types

1. **Timeline Components**
   - `TimelineItem`: Individual capability item in the AI timeline
   - `TimelineFilter`: Filter controls for the AI capability timeline
   - `TimelineCategory`: Category visualization for timeline items

2. **Learning Module Components**
   - `ModuleCard`: Card component for learning modules
   - `ProgressIndicator`: Visual indicator for learning progress
   - `CompletionBadge`: Achievement badge for completed content

3. **Interactive Elements**
   - `QuizQuestion`: Interactive question component
   - `CodeExercise`: Interactive code practice component
   - `FeedbackIndicator`: Visual feedback for learning activities

## Usage Guidelines

Import UI components using the barrel exports:

```typescript
// Good ✅
import { TimelineFilter, ModuleCard } from "@/components/learning/ui";

// Avoid ❌
import { TimelineFilter } from "@/components/learning/ui/timeline-filter";
```

## Design Principles

1. **Progressive Disclosure**: UI elements reveal complexity gradually
2. **Accessibility First**: All components meet WCAG 2.1 AA standards
3. **Visual Feedback**: Clear indicators for user actions and progress
4. **Consistent Language**: Unified terminology across learning components
