/**
 * profile components barrel export file
 * Version: 1.0.0
 */

// Re-export subdirectory exports
export * from './ui';

// Export components
export { UserProfile } from './user-profile';
export { SuccessMetricsDashboard } from './success-metrics-dashboard';
export { RoleBadge, FounderBadge, MultiRoleBadge } from './role-badges';
export { ProfileAuthProvider } from './profile-auth-provider';
export { PortfolioShowcase } from './portfolio-showcase';
export { PortfolioGallery } from './portfolio-gallery';
export * from './client-profile';
export { ClientDashboard } from './client-dashboard';
export { BuilderProfile } from './builder-profile';
export { BuilderProfileWrapper } from './builder-profile-wrapper';
export { BuilderProfileClientWrapper } from './builder-profile-client-wrapper';
export { AppShowcase } from './app-showcase';
export { AddProjectForm } from './add-project-form';
export { ValidationTierBadge } from '@/components/trust/ui/validation-tier-badge';