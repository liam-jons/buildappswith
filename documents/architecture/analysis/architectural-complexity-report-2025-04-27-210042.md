# Architectural Complexity Analysis

*Generated on: 2025-04-27*

## Overall Complexity

System Complexity Score: **1.68/10**

## Container Complexity

| Container | Component Count | Complexity Score | Coupling Score |
|-----------|-----------------|------------------|----------------|
| WebApplication | 217 | 1.53/10 | 0.07 |
| Database | 19 | 3.39/10 | 0.00 |
| AuthenticationService | 37 | 1.95/10 | 0.16 |
| PaymentService | 11 | 1.32/10 | 0.00 |
| BookingSystem | 11 | 1.32/10 | 0.09 |

## Most Complex Components

No highly complex components found.

## Cyclic Dependencies

No cyclic dependencies detected.

## Pattern Inconsistencies

Detected **9** pattern inconsistencies in the codebase.

### Utility Folder Structure

**Recommended Pattern**: Use consistent folder structure: /Users/liamj/Documents/Development/buildappswith/lib

Affected components (42):

| Component | Type | Path |
|-----------|------|------|
| instrumentation-client | Utility | /Users/liamj/Documents/Development/buildappswith/instrumentation-client.ts |
| instrumentation | Utility | /Users/liamj/Documents/Development/buildappswith/instrumentation.ts |
| next-env.d | Utility | /Users/liamj/Documents/Development/buildappswith/next-env.d.ts |
| sentry.edge.config | Utility | /Users/liamj/Documents/Development/buildappswith/sentry.edge.config.ts |
| sentry.server.config | Utility | /Users/liamj/Documents/Development/buildappswith/sentry.server.config.ts |
| tailwind.config | Utility | /Users/liamj/Documents/Development/buildappswith/tailwind.config.ts |
| vitest.config | Utility | /Users/liamj/Documents/Development/buildappswith/vitest.config.ts |
| vitest.setup | Utility | /Users/liamj/Documents/Development/buildappswith/vitest.setup.ts |
| global-error | Utility | /Users/liamj/Documents/Development/buildappswith/app/global-error.tsx |
| use-on-click-outside | Utility | /Users/liamj/Documents/Development/buildappswith/hooks/use-on-click-outside.ts |
| create-unused-features-analyzer | Utility | /Users/liamj/Documents/Development/buildappswith/scripts/create-unused-features-analyzer.ts |
| extract-architecture | Utility | /Users/liamj/Documents/Development/buildappswith/scripts/extract-architecture.ts |
| generate-architecture-report | Utility | /Users/liamj/Documents/Development/buildappswith/scripts/generate-architecture-report.ts |
| vitest.d | Utility | /Users/liamj/Documents/Development/buildappswith/types/vitest.d.ts |
| route-types | Utility | /Users/liamj/Documents/Development/buildappswith/app/api/route-types.ts |
| builders | Utility | /Users/liamj/Documents/Development/buildappswith/lib/api/builders.ts |
| profile | Utility | /Users/liamj/Documents/Development/buildappswith/lib/builders/profile.ts |
| profile-context | Utility | /Users/liamj/Documents/Development/buildappswith/lib/contexts/profile-context.tsx |
| index | Utility | /Users/liamj/Documents/Development/buildappswith/lib/logger/index.ts |
| builders | Utility | /Users/liamj/Documents/Development/buildappswith/lib/marketplace/builders.ts |
| types | Utility | /Users/liamj/Documents/Development/buildappswith/lib/marketplace/types.ts |
| profiles | Utility | /Users/liamj/Documents/Development/buildappswith/lib/mock-data/profiles.ts |
| mock-data | Utility | /Users/liamj/Documents/Development/buildappswith/lib/scheduling/mock-data.ts |
| types | Utility | /Users/liamj/Documents/Development/buildappswith/lib/scheduling/types.ts |
| utils | Utility | /Users/liamj/Documents/Development/buildappswith/lib/scheduling/utils.ts |
| stripe-server | Utility | /Users/liamj/Documents/Development/buildappswith/lib/stripe/stripe-server.ts |
| builder | Utility | /Users/liamj/Documents/Development/buildappswith/lib/types/builder.ts |
| profile-form-helpers | Utility | /Users/liamj/Documents/Development/buildappswith/lib/utils/profile-form-helpers.ts |
| create-dummy-profiles | Utility | /Users/liamj/Documents/Development/buildappswith/scripts/seed-data/create-dummy-profiles.ts |
| create-profiles | Utility | /Users/liamj/Documents/Development/buildappswith/scripts/seed-data/create-profiles.ts |
| client | Utility | /Users/liamj/Documents/Development/buildappswith/app/profile/[id]/client.tsx |
| marketplace-service | Utility | /Users/liamj/Documents/Development/buildappswith/lib/marketplace/real-data/marketplace-service.ts |
| scheduling-service | Utility | /Users/liamj/Documents/Development/buildappswith/lib/scheduling/real-data/scheduling-service.ts |
| payment-success-content | Utility | /Users/liamj/Documents/Development/buildappswith/app/(platform)/payment/success/payment-success-content.tsx |
| auth.route | Utility | /Users/liamj/Documents/Development/buildappswith/docs/cleanup-records/backup-phase3/dev-test-routes/auth.route.ts |
| create-liam-profile.route | Utility | /Users/liamj/Documents/Development/buildappswith/docs/cleanup-records/backup-phase3/dev-test-routes/create-liam-profile.route.ts |
| login.route | Utility | /Users/liamj/Documents/Development/buildappswith/docs/cleanup-records/backup-phase3/dev-test-routes/login.route.ts |
| seed-users.route | Utility | /Users/liamj/Documents/Development/buildappswith/docs/cleanup-records/backup-phase3/dev-test-routes/seed-users.route.ts |
| sentry-example-api.route | Utility | /Users/liamj/Documents/Development/buildappswith/docs/cleanup-records/backup-phase3/dev-test-routes/sentry-example-api.route.ts |
| client | Utility | /Users/liamj/Documents/Development/buildappswith/app/(platform)/builders/[id]/schedule/client.tsx |
| availability-manager-client | Utility | /Users/liamj/Documents/Development/buildappswith/app/(platform)/builders/[id]/schedule/manage/availability-manager-client.tsx |
| client | Utility | /Users/liamj/Documents/Development/buildappswith/app/(platform)/builders/[id]/schedule/manage/client.tsx |

