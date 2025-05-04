# Community UI Components

This directory contains specialized UI components for the community domain. These components are designed specifically for community-related functionality but may be reused across different parts of the community system.

## Component Overview

### DiscussionCard

The `DiscussionCard` component displays a summary of a discussion thread, showing the title, author, reply count, and recent activity.

Features:
- Title and description preview
- Author information with avatar
- Reply count and last activity timestamp
- Topic tags
- Voting and interaction metrics

Usage:
```tsx
import { DiscussionCard } from "@/components/community/ui";

// In your component
<DiscussionCard 
  discussion={discussionData}
  onClick={handleDiscussionClick} 
/>
```

### KnowledgeItem

The `KnowledgeItem` component displays a knowledge base entry with title, content preview, and metadata.

Features:
- Title and content preview
- Author information
- Creation and last update dates
- Category and tag information
- Helpfulness rating display

Usage:
```tsx
import { KnowledgeItem } from "@/components/community/ui";

// In your component
<KnowledgeItem 
  item={knowledgeItemData}
  isExpanded={false}
  onToggleExpand={handleToggleExpand} 
/>
```

### (Additional UI Components)

As more specialized community UI components are added, they will be documented here with their purpose and usage examples.

## Design Principles

Community UI components follow these design principles:

1. **Engagement-Focused**: Design encourages participation and interaction
2. **Accessibility**: Ensure all components meet WCAG 2.1 AA standards
3. **Responsiveness**: Optimize for all device sizes and orientations
4. **Progressive Enhancement**: Basic functionality works without JavaScript
5. **Clarity**: Information hierarchy guides users to important content

## Implementation Guidelines

When implementing new community UI components:

1. Use appropriate "use client" directives based on component needs
2. Include comprehensive PropTypes or TypeScript interfaces
3. Document props with JSDoc comments
4. Include accessibility considerations in implementation
5. Keep components focused on a single responsibility
6. Use composition for complex UI needs

## Related Components

Community UI components are often used in conjunction with:

- Profile components for user information
- Trust components for validation indicators
- Learning components for educational resources
- Marketplace components for builder connections
