/**
 * Marketplace module exports
 *
 * This is the main entry point for the marketplace components.
 * It exports all components, hooks and utilities in a way that
 * prevents circular dependencies.
 */

// Export dashboard component directly
export { BuilderDashboard } from './builder-dashboard';

// Export components
export {
  // Builder components
  BuilderImage,
  BuilderCard,
  BuilderList,
  BuilderListClient,
  BuilderListSkeleton,

  // Filter components
  FilterPanel,

  // Error Handling
  MarketplaceErrorBoundary,
  MarketplaceErrorFallback,

  // Helper components
  ImageFallback,
  CardSkeleton
} from './components';

// Export hooks
export {
  useBuilderFilter,
  useBuilderSearch
} from './hooks';

// Export utilities
export {
  // Image utilities
  isValidImageUrl,
  getInitials,
  getDefaultAvatarUrl,

  // Filter utilities
  createFilterParams,
  parseFilterParams,
  isEmptyFilter
} from './utils';