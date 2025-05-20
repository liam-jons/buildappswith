/**
 * Marketplace Components barrel exports
 * Version: 3.0.0
 *
 * This file exports all marketplace components following the domain-based architecture pattern.
 * Each component is exported directly from its implementation file rather than
 * via nested barrel exports to prevent circular dependencies.
 */

// Builder Dashboard components
export { default as BuilderDashboard } from './builder-dashboard/builder-dashboard';

// Builder Image components
export { BuilderImage } from './builder-image/builder-image';
export { ImageFallback } from './builder-image/fallback';

// Builder Card components
export { BuilderCard } from './builder-card/builder-card';
export { CardSkeleton } from './builder-card/card-skeleton';

// Builder List components
export { BuilderList } from './builder-list/builder-list';
export { BuilderListSkeleton } from './builder-list/builder-list-skeleton';
// Removed export for BuilderListClient as builder-list-client.tsx was deleted.

// Filter Panel components
export { FilterPanel } from './filter-panel/filter-panel';

// UI components
export { DemoBadge } from './demo-badge/demo-badge';

// Error Boundary components
export { MarketplaceErrorBoundary, MarketplaceErrorFallback } from './error-boundaries/marketplace-error-boundary';