### Middleware Folder Structure

**Recommended Pattern**: Use consistent folder structure: /Users/liamj/Documents/Development/buildappswith/lib/middleware

Affected components (3):

| Component | Type | Path |
|-----------|------|------|
| middleware | Middleware | /Users/liamj/Documents/Development/buildappswith/middleware.ts |
| mock-test | Middleware | /Users/liamj/Documents/Development/buildappswith/docs/middleware-mock-investigation/mock-test.ts |
| typed-mock-test | Middleware | /Users/liamj/Documents/Development/buildappswith/docs/middleware-mock-investigation/typed-mock-test.ts |

### Page Component Folder Structure

**Recommended Pattern**: Use consistent folder structure: /Users/liamj/Documents/Development/buildappswith/app/(marketing)

Affected components (49):

| Component | Type | Path |
|-----------|------|------|
| layout | Page Component | /Users/liamj/Documents/Development/buildappswith/app/layout.tsx |
| layout | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/layout.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/auth-test/page.tsx |
| layout | Page Component | /Users/liamj/Documents/Development/buildappswith/app/onboarding/layout.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/onboarding/page.tsx |
| layout | Page Component | /Users/liamj/Documents/Development/buildappswith/app/profile-settings/layout.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/profile-settings/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/verify/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(auth)/login/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(auth)/signin/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(auth)/signup/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(marketing)/about/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(marketing)/contact/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(marketing)/faq/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(marketing)/heading-demo/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(marketing)/heading-hero-example/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(marketing)/how-it-works/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(marketing)/privacy/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(marketing)/terms/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(marketing)/toolkit/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(marketing)/weekly-sessions/page.tsx |
| layout | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/admin/layout.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/admin/page.tsx |
| layout | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/builder-dashboard/layout.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/builder-dashboard/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/builder-profile/page.tsx |
| layout | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/client-dashboard/layout.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/client-dashboard/page.tsx |
| layout | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/dashboard/layout.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/dashboard/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/marketplace/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/portfolio/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/profile/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/book/[id]/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/profile/[id]/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/profile/demo/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/profile-settings/availability/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/profile-settings/edit/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/test/auth/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/admin/builders/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/admin/session-types/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/builder-profile/liam-jons/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/marketplace/[id]/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/payment/cancel/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/payment/success/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/profile/edit/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/book/[id]/confirmation/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/builders/[id]/schedule/page.tsx |
| page | Page Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/builders/[id]/schedule/manage/page.tsx |

