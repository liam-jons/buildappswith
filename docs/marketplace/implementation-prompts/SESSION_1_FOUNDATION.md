# Session 1: Foundation Implementation

## Session Context
- Session Type: Implementation
- Component Focus: Builder Card V2 Foundation - Data models, API endpoints, and component architecture
- Current Branch: feature/builder-card-redesign
- Related Documentation: 
  - /docs/marketplace/BUILDER_CARD_REDESIGN_PLAN.md
  - /docs/marketplace/BUILDER_CARD_INTERFACES.md
  - /docs/marketplace/BUILDER_CARD_IMPLEMENTATION_ROADMAP.md
- Project root directory: /Users/liamj/Documents/development/buildappswith

## Implementation Objectives
- Extend BuilderProfileListing interface with pathway and session data
- Create API endpoints for builder pathways and metrics
- Update database schema for new data structures
- Set up component folder structure
- Configure feature flags for gradual rollout
- Establish TypeScript interfaces and types

## Implementation Plan

### 1. Data Model Updates
- Extend the BuilderProfileListing interface in `/lib/marketplace/types.ts`
- Create new interfaces for PathwaySpecialization and SessionTypeAvailability
- Add performance metrics types and schemas
- Implement proper type guards and validation

### 2. API Endpoint Creation
- Update `/api/marketplace/builders` to include extended fields
- Create `/api/marketplace/builders/[id]/pathways` endpoint
- Implement `/api/marketplace/builders/[id]/metrics` endpoint
- Modify session types endpoint for availability data
- Add proper error handling and response types

### 3. Database Schema Updates
- Create migration for builder_pathway_specializations table
- Add builder_metrics tracking table
- Create session_availability view
- Update existing builder_profiles table
- Test migrations in development environment

### 4. Component Architecture Setup
```
components/marketplace/builder-card-v2/
├── BuilderCardV2.tsx
├── components/
│   ├── BuilderHeader.tsx
│   ├── PathwayIndicators.tsx
│   ├── SkillsList.tsx
│   ├── SessionAvailability.tsx
│   ├── BuilderMetrics.tsx
│   └── CardActions.tsx
├── hooks/
│   ├── useBuilderCard.ts
│   └── useSessionAvailability.ts
├── styles/
│   └── builder-card.module.css
└── index.ts
```

### 5. Feature Flag Configuration
- Set up feature flag for `useNewBuilderCards`
- Create environment variables for flag service
- Implement feature flag hook
- Add fallback behavior for legacy cards

## Technical Specifications

### Extended Interface Structure
```typescript
// In lib/marketplace/types.ts
export interface ExtendedBuilderProfile extends BuilderProfileListing {
  pathwaySpecializations: PathwaySpecialization[];
  sessionTypeAvailability: SessionTypeAvailability;
  performanceMetrics: BuilderPerformanceMetrics;
  bookingInfo: BookingInfo;
}

export interface PathwaySpecialization {
  pathwayId: 'accelerate' | 'pivot' | 'play';
  isActive: boolean;
  metrics: {
    activeClients: number;
    completedClients: number;
    successRate: number;
  };
}
```

### API Endpoint Structure
```typescript
// api/marketplace/builders/[id]/pathways/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const builderId = params.id;
    const pathways = await db.builderPathwaySpecialization.findMany({
      where: { builderId },
      include: { metrics: true }
    });
    
    return NextResponse.json({ success: true, pathways });
  } catch (error) {
    // Error handling
  }
}
```

### Database Schema
```sql
CREATE TABLE builder_pathway_specializations (
  id UUID PRIMARY KEY,
  builder_id UUID REFERENCES builder_profiles(id),
  pathway_id VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  client_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Feature Flag Implementation
```typescript
// lib/feature-flags.ts
export const useNewBuilderCards = () => {
  const flags = useFeatureFlags();
  return flags.USE_NEW_BUILDER_CARDS || false;
};
```

## Implementation Notes
1. Type Safety: Ensure all new interfaces extend existing types properly
2. API Versioning: Consider using /api/v2/ for new endpoints
3. Database Migrations: Test thoroughly before applying to production
4. Error Handling: Implement comprehensive error boundaries
5. Performance: Consider caching strategy for metrics data

## Expected Outputs
- Updated TypeScript interfaces with full type safety
- Working API endpoints with proper error handling
- Database schema migrations ready for deployment
- Component folder structure created and organized
- Feature flag system configured and tested
- Documentation updates for new data structures
- Foundation ready for component development

There MUST BE NO WORKAROUNDS at this critical stage - if you get stuck with anything, please stop and ask for guidance.