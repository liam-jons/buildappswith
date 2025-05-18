# Marketplace Error Handling Strategy

## Overview

This document outlines the error handling strategy for the consolidated marketplace implementation, focusing on providing a robust user experience even when errors occur. The strategy is organized by error type and component level.

## Error Categories

The marketplace error handling strategy addresses the following categories of errors:

1. **Network Errors** - Failed API requests due to connectivity issues
2. **API Errors** - Server-side errors or invalid responses
3. **Authentication Errors** - Missing or expired authentication tokens
4. **Validation Errors** - Invalid input data or parameters
5. **Rendering Errors** - Client-side React rendering exceptions
6. **Resource Errors** - Missing or invalid resources (images, data)

## Error Boundary Implementation

The marketplace uses a hierarchical error boundary approach to contain errors at appropriate levels:

```tsx
// marketplace/components/error-boundaries/marketplace-error-boundary.tsx
import React from 'react';
import { ErrorBoundary } from '@/components/error-boundaries/feature-error-boundary';
import { Button } from '@/components/ui/core/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/core/alert';
import { enhancedLogger } from '@/lib/enhanced-logger';

interface MarketplaceErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentName?: string;
}

function MarketplaceErrorFallback({
  error,
  resetErrorBoundary,
  componentName = 'Marketplace component',
}: MarketplaceErrorFallbackProps) {
  // Log the error (client-side)
  React.useEffect(() => {
    enhancedLogger.error(`Error in ${componentName}:`, {
      error: error.message,
      stack: error.stack,
      componentName,
    });
  }, [error, componentName]);

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTitle>There was a problem loading this content</AlertTitle>
      <AlertDescription className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We encountered an issue while trying to load {componentName.toLowerCase()}.
        </p>
        <Button onClick={resetErrorBoundary} variant="outline" size="sm">
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
}

interface MarketplaceErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

export function MarketplaceErrorBoundary({
  children,
  componentName = 'Marketplace component',
  fallback,
  onError,
}: MarketplaceErrorBoundaryProps) {
  const handleError = (error: Error, info: React.ErrorInfo) => {
    // Log the error
    enhancedLogger.error(`Error in ${componentName}:`, {
      error: error.message,
      stack: error.stack,
      componentInfo: info.componentStack,
      componentName,
    });

    // Call additional error handler if provided
    if (onError) {
      onError(error, info);
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={(props) => 
        fallback ? 
          <>{fallback}</> : 
          <MarketplaceErrorFallback {...props} componentName={componentName} />
      }
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Component-Level Error Handling

Different marketplace components require specific error handling approaches:

### 1. Builder List Error Handling

```tsx
// marketplace/components/builder-list/builder-list.tsx
import { MarketplaceErrorBoundary } from '../error-boundaries/marketplace-error-boundary';
import { Alert } from '@/components/ui/core/alert';

export function BuilderList({ builders, isLoading, error, onRetry }) {
  // Handle loading state
  if (isLoading) {
    return <BuilderListSkeleton count={6} />;
  }
  
  // Handle error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load builders</AlertTitle>
        <AlertDescription>
          {error.message || 'Please try again later'}
          <Button onClick={onRetry} className="mt-2" size="sm">Retry</Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Handle empty state
  if (!builders || builders.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No builders found</h3>
        <p className="text-muted-foreground mt-2">
          Try adjusting your search criteria or filters
        </p>
      </div>
    );
  }
  
  // Wrap the entire list in an error boundary
  return (
    <MarketplaceErrorBoundary componentName="Builder List">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {builders.map(builder => (
          // Wrap each card in its own error boundary to isolate failures
          <MarketplaceErrorBoundary 
            key={builder.id}
            componentName={`Builder Card for ${builder.name}`}
            fallback={<BuilderCardErrorFallback builder={builder} />}
          >
            <BuilderCard builder={builder} />
          </MarketplaceErrorBoundary>
        ))}
      </div>
    </MarketplaceErrorBoundary>
  );
}

// Fallback for individual builder card errors
function BuilderCardErrorFallback({ builder }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">{builder.name?.charAt(0) || '?'}</span>
          </div>
          <div>
            <h3 className="font-medium">{builder.name || 'Builder'}</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          This builder card couldn't be displayed properly. Please try refreshing the page.
        </p>
      </CardContent>
    </Card>
  );
}
```

### 2. Filter Panel Error Handling

```tsx
// marketplace/components/filter-panel/filter-panel.tsx
import { useState } from 'react';
import { MarketplaceErrorBoundary } from '../error-boundaries/marketplace-error-boundary';

