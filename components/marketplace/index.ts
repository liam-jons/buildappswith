/**
 * Marketplace components barrel export file
 * Version: 3.0.0
 *
 * This is the main entry point for the marketplace components.
 * It follows the domain-based architecture pattern with consolidated implementations.
 */

// Re-export everything from the components directory
// This approach maintains a clean, flat export structure
export {
  // Builder components
  BuilderDashboard,
  BuilderCard,
  BuilderList,
  // BuilderListClient, // Removed as it no longer exists
  BuilderImage,
  BuilderListSkeleton,
  CardSkeleton,
  ImageFallback,
  
  // Filter components
  FilterPanel,
  
  // UI components
  DemoBadge,
  
  // Error handling components
  MarketplaceErrorBoundary,
  MarketplaceErrorFallback
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