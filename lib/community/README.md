# Community Domain

This directory contains business logic and data models for the Buildappswith community features, which enable knowledge sharing and collective growth.

## Overview

The community system creates a supportive ecosystem for knowledge sharing, collaborative problem-solving, and collective growth. It fosters peer learning through structured interactions and recognition mechanisms.

## Directory Structure

```
/lib/community
├── actions.ts      # Server actions for community interactions
├── api.ts          # Client API functions for community data
├── schemas.ts      # Zod validation schemas
├── types.ts        # TypeScript type definitions
├── utils.ts        # Utility functions
└── index.ts        # Barrel exports
```

## Core Functionality

The community domain implements:

1. **Knowledge Exchange**: Structured Q&A and resource sharing
2. **Peer Support Networks**: Domain-specific interest groups and skill-level cohorts
3. **Collective Learning Activities**: Group challenges and learning circles
4. **Recognition System**: Contribution acknowledgment and expertise validation

## Key Types

- `Discussion`: Knowledge sharing thread with title, content, and tags
- `Comment`: Response to discussions with threading capabilities
- `UserContribution`: User engagement metrics and recognition
- `CommunitySpace`: Structured area for specialized discussions

## Usage

Import community-related functionality using the barrel exports:

```typescript
import { 
  getRecentDiscussions,
  createDiscussion,
  sortDiscussions 
} from "@/lib/community";
```

## Related Components

Community interaction components can be found in:

```
/components/community
├── ui/
│   ├── discussion-list.tsx
│   ├── comment-thread.tsx
│   └── contribution-metrics.tsx
└── index.ts
```

## Community Health Metrics

The community's health is measured through comprehensive metrics:

- **Engagement Depth**: Active participation rate, interaction frequency
- **Contribution Quality**: Helpfulness ratings, knowledge value
- **Community Connection**: Relationship formation, cross-segment interaction
- **Growth Indicators**: Organic referral rate, new member activation
