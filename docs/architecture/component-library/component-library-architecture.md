# Component Library Architecture - Visual Components
Linear Project: MVP Revenue Foundation
Issue: BUI-89 - Component Library Foundation
Date: May 3, 2025
Session Type: Planning
1. Executive Summary
This document outlines the architecture and implementation plan for the Component Library Foundation with a focus on visual components. The foundation will integrate Magic UI Pro components into a domain-driven architecture, providing the building blocks for all platform interfaces while supporting the critical path implementation of landing page, marketplace, and Liam's profile as outlined in PRD 3.1.
The architecture leverages a "build vs. buy" approach by integrating Magic UI Pro components that we already have access to, rather than building custom components from scratch. This approach aligns with PRD 3.1 Section 5.2 and will enable faster development while maintaining high-quality visual design and interactions.
2. Component Architecture Overview
2.1 Architectural Principles

Domain-Driven Organization: Components are organized by business domain first, then by technical function
Component Composition: Complex components are built by composing simpler ones
Separation of Concerns: Logic is separated from presentation using container/presenter pattern
Consistency: Consistent patterns for component usage, naming, and documentation
Accessibility: All components meet WCAG 2.1 AA standards
Performance: Server-first approach with selective client components
Maintainability: Clear documentation and testing practices

2.2 Component Organization Structure
The component organization follows the domain-driven principles from the FOLDER_STRUCTURE_GUIDE.md:
/components
├── [domain]/                 # Domain-specific components
│   ├── ui/                   # Domain-specific UI components
│   │   ├── [component].tsx   # Individual components
│   │   └── index.ts          # Barrel exports
│   ├── [component].tsx       # Domain-specific components
│   └── index.ts              # Barrel exports
├── ui/                       # Shared UI components
│   ├── core/                 # Foundational UI components
│   │   ├── [component].tsx   # Individual components
│   │   └── index.ts          # Barrel exports
│   ├── composite/            # Composed UI components
│   │   ├── [component].tsx   # Individual components
│   │   └── index.ts          # Barrel exports
│   └── index.ts              # Barrel exports
└── providers/                # Context providers
Specific domain folders will include:
/components
├── marketing/                # Landing page components
├── marketplace/              # Marketplace components
├── profile/                  # Profile components
├── trust/                    # Trust architecture components
├── booking/                  # Booking components
├── payment/                  # Payment components
└── learning/                 # Learning experience components
2.3 Component Layer Architecture
The component architecture follows a layered approach:

Base Components Layer: Magic UI Pro components wrapped in our own components
Shared UI Layer: Common UI components used across multiple domains
Domain-Specific Layer: Components specialized for specific domains
Page Components Layer: Components that compose domain components for specific pages

Page Components
    │
    ▼
Domain Components
    │
    ▼
Shared UI Components
    │
    ▼
Base Components (Magic UI Pro)
2.4 Component Composition Patterns
The architecture employs several component composition patterns:

Base Component Pattern: Thin wrappers around Magic UI Pro components

tsx// Base Button component
import { Button as MagicButton } from './MagicButton';

export function Button({ children, ...props }) {
  return <MagicButton {...props}>{children}</MagicButton>;
}

Domain-Specific Wrapper Pattern: Add domain logic to base components

tsx// Domain-specific MarketingButton
import { Button } from '@/components/ui';

export function MarketingButton({ onAction, ...props }) {
  // Add domain-specific logic
  const handleClick = () => {
    // Track analytics
    trackButtonClick();
    // Call provided action handler
    onAction?.();
  };
  
  return <Button onClick={handleClick} {...props} />;
}

Compound Component Pattern: For complex UI elements

tsx// Card compound component
function Card({ children, ...props }) {
  return <div className="card" {...props}>{children}</div>;
}

Card.Header = function CardHeader({ children, ...props }) {
  return <div className="card-header" {...props}>{children}</div>;
};

Card.Body = function CardBody({ children, ...props }) {
  return <div className="card-body" {...props}>{children}</div>;
};

Card.Footer = function CardFooter({ children, ...props }) {
  return <div className="card-footer" {...props}>{children}</div>;
};

export { Card };

