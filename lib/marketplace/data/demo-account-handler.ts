/**
 * Demo account handling for marketplace API
 * 
 * This module provides functionality for filtering and identifying demo accounts
 * in the marketplace.
 */

import { BuilderProfileListing, BuilderProfileData, MarketplaceFilters } from '../types';
import { Prisma } from '@prisma/client';
import { getServerFeatureFlag } from '@/lib/server-feature-flags';
import { FeatureFlag } from '@/lib/feature-flags';
import { createDomainLogger } from '@/lib/logger';

// Create a logger for demo account handling
const demoLogger = createDomainLogger('marketplace-demo');

/**
 * Add demo account where clause to Prisma query
 * 
 * @param where Current where clause object
 * @param filters Marketplace filters with optional excludeDemo flag
 * @returns Updated where clause with demo account handling
 */
export function addDemoAccountFilters(
  where: Prisma.BuilderProfileWhereInput,
  filters?: MarketplaceFilters
): Prisma.BuilderProfileWhereInput {
  // Check if we should exclude demo accounts
  const shouldExcludeDemo = filters?.excludeDemo;
  
  // Only apply filter in production if excludeDemo is explicitly set
  if (process.env.NODE_ENV === 'production' && shouldExcludeDemo) {
    demoLogger.debug('Excluding demo accounts in production environment');
    
    return {
      ...where,
      user: {
        ...where.user,
        isDemo: false
      }
    };
  }
  
  // In non-production environments, use feature flag to determine behavior
  const useServerFlags = getServerFeatureFlag(FeatureFlag.UseDynamicMarketplace);
  
  if (useServerFlags && shouldExcludeDemo) {
    demoLogger.debug('Excluding demo accounts based on feature flag');
    
    return {
      ...where,
      user: {
        ...where.user,
        isDemo: false
      }
    };
  }
  
  // Default: no demo account filtering
  return where;
}

/**
 * Enhance builder profile data with demo account information
 * 
 * @param builder Builder profile data from database
 * @returns Enhanced builder profile with isDemo flag
 */
export function enhanceWithDemoStatus<T extends BuilderProfileListing | BuilderProfileData>(
  builder: T,
  user: { isDemo?: boolean }
): T & { isDemo: boolean } {
  const isDemo = user?.isDemo || false;
  
  return {
    ...builder,
    isDemo: isDemo
  };
}