export function FilterPanel({ filters, filterOptions, onFilterChange, onClearFilters, isLoading, error }) {
  const [retryCount, setRetryCount] = useState(0);
  
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
    // Trigger refetch of filter options through parent component
    if (onRetry) onRetry();
  };
  
  // Loading state for filter options
  if (isLoading) {
    return <FilterPanelSkeleton />;
  }
  
  // Error state when filter options fail to load
  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <h3 className="text-sm font-medium text-red-800 mb-2">Unable to load filters</h3>
        <p className="text-xs text-red-700 mb-2">
          {error.message || 'Please try again later'}
        </p>
        <Button size="sm" variant="outline" onClick={handleRetry}>
          Retry
        </Button>
      </div>
    );
  }
  
  // Wrap individual filter sections in error boundaries
  return (
    <div className="space-y-6">
      <MarketplaceErrorBoundary componentName="Search Filter">
        <SearchFilter 
          value={filters.searchQuery || ''} 
          onChange={(value) => onFilterChange({ ...filters, searchQuery: value })}
        />
      </MarketplaceErrorBoundary>
      
      <MarketplaceErrorBoundary componentName="Skills Filter">
        <SkillsFilter 
          selectedSkills={filters.skills || []}
          availableSkills={filterOptions.skills || []}
          onChange={(skills) => onFilterChange({ ...filters, skills })}
        />
      </MarketplaceErrorBoundary>
      
      {/* Similar patterns for other filter sections */}
    </div>
  );
}
```

### 3. Builder Image Error Handling

```tsx
// marketplace/components/builder-image/builder-image.tsx
import { useState } from 'react';
import Image from 'next/image';

export function BuilderImage({ src, alt, size = 'md', className = '' }) {
  const [hasError, setHasError] = useState(false);
  
  // Size class mapping
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };
  
  // If image source is invalid or error occurred during loading
  if (!src || hasError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center ${className}`}>
        <span className="text-lg font-semibold text-muted-foreground">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }
  
  return (
    <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
        unoptimized={true}
      />
    </div>
  );
}
```

## API Error Handling

The marketplace API layer implements a consistent error handling pattern:

```typescript
// marketplace/api.ts
import { enhancedLogger } from '@/lib/enhanced-logger';

export async function fetchBuilders(page = 1, limit = 12, filters = {}) {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    // Add filter parameters
    // ...
    
    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`/api/marketplace/builders?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    // Handle HTTP error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      // Create error with additional context
      const error = new Error(errorData?.error || `API Error: ${response.status}`);
      
      // Add error metadata
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      (error as any).details = errorData?.details;
      
      // Log error with enhanced context
      enhancedLogger.error('API Fetch Error', {
        endpoint: `/api/marketplace/builders`,
        params: Object.fromEntries(params.entries()),
        status: response.status,
        details: errorData,
      });
      
      throw error;
    }
    
    // Parse and validate response
    const data = await response.json();
    
    // Ensure expected data structure
    if (!data || !Array.isArray(data.data)) {
      throw new Error('Invalid API response format');
    }
    
    return data;
  } catch (error) {
    // Categorize error types
    if (error.name === 'AbortError') {
      // Handle timeout
      enhancedLogger.error('API Request Timeout', {
        endpoint: `/api/marketplace/builders`,
        timeout: 10000,
      });
      
      throw new Error('Request timed out. Please try again.');
    }
    
    if (error.message.includes('NetworkError') || !navigator.onLine) {
      // Handle offline/network errors
      throw new Error('Network connection issue. Please check your internet connection.');
    }
    
    // Re-throw the error with enhanced context if not already handled
    if (!error.status) {
      enhancedLogger.error('Unhandled API Error', {
        endpoint: `/api/marketplace/builders`,
        error: error.message,
        stack: error.stack,
      });
    }
    
    throw error;
  }
}
```

## HTTP Status Code Handling

The marketplace implements specific handling for different HTTP status codes:

```typescript
// Error handling based on HTTP status code
function handleApiError(response, errorData) {
  switch (response.status) {
    case 400:
      // Bad request - typically validation errors
      return new Error(`Invalid request: ${errorData?.details || 'Please check your inputs'}`);
      
    case 401:
      // Unauthorized - authentication required
      // Trigger authentication flow
      window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      return new Error('Authentication required');
      
    case 403:
      // Forbidden - insufficient permissions
      return new Error('You do not have permission to access this resource');
      
    case 404:
      // Not found
      return new Error('The requested resource was not found');
      
    case 429:
      // Rate limited
      return new Error('Too many requests. Please try again later');
      
    case 500:
    case 502:
    case 503:
    case 504:
      // Server errors
      return new Error('Server error. Our team has been notified');
      
    default:
      return new Error(`Error (${response.status}): ${errorData?.error || response.statusText}`);
  }
}
```

## Error Logging Strategy

The marketplace implements a comprehensive error logging strategy:

```typescript
// Error logging enhancement
import { enhancedLogger } from '@/lib/enhanced-logger';

// Error logging middleware for the marketplace
export function logMarketplaceError(error, context = {}) {
  // Enrich error context
  const enrichedContext = {
    ...context,
    url: typeof window !== 'undefined' ? window.location.href : '',
    timestamp: new Date().toISOString(),
    userId: getUserId(), // Get current user ID if available
  };
  
  // Log to enhanced logger
  enhancedLogger.error(error.message, {
    ...enrichedContext,
    error: error.message,
    stack: error.stack,
    status: error.status,
    details: error.details,
  });
  
  // Additional error reporting to monitoring services happens
  // inside the enhanced logger
}

