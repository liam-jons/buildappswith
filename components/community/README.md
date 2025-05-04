# Community Components

This directory contains all components related to the community and knowledge sharing functionality of the Buildappswith platform. The community domain follows a domain-first organization pattern with dedicated UI components.

## Directory Structure

```
/community
├── ui/                     # Community-specific UI components
│   ├── [component].tsx     # Individual UI components
│   └── index.ts            # Barrel exports for UI components
├── [domain components]     # Community domain components
└── index.ts                # Barrel exports for all community components
```

## Component Types

### Core Community Components

- **KnowledgeBase**: Central repository for shared knowledge and resources
- **DiscussionForum**: Community discussion and question-and-answer space
- **MemberDirectory**: Searchable directory of community members
- **EventsCalendar**: Community events and activities listings
- **ContentCreationTool**: Interface for creating and sharing community content

### Community UI Components

- **DiscussionCard**: Card-based representation of a discussion thread
- **KnowledgeItem**: Display component for knowledge base entries
- **MemberCard**: Card displaying community member information
- **ContributionBadge**: Visual indicator of member contributions
- **TopicTag**: Tag component for categorizing community content

## Usage Guidelines

### Import Pattern

Always import components using the barrel exports:

```typescript
// Preferred: Use barrel exports
import { KnowledgeBase, DiscussionForum } from "@/components/community";
import { DiscussionCard, KnowledgeItem } from "@/components/community/ui";

// Avoid: Don't import directly from component files
import { KnowledgeBase } from "@/components/community/knowledge-base";
```

### Server vs. Client Components

Community components follow these patterns:

- Server components fetch their own data where possible
- Client components use the `"use client"` directive
- Interactive discussions use client components
- Static display uses server components

## Integration with Other Domains

Community components integrate with:

- **Profile Domain**: For user information and reputation
- **Trust Domain**: For validation and contribution tracking
- **Learning Domain**: For educational resource integration
- **Marketplace Domain**: For builder connections and discovery