### UI Component Folder Structure

**Recommended Pattern**: Use consistent folder structure: /Users/liamj/Documents/Development/buildappswith/components/ui

Affected components (68):

| Component | Type | Path |
|-----------|------|------|
| error-boundary | UI Component | /Users/liamj/Documents/Development/buildappswith/components/error-boundary.tsx |
| search-params-fallback | UI Component | /Users/liamj/Documents/Development/buildappswith/components/search-params-fallback.tsx |
| site-banner | UI Component | /Users/liamj/Documents/Development/buildappswith/components/site-banner.tsx |
| site-footer | UI Component | /Users/liamj/Documents/Development/buildappswith/components/site-footer.tsx |
| site-header | UI Component | /Users/liamj/Documents/Development/buildappswith/components/site-header.tsx |
| suspense-user-auth-form | UI Component | /Users/liamj/Documents/Development/buildappswith/components/suspense-user-auth-form.tsx |
| user-auth-form | UI Component | /Users/liamj/Documents/Development/buildappswith/components/user-auth-form.tsx |
| admin-nav | UI Component | /Users/liamj/Documents/Development/buildappswith/components/admin/admin-nav.tsx |
| session-type-form | UI Component | /Users/liamj/Documents/Development/buildappswith/components/admin/session-type-form.tsx |
| auth-error-boundary | UI Component | /Users/liamj/Documents/Development/buildappswith/components/auth/auth-error-boundary.tsx |
| clerk-auth-form | UI Component | /Users/liamj/Documents/Development/buildappswith/components/auth/clerk-auth-form.tsx |
| loading-state | UI Component | /Users/liamj/Documents/Development/buildappswith/components/auth/loading-state.tsx |
| login-button | UI Component | /Users/liamj/Documents/Development/buildappswith/components/auth/login-button.tsx |
| protected-route | UI Component | /Users/liamj/Documents/Development/buildappswith/components/auth/protected-route.tsx |
| user-profile | UI Component | /Users/liamj/Documents/Development/buildappswith/components/auth/user-profile.tsx |
| faq-accordion | UI Component | /Users/liamj/Documents/Development/buildappswith/components/client/faq-accordion.tsx |
| contact-form | UI Component | /Users/liamj/Documents/Development/buildappswith/components/contact/contact-form.tsx |
| animated-heading-v2 | UI Component | /Users/liamj/Documents/Development/buildappswith/components/custom/animated-heading-v2.tsx |
| animated-heading | UI Component | /Users/liamj/Documents/Development/buildappswith/components/custom/animated-heading.tsx |
| inline-animated-heading | UI Component | /Users/liamj/Documents/Development/buildappswith/components/custom/inline-animated-heading.tsx |
| two-line-animated-heading | UI Component | /Users/liamj/Documents/Development/buildappswith/components/custom/two-line-animated-heading.tsx |
| ai-capabilities-marquee | UI Component | /Users/liamj/Documents/Development/buildappswith/components/landing/ai-capabilities-marquee.tsx |
| animated-beam-section | UI Component | /Users/liamj/Documents/Development/buildappswith/components/landing/animated-beam-section.tsx |
| animated-circular-progress-bar-demo | UI Component | /Users/liamj/Documents/Development/buildappswith/components/landing/animated-circular-progress-bar-demo.tsx |
| client-section | UI Component | /Users/liamj/Documents/Development/buildappswith/components/landing/client-section.tsx |
| cta-section | UI Component | /Users/liamj/Documents/Development/buildappswith/components/landing/cta-section.tsx |
| final-cta-section | UI Component | /Users/liamj/Documents/Development/buildappswith/components/landing/final-cta-section.tsx |
| hero-section | UI Component | /Users/liamj/Documents/Development/buildappswith/components/landing/hero-section.tsx |
| hero-visualization | UI Component | /Users/liamj/Documents/Development/buildappswith/components/landing/hero-visualization.tsx |
| key-values-section | UI Component | /Users/liamj/Documents/Development/buildappswith/components/landing/key-values-section.tsx |
| pricing-section | UI Component | /Users/liamj/Documents/Development/buildappswith/components/landing/pricing-section.tsx |
| testimonials-section | UI Component | /Users/liamj/Documents/Development/buildappswith/components/landing/testimonials-section.tsx |
| animated-beam | UI Component | /Users/liamj/Documents/Development/buildappswith/components/magicui/animated-beam.tsx |
| animated-circular-progress-bar | UI Component | /Users/liamj/Documents/Development/buildappswith/components/magicui/animated-circular-progress-bar.tsx |
| aurora-text | UI Component | /Users/liamj/Documents/Development/buildappswith/components/magicui/aurora-text.tsx |
| border-beam | UI Component | /Users/liamj/Documents/Development/buildappswith/components/magicui/border-beam.tsx |
| marquee | UI Component | /Users/liamj/Documents/Development/buildappswith/components/magicui/marquee.tsx |
| particles | UI Component | /Users/liamj/Documents/Development/buildappswith/components/magicui/particles.tsx |
| sphere-mask | UI Component | /Users/liamj/Documents/Development/buildappswith/components/magicui/sphere-mask.tsx |
| text-shimmer | UI Component | /Users/liamj/Documents/Development/buildappswith/components/magicui/text-shimmer.tsx |
| word-rotate | UI Component | /Users/liamj/Documents/Development/buildappswith/components/magicui/word-rotate.tsx |
| builder-card | UI Component | /Users/liamj/Documents/Development/buildappswith/components/marketplace/builder-card.tsx |
| builder-image | UI Component | /Users/liamj/Documents/Development/buildappswith/components/marketplace/builder-image.tsx |
| featured-builder-card | UI Component | /Users/liamj/Documents/Development/buildappswith/components/marketplace/featured-builder-card.tsx |
| profile-edit-page | UI Component | /Users/liamj/Documents/Development/buildappswith/components/pages/profile-edit-page.tsx |
| payment-status-page | UI Component | /Users/liamj/Documents/Development/buildappswith/components/payment/payment-status-page.tsx |
| add-project-form | UI Component | /Users/liamj/Documents/Development/buildappswith/components/profile/add-project-form.tsx |
| app-showcase | UI Component | /Users/liamj/Documents/Development/buildappswith/components/profile/app-showcase.tsx |
| builder-profile-client-wrapper | UI Component | /Users/liamj/Documents/Development/buildappswith/components/profile/builder-profile-client-wrapper.tsx |
| builder-profile-client | UI Component | /Users/liamj/Documents/Development/buildappswith/components/profile/builder-profile-client.tsx |
| builder-profile | UI Component | /Users/liamj/Documents/Development/buildappswith/components/profile/builder-profile.tsx |
| edit-profile-form | UI Component | /Users/liamj/Documents/Development/buildappswith/components/profile/edit-profile-form.tsx |
| portfolio-gallery | UI Component | /Users/liamj/Documents/Development/buildappswith/components/profile/portfolio-gallery.tsx |
| portfolio-showcase | UI Component | /Users/liamj/Documents/Development/buildappswith/components/profile/portfolio-showcase.tsx |
| profile-interactive-elements | UI Component | /Users/liamj/Documents/Development/buildappswith/components/profile/profile-interactive-elements.tsx |
| protected-route | UI Component | /Users/liamj/Documents/Development/buildappswith/components/auth/protected/protected-route.tsx |
| availability-manager | UI Component | /Users/liamj/Documents/Development/buildappswith/components/scheduling/builder/availability-manager.tsx |
| booking-overview | UI Component | /Users/liamj/Documents/Development/buildappswith/components/scheduling/builder/booking-overview.tsx |
| session-type-editor | UI Component | /Users/liamj/Documents/Development/buildappswith/components/scheduling/builder/session-type-editor.tsx |
| weekly-schedule | UI Component | /Users/liamj/Documents/Development/buildappswith/components/scheduling/builder/weekly-schedule.tsx |
| booking-form | UI Component | /Users/liamj/Documents/Development/buildappswith/components/scheduling/client/booking-form.tsx |
| builder-calendar | UI Component | /Users/liamj/Documents/Development/buildappswith/components/scheduling/client/builder-calendar.tsx |
| timezone-selector | UI Component | /Users/liamj/Documents/Development/buildappswith/components/scheduling/shared/timezone-selector.tsx |
| availability-exceptions | UI Component | /Users/liamj/Documents/Development/buildappswith/components/scheduling/builder/availability/availability-exceptions.tsx |
| availability-management | UI Component | /Users/liamj/Documents/Development/buildappswith/components/scheduling/builder/availability/availability-management.tsx |
| weekly-availability | UI Component | /Users/liamj/Documents/Development/buildappswith/components/scheduling/builder/availability/weekly-availability.tsx |
| metrics-display | UI Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/builder/profile/components/metrics-display.tsx |
| portfolio-gallery | UI Component | /Users/liamj/Documents/Development/buildappswith/app/(platform)/builder/profile/components/portfolio-gallery.tsx |

