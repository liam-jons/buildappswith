# Session 2: Core Components Implementation

## Session Context
- Session Type: Implementation
- Component Focus: Builder Card V2 Core Components - Layout, pathway indicators, skills display, and booking integration
- Current Branch: feature/builder-card-redesign
- Related Documentation: 
  - /docs/marketplace/BUILDER_CARD_VISUAL_MOCKUP.md
  - /docs/marketplace/SKILLS_DISPLAY_TRANSFORMATION.md
  - /docs/marketplace/BUILDER_CARD_INTERFACES.md
- Project root directory: /Users/liamj/Documents/development/buildappswith

## Implementation Objectives
- Build the main BuilderCardV2 component with new layout
- Implement PathwayIndicators with interactive tooltips
- Transform skills display from chips to bullet points
- Create SessionAvailability component with auth awareness
- Implement BuilderMetrics display
- Build auth-aware CardActions component

## Implementation Plan

### 1. Main BuilderCardV2 Component
- Create the card container with proper layout structure
- Implement responsive design for mobile/desktop
- Add hover effects and transitions
- Set up component props and state management
- Integrate with feature flag system

### 2. Pathway Indicators Component
```typescript
interface PathwayIndicatorsProps {
  specializations: PathwaySpecialization[];
  onPathwayClick?: (pathwayId: string) => void;
}
```
- Display pathway icons (🚀 🔄 🎨) with active states
- Add tooltips showing client counts
- Implement click handlers for analytics
- Style active vs inactive pathways
- Add smooth hover animations

### 3. Skills List Transformation
- Convert from horizontal chips to vertical bullets
- Implement "Top Skills:" label
- Add expandable "more skills" functionality
- Create bullet point formatting
- Ensure proper responsive behavior

### 4. Session Availability Component
- Display session type badges (Free, Pathway, Specialized)
- Show authentication requirements
- Implement price range display
- Add session count indicators
- Create responsive badge layout

### 5. Builder Metrics Display
- Show rating with star icon
- Display completed sessions count
- Add success rate percentage
- Implement compact metric layout
- Create loading states for async data

### 6. Card Actions Component
- Build "Book Session" primary CTA
- Add "View Profile" secondary action
- Implement auth-aware button states
- Handle loading and disabled states
- Add proper click handlers

## Technical Specifications

### Component Structure
```tsx
// components/marketplace/builder-card-v2/BuilderCardV2.tsx
export function BuilderCardV2({ builder, isAuthenticated }: BuilderCardProps) {
  const canBook = useBookingEligibility(builder, isAuthenticated);
  
  return (
    <Card className="builder-card-v2">
      <BuilderHeader 
        name={builder.name}
        tagline={builder.tagline}
        avatarUrl={builder.avatarUrl}
        validationTier={builder.validationTier}
      />
      
      <PathwayIndicators 
        specializations={builder.pathwaySpecializations}
      />
      
      <SkillsList 
        skills={builder.skills}
        topSkills={builder.topSkills}
      />
      
      <SessionAvailability 
        availability={builder.sessionTypeAvailability}
        isAuthenticated={isAuthenticated}
      />
      
      <BuilderMetrics 
        metrics={builder.performanceMetrics}
      />
      
      <CardActions 
        builderId={builder.id}
        canBook={canBook}
        isAuthenticated={isAuthenticated}
      />
    </Card>
  );
}
```

### Pathway Indicators Implementation
```tsx
export function PathwayIndicators({ specializations }: PathwayIndicatorsProps) {
  return (
    <div className="pathway-indicators">
      {PATHWAYS_ORDER.map(pathwayId => {
        const spec = specializations.find(s => s.pathwayId === pathwayId);
        const pathway = PATHWAYS[pathwayId.toUpperCase()];
        
        return (
          <Tooltip 
            key={pathwayId}
            content={`${spec?.metrics.activeClients || 0} active clients`}
          >
            <div 
              className={cn(
                "pathway-badge",
                spec?.isActive && "pathway-active"
              )}
            >
              <span>{pathway.icon}</span>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
```

### Skills List Component
```tsx
export function SkillsList({ skills, topSkills, maxDisplay = 3 }: SkillsListProps) {
  const displaySkills = topSkills || skills.slice(0, maxDisplay);
  const remainingCount = skills.length - displaySkills.length;
  
  return (
    <div className="skills-list">
      <h4 className="skills-title">Top Skills:</h4>
      {displaySkills.map((skill, i) => (
        <div key={i} className="skill-item">
          <span className="skill-bullet">•</span>
          <span>{formatSkillName(skill)}</span>
        </div>
      ))}
      {remainingCount > 0 && (
        <button className="more-skills-link">
          + {remainingCount} more skills
        </button>
      )}
    </div>
  );
}
```

### CSS Modules Structure
```css
/* styles/builder-card.module.css */
.builder-card-v2 {
  @apply rounded-lg border bg-card shadow-sm transition-all;
  @apply hover:shadow-md hover:-translate-y-0.5;
}

.pathway-indicators {
  @apply flex gap-2 py-3;
}

.pathway-badge {
  @apply flex items-center justify-center;
  @apply w-10 h-10 rounded-full;
  @apply bg-gray-100 text-gray-400;
  @apply transition-all cursor-pointer;
}

.pathway-active {
  @apply bg-opacity-20 text-opacity-100;
}

.skills-list {
  @apply space-y-1;
}

.skill-item {
  @apply flex items-center gap-2 text-sm;
}
```

## Implementation Notes
1. Component Isolation: Each sub-component should be independently testable
2. Prop Validation: Use TypeScript interfaces for all props
3. Responsive Design: Test on mobile, tablet, and desktop
4. Accessibility: Add proper ARIA labels and keyboard navigation
5. Performance: Implement React.memo where appropriate

## Expected Outputs
- Fully functional BuilderCardV2 component
- Working pathway indicators with tooltips
- Transformed skills display using bullet points
- Session availability badges with auth awareness
- Metrics display with proper formatting
- Auth-aware action buttons
- Complete CSS styling with animations
- Component documentation

There MUST BE NO WORKAROUNDS at this critical stage - if you get stuck with anything, please stop and ask for guidance.