# Magic UI Integration Guide

## Overview

This guide documents the standard approach for integrating Magic UI components in the Buildappswith platform's domain-based architecture. Magic UI components provide enhanced visual effects and animations that elevate the user experience while maintaining performance and accessibility standards.

## Architecture

### Component Organization

Magic UI components exist in a dedicated directory separate from domain components:

```
/components
├── ui/                # Shared UI components
│   ├── core/          # Foundational components (mostly shadcn/ui)
│   └── composite/     # Composed UI components
├── magicui/           # Enhanced visual and animation components
│   ├── particles.tsx  # Visual effect components
│   ├── marquee.tsx    # Animation components
│   └── index.ts       # Barrel exports for all magic UI components
└── [domain]/          # Domain-specific components
```

This organization recognizes that Magic UI components are specialized and cross-cutting, serving as a visual enhancement layer that can be used by any domain.

### Import Patterns

The correct import pattern for Magic UI components is:

```tsx
// Using barrel exports (preferred)
import { Particles, Marquee } from "@/components/magicui";

// Direct imports (acceptable alternative)
import { Particles } from "@/components/magicui/particles";
```

All Magic UI components use named exports, not default exports, to maintain consistency with the rest of the component library.

## Usage Guidelines

### Server vs. Client Components

- Magic UI components typically involve animations and user interactions, so they should generally be marked with `"use client"` directive.
- Always respect reduced motion preferences for users with motion sensitivity.
- Provide static alternatives for users with motion sensitivity where appropriate.

Example:

```tsx
"use client";

import { Particles } from "@/components/magicui";
import { useReducedMotion } from "framer-motion";

export function EnhancedBackground() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div className="relative">
      {!shouldReduceMotion ? (
        <Particles
          className="absolute inset-0 -z-10"
          quantity={50}
          ease={70}
          size={0.05}
          staticity={40}
          color={"#ffffff"}
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-background/20" />
      )}
      {/* Content */}
    </div>
  );
}
```

### Barrel Exports

The `components/magicui/index.ts` file exports all Magic UI components:

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
export * from './particles';
export * from './ripple';
export * from './terminal';
export * from './text-animate';
export * from './typing-animation';
export * from './word-rotate';
```

### Performance Considerations

- Keep animations subtle and purposeful
- Optimize particle counts and animation complexity for mobile devices
- Use appropriate will-change properties for performance optimization
- Consider code-splitting for heavier animations
- Test on lower-end devices to ensure smooth performance

## Content Security Policy

When using Magic UI components, ensure the Content Security Policy (CSP) allows the necessary resources:

```javascript
// In next.config.mjs
const ContentSecurityPolicy = `
  // Other directives...
  img-src 'self' blob: data: https://*.stripe.com https://api.placeholder.org https://cdn.magicui.design https://randomuser.me https://placehold.co https://*.clerk.com https://img.clerk.com https://images.clerk.dev;
  // Other directives...
`;
```

Also ensure the Next.js image optimization configuration includes all necessary domains:

```javascript
images: {
  // Other config...
  remotePatterns: [
    // Other patterns...
    {
      protocol: 'https',
      hostname: 'cdn.magicui.design',
    },
    // Other patterns...
  ],
},
```

## Domain Integration

While Magic UI components exist outside the domain structure, they can be integrated with domain-specific components:

```tsx
import { Marquee } from "@/components/magicui";
import { cn } from "@/lib/utils";

interface MarketingMarqueeProps {
  title?: string;
  subtitle?: string;
  items: string[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  className?: string;
}

export function MarketingMarquee({
  title,
  subtitle,
  items = [],
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: MarketingMarqueeProps) {
  // Implementation using Magic UI's Marquee component
  return (
    <section className={cn("w-full py-16 md:py-20 overflow-hidden", className)}>
      {/* Section content */}
      <Marquee
        pauseOnHover={pauseOnHover}
        reverse={direction === "right"}
        // Other props
      >
        {/* Marquee content */}
      </Marquee>
    </section>
  );
}
```

## Future Considerations

- As the component library evolves, maintain the separation between Magic UI components and domain components
- Consider automated testing approaches for animation-heavy components
- Document performance metrics for complex animations to guide usage