### Context Provider Folder Structure

**Recommended Pattern**: Use consistent folder structure: /Users/liamj/Documents/Development/buildappswith/components/profile

Affected components (9):

| Component | Type | Path |
|-----------|------|------|
| theme-provider | Context Provider | /Users/liamj/Documents/Development/buildappswith/components/theme-provider.tsx |
| auth-provider | Context Provider | /Users/liamj/Documents/Development/buildappswith/components/auth/auth-provider.tsx |
| payment-status-indicator | Context Provider | /Users/liamj/Documents/Development/buildappswith/components/payment/payment-status-indicator.tsx |
| clerk-provider | Context Provider | /Users/liamj/Documents/Development/buildappswith/components/providers/clerk-provider.tsx |
| providers | Context Provider | /Users/liamj/Documents/Development/buildappswith/components/providers/providers.tsx |
| form | Context Provider | /Users/liamj/Documents/Development/buildappswith/components/ui/form.tsx |
| radio-group | Context Provider | /Users/liamj/Documents/Development/buildappswith/components/ui/radio-group.tsx |
| tooltip | Context Provider | /Users/liamj/Documents/Development/buildappswith/components/ui/tooltip.tsx |
| validation-tier | Context Provider | /Users/liamj/Documents/Development/buildappswith/app/(platform)/builder/profile/components/validation-tier.tsx |

