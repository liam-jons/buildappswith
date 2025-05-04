/**
 * TypeScript type definitions for admin entities
 */

/**
 * Verification status enum
 */
export enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  REQUIRES_ADDITIONAL_INFO = "REQUIRES_ADDITIONAL_INFO",
}

/**
 * Admin error type enum for server-side errors
 */
export enum AdminErrorType {
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RESOURCE_ERROR = "RESOURCE_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

/**
 * Admin client error type enum for client-side errors
 */
export enum AdminClientErrorType {
  NETWORK = "NETWORK_ERROR",
  RETRIEVAL = "RETRIEVAL_ERROR",
  UPDATE = "UPDATE_ERROR",
  OPERATION = "OPERATION_ERROR",
}

/**
 * Parameters for builder verification
 */
export interface BuilderVerificationParams {
  status: VerificationStatus;
  notes?: string;
  validationTier?: number;
  approvedBy?: string;
  rejectionReason?: string;
}

/**
 * Session type interface
 */
export interface SessionType {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  currency: string;
  isActive: boolean;
  isPublic: boolean;
  requiredValidationTier?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * System-wide settings
 */
export interface SystemSettings {
  // Platform configuration
  platformName: string;
  platformDescription?: string;
  contactEmail: string;
  supportEmail: string;
  
  // Feature flags
  enablePublicMarketplace: boolean;
  enableCommunityFeatures: boolean;
  enableLearningFeatures: boolean;
  enablePaymentProcessing: boolean;
  
  // Marketplace settings
  defaultCurrency: string;
  defaultSessionDuration: number;
  maximumSessionDuration: number;
  
  // Validation settings
  requireBuilderVerification: boolean;
  defaultValidationTier: number;
  validationTierNames: string[];
  
  // Integration settings
  stripePublishableKey?: string;
  mailchimpApiKey?: string;
  googleAnalyticsId?: string;
  
  // Content settings
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
  cookiePolicyUrl?: string;
  
  // System limits
  maxFileSizeUpload: number; // In MB
  maxSessionsPerBuilder: number;
  maxConcurrentBookings: number;
}

/**
 * Admin dashboard data
 */
export interface AdminDashboardData {
  userCounts: {
    total: number;
    active: number;
    new: number;
    byRole: Record<string, number>;
  };
  builderMetrics: {
    total: number;
    verified: number;
    pendingVerification: number;
    byValidationTier: Record<number, number>;
  };
  bookingMetrics: {
    total: number;
    completed: number;
    upcoming: number;
    canceled: number;
    bySessionType: Record<string, number>;
  };
  revenueMetrics: {
    total: number;
    averagePerBooking: number;
    byPeriod: Array<{
      period: string;
      amount: number;
    }>;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    warnings: string[];
    errors: string[];
    lastUpdated: string;
  };
}

/**
 * Builder verification record
 */
export interface BuilderVerification {
  id: string;
  builderId: string;
  status: VerificationStatus;
  notes?: string;
  validationTier?: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  submissionDate: string;
  lastUpdated: string;
}

/**
 * Result of an admin operation
 */
export interface AdminResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: AdminErrorType | string;
    detail?: string;
  };
}

/**
 * Result of a client-side admin operation
 */
export interface AdminClientResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: AdminClientErrorType;
    detail?: string;
  };
}

/**
 * Marketplace category
 */
export interface MarketplaceCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  iconName?: string;
  isActive: boolean;
  displayOrder?: number;
  parentCategoryId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Builder management settings
 */
export interface BuilderManagement {
  builderId: string;
  featured: boolean;
  priorityRanking?: number;
  specializations?: string[];
  showcaseInCategories?: string[];
  notes?: string;
  lastUpdated: string;
  updatedBy: string;
}

/**
 * Dashboard filter parameters
 */
export interface DashboardFilter {
  startDate?: string;
  endDate?: string;
  interval?: 'day' | 'week' | 'month';
  metrics?: string[];
}
