# Landing Page Integration Points

This document outlines the integration points between the redesigned landing page and various services/systems in the BuildAppsWith platform.

## Sanity CMS Integration

The landing page redesign should prepare for future content management with Sanity to enable dynamic updates to marketing content.

### Current Sanity Setup

- **Project Configuration**: Sanity is configured in `/sanity/env.ts` and initialized in `/sanity/lib/client.ts`
- **Schema Types**: Defined in `/sanity/schemaTypes/index.ts`

### Integration Points for Landing Page

1. **Hero Section Content**
   - Create a schema for the hero section that includes:
     - Headline text
     - Subheadline text
     - Word rotation array items
     - CTA button texts and links
   
   ```typescript
   // Future Sanity schema
   export const heroSection = {
     name: 'heroSection',
     title: 'Hero Section',
     type: 'document',
     fields: [
       {
         name: 'headline',
         title: 'Headline',
         type: 'string',
       },
       {
         name: 'subheadline',
         title: 'Subheadline',
         type: 'text',
       },
       {
         name: 'rotatingWords',
         title: 'Rotating Words',
         type: 'array',
         of: [{ type: 'string' }],
       },
       // CTAs and other fields
     ],
   }
   ```

2. **AI Capabilities Marquee**
   - Schema for capabilities and limitations with:
     - Title
     - Icon (reference to image asset)
     - Display order

3. **Skills Learning Tree**
   - Schema for skills/learning path:
     - Title
     - Level
     - Icon
     - Description
     - Status (active, upcoming, completed)

4. **Navigation Structure**
   - Schema for navigation items:
     - Menu title
     - Link URL
     - Dropdown items (nested)

### Implementation Strategy

For initial implementation, use static data structures with a clear path to Sanity integration:

1. Create strongly typed interfaces that match future Sanity schema
2. Use data constant files that adhere to these interfaces
3. Add comments indicating future Sanity query replacement points

Example:

```typescript
// In types.ts
export interface HeroSectionContent {
  headline: string;
  subheadline: string;
  rotatingWords: string[];
  primaryCTA: { text: string; href: string };
  secondaryCTA: { text: string; href: string };
}

// In hero-section-data.ts - will be replaced with Sanity query
export const heroContent: HeroSectionContent = {
  headline: "Learn AI with people, not just prompts",
  // other content
};

// In hero-section.tsx
// TODO: Replace static import with Sanity query
// Future implementation:
// export async function HeroSection() {
//   const content = await getSanityContent('heroSection');
```

## Sentry Integration

Sentry is already configured for error monitoring in:
- `/sentry.server.config.ts` (server-side)
- `/sentry.edge.config.ts` (edge runtime)

### Integration Points

1. **Component Error Boundaries**
   - Wrap landing page sections in error boundaries to prevent full page failures
   - Log component-specific errors to Sentry

2. **Loading State Tracking**
   - Add custom Sentry transactions for component loading
   - Track performance metrics for key interaction points

3. **User Interaction Monitoring**
   - Add custom Sentry events for key conversion points (CTA clicks)

Implementation example:

```typescript
// Error boundary for landing page components
import * as Sentry from "@sentry/nextjs";

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  displayName: string
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    try {
      return <Component {...props} />;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { component: displayName },
      });
      return <FallbackUI componentName={displayName} />;
    }
  };
}
```

## Datadog Integration

Datadog is used for monitoring and analytics as configured in:
- `/datadog-config.js`
- `/instrumentation.ts`

### Integration Points

1. **Performance Monitoring**
   - Track component render times
   - Monitor user interactions with key CTAs
   - Measure time-to-interactive for dynamic elements

2. **User Journey Analytics**
   - Track progression through landing page sections
   - Monitor conversion paths

Implementation strategy:

```typescript
// Example RUM event for CTA interaction
export function trackCTAClick(ctaName: string, ctaLocation: string) {
  if (typeof window !== 'undefined' && window.DD_RUM) {
    window.DD_RUM.addAction('click', {
      target: { name: ctaName },
      context: { location: ctaLocation }
    });
  }
}
```

## Image Asset Management

### Current Structure

Images are currently stored in `/public/images/` and `/public/logos/`

### Recommended Approach

1. **Image Optimization**
   - Use Next.js Image component with proper sizing
   - Prepare for responsive image delivery
   - Set up image optimization workflow

2. **Asset Organization**
   - Maintain consistent naming for landing page assets
   - Create a dedicated landing directory: `/public/landing/`
   - Use subdirectories for different sections: 
     - `/public/landing/hero/`
     - `/public/landing/skills/`
     - `/public/landing/cta/`

## Animation and Interaction Integration

### MagicUI Components

The landing page leverages MagicUI components for animations:

1. **WordRotate**: For rotating text in the hero section
2. **Marquee**: For scrolling content in capabilities section
3. **BorderBeam**: For highlighting elements
4. **Particles**: For background effects

### Animation Strategy

1. **Performance Considerations**
   - Use `will-change` property strategically on animated elements
   - Implement lazy loading for off-screen animations
   - Consider reduced motion preferences

2. **Interaction Tracking**
   - Add data attributes for tracking interactions
   - Implement scroll-based animation triggers

## SEO Integration

### Current Structure

SEO is handled at the page level in Next.js metadata.

### Integration Points

1. **Structured Data**
   - Implement JSON-LD for rich search results
   - Add appropriate schema.org markup

2. **Metadata Optimization**
   - Ensure consistent metadata across landing page
   - Optimize meta descriptions for new content

## Future Integration Considerations

1. **A/B Testing Framework**
   - Prepare component structure for variant testing
   - Add data attributes to track variant performance

2. **Localization**
   - Structure text content for future internationalization
   - Use text constants pattern rather than inline text

3. **Analytics Integration**
   - Consider specific event tracking for landing page behaviors
   - Implement conversion tracking for marketing objectives

---

## Implementation Checklist

- [ ] Set up component interfaces aligned with future Sanity schemas
- [ ] Implement error boundaries with Sentry integration
- [ ] Add performance tracking with Datadog RUM
- [ ] Optimize image assets and implement responsive delivery
- [ ] Add SEO structured data
- [ ] Test reduced motion and accessibility compliance