Container/Presenter Pattern: Separation of logic and presentation

tsx// Container component with logic
function ProfileCardContainer({ profileId }) {
  const { profile, isLoading, error } = useProfile(profileId);
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <ProfileCardPresenter profile={profile} />;
}

// Presenter component for UI only
function ProfileCardPresenter({ profile }) {
  return (
    <Card>
      <Card.Header>
        <Avatar src={profile.avatar} />
        <h3>{profile.name}</h3>
      </Card.Header>
      <Card.Body>{/* Profile details */}</Card.Body>
    </Card>
  );
}
3. Magic UI Pro Component Selection
Based on the user's specified components, we will integrate the following Magic UI Pro components:
3.1 Selected Visual Components
ComponentVariantPrimary DomainPurposeWrapper ComponentHeader2MarketingMain navigation for landing pagesMarketingHeaderHero1MarketingPrimary landing page bannerMarketingHeroSocial Proof Companies1 (with logos from 4)Marketing, TrustDisplay trusted companiesTrustProofCompaniesStats2MarketingDisplay key statisticsMarketingStatsFeature Scroll1MarketingShowcase platform featuresFeatureShowcaseAnimated Feature Card7, 9, 10Marketplace, ProfileDisplay builder capabilitiesBuilderFeatureCardCall to Action2, 4, 6, 11MarketingDrive user conversionsMarketingCTAFAQ2MarketingAnswer common questionsMarketingFAQFooter1MarketingBottom navigation and informationMarketingFooter
3.2 Installation Requirements
Magic UI Pro components follow a similar installation pattern to shadcn/ui, where components are added directly to the project rather than imported from a package:

Prerequisites:

Node.js v18.17+
React 18+ or React 19
Tailwind CSS setup (v3+ or v4)


Base Setup:
bashnpx shadcn-ui init

Dependencies:
bashnpm install clsx tailwind-merge framer-motion

Component Installation:
bash# For example, to add a button component
npx shadcn-ui add button


3.3 Component Customization Approach
Magic UI Pro components can be customized through:

Tailwind CSS: Using Tailwind utility classes for styling
tsx<Button className="bg-brand-500 hover:bg-brand-600">
  Custom Styled Button
</Button>

Props: Modifying behavior through component properties
tsx<AnimatedList delay={0.1} staggerDelay={0.05}>
  {items.map(item => <ListItem key={item.id} {...item} />)}
</AnimatedList>

Theme Customization: Modifying the theme in Tailwind configuration
js// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          // other shades
          900: '#0c4a6e',
        }
      }
    }
  }
}

Component Extension: Creating new components that extend Magic UI Pro components
tsximport { Button } from '@/components/ui';

export function PrimaryButton(props) {
  return <Button variant="primary" size="lg" {...props} />;
}


4. Domain-Specific Visual Components
We will create domain-specific wrapper components around Magic UI Pro components to provide specialized functionality for each domain.
4.1 Marketing Domain Components
ComponentBase ComponentPurposeKey FunctionalityMarketingHeaderHeader 2Main navigation for landing pagesNavigation, authentication state, responsive designMarketingHeroHero 1Primary landing page bannerCustomizable content, CTA buttons, animationsMarketingStatsStats 2Display key statisticsData integration, number formatting, animationsFeatureShowcaseFeature Scroll 1Showcase platform featuresFeature highlight, smooth scrolling, responsive layoutMarketingCTACall to Action 2, 4, 6, 11Drive user conversionsAction tracking, personalized messagingMarketingFAQFAQ 2Answer common questionsDynamic content, expandable sectionsMarketingFooterFooter 1Bottom navigation and informationLinks, social media, newsletter sign-up
4.2 Marketplace Domain Components
ComponentBase ComponentPurposeKey FunctionalityBuilderCardAnimated Feature Card 7Display builder informationProfile data integration, trust indicatorsBuilderFeatureCardAnimated Feature Card 9, 10Showcase builder capabilitiesFeature highlighting, animation effectsBuilderGridCustom CompositeDisplay multiple buildersFiltering, sorting, paginationMarketplaceSearchCustom CompositeSearch for buildersSearch functionality, filters, suggestionsCategoryFilterCustom CompositeFilter builders by categoryFilter UI, selection state management
4.3 Profile Domain Components
ComponentBase ComponentPurposeKey FunctionalityProfileHeaderCustom CompositeDisplay profile headerAvatar, name, key metricsValidationTierBadgeCustom with Magic UIDisplay trust validation tierVisual tier indicators, tooltipsProfileCardAnimated Feature Card 9Show profile overviewProfile data display, interactive elementsSessionTypeCardAnimated Feature Card 10Display available session typesPricing, duration, descriptionProfileStatsStats 2Show profile statisticsKey metrics, data formattingProfileCTACall to Action 6Drive profile actionsBooking initiation, contact actions
4.4 Trust Domain Components
ComponentBase ComponentPurposeKey FunctionalityTrustProofCompaniesSocial Proof Companies 1Display trusted companiesLogo integration, responsive layoutValidationBadgeCustom with Magic UIDisplay validation statusVisual indicators, tooltipsTrustIndicatorsCustom CompositeShow trust factorsVerification badges, ratingsTestimonialCardCustom with Magic UIDisplay testimonialsUser testimonials, formatting
5. Visual Theming System
The visual theming system will ensure consistent styling across all components while enabling customization.
5.1 Color Palette
A comprehensive color system based on Tailwind's approach, with:

Primary Colors: Brand colors for primary UI elements
Neutral Colors: Grays for text, backgrounds, and borders
Semantic Colors: Success, warning, error, and info colors
Accent Colors: Highlight colors for special elements

js// tailwind.config.js (excerpt)
colors: {
  primary: {
    50: '#ebf5ff',
    100: '#e1effe',
    // ...other shades
    900: '#1e3a8a',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    // ...other shades
    900: '#111827',
  },
  success: {
    50: '#ecfdf5',
    // ...other shades
    900: '#064e3b',
  },
  // Warning, error, info colors...
  accent: {
    // Accent color variations
  }
}
5.2 Typography System
A consistent typography system with:

Font Families: Primary and secondary font families
Font Sizes: Consistent scale for all text elements
Font Weights: Standard weights for different text roles
Line Heights: Appropriate line heights for readability
Typography Components: Reusable text components

js// tailwind.config.js (excerpt)
fontFamily: {
  sans: ['Inter var', 'sans-serif'],
  serif: ['Merriweather', 'serif'],
  mono: ['JetBrains Mono', 'monospace'],
},
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  // Additional sizes...
}
5.3 Spacing and Layout
Standardized spacing and layout variables:

Spacing Scale: Consistent spacing values
Layout Components: Grid and container components
Responsive Breakpoints: Standard breakpoints for all components
Z-Index Management: Organized z-index scale

js// tailwind.config.js (excerpt)
spacing: {
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  // Additional spacing values...
},
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
5.4 Animation and Transitions
Standardized animation and transition systems:

Duration Values: Standard duration times
Easing Functions: Common easing presets
Animation Presets: Reusable animation patterns
Transition Defaults: Standard transition properties

js// tailwind.config.js (excerpt)
transitionProperty: {
  'none': 'none',
  'all': 'all',
  'default': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
  // Additional transition properties...
},
transitionTimingFunction: {
  'linear': 'linear',
  'in': 'cubic-bezier(0.4, 0, 1, 1)',
  'out': 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
},
transitionDuration: {
  '75': '75ms',
  '100': '100ms',
  '150': '150ms',
  '200': '200ms',
  '300': '300ms',
  '500': '500ms',
  '700': '700ms',
  '1000': '1000ms',
}
6. Implementation Plan
6.1 Implementation Phases
The implementation will follow these phases:

Phase 1: Foundation Setup (Week 1)

Set up component architecture
Implement theming system
Create base component wrappers
Configure tooling and documentation


Phase 2: Core UI Components (Weeks 2-3)

Implement core UI components
Establish component documentation
Create component testing framework
Develop usage examples


Phase 3: Domain Components (Weeks 4-6)

Implement Marketing domain components
Implement Marketplace domain components
Implement Profile domain components
Implement Trust domain components


Phase 4: Review and Refinement (Weeks 7-8)