### Data Model Folder Structure

**Recommended Pattern**: Use consistent folder structure: ./prisma

Affected components (1):

| Component | Type | Path |
|-----------|------|------|
| schema | Data Model | /Users/liamj/Documents/Development/buildappswith/prisma/schema.prisma |

### Authentication Component Folder Structure

**Recommended Pattern**: Use consistent folder structure: /Users/liamj/Documents/Development/buildappswith/lib/auth

Affected components (18):

| Component | Type | Path |
|-----------|------|------|
| architecture-utils | Authentication Component | /Users/liamj/Documents/Development/buildappswith/scripts/architecture-utils.ts |
| extract-auth-architecture | Authentication Component | /Users/liamj/Documents/Development/buildappswith/scripts/extract-auth-architecture.ts |
| factory-test-solution | Authentication Component | /Users/liamj/Documents/Development/buildappswith/docs/middleware-mock-investigation/factory-test-solution.ts |
| improved-integration-test | Authentication Component | /Users/liamj/Documents/Development/buildappswith/docs/middleware-mock-investigation/improved-integration-test.ts |
| improved-solution | Authentication Component | /Users/liamj/Documents/Development/buildappswith/docs/middleware-mock-investigation/improved-solution.ts |
| improved-test-utils | Authentication Component | /Users/liamj/Documents/Development/buildappswith/docs/middleware-mock-investigation/improved-test-utils.ts |
| nextjs-mock-solution | Authentication Component | /Users/liamj/Documents/Development/buildappswith/docs/middleware-mock-investigation/nextjs-mock-solution.ts |
| config | Authentication Component | /Users/liamj/Documents/Development/buildappswith/lib/middleware/config.ts |
| factory | Authentication Component | /Users/liamj/Documents/Development/buildappswith/lib/middleware/factory.ts |
| logging | Authentication Component | /Users/liamj/Documents/Development/buildappswith/lib/middleware/logging.ts |
| rbac | Authentication Component | /Users/liamj/Documents/Development/buildappswith/lib/middleware/rbac.ts |
| test-utils | Authentication Component | /Users/liamj/Documents/Development/buildappswith/lib/middleware/test-utils.ts |
| validation | Authentication Component | /Users/liamj/Documents/Development/buildappswith/lib/middleware/validation.ts |
| admin-builders-page | Authentication Component | /Users/liamj/Documents/Development/buildappswith/docs/cleanup-records/updates/admin-builders-page.tsx |
| api-auth | Authentication Component | /Users/liamj/Documents/Development/buildappswith/lib/auth/clerk/api-auth.ts |
| helpers | Authentication Component | /Users/liamj/Documents/Development/buildappswith/lib/auth/clerk/helpers.ts |
| auth-provider | Authentication Component | /Users/liamj/Documents/Development/buildappswith/lib/contexts/auth/auth-provider.tsx |
| test-auth-page | Authentication Component | /Users/liamj/Documents/Development/buildappswith/docs/cleanup-records/backup-phase3/test-pages/test-auth-page.tsx |

