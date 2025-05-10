# Marketplace Data Flow

## Overview

This document describes the data flow patterns for the consolidated marketplace implementation, focusing on builder discovery, filtering, and profile viewing.

## Data Flow Diagrams

### 1. Builder Discovery & Filtering Flow

```
┌──────────────┐     ┌───────────────┐     ┌────────────────┐
│  URL Query   │────▶│ Filter State  │────▶│ API Parameters │
│  Parameters  │     │ (React State) │     │                │
└──────────────┘     └───────────────┘     └────────────────┘
       ▲                     │                     │
       │                     │                     ▼
┌──────────────┐             │             ┌────────────────┐
│    Router    │◀────────────┘             │   API Client   │
│    Update    │                           │                │
└──────────────┘                           └────────────────┘
                                                   │
┌──────────────┐                                   ▼
│  UI Controls │                           ┌────────────────┐
│ (Filter/Sort)│───────────────────────────│ Builder Data   │
└──────────────┘                           │                │
                                           └────────────────┘
                                                   │
                                                   ▼
                                           ┌────────────────┐
                                           │    Builder     │
                                           │ List Rendering │
                                           └────────────────┘
```

### 2. Marketplace Data Architecture

```
┌─────────────────────────────────────────────────┐
│                     UI Layer                     │
│  ┌───────────┐  ┌────────────┐  ┌────────────┐  │
│  │ Filter UI │  │ Search Bar │  │Builder List│  │
│  └─────┬─────┘  └─────┬──────┘  └─────┬──────┘  │
└─────────────────────────────────────────────────┘
            │           │              │
            ▼           ▼              ▼
┌─────────────────────────────────────────────────┐
│                   State Layer                    │
│   ┌───────────────────────────────────────┐     │
│   │         useBuilderFilter Hook          │     │
│   │                                        │     │
│   │  ┌────────┐  ┌───────┐  ┌──────────┐  │     │
│   │  │ Filters │  │ Search│  │Pagination│  │     │
│   │  └────────┘  └───────┘  └──────────┘  │     │
│   └───────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                   Data Layer                     │
│  ┌────────────────┐       ┌─────────────────┐   │
│  │  API Client    │       │  Data Cache     │   │
│  │                │◀─────▶│  (SWR/React    │   │
│  │ fetchBuilders  │       │  Query)         │   │
│  └────────────────┘       └─────────────────┘   │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                 Backend Layer                    │
│  ┌────────────────┐       ┌─────────────────┐   │
│  │  API Route     │       │  Data Service   │   │
│  │  /api/market-  │◀─────▶│                 │   │
│  │  place/builders│       │                 │   │
│  └────────────────┘       └─────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Data Flow Descriptions

### 1. URL-Driven Filtering

The marketplace uses a URL-driven approach to filtering, which provides several benefits:

1. **Bookmarkable & Shareable Results** - Users can share search results via URL
2. **Browser Navigation** - Back/forward buttons work with filter state
3. **SEO Friendly** - Search engines can index filtered views
4. **State Persistence** - Filter state survives page refreshes

#### Implementation Flow:

1. On page load, `useBuilderFilter` hook parses URL query parameters
2. URL parameters are converted to filter state
3. When filters change, URL is updated via router
4. URL updates trigger filter state changes
5. Filter changes trigger API requests

```jsx
// Hook implementation for URL-driven filtering
function useBuilderFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse URL parameters on load
  useEffect(() => {
    const initialFilters = {
      search: searchParams.get('search') || '',
      skills: searchParams.get('skills')?.split(',') || [],
      // ...other parameters
    };
    
    setFilters(initialFilters);
  }, [searchParams]);
  
  // Update URL when filters change
  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    // Add parameters based on filter values
    // ...
    
    router.push(`/marketplace?${params.toString()}`);
  }, [router]);
  
  // Hook returns
  return { filters, updateFilters, clearFilters };
}
```

### 2. Data Fetching Pattern

The marketplace uses a centralized data fetching pattern to ensure consistency:

1. **Single Data Source** - All components use the same data fetching mechanism
2. **Centralized State** - Filters and results are managed in one place
3. **Optimized Requests** - Debounced filters prevent excessive API calls
4. **Error Handling** - Consistent error management across components

#### Implementation Flow:

```jsx
// In marketplace page component
function MarketplacePage() {
  const { filters, updateFilters } = useBuilderFilter();
  const { data, error, isLoading } = useBuilders(filters);
  
  // Component rendering with data from hook
  return (
    <div>
      <FilterPanel filters={filters} onChange={updateFilters} />
      {isLoading ? (
        <BuilderListSkeleton />
      ) : error ? (
        <ErrorDisplay error={error} />
      ) : (
        <BuilderList builders={data.builders} />
      )}
    </div>
  );
}

