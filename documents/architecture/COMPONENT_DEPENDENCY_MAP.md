# Component Dependency Map

**Last Updated:** May 14, 2025  
**Note:** This document has been updated to reflect the header unification changes. The previously separate MarketingHeader component has been removed in favor of a unified SiteHeader component.

This document maps the component dependencies and import/export patterns for the marketing page and related components, with a focus on the recent updates in the feature/updated-landing-page branch.

## Marketing Page Component Hierarchy

### Page Structure and Component Flow

```mermaid
graph TD
    A[app/(marketing)/page.tsx] --> B[MarketingHero]
    A --> C[FeatureShowcase]
    A --> D[TestimonialSection]
    A --> E[MarketingCTA]
    A --> F[TrustProofCompanies]
    A --> G[MarketingMarquee]
    A --> H["Particles (Error)"]
    
    G --> I[Marquee]
    
    J[app/(marketing)/layout.tsx] --> K[SiteHeader]
    J --> L[MarketingFooter]
    
    subgraph marketing-components ["Marketing Components (@/components/marketing)"]
        B
        C
        D
        E
    end
    
    subgraph marketing-ui ["Marketing UI (@/components/marketing/ui)"]
        F["TrustProofCompanies (New)"]
        G["MarketingMarquee (New)"]
    end
    
    subgraph magicui ["MagicUI Components (@/components/magicui)"]
        H["Particles (Named Export)"]
        I["Marquee (Named Export)"]
    end
```

## Import/Export Patterns

### Current Implementation

```typescript
// In app/(marketing)/page.tsx
import Particles from "@/components/magicui/particles"; // ERROR: Default import for named export
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { TestimonialSection } from "@/components/marketing/testimonial-section";
import { MarketingCTA } from "@/components/marketing/marketing-cta";
import { TrustProofCompanies, MarketingMarquee } from "@/components/marketing/ui";

// In components/marketing/ui/marketing-marquee.tsx
import { Marquee } from "@/components/magicui/marquee"; // CORRECT: Named import for named export

// In components/magicui/particles.tsx
export const Particles: React.FC<ParticlesProps> = ({ ... }); // CORRECT: Named export

// In components/magicui/marquee.tsx
export function Marquee({ ... }); // CORRECT: Named export
```

### Barrel Export Files

#### MagicUI Barrel (`components/magicui/index.ts`)

```typescript
export * from './animated-circular-progress-bar';
export * from './animated-subscribe-button';
export * from './aurora-text';
export * from './avatar-circles';
export * from './blur-fade';
export * from './border-beam';
export * from './dot-pattern';
export * from './globe';
export * from './marquee';
export * from './orbiting-circles';
export * from './particles'; // CORRECT: Exports the named Particles component
export * from './ripple';
export * from './terminal';
export * from './text-animate';
export * from './typing-animation';
export * from './word-rotate';
```

#### Marketing UI Barrel (`components/marketing/ui/index.ts`)

```typescript
export * from './testimonial-card';
export * from './marketing-stat';
export * from './feature-card';
export * from './trust-proof-companies'; // CORRECT: Exports the new component
export * from './marketing-marquee'; // CORRECT: Exports the new component
```

## New Components Analysis

### 1. TrustProofCompanies

**File**: `components/marketing/ui/trust-proof-companies.tsx`

```typescript
"use client"; // CORRECT: Marked as client component

// Dependencies:
import { cn } from "@/lib/utils";
import Image from "next/image"; // UNUSED: Imported but not used

// Export: 
export function TrustProofCompanies({ ... }) { ... }
// CORRECT: Named export
```

**Usage in Page**:
```typescript
<TrustProofCompanies
  title="Trusted by Industry Leaders"
  subtitle="Join the companies building the future with our network of AI experts"
  companies={[
    { id: "anthropic", name: "Anthropic", logo: "/logos/anthropic-logo.svg", altText: "Anthropic logo" },
    // More companies...
  ]}
/>
```

### 2. MarketingMarquee

**File**: `components/marketing/ui/marketing-marquee.tsx`

```typescript
"use client"; // CORRECT: Marked as client component

// Dependencies:
import React from "react";
import { Marquee } from "@/components/magicui/marquee"; // CORRECT: Named import
import { cn } from "@/lib/utils";

// Export:
export function MarketingMarquee({ ... }) { ... }
// CORRECT: Named export
```

**Usage in Page**:
```typescript
<MarketingMarquee
  title="The Power of AI"
  subtitle="AI is rapidly evolving, transforming how we build applications and solve problems"
  items={[
    "AI Website Development",
    // More items...
  ]}
  direction="right"
  speed="slow"
  pauseOnHover
/>
```

### 3. Particles

**File**: `components/magicui/particles.tsx`

```typescript
"use client"; // CORRECT: Marked as client component

// Dependencies:
import { cn } from "@/lib/utils";
import React, {
  ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";

// Export:
export const Particles: React.FC<ParticlesProps> = ({ ... }) => { ... };
// CORRECT: Named export
```

**Usage in Page** (INCORRECT):
```typescript
// Default import for a named export
import Particles from "@/components/magicui/particles"; 

// Later in the component:
<Particles
  className="absolute inset-0 -z-10"
  quantity={50}
  ease={70}
  size={0.05}
  staticity={40}
  color={"#ffffff"}
/>
```

## Import Path Resolution

### Current Path Aliases

The `@/` prefix in imports is resolved based on the tsconfig.json path configuration:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This correctly maps `@/components/magicui/particles` to `/Users/liamj/Documents/development/buildappswith/components/magicui/particles`.

## Error Analysis

### Component Loading Error

The error referencing `/Users/liamj/src/...` in paths suggests one of two issues:

1. **Incorrect Import Type**: The import statement in page.tsx is using a default import (`import Particles from`) for a component that is exported as a named export (`export const Particles`).

2. **Build/Bundling Path Leak**: The error path includes part of the local development path, which might indicate that the build process is including absolute paths rather than relative ones.

## Proper Import Patterns

According to the folder structure documentation, the preferred import pattern is:

```typescript
// Preferred
import { ComponentName } from "@/components/domain";

// Avoid
import { ComponentName } from "@/components/domain/component-name";
```

For the Particles component, this would be:

```typescript
// Correct:
import { Particles } from "@/components/magicui";

// Alternative but acceptable:
import { Particles } from "@/components/magicui/particles";

// Incorrect (current implementation):
import Particles from "@/components/magicui/particles";
```

## Recommendations

1. **Fix Import Statement**: Update the import in app/(marketing)/page.tsx:
   ```typescript
   // Change FROM:
   import Particles from "@/components/magicui/particles";
   
   // TO:
   import { Particles } from "@/components/magicui";
   // or
   import { Particles } from "@/components/magicui/particles";
   ```

2. **Ensure Consistent Pattern**: Audit all imports of magicui components to ensure they follow the named import pattern.

3. **Documentation Update**: Add clarity to the component documentation about export patterns, specifically noting that all components use named exports, not default exports.

4. **Next Steps**: After fixing the import issue, investigate if there are any other components with similar import/export mismatches.

## Relationship to Folder Structure

The current implementation largely follows the documented folder structure with one addition:

- The `magicui` folder is a new category not explicitly covered in the documentation
- It follows similar patterns to other component categories (barrel exports, client components)
- It serves as a foundation for higher-level marketing components

Considering its integration with the rest of the component structure, `magicui` should be documented as a specialized UI component category similar to the existing `ui` directory, but focused on interactive and visual effects components.