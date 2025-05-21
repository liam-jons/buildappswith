/**
 * Profile Component Types
 * Version: 1.0.0
 * 
 * Type definitions for profile components
 */

import { 
  BaseComponentProps, 
  WithChildrenProps, 
  LoadableProps,
  StandardSize 
} from '@/lib/types';
import { 
  BuilderProfileData,
  ValidationTier,
  UserRole,
  ProfileAuthContext
} from '@/lib/profile/types';

/**
 * Common profile component props
 */
export interface ProfileComponentProps extends BaseComponentProps {
  /** Profile ID */
  profileId?: string;
  /** User ID */
  userId?: string;
  /** Whether this is a public view */
  isPublicView?: boolean;
  /** Profile data */
  profile?: BuilderProfileData;
}

/**
 * Builder profile wrapper props
 */
export interface BuilderProfileWrapperProps extends 
  ProfileComponentProps,
  LoadableProps {
  /** Profile data (optional - will be fetched if not provided) */
  profile?: BuilderProfileData;
  /** User role context */
  userRole?: UserRole;
  /** Profile auth context */
  authContext?: ProfileAuthContext;
}

/**
 * Builder profile client wrapper props
 */
export interface BuilderProfileClientWrapperProps extends
  ProfileComponentProps,
  WithChildrenProps {
  /** Profile data (required) */
  profile: BuilderProfileData;
  /** Whether to show edit controls */
  showEditControls?: boolean;
}

/**
 * Profile header props
 */
export interface ProfileHeaderProps extends 
  BaseComponentProps, 
  LoadableProps {
  /** Profile data */
  profile: BuilderProfileData;
  /** Whether to show verification badge */
  showVerification?: boolean;
  /** Whether to show contact button */
  showContact?: boolean;
  /** Header size variant */
  size?: StandardSize;
  /** Whether this is an editable view */
  editable?: boolean;
}

/**
 * Profile stats props
 */
export interface ProfileStatsProps extends BaseComponentProps {
  /** Profile data */
  profile: BuilderProfileData;
  /** Stats layout variant */
  layout?: 'horizontal' | 'vertical' | 'grid';
  /** Whether to show all stats or subset */
  compact?: boolean;
}

/**
 * Profile details props
 */
export interface ProfileDetailsProps extends 
  BaseComponentProps,
  LoadableProps {
  /** Profile data */
  profile: BuilderProfileData;
  /** Whether to show full details */
  detailed?: boolean;
  /** Whether this is editable */
  editable?: boolean;
}

/**
 * Session booking card props
 */
export interface SessionBookingCardProps extends 
  BaseComponentProps,
  LoadableProps {
  /** Builder profile data */
  profile: BuilderProfileData;
  /** Session type ID */
  sessionTypeId?: string;
  /** Whether booking is enabled */
  bookingEnabled?: boolean;
  /** Card size variant */
  size?: StandardSize;
}

/**
 * Portfolio gallery props
 */
export interface PortfolioGalleryProps extends 
  BaseComponentProps,
  LoadableProps {
  /** Profile data containing portfolio items */
  profile: BuilderProfileData;
  /** Maximum items to display */
  maxItems?: number;
  /** Gallery layout */
  layout?: 'grid' | 'masonry' | 'carousel';
  /** Whether to show item details */
  showDetails?: boolean;
}

/**
 * Metrics display props
 */
export interface MetricsDisplayProps extends BaseComponentProps {
  /** Profile data containing metrics */
  profile: BuilderProfileData;
  /** Metrics category to display */
  category?: string;
  /** Display format */
  format?: 'cards' | 'chart' | 'table';
  /** Whether to animate numbers */
  animated?: boolean;
}

/**
 * Client dashboard props
 */
export interface ClientDashboardProps extends 
  BaseComponentProps,
  LoadableProps {
  /** User ID */
  userId: string;
  /** Dashboard view mode */
  view?: 'overview' | 'bookings' | 'projects';
}

/**
 * User profile props (generic user profile)
 */
export interface UserProfileProps extends 
  BaseComponentProps,
  LoadableProps {
  /** User ID */
  userId: string;
  /** Whether to show sensitive information */
  showSensitive?: boolean;
  /** Profile view mode */
  mode?: 'public' | 'private' | 'admin';
}

/**
 * Profile auth provider props
 */
export interface ProfileAuthProviderProps extends WithChildrenProps {
  /** Profile data */
  profile?: BuilderProfileData;
  /** User ID */
  userId?: string;
  /** Initial auth context */
  initialContext?: Partial<ProfileAuthContext>;
}