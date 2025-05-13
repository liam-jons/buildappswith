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
  
  console.log('[PROD DEBUG DEMO] Environment:', process.env.NODE_ENV);
  console.log('[PROD DEBUG DEMO] excludeDemo filter:', shouldExcludeDemo);
  console.log('[PROD DEBUG DEMO] Initial where clause:', JSON.stringify(where));
  
  // Only apply filter in production if excludeDemo is explicitly set
  if (process.env.NODE_ENV === 'production' && shouldExcludeDemo) {
    demoLogger.debug('Excluding demo accounts in production environment');
    console.log('[PROD DEBUG DEMO] Adding isDemo:false filter in production');
    
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
  
  console.log('[PROD DEBUG DEMO] Dynamic marketplace flag:', useServerFlags);
  
  if (useServerFlags && shouldExcludeDemo) {
    demoLogger.debug('Excluding demo accounts based on feature flag');
    console.log('[PROD DEBUG DEMO] Adding isDemo:false filter based on feature flag');
    
    return {
      ...where,
      user: {
        ...where.user,
        isDemo: false
      }
    };
  }
  
  // Default: no demo account filtering
  console.log('[PROD DEBUG DEMO] Not adding any demo filters, returning original where clause');
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
  user: { isDemo?: boolean; id?: string }
): T & { isDemo: boolean } {
  const isDemo = user?.isDemo || false;
  console.log('[PROD DEBUG DEMO] Enhancing builder with isDemo:', isDemo, 'for user:', user?.id || 'unknown');
  
  return {
    ...builder,
    isDemo: isDemo
  };
}