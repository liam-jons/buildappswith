# Calendly Integration Performance Considerations

*Version: 1.0.0*

This document outlines the performance considerations and optimizations for the Calendly integration with BuildAppsWith, ensuring a smooth, responsive user experience.

## Overview

Performance optimization is essential for the Calendly integration to provide a seamless booking experience. The following areas are addressed:

1. API Response Caching
2. Data Prefetching Strategy
3. Batch API Requests
4. Optimistic UI Updates
5. Lazy Loading Calendly Components
6. Rate Limiting and Throttling
7. Connection Pooling
8. Webhook Processing Optimization
9. Client-Side Rendering Performance
10. Database Query Optimization
11. Image and Asset Optimization
12. Memory Management

## 1. API Response Caching

Implement Redis-based caching to reduce API calls to Calendly:

```typescript
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: Partial<CacheOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const cacheKey = `${opts.prefix}${key}`;
  
  try {
    // Try to get from cache first
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      logger.debug('Cache hit', { key: cacheKey });
      return JSON.parse(cached);
    }
    
    // If not in cache, fetch fresh data
    logger.debug('Cache miss', { key: cacheKey });
    const data = await fetchFn();
    
    // Store in cache
    await redis.set(cacheKey, JSON.stringify(data), 'EX', opts.ttl);
    
    return data;
  } catch (error) {
    // If cache fails, just fetch the data directly
    return fetchFn();
  }
}
```

### Caching Strategy

- **Event Types**: Cache for 5-10 minutes
- **User Profiles**: Cache for 1 hour
- **Availability**: Cache for 1-2 minutes
- **Configuration**: Cache until explicitly invalidated

### Cache Invalidation

Implement targeted invalidation for cache entries when data changes:

```typescript
export async function invalidateEntityCache(entityId: string): Promise<void> {
  const pattern = `${DEFAULT_OPTIONS.prefix}*:${entityId}:*`;
  const keys = await redis.keys(pattern);
  
  if (keys.length > 0) {
    await redis.del(...keys);
    logger.debug('Invalidated entity cache', { 
      entityId,
      keyCount: keys.length
    });
  }
}
```

## 2. Data Prefetching Strategy

Prefetch Calendly data when users hover over UI elements:

```typescript
export function BuilderCardWithPrefetch({ builder, ...props }) {
  const prefetchData = () => {
    prefetchCalendlyData(builder.id);
  };
  
  return (
    <div 
      onMouseEnter={prefetchData}
      {...props}
    >
      {/* Builder card content */}
    </div>
  );
}
```

The prefetching implementation fetches data in parallel:

```typescript
export async function prefetchCalendlyData(builderId: string): Promise<void> {
  try {
    // Prefetch in parallel
    await Promise.all([
      preloadSessionTypes(builderId),
      preloadBuilderAvailability(builderId, new Date())
    ]);
  } catch (error) {
    // Ignore prefetch errors - they shouldn't affect the UI
    logger.debug('Calendly prefetch failed', {
      error: error instanceof Error ? error.message : String(error),
      builderId
    });
  }
}
```

## 3. Batch API Requests

Batch multiple API calls together to reduce HTTP overhead:

```typescript
export async function batchCalendlyRequests<T>(
  requests: Array<() => Promise<T>>,
  maxBatchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];
  
  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < requests.length; i += maxBatchSize) {
    const batch = requests.slice(i, i + maxBatchSize);
    const batchResults = await Promise.all(batch.map(req => req()));
    results.push(...batchResults);
  }
  
  return results;
}
```

## 4. Optimistic UI Updates

Improve perceived performance with optimistic UI updates:

```typescript
export function CalendlyBookingButton({ sessionType, builderId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const handleBooking = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Update UI optimistically
      // Show immediate feedback while API call happens in background
      const { bookingId, schedulingUrl } = await createCalendlyBooking({
        sessionTypeId: sessionType.id,
        builderId
      });
      
      // Redirect to Calendly scheduling page
      router.push(schedulingUrl);
    } catch (err) {
      setError('Unable to initialize booking. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Component JSX...
}
```

## 5. Lazy Loading Calendly Components

Use dynamic imports and code splitting to reduce initial bundle size:

```typescript
// Lazy load Calendly components to reduce initial load time
const CalendlyEmbed = dynamic(
  () => import('./calendly-embed').then(mod => mod.CalendlyEmbed),
  { ssr: false, loading: () => <CalendlyLoading /> }
);

function CalendlyLoading() {
  return (
    <div className="h-96 w-full flex items-center justify-center bg-gray-50 rounded-md">
      <div className="animate-pulse text-gray-400">
        Loading scheduling component...
      </div>
    </div>
  );
}
```

## 6. Rate Limiting and Throttling

Implement client-side rate limiting to adhere to Calendly API limits:

```typescript
// Create rate limiters for different Calendly API endpoints
const eventTypesLimiter = new RateLimiter('calendly:event-types', {
  maxRequests: 10,
  windowMs: 60000 // 1 minute
});

const bookingLimiter = new RateLimiter('calendly:booking', {
  maxRequests: 5,
  windowMs: 60000 // 1 minute
});

export async function withRateLimit<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const limiter = key.includes('event-types') 
    ? eventTypesLimiter 
    : bookingLimiter;
  
  await limiter.consume(key);
  return fn();
}
```

## 7. Connection Pooling