### Service Folder Structure

**Recommended Pattern**: Use consistent folder structure: /Users/liamj/Documents/Development/buildappswith/lib/marketplace

Affected components (8):

| Component | Type | Path |
|-----------|------|------|
| scheduling | Service | /Users/liamj/Documents/Development/buildappswith/lib/api-client/scheduling.ts |
| builder-profile-service | Service | /Users/liamj/Documents/Development/buildappswith/lib/services/builder-profile-service.ts |
| builder-service | Service | /Users/liamj/Documents/Development/buildappswith/lib/services/builder-service.ts |
| index | Service | /Users/liamj/Documents/Development/buildappswith/lib/stripe/index.ts |
| stripe-client | Service | /Users/liamj/Documents/Development/buildappswith/lib/stripe/stripe-client.ts |
| BuilderProfileClient | Service | /Users/liamj/Documents/Development/buildappswith/app/(platform)/marketplace/[id]/BuilderProfileClient.tsx |
| admin-builders-page | Service | /Users/liamj/Documents/Development/buildappswith/docs/cleanup-records/backup-phase3/test-pages/admin-builders-page.tsx |
| sentry-example-page | Service | /Users/liamj/Documents/Development/buildappswith/docs/cleanup-records/backup-phase3/test-pages/sentry-example-page.tsx |

### API Endpoint Folder Structure

**Recommended Pattern**: Use consistent folder structure: /Users/liamj/Documents/Development/buildappswith/app/api/admin/builders

Affected components (24):

| Component | Type | Path |
|-----------|------|------|
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/admin/session-types/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/apps/[builderId]/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/marketplace/builders/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/marketplace/featured/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/marketplace/filters/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/profiles/builder/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/profiles/user/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/scheduling/availability-exceptions/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/scheduling/availability-rules/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/scheduling/bookings/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/scheduling/builder-settings/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/scheduling/session-types/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/scheduling/time-slots/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/stripe/checkout/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/stripe/webhook/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/test/auth/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/webhooks/clerk/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/admin/session-types/[id]/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/apps/edit/[id]/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/marketplace/builders/[id]/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/scheduling/bookings/[id]/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/scheduling/session-types/[id]/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/stripe/sessions/[id]/route.ts |
| route | API Endpoint | /Users/liamj/Documents/Development/buildappswith/app/api/admin/session-types/[id]/status/route.ts |

## Architecture Simplification Recommendations