// Usage in components and hooks
try {
  // Logic that might fail
} catch (error) {
  logMarketplaceError(error, {
    component: 'BuilderList',
    action: 'fetchBuilders',
    filters,
  });
  
  // Handle the error appropriately
}
```

## Retry Strategies

The marketplace implements automatic retry strategies for transient errors:

```typescript
// Retry utility for API calls
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }
      
      // Check for retryable status codes
      if ([408, 429, 500, 502, 503, 504].includes(response.status)) {
        // This is a retryable error, continue to retry logic
        lastError = new Error(`HTTP Error ${response.status}`);
        (lastError as any).status = response.status;
      } else {
        // Non-retryable error status code
        throw await handleApiError(response);
      }
    } catch (error) {
      // Network errors are generally retryable
      const isNetworkError = !error.status && 
        (error.message.includes('NetworkError') || 
         error.message.includes('Failed to fetch'));
      
      if (!isNetworkError && error.status) {
        // Non-network error with status code already processed
        throw error;
      }
      
      lastError = error;
    }
    
    // Calculate exponential backoff delay
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // If we get here, all retries failed
  enhancedLogger.error('All retry attempts failed', {
    url,
    maxRetries,
    lastError: lastError?.message,
  });
  
  throw lastError;
}
```

## User Feedback Strategy

The marketplace implements a consistent approach to user feedback:

```tsx
// User-facing error handling component
export function MarketplaceErrorDisplay({ error, onRetry, className = '' }) {
  // Determine error category and message
  const { title, message, canRetry } = useMemo(() => {
    if (!error) {
      return {
        title: 'Something went wrong',
        message: 'An unexpected error occurred',
        canRetry: true,
      };
    }
    
    // Network errors
    if (!navigator.onLine || error.message.includes('network')) {
      return {
        title: 'Connection issue',
        message: 'Please check your internet connection and try again',
        canRetry: true,
      };
    }
    
    // Authentication errors
    if (error.status === 401 || error.status === 403) {
      return {
        title: 'Authentication required',
        message: 'Please log in to continue',
        canRetry: false,
      };
    }
    
    // Server errors
    if (error.status >= 500) {
      return {
        title: 'Server error',
        message: 'We\'re experiencing technical difficulties. Please try again later',
        canRetry: true,
      };
    }
    
    // Default/unknown errors
    return {
      title: 'Something went wrong',
      message: error.message || 'An unexpected error occurred',
      canRetry: true,
    };
  }, [error]);
  
  return (
    <div className={`rounded-md bg-red-50 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {canRetry && onRetry && (
            <div className="mt-4">
              <Button 
                size="sm"
                onClick={onRetry}
                variant="outline"
                className="text-red-800 bg-red-100 hover:bg-red-200"
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Graceful Degradation Strategy

The marketplace implements graceful degradation for different failure scenarios:

1. **Filter Failure** - Fallback to unfiltered results if filters cannot be applied
2. **Image Loading** - Fallback to initials if images cannot be loaded
3. **Builder Details** - Display partial information if full details cannot be loaded
4. **Search Functionality** - Fallback to browsing mode if search is unavailable
5. **Sorting** - Fallback to default sort if custom sorting fails

```tsx
// Example of graceful degradation in filter application
function useBuilderFilter() {
  // State management
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filterErrors, setFilterErrors] = useState({});
  
  // Apply filters with graceful degradation
  const applyFilters = useCallback(async (newFilters) => {
    setFilters(newFilters);
    
    try {
      // Attempt to apply all filters
      const result = await fetchBuilders(1, 12, newFilters);
      setAppliedFilters(newFilters);
      setFilterErrors({});
      return result;
    } catch (error) {
      // Identify which filter is causing the issue
      const problematicFilter = identifyProblematicFilter(newFilters, error);
      
      if (problematicFilter) {
        // Apply filters except the problematic one
        const fallbackFilters = { ...newFilters };
        delete fallbackFilters[problematicFilter];
        
        try {
          // Try with reduced filters
          const result = await fetchBuilders(1, 12, fallbackFilters);
          
          // Track the error but still show results
          setAppliedFilters(fallbackFilters);
          setFilterErrors({
            [problematicFilter]: `Could not apply ${problematicFilter} filter`
          });
          
          return result;
        } catch (fallbackError) {
          // Extreme fallback: no filters
          const result = await fetchBuilders(1, 12, {});
          setAppliedFilters({});
          setFilterErrors({ general: 'Could not apply filters' });
          return result;
        }
      }
      
      // If we can't identify the problematic filter, throw
      throw error;
    }
  }, []);
  
  return {
    filters,
    appliedFilters,
    filterErrors,
    applyFilters
  };
}
```

## Summary

This error handling strategy ensures the marketplace provides:

1. **Resilience** - The ability to recover from failures
2. **Graceful Degradation** - Maintain core functionality even when some features fail
3. **User Transparency** - Clear feedback on what went wrong and what to do
4. **Developer Visibility** - Comprehensive error logging for debugging
5. **Performance Impact** - Minimal performance overhead from error handling

By implementing these patterns consistently across all marketplace components, we create a robust user experience that can handle a wide range of failure scenarios while providing clear paths to recovery.