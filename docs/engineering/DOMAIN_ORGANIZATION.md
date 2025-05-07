# Domain Organization Guidelines

This document outlines the domain-specific component organization for the BuildAppsWith platform.

## Marketing Domain Components
The Marketing domain includes components used across marketing pages of the platform. These components should be used for site-wide marketing purposes.

### Responsibilities
- Site-wide header and footer for marketing pages
- Generic marketing components that can be reused across multiple pages
- Marketing-specific UI elements like hero sections, CTAs, feature showcases
- Navigation for marketing pages

### Key Components
- `MarketingHeader`: The main navigation header for marketing pages
- `MarketingFooter`: The footer for marketing pages
- `MarketingHero`: Hero components for marketing pages
- `FeatureShowcase`: Component for showcasing features
- `FeatureGrid`: Grid layout for features
- `MarketingCta`: Call-to-action components
- `TestimonialSection`: Testimonial display components

## Landing Domain Components
The Landing domain includes specialized components specific to the main landing page of the site. These components are typically more complex and feature-rich than marketing components.

### Responsibilities
- Landing page-specific animations and interactive elements
- Complex visual components like marquees, skill trees, and carousels
- Landing page-specific sections that are not intended for reuse on other pages

### Key Components
- `HeroSection`: Specialized hero section for the landing page
- `FeatureScroll`: Interactive feature scrolling component
- `BentoSection`: Bento grid layout for the landing page
- `AiCapabilitiesMarquee`: Scrolling marquee of AI capabilities
- `SkillsTreeSection`: Visualization of skills in a tree format
- `SkillsCarousel`: Carousel of skills
- `TrustedEcosystem`: Display of trusted partners
- `CtaSection`: Specialized CTA for the landing page

## Future Refactoring Considerations
In the future, the following refactoring should be considered:

1. Move landing-specific components that could be used across marketing pages to the marketing domain
2. Consolidate similar components between domains to reduce duplication
3. Establish clearer naming conventions to differentiate between domain-specific components
4. Improve component documentation to clarify usage contexts

## Usage Guidelines
- For site-wide navigation, use `MarketingHeader` and `MarketingFooter`
- For landing page-specific sections, use components from the landing domain
- For reusable marketing components that appear across multiple pages, use the marketing domain
- When in doubt, prefer the more generic marketing components over landing-specific ones

## Implementation Note
This organization is part of our effort to establish clearer domain-based component architecture, which improves maintainability and makes it easier for developers to find and use the right components.