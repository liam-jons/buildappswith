Comprehensive migration plan for the landing page implementation:

  Landing Page Implementation Migration Plan

  1. Component Mapping

  *Note: Components with asterisks need custom implementation as direct replacements don't exist.

  2. Migration Strategy

  Phase 1: Setup and Core Components

  1. Add MarketingHeader to Layout
    - Implement the MarketingHeader in the /app/(marketing)/layout.tsx file
    - Configure with appropriate navigation links for the landing page sections
  2. Core Structure Migration
    - Replace Hero and CTA components first (highest revenue impact)
    - Update the page.tsx file with imports from marketing components
    - Maintain section IDs for smooth scrolling functionality

  Phase 2: Section-by-Section Migration

  3. Hero Section Migration
    - Replace <HeroSection /> with <MarketingHero />
    - Configure props to match current content and add enhanced features
  4. Testimonials Section Migration
    - Replace <TestimonialsSection /> with <TestimonialSection />
    - Configure with existing testimonials data
  5. CTA Section Migration
    - Replace <FinalCtaSection /> with <MarketingCTA />
    - Configure props to maintain conversion focus
  6. Features Section Migration
    - Replace <KeyValuesSection /> with <FeatureShowcase /> or <FeatureGrid />
    - Configure features with appropriate icons and content

  Phase 3: Custom Implementation

  7. Client Section Implementation
    - Create a custom TrustProofCompanies component based on the content matrix
    - Use logos and branding consistent with current implementation
  8. AI Capabilities Marquee Implementation
    - Create a custom MarketingMarquee component using the Magic UI Marquee
    - Implement consistent styling and animations

  Phase 4: Finalization and Enhancement

  9. Add MarketingFooter
    - Add the MarketingFooter component at the end of the page
    - Configure with appropriate links and content
  10. Enhance Accessibility
    - Add proper ARIA labels to all interactive elements
    - Ensure keyboard navigation works properly
    - Test with screen readers

  3. Component Implementation Details

  MarketingHero Configuration

  <MarketingHero
    badge="Build Apps With AI"
    badgeIcon="🚀"
    headline="Launch your product with expert AI builders"
    subheadline="Connect with AI-proficient developers to bring your ideas to life. Our platform makes it easy to find, book, and 
  collaborate with the best technical talent."
    primaryCTA={{
      text: "Find Builders",
      href: "/marketplace",
    }}
    secondaryCTA={{
      text: "How It Works",
      href: "#feature-showcase", // Scroll to feature showcase section
    }}
    imageLightSrc="/hero-light.png"
    imageDarkSrc="/hero-dark.png"
    headlineRotatingWords={["apps", "websites", "AI solutions", "products"]} // Optional animation
  />

  MarketingCTA Configuration

  <MarketingCTA
    id="cta"
    title="Start building today"
    subtitle="Our expert AI builders are ready to bring your vision to life"
    ctaText="Find a builder"
    ctaHref="/marketplace"
    ctaVariant="primary"
    supportingText="No commitment required"
    backgroundGradient="bg-gradient-to-r from-purple-600 to-blue-600"
  />

  TestimonialSection Configuration

  <TestimonialSection
    id="testimonials"
    title="What Our Clients Say"
    subtitle="Real success stories from clients who have built their applications with our network of AI experts"
    testimonials={[
      {
        id: "1",
        name: "Sarah Johnson",
        role: "Startup Founder",
        img: "https://i.pravatar.cc/150?img=1",
        description: "BuildAppsWith connected me with an AI specialist who helped us implement a recommendation engine that increased 
  conversion by 34%. The booking process was seamless.",
        verificationStatus: "verified"
      },
      // Add more testimonials...
    ]}
  />

  FeatureShowcase Configuration

  <FeatureShowcase
    id="feature-showcase"
    title="How It Works"
    subtitle="Our platform connects you with AI-specialized builders to turn your ideas into reality"
    features={[
      {
        id: "idea",
        title: "Share Your Vision",
        description: "Describe your project, requirements, and goals. Be as detailed or abstract as you need to be.",
        icon: <IdealightbulbIcon className="h-8 w-8" />,
        readMoreLink: "/how-it-works#vision"
      },
      // Add more features...
    ]}
    variant="scroll" // or "grid" or "bento"
  />

  Custom TrustProofCompanies Component (to be created)

  // Create this component based on content matrix requirements
  export interface TrustProofCompaniesProps {
    title?: string;
    subtitle?: string;
    companies: Array<{
      id: string;
      name: string;
      logo: string;
      altText: string;
    }>;
    className?: string;
  }

  export function TrustProofCompanies({
    title = "Trusted by Industry Leaders",
    subtitle = "Join the companies building the future with our network of AI experts",
    companies = [],
    className,
  }: TrustProofCompaniesProps) {
    // Implementation goes here
  }

  4. Testing Strategy (to be agreed in a future chat session)


  5. Risk Assessment and Mitigation

  Potential Risks

  1. Content Mismatch
    - Risk: New components may not support all content from the original implementation
    - Mitigation: Carefully audit current content and ensure all is transferred; adapt components as needed
  2. Performance Regression
    - Risk: New components might be more JavaScript-heavy and affect performance
    - Mitigation: Monitor Core Web Vitals before and after; optimize animations and code splitting
  3. NavLink Compatibility
    - Risk: The new header's navigation might work differently from the current implementation
    - Mitigation: Test and adapt the navigation logic to ensure smooth scrolling works the same
  4. Cross-Browser Issues
    - Risk: New components might have different behavior across browsers
    - Mitigation: Test in Chrome, Firefox, Safari, and Edge; fix any inconsistencies

  6. Timeline Estimation

  7. Linear Issues

  Parent Issue Update

  BUI-71: Landing Page Implementation
  - Update with detailed current status
  - Add implementation plan and timeline
  - Link to all child issues

  Child Issues

  1. BUI-117: Landing Page Header Implementation
    - Add MarketingHeader to layout
    - Configure navigation for landing page sections
    - Implement ViewingPreferences for accessibility
  2. BUI-118: Hero Section Migration
    - Replace HeroSection with MarketingHero
    - Configure props for content and features
    - Add rotating headline words feature
  3. BUI-119: Feature Showcase Migration
    - Replace KeyValuesSection with FeatureShowcase
    - Configure with appropriate features and icons
    - Implement scroll animation variant
  4. BUI-120: Testimonials Section Migration
    - Replace TestimonialsSection with TestimonialSection
    - Configure with existing testimonial data
    - Implement TestimonialScroll component
  5. BUI-121: CTA Section Migration
    - Replace FinalCtaSection with MarketingCTA
    - Configure for maximum conversion
    - Implement analytics tracking
  6. BUI-122: Client Section Custom Implementation
    - Create TrustProofCompanies component
    - Implement company logo showcase
    - Ensure mobile responsiveness
  7. BUI-123: AI Capabilities Marquee Custom Implementation
    - Create custom MarketingMarquee component
    - Implement AI capabilities scrolling display
    - Ensure accessibility support
  8. BUI-124: Marketing Footer Implementation
    - Add MarketingFooter to landing page
    - Configure with appropriate links and sections
    - Ensure consistent styling with header
  9. BUI-125: Landing Page Testing and Optimization
    - Perform visual regression testing
    - Conduct accessibility testing
    - Optimize performance metrics
    - Implement analytics tracking

  This comprehensive migration plan provides a clear roadmap for implementing the landing page using the new marketing domain components.
  By following this structured approach, we can ensure a smooth migration while maintaining the conversion funnel and improving overall
  quality.