Use HTTP connection pooling to reduce connection overhead:

```typescript
// Create a connection pool to reuse connections
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 50, // Limit concurrent connections
  maxFreeSockets: 10, // Keep up to 10 sockets open when idle
  timeout: 30000 // 30 seconds
});

export async function enhancedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    agent,
    headers: {
      ...options.headers,
      'Connection': 'keep-alive'
    }
  });
}
```

## 8. Webhook Processing Optimization

Process webhooks asynchronously using a queue system:

```typescript
// Create a queue for processing webhooks asynchronously
const webhookQueue = new Queue('calendly-webhooks', {
  connection: redis
});

export async function queueWebhook(
  eventType: string,
  payload: any
): Promise<string> {
  // Add to queue with appropriate settings
  const job = await webhookQueue.add(eventType, payload, {
    attempts: 3, // Retry up to 3 times
    backoff: {
      type: 'exponential',
      delay: 5000 // Start with 5 seconds
    },
    removeOnComplete: true,
    removeOnFail: false // Keep failed jobs for inspection
  });
  
  return job.id;
}
```

Process similar webhooks in batches for better throughput:

```typescript
export async function processBatch(
  batch: any[],
  eventType: string
): Promise<void> {
  // For some webhook types, we can optimize by processing in batch
  switch (eventType) {
    case 'invitee.created':
      await processBatchedInviteeCreations(batch);
      break;
    default:
      // Process individually if no batch optimization available
      await Promise.all(batch.map(item => processWebhook(item, eventType)));
  }
}
```

## 9. Client-Side Rendering Performance

Load Calendly widgets efficiently with intersection observer:

```typescript
export function OptimizedCalendlyWidget({ schedulingUrl }) {
  const [loaded, setLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px' // Load when within 200px of viewport
  });
  const widgetRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Only load Calendly script when component is in view
    if (inView && !loaded) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => setLoaded(true);
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [inView, loaded]);
  
  // Component rendering...
}
```

## 10. Database Query Optimization

Optimize database queries for booking data:

```typescript
export async function getBookingWithOptimizedQuery(
  bookingId: string
): Promise<BookingWithRelations> {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      // Only include necessary relations
      sessionType: {
        select: {
          id: true,
          name: true,
          duration: true,
          price: true
        }
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      // Don't include unnecessary large relations
      notes: false,
      attachments: false
    }
  });
}
```

Use database indexes effectively:

```typescript
export async function getActiveBookingsByBuilder(
  builderId: string,
  startDate: Date,
  endDate: Date
): Promise<Booking[]> {
  // This query uses composite index (builderId, startTime, status)
  return prisma.booking.findMany({
    where: {
      builderId,
      startTime: {
        gte: startDate,
        lte: endDate
      },
      status: {
        in: ['CONFIRMED', 'PENDING_PAYMENT']
      }
    },
    orderBy: {
      startTime: 'asc'
    }
  });
}
```

## 11. Image and Asset Optimization

Optimize images for faster loading:

```typescript
export function OptimizedBuilderImage({ builder }) {
  return (
    <div className="relative w-16 h-16 rounded-full overflow-hidden">
      <Image
        src={builder.imageUrl || '/images/default-avatar.svg'}
        alt={`${builder.name}'s profile picture`}
        fill
        sizes="(max-width: 768px) 64px, 96px"
        priority={false}
        loading="lazy"
        className="object-cover"
      />
    </div>
  );
}
```

## 12. Memory Management

Process large webhook payloads in a memory-efficient way:

```typescript
export async function streamProcessLargeWebhooks(
  dataStream: NodeJS.ReadableStream
): Promise<void> {
  return new Promise((resolve, reject) => {
    let buffer = '';
    
    // Create a transform stream to process data in chunks
    const processor = new Transform({
      transform(chunk, encoding, callback) {
        try {
          buffer += chunk.toString();
          
          // Try to extract complete JSON objects
          let endPos;
          while ((endPos = buffer.indexOf('}\n')) !== -1) {
            const jsonStr = buffer.substring(0, endPos + 1);
            buffer = buffer.substring(endPos + 2);
            
            // Process the complete JSON
            const webhookData = JSON.parse(jsonStr);
            processWebhookData(webhookData);
          }
          
          callback();
        } catch (error) {
          callback(error);
        }
      }
    });
    
    dataStream
      .pipe(processor)
      .on('finish', resolve)
      .on('error', reject);
  });
}
```

## Performance Monitoring

In addition to these optimizations, implement comprehensive performance monitoring:

1. **Response Time Tracking**: Monitor API response times for Calendly endpoints
2. **Cache Hit Rate**: Track cache effectiveness
3. **Error Rates**: Monitor API errors and fallback usage
4. **Client-Side Metrics**: Track client-side rendering and interaction performance
5. **Resource Usage**: Monitor server memory and CPU usage, especially during webhook processing

## Load Testing

Prior to production deployment, conduct load testing for:

1. **Concurrent Bookings**: Simulate multiple users booking simultaneously
2. **Webhook Processing**: Test handling high webhook volumes
3. **API Rate Limits**: Verify rate limiting behavior under load

## Related Documentation

- [Calendly Integration](./CALENDLY_INTEGRATION.md)
- [Calendly Webhook Implementation](./CALENDLY_WEBHOOK_IMPLEMENTATION.md)
- [Calendly Error Handling](./CALENDLY_ERROR_HANDLING.md)