Conduct comprehensive testing
Refine documentation
Address issues and improvements
Prepare for integration with other systems



6.2 Component Implementation Priorities
Implementation will prioritize components in this order:

Critical Path Components:

Marketing components for landing page (Header, Hero, CTA)
Profile components for Liam's profile (ProfileCard, SessionTypeCard)
Marketplace components for builder discovery (BuilderCard, BuilderGrid)


Supporting Components:

Trust components for validation display
Additional marketing components
Supplementary profile and marketplace components


Enhancement Components:

Advanced animations and effects
Interactive features
Progressive enhancement components



6.3 Linear Issue Structure
The work has been organized in Linear with the following structure:

Parent Issue: BUI-89: Component Library Foundation

Child Issues:

BUI-90: Magic UI Pro Component Research and Selection
BUI-91: Component Architecture and Organization
BUI-92: Core UI Component Implementation
BUI-93: Domain-Specific Visual Components
BUI-94: Documentation and Usage Guidelines
BUI-95: Component Testing Framework
BUI-96: Visual Theming System





7. Documentation Approach
7.1 Documentation Structure
Component documentation will include:

Component Library Overview:

Architecture explanation
Component organization
Usage principles
Getting started guide


Component API Documentation:

Props and methods
Usage examples
Customization options
Accessibility considerations


Theming Documentation:

Color system overview
Typography guidelines
Spacing and layout principles
Animation and transition standards


Implementation Guides:

Step-by-step implementation guides
Domain-specific implementation examples
Integration with other systems
Best practices and patterns



7.2 Documentation Tools
Consider implementing one of these documentation approaches:

Markdown Documentation:

Simple, version-controlled documentation
Easy to maintain and update
Can be hosted in the repository


Storybook Integration:

Interactive component documentation
Visual testing and development
Component playground for experimentation
Can generate static documentation site


Custom Documentation Site:

Tailored to project needs
Can showcase components in context
May require additional maintenance



8. Testing Strategy
8.1 Testing Approach
Component testing will follow these approaches:

Unit Testing:

Test individual component functionality
Props validation and rendering
Event handling and callbacks
State management


Integration Testing:

Component interactions
Form submissions
Data flow between components
Context and provider interactions


Accessibility Testing:

WCAG 2.1 AA compliance
Keyboard navigation
Screen reader compatibility
Color contrast and focus management


Visual Testing:

Component appearance
Responsive design testing
Visual regression testing
Cross-browser compatibility



8.2 Testing Tools
Recommended testing tools:

Vitest: Fast, modern testing framework
React Testing Library: Component testing with user-centric approach
axe-core: Accessibility testing automation
MSW (Mock Service Worker): API mocking for tests
Chromatic: Visual regression testing (optional)

9. Risks and Mitigations
RiskProbabilityImpactMitigationMagic UI Pro component limitationsMediumHighCreate custom components for gaps, document limitationsComponent styling conflictsMediumMediumEstablish clear CSS scoping, use Tailwind for isolationAccessibility compliance challengesMediumHighBuild accessibility testing into development, conduct regular auditsPerformance issues with complex componentsLowMediumImplement performance monitoring, lazy-loading strategiesDocumentation maintenance burdenMediumMediumAutomate documentation where possible, establish update processesComponent versioning conflictsLowHighEstablish clear versioning strategy, document upgrade paths
10. Conclusion
This component library architecture provides a comprehensive foundation for implementing the visual components needed for the Buildappswith platform. By leveraging Magic UI Pro components within a domain-driven architecture, we can rapidly develop high-quality interfaces while maintaining flexibility and customization options.
The architecture supports the critical path implementation of landing page, marketplace, and Liam's profile as outlined in PRD 3.1, while establishing patterns for future component development. The focus on visual components in this planning session sets the stage for the interactive components to be addressed in the next session.
11. Next Steps

Begin implementation of base component wrappers for Magic UI Pro components
Set up the theming system for consistent visual language
Implement core UI components for critical path features
Develop documentation standards and examples
Plan interactive component architecture in the next planning session


Document prepared for BUI-89 by Claude, with approval from Liam Jons.