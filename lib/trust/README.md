# Trust Domain

This directory contains business logic and data models for the Buildappswith trust architecture, which is responsible for establishing and visualizing builder credibility.

## Overview

The trust architecture provides a simplified, concrete outcome-based approach to establishing builder credibility. It replaces the previous multi-dimensional visualization with a focused system that emphasizes:

1. **Outcome Verification**: Before/after metrics for completed projects
2. **Capability Validation**: Portfolio verification through concrete examples
3. **Reliability Indicators**: Response time, completion consistency, communication clarity
4. **Community Recognition**: Peer endorsements and knowledge contribution

## Directory Structure

```
/lib/trust
├── actions.ts      # Server actions for trust verification
├── api.ts          # Client API functions for trust data
├── schemas.ts      # Zod validation schemas
├── types.ts        # TypeScript type definitions
├── utils.ts        # Utility functions
└── index.ts        # Barrel exports
```

## Core Functionality

The trust domain implements:

1. **Validation Tier System**: Basic, Verified, and Expert tiers based on submitted evidence
2. **Evidence Submission**: System for builders to submit verification evidence
3. **Verification Processing**: Validation checks and tier calculation
4. **Trust Visualization**: Components for displaying trust indicators

## Key Types

- `ValidationTier`: Trust levels (basic, verified, expert)
- `TrustEvidence`: Structured evidence for verification
- `TrustValidationResult`: Result of validation processing

## Usage

Import trust-related functionality using the barrel exports:

```typescript
import { 
  getValidationTier,
  calculateValidationTier,
  formatValidationTier 
} from "@/lib/trust";
```

## Related Components

Trust visualization components can be found in:

```
/components/trust
├── ui/
│   ├── validation-tier-badge.tsx
│   └── trust-evidence-display.tsx
└── index.ts
```
