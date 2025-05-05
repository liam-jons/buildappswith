# Landing Page Components

This directory contains the components for the BuildAppsWith redesigned landing page, which emphasizes human-guided AI learning.

## Component Overview

### Main Components

- **Navbar**: Navigation component with dropdown menus and animated viewing preferences button
  - Features: Animated dropdowns, mobile responsiveness, animated theme toggle
  - File: `navbar.tsx`

- **HeroSection**: Main hero section with double-row headline and word rotation
  - Features: Large typography, word rotation animation, split subheading
  - File: `hero-section.tsx`

- **AICapabilitiesMarquee**: Horizontal scrolling component showing AI capabilities
  - File: `ai-capabilities-marquee.tsx`

- **AIStats**: Component displaying AI metrics with animated counting numbers
  - File: `ai-stats.tsx`

- **TrustedEcosystem**: Grid displaying partner company logos
  - File: `trusted-ecosystem.tsx`

- **SkillsCarousel**: Carousel for learning pathway selection
  - File: `skills-carousel.tsx`

- **SkillsTreeSection**: "How It Works" section with step boxes
  - File: `skills-tree-section.tsx`
  
- **CTASection**: Call-to-action section with dual buttons
  - File: `cta-section.tsx`

- **Footer**: Custom footer with newsletter signup and navigation
  - File: `footer.tsx`

### Support Components

- **Accessibility**: Components for improved accessibility
  - File: `accessibility.tsx`

- **PerformanceOptimizations**: Components for performance monitoring
  - File: `performance-optimizations.tsx`

## Data Structure

The components use data from:
- `types.ts`: Defines TypeScript interfaces for the components
- `data.tsx`: Contains content data for the landing page components

## Usage

The main entry point for the landing page is:
```tsx
// app/(marketing)/page.tsx
export default function Page() {
  return (
    <AccessibilityProvider>
      <Navbar />
      <main>
        <HeroSection />
        <AICapabilitiesMarquee />
        {/* Other sections */}
      </main>
      <Footer />
    </AccessibilityProvider>
  );
}
```

## Recent Updates

- Removed duplicate header/footer by modifying the marketing layout
- Enhanced ViewingPreferences button with AnimatedSubscribeButton component
- Doubled main heading sizes and reformatted subheading
- See `/docs/landing-page-updates.md` for detailed change documentation

## Design Principles

1. Clear visual hierarchy with properly sized headings
2. Interactive elements for improved engagement
3. Mobile-first responsive design
4. Accessible to all users
5. Performance optimized for all devices