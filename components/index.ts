/**
 * components components barrel export file
 * Version: 2.0.0
 * Updated to use named exports consistently
 */

// Export components
export { UserAuthForm } from './user-auth-form';
export { ThemeProvider } from './theme-provider';
export { SuspenseUserAuthForm } from './suspense-user-auth-form';
export { SiteFooter } from './site-footer';
export { SearchParamsFallback } from './search-params-fallback';
export * from './ui/core/tooltip';
export * from './ui/core/textarea';
export * from './ui/core/tabs';
export * from './ui/core/table';
export * from './ui/core/switch';
export * from './ui/core/sonner';
export * from './ui/core/separator';
export * from './ui/core/select';
export * from './ui/core/radio-group';
export * from './ui/core/popover';
export { LoadingSpinner } from './ui/core/loading-spinner';
export * from './ui/core/label';
export * from './ui/core/input';
export * from './ui/core/form';
export * from './ui/core/dropdown-menu';
export * from './ui/core/dialog';
export * from './ui/core/checkbox';
export * from './ui/core/card';
export * from './ui/core/button';
export * from './ui/core/badge';
export * from './ui/core/avatar';
export * from './ui/core/alert';
export * from './ui/core/accordion';
export { ValidationTierBadge } from './trust/ui/validation-tier-badge';
export { TimezoneSelector } from './scheduling/shared/timezone-selector';
// Using default exports for these scheduling components
export { default as TimeSlotSelector } from './scheduling/client/time-slot-selector';
export { SessionTypeSelector } from './scheduling/client/session-type-selector';
export { default as BookingForm } from './scheduling/client/booking-form';
export { default as BookingCalendar } from './scheduling/client/booking-calendar';
export { WeeklySchedule } from './scheduling/builder/weekly-schedule';
export { SessionTypeEditor } from './scheduling/builder/session-type-editor';
export { default as WeeklyAvailability } from './scheduling/builder/availability/weekly-availability';
export { default as AvailabilityManagement } from './scheduling/builder/availability/availability-management';
export { default as AvailabilityExceptions } from './scheduling/builder/availability/availability-exceptions';
export { Providers as providers } from './providers/providers';
export { ClerkProvider } from './providers/clerk-provider';
export { UserProfile } from './profile/user-profile';
export { SuccessMetricsDashboard } from './profile/success-metrics-dashboard';
export { RoleBadge as RoleBadges } from './profile/role-badges';
export { ProfileAuthProvider } from './profile/profile-auth-provider';
export { PortfolioShowcase } from './profile/portfolio-showcase';
export { PortfolioGallery } from './profile/portfolio-gallery';
export * from './profile/client-profile';
export { BuilderProfile } from './profile/builder-profile';
export { BuilderProfileWrapper } from './profile/builder-profile-wrapper';
export { BuilderProfileClientWrapper } from './profile/builder-profile-client-wrapper';
export { AppShowcase } from './profile/app-showcase';
export { AddProjectForm } from './profile/add-project-form';
// export { ValidationTierBadge } from './profile/ui/validation-tier-badge'; // Duplicated with ./trust/ui/
export { SessionBookingCard } from './profile/ui/session-booking-card';
export { ProfileStats } from './profile/ui/profile-stats';
export { PaymentStatusIndicator } from './payment/payment-status-indicator';
// Use proper import from marketplace/components
export { BuilderList, BuilderImage, BuilderCard } from './marketplace/components';
// Use proper import for BuilderDashboard which appears to use default export in the marketplace example
export { default as BuilderDashboard } from './marketplace/components/builder-dashboard/builder-dashboard';
export { FilterPanel } from './marketplace/components/filter-panel/filter-panel';
// export { TestimonialSection } from './marketing/testimonial-section'; // Duplicated with ./landing/
export { MarketingHero } from './marketing/marketing-hero';
// Remove reference to missing module
// export { MarketingFooter } from './marketing/marketing-footer';
export { MarketingCTA as MarketingCta } from './marketing/marketing-cta';
export { FeatureShowcase } from './marketing/feature-showcase';
export { FeatureGrid } from './marketing/feature-grid';
export { TrustProofCompanies } from './marketing/ui/trust-proof-companies';
export { TestimonialCard } from './marketing/ui/testimonial-card';
export { NewsletterForm } from './marketing/ui/newsletter-form';
export { MarketingStat } from './marketing/ui/marketing-stat';
export { MarketingMarquee } from './marketing/ui/marketing-marquee';
export { FeatureCard } from './marketing/ui/feature-card';
export { WordRotate } from './magicui/word-rotate';
export { TypingAnimation } from './magicui/typing-animation';
export { TextAnimate } from './magicui/text-animate';
export * from './magicui/terminal';
export * from './magicui/ripple';
export * from './magicui/particles';
export { OrbitingCircles } from './magicui/orbiting-circles';
export { Marquee as marquee } from './magicui/marquee';
export { Globe as globe } from './magicui/globe';
export { DotPattern } from './magicui/dot-pattern';
export * from './magicui/border-beam';
export { BlurFade } from './magicui/blur-fade';
export * from './magicui/avatar-circles';
export * from './magicui/aurora-text';
// Remove reference to missing module
// export { AnimatedSubscribeButton } from './animated-subscribe-button';
export { AnimatedCircularProgressBar } from './magicui/animated-circular-progress-bar';
export * from './learning/timeline';
export { TimelineItem } from './learning/ui/timeline-item';
export { TimelineFilter } from './learning/ui/timeline-filter';
export * from './landing/types';
export { TrustedEcosystem } from './landing/trusted-ecosystem';
export { TestimonialSection } from './landing/testimonial-section';
export { SkillsTreeSection } from './landing/skills-tree-section';
export { SkillsCarousel } from './landing/skills-carousel';
// Remove reference to missing member
// export { PerformanceOptimizations } from './landing/performance-optimizations';
export { Navbar as navbar } from './landing/navbar';
export { HeroSection } from './landing/hero-section';
// Comment out missing module reference
// export { footer } from './landing/footer';
export { FeatureScroll } from './landing/feature-scroll';
export * from './landing/data';
export { CTASection as CtaSection } from './landing/cta-section';
export { BentoSection } from './landing/bento-section';
export { AIStats as AiStats } from './landing/ai-stats';
export { AICapabilitiesMarquee as AiCapabilitiesMarquee } from './landing/ai-capabilities-marquee';
export { default as accessibility } from './landing/accessibility';
export { TestimonialScroll } from './landing/ui/testimonial-scroll';
export * from './community/knowledge-base';
export { KnowledgeItem } from './community/ui/knowledge-item';
export { DiscussionCard } from './community/ui/discussion-card';
export { BookingButton } from './booking/booking-button';
// export { LoadingState } from './auth/loading-state';
// export { ClerkAuthForm } from './auth/clerk-auth-form';
// export { AuthStatus } from './auth/auth-status';
// export { AuthErrorBoundary } from './auth/auth-error-boundary';
export * from './admin/settings-panel';
export { SessionTypeForm } from './admin/session-type-form';
export { AdminNav } from './admin/admin-nav';
export { AdminCard } from './admin/ui/admin-card';
export * from './site-footer';
export * from './theme-provider';
export * from './search-params-fallback';

// Comment out non-module export
// export * from './utils';
