/**
 * Profile barrel export file
 * Version: 1.1.0
 */

// Export actions (server actions)
export {
  getCurrentBuilderProfile,
  getBuilderProfileBySlug as getBuilderProfileBySlugAction,
  updateBuilderProfile as updateBuilderProfileAction,
  updateExpertiseAreas,
  getSessionTypes,
  updateSessionType,
  deleteSessionType,
  updateProfile,
  getUserProfile,
  getPublicUserProfile,
  getClientProfileData
} from './actions';

// Export API functions (client API functions) 
export {
  getBuilderProfileById,
  getBuilderProfileBySlug,
  getBuilderProfileByClerkId,
  getAllBuilderProfiles,
  createBuilderProfile,
  updateBuilderProfile,
  deleteBuilderProfile
} from './api';

// Export data service
export * from './data-service';

// Export types (avoiding duplicates)
export type {
  UserRole,
  SpecializationArea,
  ProfileImage,
  SocialProfiles,
  SpecializationContent,
  Testimonial,
  BuilderAvailability,
  PortfolioProject,
  AIApp,
  MetricsCategory,
  Metric,
  ExpertiseAreasUpdate,
  SessionTypeWithId,
  BuilderProfileData,
  BuilderProfileResponseData,
  BuilderProfileResponse,
  UpdateBuilderProfileData,
  ProfilePermissions,
  ProfileAuthContext
} from './types';

// Export schemas and schema types (avoiding duplicates)
export {
  profileImageSchema,
  socialProfilesSchema,
  testimonialSchema,
  availabilitySchema,
  portfolioProjectSchema,
  aiAppSchema,
  metricSchema,
  metricsCategorySchema,
  specializationContentSchema,
  expertiseAreasSchema,
  createBuilderProfileSchema,
  updateBuilderProfileSchema,
  builderProfileQuerySchema,
  ValidationTier
} from './schemas';

// Export schema-derived types with different names to avoid conflicts
export type {
  ProfileImage as ProfileImageSchema,
  SocialProfiles as SocialProfilesSchema,
  Testimonial as TestimonialSchema,
  Availability,
  PortfolioProject as PortfolioProjectSchema,
  AIApp as AIAppSchema,
  Metric as MetricSchema,
  MetricsCategory as MetricsCategorySchema,
  SpecializationContent as SpecializationContentSchema,
  ExpertiseAreas,
  CreateBuilderProfileData,
  UpdateBuilderProfileData as UpdateBuilderProfileSchemaData,
  BuilderProfileQuery
} from './schemas';