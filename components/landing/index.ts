/**
 * landing components barrel export file
 * Version: 2.0.0
 * Updated to use named exports consistently
 */

// Export components using named exports to match their implementations
export { TrustedEcosystem } from './trusted-ecosystem';
export { TestimonialSection } from './testimonial-section';
export { SkillsTreeSection } from './skills-tree-section';
export { SkillsCarousel } from './skills-carousel';
// Export performance utilities individually since there's no single PerformanceOptimizations component
export { 
  BlurImage, 
  MemoizedNavbar, 
  InView, 
  DeferredContent, 
  PerformanceMonitor,
  lazyLoad
} from './performance-optimizations';
export { Navbar } from './navbar';
export { HeroSection } from './hero-section';
export { FeatureScroll } from './feature-scroll';
export { CTASection as CtaSection } from './cta-section';
export { BentoSection } from './bento-section';
export { AIStats as AiStats } from './ai-stats';
export { AICapabilitiesMarquee as AiCapabilitiesMarquee } from './ai-capabilities-marquee';
// Export accessibility utilities
export { 
  AccessibilityProvider, 
  withSectionAccessibility, 
  AccessibleLink, 
  accessibilityStyles, 
  AccessibilityStyles 
} from './accessibility';
export { BrandWordRotate } from './brand-word-rotate';

// Export data
export * from './data';
export * from './types';

// Re-export subdirectory
export * from './ui';