// Data fetching hook
function useBuilders(filters) {
  // Using SWR for caching and revalidation
  const { data, error, isLoading } = useSWR(
    [`/api/marketplace/builders`, filters],
    fetchBuilders,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );
  
  return { data, error, isLoading };
}
```

### 3. API Layer Pattern

The API layer follows a consistent pattern:

1. **Parameter Validation** - Ensures input validation before processing
2. **Type Safety** - Strong typing for request/response objects
3. **Error Formatting** - Standardized error responses
4. **Pagination** - Consistent pagination structure

#### Implementation Pattern:

```typescript
// API route implementation
export async function GET(request: NextRequest) {
  try {
    // Extract and validate parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    
    // Build filters
    const filters: MarketplaceFilters = {
      searchQuery: searchParams.get('search') || undefined,
      skills: searchParams.get('skills')?.split(',') || undefined,
      // ...other filters
    };
    
    // Fetch data with validated parameters
    const result = await marketplaceService.fetchBuilders(page, limit, filters);
    
    // Return standardized response
    return NextResponse.json({
      data: result.builders,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    // Handle and format errors
    return NextResponse.json(
      { error: 'Failed to fetch builders', details: error.message },
      { status: 500 }
    );
  }
}
```

## Data Structures

### Filter State Structure

```typescript
interface MarketplaceFilters {
  searchQuery?: string;
  skills?: string[];
  validationTiers?: number[];
  availability?: string[];
  sortBy?: string;
  minHourlyRate?: number;
  maxHourlyRate?: number;
}
```

### API Response Structure

```typescript
interface BuildersResponse {
  data: BuilderProfileListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Caching Strategy

The marketplace implements a multi-level caching strategy:

1. **Client-Side Caching** - Using SWR or React Query for data fetching
2. **Cache Invalidation** - When filters change, cache is invalidated
3. **Stale-While-Revalidate** - Show cached data first, refresh in background
4. **Optimistic Updates** - For quick UI feedback during interactions

```jsx
// Example of caching implementation with SWR
const { data, mutate } = useSWR(
  ['/api/marketplace/builders', filters],
  fetchBuilders,
  {
    // Cache for 10 seconds
    dedupingInterval: 10000,
    
    // Show stale data while revalidating
    revalidateOnFocus: false,
    
    // Fallback data for initial render
    fallbackData: { data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } },
  }
);

// Optimistic update example when adding a filter
function addSkillFilter(skill) {
  // Optimistically update the UI
  mutate(
    // Optimistic data
    (current) => {
      return {
        ...current,
        filters: {
          ...current.filters,
          skills: [...current.filters.skills, skill],
        },
      };
    },
    // Revalidate after update
    true
  );
}
```

## Error Handling Flow

The marketplace uses a comprehensive error handling strategy:

1. **Granular Error Types** - Differentiate between network, API, and data errors
2. **UI Error States** - Specific UI states for different error types
3. **Retry Mechanisms** - Allow users to retry failed requests
4. **Fallback Content** - Always provide fallback content for failed data loads

```jsx
// Error handling in data fetching hook
function useBuilders(filters) {
  const [retryCount, setRetryCount] = useState(0);

  const { data, error, isLoading } = useSWR(
    [`/api/marketplace/builders`, filters, retryCount],
    fetchBuilders,
    {
      onError: (err) => {
        // Log error for monitoring
        console.error('Builder data fetch error:', err);
        
        // Classify error type
        if (err.message.includes('network')) {
          setErrorType('network');
        } else if (err.status === 500) {
          setErrorType('server');
        } else {
          setErrorType('unknown');
        }
      },
    }
  );
  
  // Retry mechanism
  const retryFetch = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);
  
  return { 
    data: data || { data: [], pagination: { page: 1, total: 0 } }, 
    error, 
    isLoading,
    retry: retryFetch,
  };
}
```

## Analytics Integration

The marketplace implements analytics tracking at key points in the data flow:

1. **Search Events** - Track search queries and filter applications
2. **View Events** - Track builder profile views
3. **Conversion Events** - Track clicks on booking or contact buttons
4. **Performance Metrics** - Track data loading times and error rates

```jsx
// Analytics integration in filter hook
function useBuilderFilter() {
  // ...filter state management
  
  const updateFilters = useCallback((newFilters) => {
    // Update state and URL
    setFilters(newFilters);
    updateUrlParams(newFilters);
    
    // Track filter changes
    analytics.track('marketplace_filter_change', {
      filters: newFilters,
      timestamp: new Date().toISOString(),
    });
  }, []);
  
  return { filters, updateFilters };
}
```

## Performance Optimizations

To ensure optimal performance, the marketplace data flow implements:

1. **Debounced Search** - Prevent excessive API calls during typing
2. **Virtualized Lists** - Render only visible builder cards
3. **Incremental Loading** - Load more builders as user scrolls
4. **Image Optimization** - Proper handling of builder avatars and images

```jsx
// Debounced search implementation
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  
  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedSearch) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, onSearch]);
  
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search builders..."
    />
  );
}

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
```