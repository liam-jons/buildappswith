# Trust Domain

This directory contains components, hooks, and utilities for the Trust Architecture in the Buildappswith platform. The Trust domain is responsible for providing transparent validation and trust indicators throughout the application.

## Overview

The Trust domain implements a simplified trust architecture as described in PRD 3.1, focusing on concrete outcomes and transparent verification rather than complex multi-dimensional visualization. The components in this domain visualize validation tiers, trust indicators, and validation status.

## Directory Structure

```
/trust
├── ui/                     # Domain-specific UI components
│   ├── validation-tier-badge.tsx    # Badge showing validation tier
│   ├── trust-indicators.tsx         # Trust metric visualizations
│   ├── validation-tier-progress.tsx # Progress visualization
│   ├── case-study-card.tsx          # Case study display
│   └── index.ts           # Barrel exports
├── outcome-verification.tsx  # Outcome verification component
├── capability-validation.tsx # Capability validation component
├── testimonial-card.tsx      # Client testimonial display
└── index.ts                  # Barrel exports
```

## Core Components

### ValidationTierBadge

Displays a user's validation tier with appropriate visual styling.

```tsx
import { ValidationTierBadge } from "@/components/trust";

<ValidationTierBadge tier="VERIFIED" size="md" />
```

### TrustIndicators

Displays multiple trust metrics for a builder (completion rate, satisfaction, etc.).

```tsx
import { TrustIndicators } from "@/components/trust";

<TrustIndicators 
  metrics={{
    completedProjects: 37,
    clientSatisfaction: 98,
    responseRate: 95,
    onTimeDelivery: 94
  }}
/>
```

### ValidationTierProgress

Shows a builder's progress toward the next validation tier.

```tsx
import { ValidationTierProgress } from "@/components/trust";

<ValidationTierProgress 
  currentTier="VERIFIED"
  nextTier="EXPERT"
  progress={75}
  requirements={[
    { label: "Completed projects", value: 37, target: 50, completed: false },
    { label: "Client satisfaction", value: 98, target: 95, completed: true },
    { label: "Response rate", value: 95, target: 90, completed: true }
  ]}
/>
```

### OutcomeVerification

Displays before/after metrics for completed projects.

```tsx
import { OutcomeVerification } from "@/components/trust";

<OutcomeVerification
  project={{
    title: "Productivity Enhancement",
    client: "Acme Corp",
    beforeMetrics: { productivityScore: 65, completionRate: 72 },
    afterMetrics: { productivityScore: 89, completionRate: 94 },
    improvement: { productivityScore: 37, completionRate: 31 },
    clientVerified: true
  }}
/>
```

## Validation Tiers

The Trust domain implements these validation tiers:

| Tier | Badge Color | Requirements | Benefits |
|------|-------------|--------------|----------|
| **BASIC** | Gray | Account creation and verification | Basic platform access |
| **VERIFIED** | Blue | Identity verification, 5+ completed projects, 90%+ satisfaction | Enhanced visibility, verified badge |
| **EXPERT** | Purple | 50+ completed projects, 95%+ satisfaction, specialty validation | Featured placement, expert badge, advanced capabilities |
| **MASTER** | Gold | 100+ completed projects, 98%+ satisfaction, industry recognition | Top placement, master badge, premium features |

## Integration with Other Domains

### Profile Domain

Trust components enhance builder profiles with validation badges and trust indicators:

```tsx
// components/profile/builder-profile-full.tsx
import { ValidationTierBadge, TrustIndicators } from "@/components/trust";

export function BuilderProfileFull({ builderId }) {
  // Implementation
  return (
    <div>
      <ProfileHeader name={builder.name} title={builder.title} />
      <ValidationTierBadge tier={builder.validationTier} />
      <TrustIndicators metrics={trustMetrics} />
      {/* Other profile content */}
    </div>
  );
}
```

### Marketplace Domain

Trust components influence marketplace search and filtering:

```tsx
// components/marketplace/builder-card.tsx
import { ValidationTierBadge } from "@/components/trust";

export function BuilderCard({ builder }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{builder.name}</h3>
        <ValidationTierBadge tier={builder.validationTier} size="sm" />
      </div>
      {/* Other card content */}
    </Card>
  );
}
```

### Scheduling Domain

The Trust level determines available session types and booking options:

```tsx
// lib/scheduling/utils.ts
import { getTrustLevel } from "@/lib/trust/actions";

export async function getAvailableSessionTypes(builderId: string, userId: string) {
  const trustLevel = await getTrustLevel(userId);
  const allSessionTypes = await getAllSessionTypes(builderId);
  
  // Filter session types based on trust level
  return allSessionTypes.filter(sessionType => {
    // Some session types may require minimum trust levels
    if (sessionType.minimumTrustLevel) {
      const tierValues = {
        BASIC: 1,
        VERIFIED: 2,
        EXPERT: 3,
        MASTER: 4
      };
      
      return tierValues[trustLevel] >= tierValues[sessionType.minimumTrustLevel];
    }
    
    return true;
  });
}
```

## API Reference

### Trust Actions

```tsx
// lib/trust/actions.ts

// Get a user's validation tier
export async function getValidationTier(userId: string): Promise<ValidationTier>

// Get a builder's trust metrics
export async function getTrustMetrics(builderId: string): Promise<TrustMetrics>

// Get validation tier requirements for a builder
export async function getValidationRequirements(builderId: string): Promise<ValidationRequirements>

// Verify a project outcome
export async function verifyProjectOutcome(projectId: string, clientId: string): Promise<VerificationResult>
```

### Trust Types

```tsx
// lib/trust/types.ts

export type ValidationTier = "BASIC" | "VERIFIED" | "EXPERT" | "MASTER";

export interface TrustMetrics {
  completedProjects: number;
  clientSatisfaction: number;
  responseRate: number;
  onTimeDelivery: number;
}

export interface ValidationRequirement {
  label: string;
  value: number;
  target: number;
  completed: boolean;
}

export interface ValidationRequirements {
  currentTier: ValidationTier;
  nextTier: ValidationTier;
  progress: number;
  requirements: ValidationRequirement[];
}

export interface ProjectOutcome {
  title: string;
  client: string;
  beforeMetrics: Record<string, number>;
  afterMetrics: Record<string, number>;
  improvement: Record<string, number>;
  clientVerified: boolean;
}

export interface VerificationResult {
  success: boolean;
  message: string;
}
```

## Development Guidelines

### Creating New Trust Components

When creating new trust components, follow these guidelines:

1. **Focus on Concrete Outcomes**: Emphasize tangible results rather than abstract metrics
2. **Transparent Verification**: Make the verification process clear and understandable
3. **Accessible Design**: Ensure trust indicators are accessible to all users
4. **Consistent Styling**: Follow the established design patterns for trust visualization
5. **Clear Documentation**: Document how the component fits into the trust architecture

### Trust Visualization Principles

Trust visualization should follow these principles:

1. **Simplicity**: Easy to understand at a glance
2. **Honesty**: Accurate representation of reality
3. **Transparency**: Clear about how validation is determined
4. **Accessibility**: Understandable by all users, regardless of technical background
5. **Consistency**: Use consistent patterns across the platform

## Future Enhancements

Planned enhancements for the Trust domain include:

1. **Enhanced Validation Processes**: More sophisticated validation mechanisms
2. **Trust Score API**: Public API for accessing validation status
3. **Third-Party Verification**: Integration with external validation services
4. **Customizable Trust Displays**: Allow builders to highlight specific trust metrics
5. **Trust Timeline**: Historical view of trust development over time